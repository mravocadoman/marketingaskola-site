---
layout: post.njk
title: "Konversiju uzskaite: bez tās Tu nezini, ko reklāma maksā"
seoTitle: "Konversiju uzskaite: kā to uzstādīt | Mārketinga Skola"
description: "Kas ir konversiju uzskaite, kā to uzstādīt Meta un Google reklāmām, kā pārbaudīt, vai tā tiešām strādā, un četras kļūdas, kas klusi sabojā datus."
date: 2026-09-05
updated: 2026-09-05
image: "/img/gen/cover-konversiju-uzskaite.webp"
categories: ["digitalais-marketings"]
permalink: "/konversiju-uzskaite/"
keywords: ["konversiju uzskaite", "Conversions API", "Meta pikselis", "Google Analytics 4", "Event Match Quality"]

---

Sāksim ar to, ko konversiju uzskaite nedara. Tā nepadara reklāmu lētāku. Tā neatved klientus un neuzlabo piedāvājumu.

Tā dara divas citas lietas, un abas ir svarīgākas, nekā sākumā šķiet. Pirmkārt, tā **parāda**, cik patiesībā maksā klients, nevis klikšķis. Otrkārt, tā dod Meta un Google algoritmiem, **no kā mācīties**. Ja rezultāti līdz tiem nenonāk, sistēma turpina meklēt cilvēkus, kuri klikšķina, nevis tos, kuri pērk.

Cenu pēc tam samazina lēmumi. Uzskaite tikai ļauj tos pieņemt. Bez tās Tu nepieņem sliktus lēmumus. Tu tos nepieņem vispār, jo nav datu, uz kuriem balstīties.

Šis raksts ir par to, kā to salikt: kas skaitās konversija, kā to uzstādīt, kā pārbaudīt, vai tā tiešām strādā, un ko nedarīt.

## Kas ir konversija un kas nav

Konversija ir darbība, kurai Tavā biznesā ir reāla naudas vērtība. Pirkums, aizpildīta pieteikuma forma, zvans, rezervācija, cenas pieprasījums.

Konversija **nav** lapas apskate, ritināšana līdz pusei, video noskatīšanās vai klikšķis uz izvēlnes. Šos rādītājus var mērīt, bet uz tiem nedrīkst optimizēt reklāmu. Sistēma iemācīsies tos dabūt lēti, un Tu maksāsi par cilvēkiem, kuri neko nepirks.

Praktiskais tests: ja darbība tuvākajā mēnesī netuvina Tevi ieņēmumiem, tā nav konversija. Lielākajai daļai uzņēmumu pietiek ar vienu vai divām.

## Trīs slāņi, kas jāsaliek

Konversiju uzskaite nav viens rīks. Tie ir trīs slāņi, un katrs dara ko citu.

**Pirmais slānis: Tavi paša dati.** [Google Analytics 4](https://analytics.google.com/) parāda, kas notiek mājaslapā neatkarīgi no reklāmas: no kurienes cilvēki nāk, kur apstājas, cik no viņiem pabeidz darbību. Šis ir slānis, pēc kura Tu pieņem lēmumus.

**Otrais slānis: reklāmu sistēmu mācīšanās.** Meta pikselis un Conversions API, Google Ads konversiju uzskaite. Šis slānis nav domāts Tev. Tas ir domāts algoritmam, lai tas saprastu, kādus cilvēkus meklēt.

**Trešais slānis: piekrišana.** Eiropā izsekošanai vajag lietotāja piekrišanu, un tā ietekmē abus iepriekšējos slāņus. Ja sīkdatņu paziņojums nav savienots ar mērīšanas rīkiem, dati vai nu netiek savākti, vai tiek savākti nelikumīgi.

{% infographic { id: "info-konversiju-uzskaites-slani", title: "Konversiju uzskaite trijos slāņos", items: [
 { label: "Tavi dati", text: "Google Analytics 4: lēmumiem." },
 { label: "Reklāmu sistēmas", text: "Pikselis, Conversions API, Google Ads: algoritmam." },
 { label: "Piekrišana", text: "Bez tās dati vai nu nav, vai nav likumīgi." }
] } %}

## Meta: pikselis vairs nepietiek

Pikselis strādā pārlūkprogrammā, un pārlūkprogrammas to arvien biežāk bloķē. Praksē tas nozīmē, ka daļu pirkumu Meta vienkārši neredz.

Risinājums ir Conversions API: notikumi tiek sūtīti no Tava servera, kur reklāmu bloķētāji tiem netiek klāt. Agrāk tam vajadzēja izstrādātāju. Kopš 2026. gada pavasara Meta piedāvā pamata uzstādīšanu ar vienu klikšķi un bez maksas, un lielākajai daļai mājaslapu platformu ir gatavs pieslēgums. Sarežģītāki gadījumi, piemēram, pielāgoti notikumi vai pārdošana ārpus mājaslapas, joprojām prasa darbu.

Abus uzstāda [Meta Events Manager](https://business.facebook.com/events_manager2/) sadaļā.

**Divas lietas, kas jāpārbauda pēc uzstādīšanas.**

Pirmā ir **dublēšanās**. Ja vienu pirkumu sūta gan pikselis, gan serveris, Meta drīkst to ieskaitīt tikai vienu reizi. Tas notiek automātiski, ja abi notikumi sūta vienādu `event_id` un vienādu nosaukumu. Ja viss ir pareizi, Events Manager rāda, ka notikums saņemts no diviem avotiem, bet ieskaitīts vienu reizi.

Otrā ir **notikumu atbilstības kvalitāte** jeb Event Match Quality. Tas ir vērtējums no 1 līdz 10 par to, cik labi Tavi dati sakrīt ar reāliem cilvēkiem. Zem 5 sistēma mācās slikti. Virs 7 tā strādā normāli. Rādītāju visvairāk uzlabo e-pasta adreses un telefona numura nodošana kopā ar notikumu. Protams, tikai tad, ja cilvēks tos ir devis un piekritis to izmantošanai.

## Google: konversijas, ne apmeklējumi

Google Ads pusē princips ir tāds pats. Kampaņa var optimizēties uz konversijām tikai tad, ja tās ir definētas.

Praktiskā secība ir vienkārša. Google Analytics 4 atzīmē notikumu kā galveno notikumu, pēc tam importē to Google Ads kontā kā konversiju. Alternatīvi Google Ads uzskaites kodu var ievietot tieši paldies lapā.

Vienu lietu Latvijā aizmirst īpaši bieži: **zvanus**. Pakalpojumu uzņēmumos liela daļa pieteikumu nāk pa telefonu, un tie nekur neparādās. Google Ads var uzskaitīt zvanus no reklāmas un no mājaslapā redzamā numura. Bez tā pusi rezultāta neredz neviens.

Kā to visu ielikt pirmajā kampaņā, aprakstīts rakstā [Google Ads: kā palaist pirmo kampaņu](/google-ads-pirma-kampana/), bet kanāla vispārīgais vērtējums ir rakstā [vai Google reklāma ir efektīva](/google-reklama/).

## Kā pārbaudīt, vai tiešām strādā

Uzstādīt un noticēt nav viens un tas pats. Pārbaude aizņem piecpadsmit minūtes.

1. **Veic testa darbību pats.** Aizpildi formu vai izdari pirkumu ar testa datiem.
2. **Meta Events Manager**, sadaļa Test Events: notikumam jāparādās dažu sekunžu laikā, ar pareizu nosaukumu.
3. **Google Analytics 4**, DebugView: tas pats notikums jāredz arī tur.
4. **Salīdzini ar realitāti.** Pēc nedēļas paņem sistēmas rādīto pirkumu skaitu un salīdzini ar grāmatvedību. Ja atšķirība pārsniedz aptuveni divdesmit procentus, kaut kas netiek uzskaitīts.

Ceturtais solis ir svarīgākais, un to izlaiž gandrīz visi. Pirmie trīs pārbauda, vai signāls aiziet. Tikai šis solis pārbauda, vai signāls ir pareizs.

{% infographic { id: "info-konversiju-parbaude", title: "Četri soļi, lai pārbaudītu uzskaiti", items: [
 { label: "Veic testa darbību", text: "Aizpildi formu vai nopērc ar testa datiem." },
 { label: "Pārbaudi Meta pusē", text: "Events Manager, sadaļa Test Events." },
 { label: "Pārbaudi Google pusē", text: "Analytics DebugView." },
 { label: "Salīdzini ar grāmatvedību", text: "Pēc nedēļas, ne pēc dienas." }
] } %}

## Četras kļūdas, kas sabojā datus

**Viss ir konversija.** Ja kontā ir atzīmētas septiņas konversijas, tostarp lapas apskates, sistēma optimizējas uz lētāko no tām. Atstāj vienu vai divas, kas tiešām nozīmē naudu.

**Dubulta uzskaite.** Pikselis un serveris vienu pirkumu sūta divreiz, un atdeve izskatās divreiz labāka, nekā ir patiesībā. Lēmumi, kas pieņemti pēc šādiem datiem, maksā dārgi.

**Uzskaite bez piekrišanas.** Sīkdatņu paziņojums, kas neko neietekmē, ir juridisks risks, nevis formalitāte. Google piedāvā piekrišanas režīmu, kas ļauj daļu datu modelēt, ja cilvēks atsakās no izsekošanas.

**Uzstādīts vienreiz un aizmirsts.** Mājaslapas maiņa, jauns formas spraudnis vai pārtaisīta paldies lapa var klusi apturēt uzskaiti. Pārbaudi to reizi ceturksnī.

## Ar ko sākt, ja nav nekā

Šādā secībā, viens solis dienā:

1. Pievieno Google Analytics 4 un atzīmē vienu galveno notikumu.
2. Uzstādi Meta pikseli un pieslēdz Conversions API.
3. Importē konversiju Google Ads kontā, ja tur reklamējies.
4. Veic testa darbību un pārbaudi visus trīs.

Pēc tam divas nedēļas neko nemaini un ļauj sistēmām savākt datus. Kāpēc pacietība te ir daļa no darba, aprakstīts rakstā [Facebook reklāmas: kā reklamēt savu biznesu internetā](/facebook-reklamas-izstrade/), bet biežākās kļūdas kontā rakstā [5 visizplatītākās kļūdas reklāmas izvietošanā Facebook](/5-visizplatitakas-kludas-reklamas-izvietosana-facebook/).

Ja reklāmas budžets jau tiek tērēts, šis ir darbs, pēc kura pirmo reizi redzēsi, kur tas aiziet. Cik reklāma maksā praksē, esam sarēķinājuši rakstā [cik maksā reklāma Facebook](/cik-maksa-reklama-facebook/).

## Kāpēc to parasti neizdara pats īpašnieks

Nevis tāpēc, ka tas būtu grūti. Tāpēc, ka tas ir darbs, kuru izdara vienu reizi, un darbu, ko dara vienu reizi, neviens īsti neprot.

Uzskaite nekad nesalūst skaļi. Tā nesūta paziņojumu. Formas spraudnis atjaunojas, paldies lapa tiek pārtaisīta, un notikums vienkārši pārstāj sūtīties. Reklāma turpina strādāt, atskaites turpina rādīt skaitļus, un pēc trim mēnešiem izrādās, ka sistēma visu šo laiku ir optimizējusies uz nepareizo darbību. Nauda ir iztērēta, un sliktākais ir tas, ka zaudēta arī mācīšanās. Dati par šo periodu vairs nav izmantojami.

Tieši te ir atšķirība starp cilvēku, kurš savu kontu redz vienu reizi, un cilvēku, kurš redz desmitiem kontu. Mēs nezinām Tavu biznesu labāk par Tevi. Bet mēs zinām, kā izskatās salūzusi uzskaite, jo esam redzējuši visus veidus, kā tā mēdz salūzt. Tāpēc pārbaudām tieši šīs vietas, pirms vispār pieskaramies kampaņai.

Un ir vēl viens arguments, kuru vērts pateikt skaidri. Stunda, ko Tu pavadi Events Manager sadaļā, ir stunda, ko nepavadi pie piedāvājuma, cenas vai sarunas ar klientu. Tieši tur ir Tava priekšrocība, kuru neviens ārējs partneris nevar aizstāt. Tehnisko slāni var deleģēt. Iemeslu, kāpēc cilvēki pērk tieši pie Tevis, nevar.

## Nākamais solis

**Ja gribi to saprast un uzstādīt pats**, tam ir domāts [Meta reklāmas kurss](/meta-reklamas-kurss/) un [Google Ads kurss](/google-ads-kurss/). Trīs stundas tiešsaistē, mazā grupā, ar Tavu kontu ekrānā, nevis ar teoriju.

**Ja gribi, lai to vienkārši salīdzina un salabo**, sāc ar [individuālo konsultāciju](/marketinga-konsultacijas/). Vienā stundā izejam cauri Tavam kontam un pasakām, kas skaitās pareizi, kas neskaitās vispār un ko darīt vispirms. Konkrēts saraksts, ko vari izpildīt pats vai iedot kādam citam.

**Ja gribi, lai kontu vada un uztur kāds cits**, apskati [Facebook un Instagram reklāmas pakalpojumu](/facebook-reklama/) vai [AI un automatizācijas pakalpojumu](/ai-un-automatizacijas/).

Lai kuru variantu izvēlies, izdari to pirms nākamā budžeta, nevis pēc tā. Nauda, kas iztērēta ar salūzušu uzskaiti, nav tikai iztērēta. Tā arī nav neko iemācījusi.
