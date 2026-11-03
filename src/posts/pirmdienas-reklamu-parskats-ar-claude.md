---
layout: post.njk
title: "Pirmdienas reklāmu sapulce kā Claude uzdevums: prompts un noteikumi"
seoTitle: "Pirmdienas Meta reklāmu pārskats ar Claude | Mārketinga Skola"
description: "Kā Claude katru pirmdienu izvērtē Meta reklāmas, aptur, palielina vai atstāj tās pēc rakstītiem noteikumiem un atsūta īsu ziņu. Prompts un noteikumi."
date: 2026-11-03
image: "/img/gen/cover-pirmdienas-reklamu-parskats-ar-claude.webp"
categories: ["socialo-tiklu-reklama","maksligais-intelekets"]
permalink: "/pirmdienas-reklamu-parskats-ar-claude/"
keywords: ["Meta reklāmas","Claude","reklāmu pārskats","pirkuma izmaksas","checkout","automatizācija"]
magnet: "PIRMDIENA"
---
Iedomājies pirmdienas rītu: atver Ads Manager un atkal domā: „Kuras reklāmas apturēt un kurām palielināt budžetu?” Rihards Zeila sava print-on-demand e-komercijas projekta Meta kontā pirmdienas pārskatu uztic ieplānotam Claude uzdevumam, kas kopš 2026. gada oktobra sākuma drīkst arī mainīt reklāmas iepriekš uzrakstītu noteikumu robežās. Šajā ceļvedī atradīsi Riharda darba kārtību un kopējamu promptu, ko pielāgot Tavam kontam.

## Pieraksti savas robežas, pirms dod Claude atļauju

Claude vajag nevis vispārīgu uzdevumu „uzlabo reklāmas”, bet skaidras robežas. Sāc ar saviem finanšu rādītājiem.

Pieraksti kopā ar datumu:

* **Break-even jeb augstāko pirkuma cenu, pie kuras vēl nezaudē:** cik daudz reklāmā vari samaksāt par vienu pirkumu, pirms pārdošana rada zaudējumus.
* **Mērķa pirkuma cenu:** cik Tu vēlies maksāt reklāmā par vienu pirkumu.
* **Konta dienas budžeta griestus:** cik daudz viss reklāmas konts drīkst tērēt dienā bez Tavas papildu atļaujas.

Claude piemēros Tavus skaitļus, bet pats nevarēs pateikt, vai finanšu robežas ir pareizas. Rūpīgākais darbs būs nevis prompta kopēšana, bet savu robežu noteikšana.

Darbam vajadzīgs Claude plāns ar ieplānotiem uzdevumiem, savienojums Meta datu lasīšanai un atsevišķs savienojums reklāmu mainīšanai. Ieplānots uzdevums ir Claude sesija, kas pati sākas noteiktā laikā.

Rihards datu lasīšanai izmanto Windsor.ai. Ja Tu uzturi dashboard jeb pārskatu paneli, uzdevumā vari iekļaut arī paneļa atjaunošanu.

Rēķinies ar Claude plāna un savienojumu izmaksām, kā arī reklāmas budžetu. Programmēt nav vajadzīgs, taču izstrādātājs var palīdzēt pieslēgt reklāmas kontu, ja savā darbā Claude savienojumus vēl neizmanto.

{% infographic { id: "info-pirmdienas-reklamu-parskats-ar-claude", title: "Pirmdienas pārskats četros soļos", items: [
  { label: "Secība", text: "Vispirms pirkuma izmaksas" },
  { label: "Par agru?", text: "Mazāk par 3 dienām: gaidi" },
  { label: "Lēmums", text: "Apturēt, palielināt vai atstāt" },
  { label: "Ziņa", text: "Ko mainīja un kāpēc" }
] } %}

## Vērtē pēc pirkuma cenas, nevis pēc visiem klikšķiem

Pirmdienas pārskatā saglabā vienādu rādītāju secību. Reklāmu vērtē pēc pārdošanas, nevis pēc aktivitātes ap reklāmu.

* **Pirkuma cena:** cik reklāmā izmaksāja viens pirkums. Galvenais lēmuma rādītājs.
* **Sāktie checkout:** vai cilvēki sāk noformēt pirkumu jau tad, kad pirkumu vēl ir maz.
* **Link CPC:** cik maksā saites klikšķis uz Tavu vietni.
* **Link CTR un CPM:** saites klikšķu īpatsvars un reklāmas rādīšanas izmaksu rādītājs. Abi ir palīgrādītāji.

Meta kopējie „clicks”, „CTR” un „CPC” ietver arī reakcijas un profila klikšķus. Pēc kopējiem klikšķiem vari kļūdaini palielināt budžetu reklāmai, kas cilvēkiem patīk, nevis reklāmai, kas pārdod.

Arī lēts saites klikšķis pats par sevi nav iemesls palielināt budžetu. Sāc ar pirkuma cenu.

## Nosaki, kad reklāmu apturēt un kad nogaidīt

Riharda noteikumos reklāma ir pietiekami pārbaudīta, ja darbojusies vismaz 3 dienas **un** saņēmusi vismaz 30 saites klikšķus. Liels iztērētais budžets viens pats nenozīmē, ka tests ir pabeigts.

Lēmumiem ir konkrēta secība:

* **Izņēmums, kad aptur uzreiz:** ja reklāmai ir vismaz 30 saites klikšķi, bet neviens nav sācis checkout, to aptur neatkarīgi no vecuma.
* **Nogaidi ar nepārbaudītu reklāmu:** ja reklāma darbojusies mazāk nekā 3 dienas vai saņēmusi mazāk nekā 30 saites klikšķus, neaiztiec reklāmu, izņemot iepriekš aprakstīto gadījumu.
* **Pārbaudi checkout noplūdi:** ja ir vismaz 10 sākti checkout, bet ar pirkumu beidzas mazāk nekā 10 %, atzīmē piedāvājuma vai landing page problēmu. Reklāmu neapturi.
* **Salīdzini pirkuma cenu ar break-even:** pēc pietiekama testa apturi reklāmu, ja pirkuma cena pārsniedz Tavu robežu un nav checkout noplūdes.

Checkout noplūdi pārbaudi **pirms** tam, kad aptur reklāmu augstas pirkuma cenas dēļ. Pretējā gadījumā Claude var apturēt reklāmu, kas atved pircējus, ja problēma ir piedāvājumā vai landing page.

Reklāmu ar mazu tēriņu vērtē kopā ar tās saimi: reklāmām, kuru nosaukumi sākas vienādi un kuras pārbauda vienu ideju. Atsevišķai reklāmai ar mazu tēriņu nepietiek datu patstāvīgam secinājumam.

Budžetu palielini kampaņai, kuras pirkuma cena katrā no pēdējām 3 pilnajām dienām bijusi zem mērķa. Palielinājums ir no 20 līdz 30 %, nepārsniedzot kopējos dienas budžeta griestus.

## Salīdzini ar Riharda kontu, nevis pārņem viņa mērķus

Riharda konta rādītāji mērīti **2026. gada oktobra sākumā**. Tava konta skaitļi atšķirsies, tāpēc izmanto salīdzinājumu, lai saprastu atšķirību starp rezultātiem, nevis noteiktu savus mērķus.

| Rādītājs | Reklāmas ar labiem rezultātiem | Apturētās reklāmas |
| :--- | :--- | :--- |
| Link CPC | No 0,44 līdz 0,62 $ | No 0,98 līdz 1,84 $ |
| CPM | No 11 līdz 15 $ | No 18 līdz 31 $ |

Riharda kontā ar pirkumu beidzās no 15 līdz 38 % sākto checkout. Tāpēc robeža zem 10 % bija ievērojami zemāka par kontā novēroto diapazonu.

Riharda kontā checkout sākās aptuveni pēc katra desmitā saites klikšķa. Ja Tavā kontā checkout sāk daudz retāk, palielini 30 klikšķu slieksni. Neapturi reklāmas pēc sveša konta ritma.

<!-- gate -->

## Sakārto nosaukumus un vispirms pieslēdz datu lasīšanu

Vienas idejas reklāmām piešķir vienādu nosaukuma sākumu. Piemēram, „Angle1 A”, „Angle1 B” un „Angle1 C” ļauj Claude atpazīt reklāmu saimi arī tad, ja atsevišķai reklāmai tēriņš ir mazs.

Vispirms pieslēdz Windsor.ai vai citu Meta datu lasīšanas rīku. Atļauju mainīt reklāmas vēl nedod.

Datu pārbaudei izmanto atsevišķu pieprasījumu:

```text
Par katru aktīvo reklāmu pēdējās 7 dienās parādi iztērēto budžetu, saites klikšķus, sāktos checkout, pirkumus un pirkuma cenu. Reklāmas kontā neko nemaini.
```

Salīdzini vairāku reklāmu skaitļus ar Ads Manager. Tikai tad, kad skaitļi sakrīt, pievieno savienojumu, kas ļauj apturēt reklāmas, mainīt budžetu un palaist jaunu testu.

Ja savienojums neatpazīst datu lauku, Claude jāmeklē īstais lauka nosaukums savienojuma dokumentācijā vai lauku sarakstā. Lauka nosaukumu nedrīkst uzminēt.

## Iekopē promptu un aizpildi sava konta datus

Aizstāj visas figūriekavas ar sava konta informāciju un pielāgo sliekšņus saviem datiem. Saglabā rādītāju un lēmumu secību.

```text
Tu vadi pirmdienas reklāmu pārskatu manam Meta reklāmas kontam {KONTS}.

Tev ir mana pastāvīgā atļauja rīkoties šo noteikumu robežās bez papildu jautājumiem. Pēc darbībām atsūti pārskatu. Par jebkuru darbību ārpus noteikumiem vispirms jautā man.

RĪKI
- Lasi datus ar {DATU_LASĪŠANAS_RĪKS}.
- Maini reklāmas ar {IZMAIŅU_RĪKS}.
- Atjauno pārskatu paneli: {PANELIS_VAI_NAV}.
- Nosūti pārskatu uz {PĀRSKATA_ADRESĀTS}.
- Ja datu lauks nedarbojas, pārbaudi savienojuma īsto lauku sarakstu. Neuzmini lauku nosaukumus.

MANAS ROBEŽAS
- Break-even pirkuma cena: {BREAK_EVEN}. Virs šīs cenas reklāma rada zaudējumus.
- Mērķa pirkuma cena: {MĒRĶIS}.
- Kopējā dienas budžeta griesti: {DIENAS_BUDŽETS}.
- Nepārsniedz dienas budžeta griestus bez manas atļaujas.

DATU SECĪBA
- Vispirms vērtē pirkuma cenu. Pirkuma cena nosaka lēmumu.
- Tad vērtē sāktos checkout.
- Tad vērtē link CPC.
- Beigās vērtē link CTR un CPM tikai kā palīgrādītājus.
- Nerindo reklāmas pēc kopējiem clicks, CTR vai CPC, jo kopējie rādītāji ietver arī reakcijas un profila klikšķus.

REKLĀMU LĒMUMU SECĪBA
- Ja reklāmai ir vismaz 30 saites klikšķi, bet neviens nav sācis checkout, apturi reklāmu neatkarīgi no vecuma.
- Citādi reklāma, kas darbojusies mazāk nekā 3 dienas vai saņēmusi mazāk nekā 30 saites klikšķus, ir nepārbaudīta. Neapturi reklāmu neatkarīgi no tēriņa. Pārskatā pasaki, kāpēc nogaidi.
- Pietiekams tests nozīmē vismaz 3 dienas UN vismaz 30 saites klikšķus.
- Pēc pietiekama testa vispirms pārbaudi checkout. Ja ir vismaz 10 sākti checkout, bet ar pirkumu beidzas mazāk nekā 10 %, atzīmē piedāvājuma vai landing page problēmu. Reklāmu neapturi.
- Ja checkout noplūdes nav un pirkuma cena pārsniedz {BREAK_EVEN}, apturi reklāmu.
- Reklāmu ar mazu tēriņu vērtē kopā ar reklāmu saimi, nevis atsevišķi. Saimi nosaka vienāds reklāmas nosaukuma sākums.

BUDŽETA PALIELINĀŠANA
- Ja kampaņas pirkuma cena katrā no pēdējām 3 pilnajām dienām ir zem {MĒRĶIS}, palielini kampaņas budžetu par 20 līdz 30 %.
- Pēc izmaiņas visu dienas budžetu summa nedrīkst pārsniegt {DIENAS_BUDŽETS}.
- Ja palielinājums pārsniegtu griestus, budžetu nemaini un jautā man.

NĀKAMAIS TESTS
- Palaid nākamo testu.
- 80 % testa budžeta atvēli variācijām no reklāmām, kas jau sevi pierādījušas.
- Katrā variācijā maini tikai vienu elementu: virsrakstu, attēlu vai formātu.
- 20 % testa budžeta paredzi vienai pārdrošai idejai.
- Vienā testā nekad nemaini divus elementus.

NOSLĒGUMĀ
Atjauno pārskatu paneli, ja panelis ir norādīts.

Atsūti īsu pārskatu ar šādām daļām:
- Ko mainīji un kuri skaitļi pamato katru izmaiņu.
- Kuras reklāmas un testi pašlaik darbojas.
- Kuri jautājumi prasa manu lēmumu.
- Ko nevarēji pārbaudīt.

Skaidri nosauc nepārbaudīto informāciju. Nekad neaizstāj trūkstošus datus ar minējumu.
```

Pirms uzdevuma saglabāšanas pārbaudi, vai promptā nav palikušas neaizpildītas figūriekavas. Īpaši pārbaudi budžeta griestus un pārskata saņēmēju.

## Izmēģini pārskatu bez atļaujas mainīt reklāmas

Ieplāno Claude uzdevumu pirmdienas rītam. Pirmajās palaišanas reizēs prompta pašā sākumā pievieno:

```text
Šonedēļ reklāmas kontā neko nemaini. Atsūti pārskatu par darbībām, kuras Tu ieteiktu, un pamato katru ieteikumu ar datiem.
```

Salīdzini Claude ieteikumus ar saviem lēmumiem. Ja nepiekrīti ieteikumam, precizē noteikumu ar skaitli, nevis pievieno neskaidru prasību „vērtē uzmanīgāk”.

Piemēram, 2 dienas veca reklāma ar 20 saites klikšķiem vēl nav pietiekami pārbaudīta neatkarīgi no iztērētā budžeta. Pārskatā jābūt skaidram lēmumam nogaidīt.

Pārej pie automātiskām izmaiņām tikai pēc pilna pārskata izlasīšanas, kad piekrīti katrai ieteiktajai darbībai.

## Dod pastāvīgo atļauju un lasi neatrisinātos jautājumus

Kad izmēģinājuma pārskats sakrīt ar Tavu vērtējumu, izdzēs norādi neko nemainīt. Claude drīkstēs rīkoties noteikumu robežās un pēc tam ziņot par izmaiņām.

Tavā pirmdienas pārskatā īpašu uzmanību prasa jautājumi, kuriem vajadzīgs Tavs lēmums, un informācija, ko Claude nevarēja pārbaudīt. Nepārbaudītais nav pārskata sīkums.

Ja vēl nevēlies pieslēgt automātiskas izmaiņas, sāc ar Ads Manager: saliec blakus pirkuma cenu, sākto checkout skaitu un link CPC. Sakārto reklāmas pēc pirkuma cenas un atzīmē nepārbaudītās reklāmas pēc vecuma un klikšķu skaita.

Vispirms izproti lēmumu secību savā kontā. Pēc tam uztici Claude atkārtojamo darbu.

Avots: [Riharda Zeilas ceļvedis par pirmdienas reklāmu pārskatu ar Claude](https://rihardszeila.com/blog/monday-ads-review-with-claude), kura pamatā ir viņa paša iknedēļas uzdevums.

<!-- /gate -->

## Gribi, lai šādu sistēmu sakārtojam Tavā uzņēmumā?

Šādas sistēmas būvējam klientiem: [mārketinga automatizācija](/marketinga-automatizacija/) no pieteikumu plūsmas līdz atskaitēm, kurās pirmie ir klienti, nevis klikšķi. Ja vēl nezini, ar ko sākt, aizpildi [automatizācijas testu](/automatizacijas-tests/): četri jautājumi, un rezultātu redzi uzreiz.
