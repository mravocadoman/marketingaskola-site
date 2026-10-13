## Vispirms izlasi

Septiņās rindās ir salikta vairāk nekā desmit gadu pieredze ar reklāmām. Šīs rindas ir galvenais. Modelis tās tikai piemēro katru rītu plkst. 10:22, un tas nenogurst, nezaudē interesi un nekļūst pārāk optimistisks.

**Kas tas ir.** Divas ieplānotas Claude sesijas ar piekļuvi datiem. Viena plkst. 9:00 komandas čatā publicē vienu rindu ar patiesajiem skaitļiem: tēriņš, īstie pasūtījumi un reālais ROAS pret 7 dienu vidējo. Otra plkst. 10:22 vada aktīvu Meta kampaņu stingru noteikumu robežās, katru reizi pieraksta savu pamatojumu un atskaitās. Abas strādā vienā mūsu pašu print-on-demand e-komercijas projektā ar apzināti nelielu kampaņu: 70 $ dienā. Pietiekami mazu, lai kļūda pārāk nesāpētu, un pietiekami lielu, lai tā tomēr maksātu naudu.

**Godīgi.** Claude šo kampaņu vada kopš 2026. gada 29. septembra. Noteikumi ir interesantākā daļa, rezultāti vēl tiek apkopoti. Tas nav apgalvojums, ka modelis pērk reklāmu labāk par cilvēku. Tas ir apgalvojums, ka modelis cilvēka noteikumus ievēro konsekventāk nekā pats cilvēks septiņos no rīta.

**Kas tas nav.** Tā nav atribūcijas modelēšana, MMM vai radošā studija. Sistēma spriež, tērē un aptur. Tā nenosaka, kāds ir Tavs break-even, un neizdomā Tavu pirmo labo reklāmu. Tas joprojām ir Tavs darbs.

## Kā tas uzbūvēts

**9:00, patiesā ROAS atskaite** (ieplānota Claude sesija):

- lasa vakardienas un pēdējo 7 dienu Meta tēriņus, rādījumus un klikšķus (Windsor.ai savienojums);
- lasa tās pašas dienas īstos pasūtījumus un ieņēmumus no veikala datiem;
- uzraksta vienu rindu komandas čatā caur n8n webhook;
- brīdina, ja ROAS ir zem break-even, pasūtījumu nav vai CPC ir virs griestiem.

**10:22, ikdienas pārvaldnieks** (ieplānota Claude sesija):

- lasa katras reklāmas vakardienas un 7 dienu skaitļus (Windsor.ai);
- lasa īstos pasūtījumus par tām pašām dienām, kur iespējams, ar atribūciju (veikala datubāze);
- lasa visus savus iepriekšējos ierakstus žurnāla tabulā, vienmēr vispirms vēsturi;
- rīkojas ar budžetiem, apturēšanu un jauniem testiem septiņu noteikumu robežās;
- pieraksta žurnālā vienu rindu: skaitļi, darbības, pamatojums;
- katru savu izmaiņu pārbauda, to nolasot atpakaļ;
- atsūta mums piecu rindu atskaiti.

Divas lietas šajā shēmā ir svarīgākas par modeli. Pirmkārt, īstie pasūtījumi katrā reizē atrodas blakus platformas skaitļiem: sistēmai nekad nav ļauts spriest tikai pēc Meta pirkumu skaita. Otrkārt, žurnālu tā izlasa pirms jebkura lēmuma, tāpēc šodienas sesija zina, ko vakardienas sesija izdarīja un kāpēc, un nevar mētāties no vienas puses uz otru.

## Septiņi noteikumi

| # | Noteikums | Skaitļi mūsu kontā |
| --- | --- | --- |
| 1 | Spried pēc īstajiem pasūtījumiem, nevis pēc platformas pirkumu skaita. | Meta mūsu projektā pirkumus pārspīlē par 15 līdz 20 %. Break-even ir apmēram 18 $ reālās izmaksas uz jaunu klientu. Platformas CPA ir mājiens, nevis spriedums. |
| 2 | Ievēro mācīšanās fāzi, pēc tam maini lēni. | Pirmās četras dienas budžetu nemaina. Pēc tam ne biežāk kā reizi trijās dienās un ne vairāk kā par 20 % vienā reizē. Palielina tikai tad, ja trīs dienu reālais CPA ir mērķī vai zemāk. Samazināt drīkst jebkurā brīdī. Ir augšējā robeža, ko bez mūsu rakstiskas atļaujas nepārsniedz. |
| 3 | Aptur zaudētājus pēc noteikuma, uzturi veselīgu reklāmu kopu. | Reklāmu aptur, ja iztērēti 40 $ un pirkumu nav, vai ja iztērēti 60 $ un platformas CPA ir virs 30 $. Aktīvas ir 4 līdz 8 reklāmas. Pēdējo labi strādājošo neaptur nekad. |
| 4 | Nogurumu aizstāj ar vienu skaidru testu. | Ja frekvence pārsniedz 2,5 vai saites CTR ir par 30 % zemāks nekā reklāmas pirmajā nedēļā, palaiž vienu jaunu testu: jaunu teksta leņķi uz pārbaudīta attēla. Vienlaikus mainās tikai viena lieta. Testa nosaukumā redzams, ko tas pārbauda. |
| 5 | Avārijas slēdzis, un pasaki mums. | Ja pēc 350 $ tēriņa 7 dienu reālais CPA ir virs 30 $, budžetu krasi samazina un ziņo. Ja trīs dienas pēc kārtas nav neviena reāla pirkuma, kampaņu aptur un ziņo. |
| 6 | Teksta noteikumi, ko modelis nevar apiet. | Bez domuzīmēm. Nekad nepiedāvā atlaides vai dāvanas. Nekad nesola piegādes datumu. Cenas tikai no dotā saraksta. |
| 7 | Spried tikai pēc pilnām dienām, pārbaudi katru izmaiņu, pieraksti katru reizi. | Reklāmas kontam un veikalam jābūt vienai dienas robežai (mums abi strādā vienā laika joslā). Katru izmaiņu pēc veikšanas nolasa atpakaļ. Katrā reizē žurnālā viena rinda ar pamatojumu. |

**Kāpēc sliekšņi ir garlaicīgi.** 40 $ bez neviena pirkuma ir apmēram divu klientu break-even izmaksas, bet klientu nav. 60 $ ar CPA virs 30 $ nozīmē pirkumu, kas izmaksāja vairāk par peļņu. 20 % vienā reizē ir lielākais budžeta solis, kas lielākajā daļā kontu neatsāk mācīšanos. Nekas no tā nav gudrs. Tās ir lietas, ko jau zinājām, bet nedarījām konsekventi.

## Ikdienas pārvaldnieka instrukcija

Šī ir instrukcija, kas tiešām darbojas, tikai konta dati tajā aizstāti ar vietturiem. Tas ir ieplānots Claude uzdevums ar diviem savienojumiem: Meta datu savienojumu, kas var lasīt un rakstīt (mums tas ir Windsor.ai), un veikala datubāzi. Nomaini vietturus un skaitļus sadaļā NOTEIKUMI. Struktūru atstāj, kā ir: tieši struktūra prasīja visvairāk gadu.

```text
Tu esi manas Meta kampaņas "{CAMPAIGN_NAME}" ikdienas pārvaldnieks projektā {PROJECT}. Es Tev to nodevu {DATE}: rīkojies un pēc tam atskaities. Ikdienas soļiem manu apstiprinājumu neprasi.

IESTATĪJUMI
- Reklāmas konts {AD_ACCOUNT_ID} (laika josla {TZ}), caur Meta savienojumu: get_data lasīšanai, list_actions / execute_action rakstīšanai.
- TAVĀ PĀRZIŅĀ: kampaņa {CAMPAIGN_ID} (CBO, {DAILY_BUDGET} $ dienā no {DATE}), reklāmas kopa {ADSET_ID} (Advantage+ auditorija ieslēgta, {INTERESTS} kā signāli, {GEO}, vecums {AGE_RANGE}, tikai feed, story un reels izvietojumi, optimizācija uz pirkumiem ar pikseli {PIXEL_ID}). Reklāmas: {N_PROVEN} pārbaudītas reklāmas un {N_TESTS} testi ({TEST_NAMES_AND_IDS}). Lapa {PAGE_ID}, saite {LANDING_URL}, url_tags {UTM_TEMPLATE}.
- NAV TAVĀ PĀRZIŅĀ, tikai vēro: {OTHER_CAMPAIGNS}. Apturētās kampaņas paliek apturētas.
- Žurnāls: tabula {LOG_TABLE} veikala datubāzē. Vispirms izlasi visas rindas, lai zinātu vēsturi; katrā reizē pievieno vienu rindu.

NOTEIKUMI
1. Break-even ir apmēram {BREAK_EVEN_CPA} $ reālās izmaksas uz jaunu klientu ({WHICH_PRODUCT_IS_PROFITABLE}). Meta pirkumus pārspīlē par aptuveni 15-20 %. Spried pēc īstajiem pasūtījumiem.
2. Mācīšanās fāze: līdz {LEARNING_END_DATE} budžetu nemaini. Pēc tam ne vairāk kā viena budžeta izmaiņa trijās dienās, ne vairāk kā par 20 % vienā reizē. Palielini tikai tad, ja trīs dienu reālais CPA ir {TARGET_CPA} $ vai zemāk. Bez manas atļaujas ne vairāk kā {HARD_CAP} $ dienā; samazināt drīksti.
3. Aptur reklāmu, ja tēriņš ir vismaz 40 $ un pirkumu nav, vai ja tēriņš ir vismaz 60 $ un Meta CPA ir virs 30 $. Lai aktīvas būtu 4-8 reklāmas, un nekad neaptur pēdējo labi strādājošo.
4. Kad reklāma ir apturēta vai nogurusi (frekvence virs 2,5 vai saites CTR par 30 % vai vairāk zemāks nekā tās pirmajā nedēļā), pievieno jaunu testu: jaunu teksta leņķi uz pārbaudīta attēla (izmanto esošos image hash vai pārbaudītos creative_id). Vienlaikus maini tikai vienu lietu. Nosaukums: "Claude <burts> | <leņķis> | <attēls>".
5. Ja kampaņas 7 dienu reālais CPA pēc vismaz 350 $ tēriņa ir virs 30 $, samazini budžetu līdz {FLOOR_BUDGET} $ un pasaki man. Ja trīs dienas pēc kārtas nav neviena reāla pirkuma, aptur kampaņu un pasaki man.
6. Teksts: bez domuzīmēm, nekad nepiedāvā atlaides vai dāvanas. Cenas: {PRICE_LIST}. Nesoli piegādes datumus.
7. Spried tikai pēc pilnām {TZ} dienām. Katru izmaiņu pārbaudi, to nolasot atpakaļ.

KATRĀ REIZĒ
a. Ielādē projekta kontekstu ({SKILL_OR_DOC}).
b. Meta: vakardiena un pēdējās 7 dienas pa kampaņām un pa reklāmām: spend, cpm, frequency, link_clicks, landing_page_views, add_to_cart, initiate_checkout, purchases, purchase_value, effective_status.
c. Īstie pārdošanas dati par tām pašām dienām ({DAY_BOUNDARY_IN_UTC}): apmaksātie pasūtījumi (ne testa pasūtījumi), savienoti ar pasūtījumu tabulu (kanāls, atribūcija; kur utm dati ļauj, piešķir šai kampaņai vai citām). Atsevišķi saskaiti jaunus pasūtījumus un papildpirkumus. Piltuves pārbaude no vietnes notikumu tabulas: {STEP_A} līdz {STEP_B} konversija (parasti {NORMAL_RANGE}) un izveidotie pasūtījumi dienā (parasti {NORMAL_ORDERS}). Ja piltuve ir salūzusi, vispirms ziņo par to, nevis vaino reklāmas.
d. Rīkojies pēc noteikumiem, pēc tam pievieno žurnālā rindu ar skaitļiem, darbībām un pamatojumu.
e. Atsūti man īsu atskaiti: vakardienas tēriņš, Meta un īstie pirkumi, reālais CPA pret {BREAK_EVEN_CPA} $, ko mainīji un kāpēc, un ko vērts atzīmēt citās kampaņās vai vietnē. Bez domuzīmēm. Īsi.
```

Visvairāk palīdz trīs rindas. "Vispirms izlasi visas rindas" neļauj modelim no jauna pieņemt vakardienas lēmumu. "Ja piltuve ir salūzusi, vispirms ziņo par to" neļauj tam apturēt labu kampaņu tikai tāpēc, ka salūza checkout lapa. "Katru izmaiņu pārbaudi" ir atšķirība starp atskaiti, kurā rakstīts "reklāmu apturēju", un reklāmu, kas tiešām ir apturēta.

## Patiesā ROAS atskaite

Tā strādā pirmā, plkst. 9:00, lai komandas čatā īstais skaitlis būtu pirms tam, kad kāds atver reklāmu paneli. Pirmajā nedēļā platforma mūsu veikalam uzrādīja 68 pirkumus, bet īsto pasūtījumu bija 54: par 26 % vairāk pasūtījumu, nekā bija, un par 30 % vairāk ieņēmumu. Neviens nemelo. Atribūcijas logi un modelētās konversijas skaitli katru reizi bīda uz augšu, platformai par labu.

```text
Tu esi projekta {PROJECT} analītiķis. Sagatavo ikdienas patieso reklāmas rezultātu atskaiti un publicē to komandas čatā. Strādā tikai ar aktuāliem datiem, nevis no atmiņas.

1. Iegūsti vakardienas Meta tēriņus: Meta savienojums get_data, konts {AD_ACCOUNT_ID}, lauki date, spend, impressions, link clicks par vakardienu un iepriekšējām 6 dienām (7 dienu bāze). Savienojums datumus atgriež reklāmas konta laika joslā ({TZ}).
2. Iegūsti vakardienas īstos pasūtījumus un ieņēmumus no veikala par tām pašām 8 dienām ({SHOP_QUERY}). Veikalam un reklāmas kontam jābūt vienai dienas robežai; ja tā nav, pārrēķini pirms salīdzināšanas.
3. Aprēķini vakardienai un 7 dienu vidējo: patiesais ROAS = ieņēmumi / tēriņš; patiesais vidējais CPA = tēriņš / pasūtījumi; CPC = tēriņš / saišu klikšķi.
4. Publicē VIENU kompaktu ziņu (bez markdown tabulām) komandas čatā caur {WEBHOOK}. Formāts: "📊 Patiesā atskaite <datums>: tēriņš X $ · Y pasūtījumi · Z $ ieņēmumi · ROAS A.B (7 d. vid. C.D) · CPA E $ · CPC F $" un VIENA rinda ar skaidrojumu. Sāc ar ⚠️ un pasaki to skaidri, ja ROAS ir zem {BREAK_EVEN_ROAS}, pasūtījumu nav vai CPC ir virs {CPC_CEILING} $.
5. Ja kāds datu avots nav pieejams, publicē atskaiti ar to, kas ir, un pasaki, kura avota trūka. Nekad neklusē un nekad neizdomā skaitļus.

Kopā ne vairāk kā 6 rindas. Nekādus datus nemaini: šis uzdevums tikai lasa un atskaitās.
```

**Pirmā kļūda, ar ko saskarsies: laika joslas.** Mūsu atskaites pirmā versija salīdzināja pirmdienas tēriņus ar otrdienas pārdošanu, jo platforma datus rādīja vienā laika joslā, bet veikals citā. Katra automatizācija, ko esam būvējuši, vispirms salūza laika joslu dēļ un tikai pēc tam kaut kā sarežģītāka dēļ. Instrukcijas 2. punkts ir tieši tā rīta dēļ.

## Pirms tērē: divu stundu pārbaude

Lētākā kampaņa ir tā, ko nemaz nepalaid. Vienu lead gen ideju šogad apturējām apmēram divās stundās, pirms iztērējām kaut vienu eiro. Šī secība der pakalpojumiem un lead gen, kur pieprasījums vai nu ir, vai nav. Tā neder pilnīgi jaunām kategorijām, kas šo pārbaudi pēc definīcijas neiztur.

1. **Vispirms Meta Ad Library.** Meklē nišu savā valstī. Kas tajā rāda reklāmas, un cik ilgi? Ilgi strādājošas reklāmas ir spēcīgākais signāls, jo neviens ilgi nemaksā par to, kas nes zaudējumus.
2. **Pēc tam meklēšanas apjoms.** Ja cilvēkiem šī problēma būtu un viņi meklētu risinājumu, viņi to arī rakstītu meklētājā.
3. **Tad vienīgais jautājums, kam ir nozīme:** vai klusums ir iespēja vai spriedums? Vai nu neviens šajā nišā neprot reklamēties, vai tirgus ir par mazu, lai tajā reklamētos.
4. **Paskaties uz blakus kategoriju.** Tā parādīs, vai plašākajā jomā vispār kaut kas notiek.
5. **Izlem rakstiski un ej tālāk.** Uzrakstīts lēmums neļauj pie tā atgriezties vienpadsmitos vakarā.

Solis, ko izlaidām un nevajadzēja: mēs nevienam nepiezvanījām. Divas stundas Ad Library parāda, ko dara reklāmdevēji, nevis to, kā izskatās uzņēmuma zvanu žurnāls. Trīs zvani to būtu izšķīruši pa īstam.

## Kļūda, kas izmaksāja vairāk par jebkuru slieksni

Vienā kampaņā viens leads maksāja 0,38 €. Iztērējām 1 175 € un ieguvām vairāk nekā 2 000 e-pasta pierakstu vebināra piltuvei, kas veda uz kursu. Kursu nopirka apmēram 2 % no viņiem. Kampaņa atpelnīja aptuveni 8 reizes, un tieši tāpēc, ka tā strādāja, mēs no tās gandrīz neko neiemācījāmies. Algoritmam bija uzdots atrast lead formas aizpildītājus. Tas to izdarīja izcili. Neviens tam nepateica, ka pastāv arī pirkums.

Noteikums, kas no tā radās: optimizē uz agrāko notikumu Tavā piltuvē, ko cilvēks bez īstas intereses neizpildītu.

| Notikums | Cik pūļu tas prasa | Izmantot kā mērķi? |
| --- | --- | --- |
| Iepriekš aizpildīta lead forma | Divi pieskārieni. Nekādu. | Nē. Tās ir lamatas. |
| Forma, ko aizpilda pats | Nelielas, bet īstas | Vāji, bet labāk nekā nekas |
| Kvalificēta atbilde | Uzrakstīt teikumu cilvēkam | Jā |
| Pieteikts zvans | Atvēlēt laiku savā kalendārā | Jā, parasti labākais pieejamais |
| Pirkums | Nauda | Jā, ja apjoms ļauj platformai mācīties |

CPL nav rezultāta rādītājs. Tā ir cena. To var nospiest gandrīz cik zemu vien gribi, atrodot cilvēkus, kuriem piekrišana neko nemaksā, un tie ir tie paši cilvēki, kuriem tā neko nenozīmē. Šādas kampaņas mēs tagad vērtējam pēc kvalificētas sarunas cenas: neglītāks, lēnāks rādītājs, ko nevar skaisti nofotografēt.

## Kur tas salūzt

- **Mazs budžets, maza izlase.** Ar 70 $ dienā vienas dienas pirkumi ir tikai daži pasūtījumi. Tāpēc katrs noteikums vērtē trīs un septiņu dienu periodus, un nekas netiek vērtēts pēc vienas dienas.
- **Mācīšanās fāze ir īsta.** Ja pirmajās dienās aiztiec budžetu, platforma sāk no jauna. 2. noteikums radās tāpēc, ka paši to vairākkārt sabojājām, rīkojoties manuāli.
- **Ja ļausi, modelis novirzīsies.** Visam, kas Tev tiešām ir svarīgs, jābūt noteikumam ar skaitli, nevis teikumam "esi saprātīgs". Instrukcijas novirzās. Slieksnis ne.
- **Datu savienojumi maina lauku nosaukumus.** Abās instrukcijās ir teikts: ja lauks tiek noraidīts, sameklē īsto lauku sarakstu, nevis min. Uzminēts lauks dod pārliecinoši nepareizu skaitli.
- **Labu reklāmu tas neuztaisīs.** Tas var tikai kombinēt pārbaudītus attēlus ar jauniem leņķiem. Pirmais labais attēls joprojām ir cilvēka darbs.
- **Break-even joprojām ir Tavs.** Sistēma skaitli tikai piemēro. Ja Tavi 18 $ patiesībā ir 24 $, katrs noteikums šajā lapā nemanāmi kļūdās. Pārrēķini to katru mēnesi no reālās peļņas, atgriešanām un piegādes.

## Palaid pats

1. **Sāc tikai ar patieso ROAS atskaiti.** Viena rinda dienā, īstie pasūtījumi blakus platformas skaitļiem. Dzīvo ar to divas nedēļas, pirms kaut kam ļauj rīkoties.
2. **Pareizi aprēķini break-even:** peļņa pēc produkta, piegādes, maksājumu komisijām un atgriešanām. Pieraksti to kopā ar datumu.
3. **Nokopē ikdienas pārvaldnieka instrukciju.** Aizpildi vietturus. Budžetu iestati tādu, ar kādu vari atļauties nedēļu kļūdīties.
4. **Pirms piešķir rakstīšanas tiesības, izveido žurnāla tabulu.** Vispirms vēsture, tikai pēc tam darbības.
5. **Pirmās divas nedēļas katru rītu lasi žurnālu.** Ne atskaiti, bet žurnālu. Pamatojuma kolonnā redzēsi, vai Tavi noteikumi saka to, ko domāji.
