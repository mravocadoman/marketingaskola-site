---
layout: post.njk
title: "AI automatizācija uzņēmumiem: 29 procesi, kas strādā katru dienu"
seoTitle: "AI automatizācija uzņēmumiem: reāli piemēri | Mārketinga Skola"
description: "Kā izskatās automatizācija, kas tiešām strādā: rēķinu apstrāde, klientu e-pasts, reklāmas mērīšana un saturs. Reāli procesi no mūsu pašu uzņēmumiem, ar to, kas nostrādāja un kas ne."
date: 2026-09-09
image: "/img/gen/cover-ai-automatizacija-uznemumiem.webp"
categories: ["maksligais-intelekets","digitalais-marketings"]
permalink: "/ai-automatizacija-uznemumiem/"
keywords: ["AI automatizācija", "biznesa procesu automatizācija", "n8n", "rēķinu apstrāde", "mākslīgais intelekts uzņēmumā", "Meta Conversions API"]

---

Par automatizāciju runā divējādi. Vai nu tā ir prezentācija ar bultiņām, kurā neviens process nav nosaukts vārdā, vai arī tas ir viens *ChatGPT* logs, kurā īpašnieks katru rītu ielīmē to pašu tekstu.

Šis raksts ir par trešo variantu: **procesiem, kas nostrādā paši, kamēr tu ar tiem nenodarbojies**. Visi piemēri zemāk ir no sistēmām, ko esam uzbūvējuši un katru dienu darbinām paši — kopā 46 darbplūsmas, no kurām 29 šobrīd ir aktīvas. Neviens no tiem nav demonstrācijas piemērs.

Vairākums ir tieši pārnesams uz mazu Latvijas uzņēmumu, jo problēmas ir tās pašas: rēķini, kas pazūd e-pastā, klientu vēstules, uz kurām neviens nav atbildējis, un reklāma, par kuru nav skaidrs, vai tā nopelna.

## 1. Rēķini: no e-pasta līdz grāmatvedībai bez cilvēka

Šis ir process, ko katrs SIA īpašnieks pazīst. Piegādātāju rēķini ienāk e-pastā, dažs PDF, dažs attēlā, dažs vienkārši vēstules tekstā. Kāds tos lejupielādē, pārsauc, ieliek mapē pa mēnešiem un pārsūta grāmatvedei. Katru mēnesi no jauna.

Ko dara mūsu sistēma:

- **Skenē divas e-pasta kastes** un atpazīst, kura vēstule vispār satur rēķinu.
- **Nolasa PDF ar mākslīgo intelektu** — piegādātājs, summa, rēķina numurs, datums — arī tad, ja rēķins ir skenēts attēls, nevis teksts.
- **Sakārto failus** *Google Drive* mapēs pa mēnešiem ar konsekventu nosaukumu.
- **Ievada izdevumu** uzskaites panelī, no kura redzama mēneša aina.

Divas lietas, kas šo padara par darbarīku, nevis triku:

**Meklētājs trūkstošajiem rēķiniem.** Ja bankas izrakstā ir maksājums, aiz kura nav rēķina, sistēma pati pārmeklē pastu ap maksājuma datumu, izlasa katru PDF pielikumu un salīdzina pēc summas, numura un piegādātāja. Atradumu sapludina ar maksājumu.

**Iknedēļas revīzija.** Reizi nedēļā process pārbauda, kas joprojām nav savienots, un atsūta *Telegram* kopsavilkumu — sagrupētu pa piegādātājiem un mēnešiem. Nevis brīdinājumu par katru rēķinu atsevišķi, bet vienu sarakstu ar to, kas tiešām jāizdara.

Atsevišķi ir **bankas izraksta nolasītājs**: *Swedbank* izrakstu PDF vai pat ekrānuzņēmums pārtop strukturētā darījumu sarakstā ar kopsummām. Tas ir mazs, bet tieši šis solis parasti ir tas, kur cilvēks pazaudē stundu.

## 2. Klientu e-pasts: AI sagatavo, cilvēks nosūta

Klientu atbalsts ir vieta, kur automatizācija visbiežāk tiek uzbūvēta nepareizi. Vilinājums ir likt robotam atbildēt pašam. Mēs to apzināti nedarām.

Kā strādā mūsu e-veikala atbalsta sistēma:

- Nolasa neizlasīto pastu atbalsta kastē.
- **Uzmeklē klienta reālo pasūtījuma statusu** datubāzē — nevis mineklē, bet paskatās.
- Sagatavo atbildi kā **melnrakstu** *Gmail* kastē un paziņo *Telegram*.
- Cilvēks izlasa, izlabo, ja vajag, un nosūta.

Sistēma **nekad nesūta pati un nekad nemaina pasūtījumu**. Tā ir apzināta izvēle, ne tehnisks ierobežojums.

Ap to ir vēl trīs mazi procesi, kas atrisina to, ko lielā sistēma nepamana:

- **Automātiska kārtošana** — viss, kas nav īsta klienta vēstule, tiek arhivēts uzreiz, lai kastē paliek tikai klienti. Nepazīstamus sūtītājus tā apzināti atstāj kastē, nevis min.
- **Neatbildēto vēstuļu uzraugs** — atrod sarunas, kurās pēdējais ziņojums ir no klienta un neviens nav atbildējis. Izlasīta, bet neatbildēta vēstule pirmajam procesam ir neredzama uz visiem laikiem.
- **Telegram bots komandai** — atbild uz jautājumiem par pasūtījumiem un pastu. Tikai lasa, neko nemaina.

Mazam uzņēmumam vērtīgākais te nav ietaupītais laiks uz vienu vēstuli. Tas ir, ka **neviena vēstule vairs neizkrīt**.

## 3. Reklāmas mērīšana: dati, kas nepazūd līdz ar sīkdatnēm

Ja tavas reklāmas rezultāti pēdējos gados ir kļuvuši neizskaidrojami, iemesls parasti nav reklāma. Iemesls ir tas, ka pārlūks vairs neatļauj *Meta* redzēt to, ko agrāk redzēja.

Risinājums ir mērīt no servera puses. Mēs uzbūvējām starpnieku, kas:

- saņem konversijas notikumus no mājaslapas,
- **jauc identifikatorus** pirms tālāksūtīšanas (*Meta Conversions API* prasa jauktus datus — tas nav tikai privātuma jautājums),
- pārsūta tos *Meta* ar to pašu `event_id`, ko lieto pikselis pārlūkā.

Tas pēdējais punkts ir viss noslēpums: **kopīgs `event_id` nozīmē, ka *Meta* atpazīst abus signālus kā vienu notikumu** un neskaita to divreiz. Bez tā serverpuses mērīšana pieskaita pirkumus, kuru nav.

Tā paša principa turpinājums ir maksājumu sistēmas savienojums: kad *Stripe* apstiprina apmaksu, notikums aiziet ar **reālo summu** un ar sesijas identifikatoru kā `event_id`, tāpēc atkārtots mēģinājums nevar radīt dubultu pirkumu.

Reklāmu pusē mēs strādājam arī programmatiski — kampaņas, reklāmu kopas, budžeti un radošie materiāli caur API, nevis ar roku saskarnē. Ar vienu stingru noteikumu, par kuru zemāk.

## 4. Saturs: no idejas līdz publikācijai

Satura konveijers ir vienkāršākā daļa un tā, kur AI dod vismazāk, nekā cerēts. Tas, kas strādā:

- **Ideju savākšana** — automātiski skenējam nozares avotus un atlasām tikai tos ierakstus, kuros ir konkrēts padoms, nevis vispārīga doma.
- **Balss ieraksts kā sākumpunkts** — *Telegram* nosūtīta doma pārtop melnrakstā. Īpašnieks runā mašīnā, nevis sēž pie tukšas lapas.
- **Publicēšana pa kanāliem** pēc apstiprinājuma.

Un viena lieta, kas attiecas tieši uz latviešu tirgu: **lokalizācija nav tulkošana**. Mūsu process ņem apstiprinātu angļu ierakstu un pārraksta to latviski ar skaidru aizliegumu tulkot burtiski. Mašīntulkots mārketinga teksts latviski ir uzreiz atpazīstams, un tas maksā uzticību.

## 5. Kad automatizācija drīkst rīkoties pati

Šī ir tā sadaļa, ko prezentācijās parasti izlaiž, un tieši tā atšķir sistēmu, kas strādā gadu, no tādas, kuru pēc mēneša izslēdz.

Mūsu noteikumi:

| Drīkst pati | Nedrīkst bez cilvēka |
|---|---|
| Lasīt, kārtot, arhivēt | Sūtīt klientam vēstuli |
| Sagatavot melnrakstu | Mainīt cenu |
| Ievadīt izdevumu uzskaitē | Ieslēgt reklāmas kampaņu |
| Brīdināt par problēmu | Tērēt naudu klienta vārdā |

Konkrēts piemērs: **reklāmas kampaņas mūsu sistēmā vienmēr tiek izveidotas apturētas.** Ieslēgt tās var tikai cilvēks, jo tieši tas solis sāk reālus tēriņus. Tehniski nekas neliedza darīt citādi — mēs to aizliedzām apzināti.

Otrs: **kļūdu paziņotājs.** Katra darbplūsma ziņo par savu neveiksmi vienā vietā — nosaukums, mezgls, kļūda, saite. Automatizācija bez šī nav automatizācija, bet klusa riska uzkrāšana. Tu neuzzini, ka process ir miris, kamēr kāds nepajautā, kur palika rēķini.

## 6. Kā saprast, vai reklāma tiešām nopelna

Automatizācija bez mērīšanas tikai paātrina nepareizus lēmumus. Trīs principi, kas mums ir izmaksājuši visdārgāk, lai tos iemācītos:

**Rēķini robežu, ne vidējo.** Vidējā klienta piesaistes izmaksa neko nepasaka, ja daļa produktu nes peļņu un daļa ne. Nozīme ir tam, cik maksā *nākamais* klients katrā segmentā, un vai tas joprojām ir zem sliekšņa, virs kura tu strādā ar zaudējumiem.

**Salīdzini periodus godīgi.** Ja vienlaikus mainījās cena, budžets un radošais materiāls, tu nezini, kas nostrādāja. Salīdzināmi ir tikai periodi ar vienu izmaiņu.

**Pārbaudi secinājumu vēlreiz, pirms rīkojies.** Mums bija skaidrs atradums par ievērojamu konversijas kritumu, uz kura pamata gandrīz tika pārtaisīta lapa. Pārrēķinot ar citu datu avotu, **kritums neatkārtojās** — sākotnējais rezultāts bija mērījuma artefakts. Diena, kas iztērēta pārbaudei, ietaupīja nedēļu darba nepareizā virzienā.

Tas pats attiecas uz iemesliem. Kad mūsu reklāmu rezultāts nedēļas nogalēs sabruka, pirmais izskaidrojums bija budžets. Pareizais iemesls izrādījās cits: viena nogurusi reklāma bija ieslēgta atpakaļ un pakāpeniski pārņēma lielāko daļu budžeta, kamēr pati kļuva arvien neefektīvāka. To atklāja, salīdzinot piecus neatkarīgus datu avotus. **Ticamākais izskaidrojums un pareizais izskaidrojums nav viens un tas pats.**

## Ar ko sākt

Nevis ar rīku. Ar procesu, kas tev jau tagad apnicis.

1. **Uzraksti, ko dari katru nedēļu ar rokām.** Konkrēti: "lejupielādēju rēķinus no pasta un pārsaucu tos".
2. **Izvēlies to, kas atkārtojas visbiežāk un ir visgarlaicīgākais.** Ne to, kas šķiet vismodernākais.
3. **Automatizē pusi.** Lai sistēma sagatavo, cilvēks apstiprina. Pilnu automātiku ieslēdz tikai tad, kad mēnesi esi redzējis, ka sagatavotais ir pareizs.
4. **Uzliec brīdinājumu par kļūdām**, pirms uzliec otro procesu.

Pirmais process, kas nostrādā, parasti atbrīvo vairākas stundas mēnesī. Vērtīgākais tomēr ir cits: kad redzi, ka viens process strādā bez tevis, kļūst redzami pārējie desmit.

## Biežāk uzdotie jautājumi

**Vai tam vajag programmētāju?**
Pirmajiem procesiem — nē. Vajag skaidru aprakstu, ko process dara un ko tas nedrīkst darīt. Sarežģītākajiem, kur jāsavieno datubāze, maksājumi un reklāmu konti, jā.

**Cik tas maksā?**
Rīku izmaksas mazam uzņēmumam parasti ir dažu desmitu eiro robežās mēnesī. Galvenā izmaksa ir uzbūvēšana un tas, ka procesu vajag pieskatīt pirmajās nedēļās.

**Vai AI nekļūdās?**
Kļūdās. Tāpēc iepriekšējā sadaļa ir par to, kam automatizācija drīkst pieskarties bez cilvēka. Rēķina nolasīšana nepareizi ir laba kļūda — to pamana un izlabo. Nepareiza vēstule klientam nav.

**Vai to var uzbūvēt uz maniem esošajiem rīkiem?**
Parasti jā. Visi piemēri šajā rakstā strādā uz *Gmail*, *Google Drive*, *Telegram*, datubāzes un reklāmu kontiem, kas uzņēmumam jau ir.
