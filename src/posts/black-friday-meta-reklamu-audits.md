---
layout: post.njk
title: "Meta reklāmu audits pirms Black Friday: 7 prompti vienai konta pārbaudei"
seoTitle: "Black Friday Meta reklāmu audits ar Claude | Mārketinga Skola"
description: "Septiņi Claude prompti, kas pirms Black Friday tikai nolasa Meta reklāmu datus: faktiskie pasūtījumi, apnikušas reklāmas, budžeta grafiks un apturēšana."
date: 2026-11-03
image: "/img/gen/cover-black-friday-meta-reklamu-audits.webp"
categories: ["socialo-tiklu-reklama","maksligais-intelekets"]
permalink: "/black-friday-meta-reklamu-audits/"
keywords: ["Black Friday","Meta reklāmas","reklāmu audits","Claude","budžets","e-komercija"]
magnet: "AUDITS"
---
Iedomājies, Tu atver Ads Manager un domā: „Kurai reklāmai palielināt budžetu pirms Black Friday?” Meta pirkumu skaits vēl nav Tava veikala apmaksāto pasūtījumu skaits. Pirms piektdienas, 2026. gada 27. novembra, pārbaudi nevis tikai reklāmu rādītājus, bet arī reālos pasūtījumus.

<!-- gate -->

## 1. Salīdzini Meta pirkumus ar veikala pasūtījumiem

Rihards Zeila [savā ceļvedī](https://rihardszeila.com/blog/black-friday-meta-ads-audit) apraksta nedēļu, kurā Meta uzrādīja 68 pirkumus, bet veikals reģistrēja 54 pasūtījumus. Meta ieskaita arī vēlākus pirkumus pēc reklāmas apskates un modelētas konversijas. Atšķirība ietekmē pirkuma cenu.

Audita promptu pamatā ir Riharda noteikumi, ko viņš lieto savā print-on-demand e-komercijas projektā. Konta sliekšņus nevajag automātiski pārņemt kā Tava biznesa mērķus.

**Visi septiņi prompti tikai nolasa datus un sagatavo pārskatu.** Claude neko nemaina reklāmu kontā vai veikalā. Katru lēmumu pieņem Tu, un arī izmaiņas Ads Manager ievadi Tu.

Pirms sāc, sagatavo:

* Claude ar piekļuvi Meta datiem, piemēram, caur Windsor.ai. Ja savienojums piedāvā tikai lasīšanas tiesības, izvēlies lasīšanas tiesības.
* Veikala savienojumu vai pēdējo 14 dienu pasūtījumu failu ar laiku un statusu.
* Savu break-even jeb maksimālo reklāmas cenu par jaunu klientu, pie kuras vēl nezaudē naudu.

Aizstāj figūriekavu saturu ar saviem datiem. Kad savienojumi darbojas, auditam paredzi stundu vai divas. Programmēt nevajag, taču veikala pieslēgšanai var noderēt izstrādātāja palīdzība.

```text
Tikai nolasi datus un sagatavo pārskatu. Neko nemaini reklāmu kontā vai veikalā. Lēmumus pieņemu es.

Salīdzini Meta kontu {KONTA NOSAUKUMS} ar veikala pasūtījumiem par pēdējām 14 pilnajām dienām.

Noskaidro Meta laika joslu un atribūcijas iestatījumu. Veikala pasūtījumu laikus pārrēķini Meta laika joslā.

No Meta nolasi pirkumu skaitu un vērtību pa dienām. No veikala nolasi apmaksātos pasūtījumus un ieņēmumus. Izslēdz testa, atceltos un atmaksātos pasūtījumus.

Parādi tabulu: datums, Meta pirkumi, veikala pasūtījumi, starpība. Pievieno perioda kopsummas un starpību procentos: (Meta pirkumi mīnus veikala pasūtījumi) dalīts ar veikala pasūtījumiem.

Atzīmē dienas, kad pirkumi ir tikai vienā avotā. Norādi iespējamu laika joslas vai uzskaites problēmu.

Noslēgumā norādi Meta novirzi procentos un koeficientu aptuvenai pirkuma cenas korekcijai.

Ja avots nav pieejams vai trūkst skaitļa, pasaki. Neko neizdomā. Ja datu lauks nedarbojas, pārbaudi pieejamo lauku sarakstu.
```

Saglabā novirzi kopā ar pārbaudes datumu. Konta kopējā novirze ir aptuvena korekcija, nevis precīzs katras reklāmas rezultāts.

{% infographic { id: "info-black-friday-meta-reklamu-audits", title: "Audits pirms Black Friday četros soļos", items: [
  { label: "Pasūtījumi", text: "Salīdzini ar Meta skaitli" },
  { label: "Reklāmas", text: "Apnikušās nomaini ar testu" },
  { label: "Budžets", text: "+20 % ik pēc 3 dienām" },
  { label: "Apturēšana", text: "Noteikumi pirms izpārdošanas" }
] } %}

## 2. Sarindo reklāmas pēc pirkumiem, nevis uzmanības

Klikšķi uz saites ved uz vietni, bet Meta kopējie klikšķi ietver arī reakcijas, komentārus un klikšķus uz lapas nosaukuma. Budžetu vērtē pēc pirkumiem un sāktajiem checkout, nevis tikai pēc CTR.

```text
Tikai nolasi datus un sagatavo pārskatu. Neko nemaini reklāmu kontā vai veikalā. Lēmumus pieņemu es.

Sarindo visas Meta konta {KONTA NOSAUKUMS} reklāmas, kurām pēdējās 14 pilnajās dienās bijuši tēriņi.

Katrai parādi tēriņus, pirkumus, pirkuma cenu, sāktos checkout un cenu par vienu sāktu checkout, saites klikšķus, link CPC, link CTR, CPM un kopējos klikšķus.

Prioritātes: zemākā pirkuma cena, sāktie checkout, link CPC, tikai pēc tam CTR un CPM. Reklāmas bez pirkumiem liec zem reklāmām ar pirkumiem.

Konta pirkumu skaita novirze ir {NOVIRZE NO PIRMĀ PROMPTA} %. Blakus Meta pirkuma cenai parādi aptuveni koriģēto cenu. Nepasniedz konta korekciju kā precīzu reklāmas rezultātu.

Atzīmē reklāmas ar daudziem klikšķiem vai augstu CTR, bet maz pirkumiem un sāktiem checkout. Īsi paskaidro, kāpēc klikšķi nepierāda pārdošanu.

Noslēdz ar sarakstiem: reklāmas budžeta palielināšanas izvērtēšanai un reklāmas, kurām ir labi tikai uzmanības rādītāji.

Trūkstošus skaitļus neizdomā. Nederīgiem laukiem pārbaudi pieejamo lauku sarakstu.
```

Pirms palielini budžetu, pārliecinies, ka izvēlētajai reklāmai ir nevis tikai klikšķi, bet arī pirkumi.

## 3. Atšķir nepārbaudītas reklāmas no reklāmām bez rezultāta

Riharda noteikumos reklāma ar mazāk nekā 3 dienām vai 30 saites klikšķiem vēl nav pietiekami pārbaudīta. Taču 30 saites klikšķi bez neviena sākta checkout jau ir atsevišķs brīdinājums neatkarīgi no reklāmas vecuma.

```text
Tikai nolasi datus un sagatavo pārskatu. Neko nemaini reklāmu kontā vai veikalā. Lēmumus pieņemu es.

Sagrupē aktīvās reklāmas Meta kontā {KONTA NOSAUKUMS}.

Katrai nolasi pirmās rādīšanas datumu, aktīvās dienas, tēriņus, saites klikšķus, sāktos checkout un pirkumus no reklāmas sākuma līdz vakardienai.

BEZ REZULTĀTA: vismaz 30 saites klikšķi un neviens sākts checkout neatkarīgi no vecuma. Šim nosacījumam ir priekšroka.

NEPĀRBAUDĪTA: darbojas mazāk nekā 3 dienas vai savākusi mazāk nekā 30 saites klikšķus, ja neietilpst grupā BEZ REZULTĀTA.

VĒRTĒJAMA: visas pārējās reklāmas.

Parādi trīs sarakstus ar skaitļiem, kas pamato iedalījumu. Reklāmām bez rezultāta norādi kopējos tēriņus.

Trūkstošus skaitļus neizdomā. Nederīgiem laukiem pārbaudi pieejamo lauku sarakstu.
```

Nepārbaudītu reklāmu nesteidzies apturēt vai izmantot par Black Friday budžeta pamatu. Par reklāmas apturēšanu lem Tu.

## 4. Atrodi reklāmas, kas cilvēkiem jau apnikušas

Agrāk reklāma varēja nest peļņu, bet tagad cilvēki uz to vairs nereaģē. Īpaši pārbaudi reklāmas, kurām plāno piešķirt papildu budžetu.

```text
Tikai nolasi datus un sagatavo pārskatu. Neko nemaini reklāmu kontā vai veikalā. Lēmumus pieņemu es.

Atrodi nogurušās reklāmas Meta kontā {KONTA NOSAUKUMS}.

Aktīvajām reklāmām, kas darbojas vismaz 7 dienas, salīdzini pirmo 7 dienu link CTR ar pēdējo 7 dienu link CTR. Parādi izmaiņu procentos un pēdējo 7 dienu frequency jeb vidējo rādīšanas biežumu vienam cilvēkam.

Atzīmē reklāmu, ja frequency pārsniedz 2,5 vai link CTR krities vismaz par 30 %.

Katrai atzīmētajai reklāmai parādi rādītājus, pamattekstu un virsrakstu. Piedāvā vienu aizstāšanas testu ar vienu izmaiņu: jaunu tekstu esošajam vizuālim vai esošo tekstu vizuālim, kas jau strādājis citā reklāmā.

Ja maini tekstu, uzraksti tekstu. Testa nosaukumā norādi izmaiņu.

Neizdomā atlaides, dāvanas vai piegādes datumus. Atļautie piedāvājumi: {PIEDĀVĀJUMI VAI “NAV”}.

Trūkstošus skaitļus neizdomā. Nederīgiem laukiem pārbaudi pieejamo lauku sarakstu.
```

Aizstāšanas testā maini nevis visu reklāmu, bet vienu elementu. Jaunās reklāmas izvērtēšanai paredzi 3 dienas un 30 saites klikšķus.

## 5. Pārbaudi, kur pazūd pirkumi

Ja cilvēki sāk pasūtījumu, bet nepabeidz pirkumu, pārbaudi arī piedāvājumu un landing page. Lielāks reklāmu budžets checkout problēmu neatrisina.

```text
Tikai nolasi datus un sagatavo pārskatu. Neko nemaini reklāmu kontā vai veikalā. Lēmumus pieņemu es.

Pārbaudi checkout Meta kontam {KONTA NOSAUKUMS} un veikalam par pēdējām 14 pilnajām dienām.

Katrai reklāmai un kontam kopā parādi sāktos checkout, pirkumus un to, cik no sāktajiem checkout beidzas ar pirkumu.

No veikala nolasi apmaksātos pasūtījumus un, ja pieejams, sāktos un pamestos checkout.

Atzīmē reklāmas un konta kopējo rezultātu, ja ir vismaz 10 sākti checkout, bet ar pirkumu beidzas mazāk nekā 10 %.

Ja problēma redzama vairumam reklāmu, norādi iespējamu piedāvājuma vai landing page problēmu. Ja tikai vienai, salīdzini reklāmas solījumu ar lapas saturu.

Sagatavo manuālo pārbaužu sarakstu šādā secībā: cena un piegādes izmaksas vēl pirms checkout, pirkums telefonā, maksājumu iespējas, nevajadzīgi formas lauki.

Ja avots vai skaitlis nav pieejams, pasaki. Neko neizdomā. Nederīgiem laukiem pārbaudi pieejamo lauku sarakstu.
```

Izmēģini pirkumu savā telefonā no sākuma līdz beigām un pieraksti katru vietu, kur rodas šaubas. Problēmas izlabo pirms budžeta palielināšanas.

## 6. Ieplāno budžeta kāpumu ar datumiem

Ceļvedī izmantotais drošais budžeta kāpums ir ne vairāk kā 20 % ik pēc 3 dienām. Četri palielinājumi budžetu aptuveni dubulto, tāpēc pēdējā sākuma diena ir svētdiena, 15. novembris.

Piemēram, sākot ar 70 $ dienā:

| Datums | Dienas budžets |
| :--- | ---: |
| 15. novembris | 84 $ |
| 18. novembris | 101 $ |
| 21. novembris | 121 $ |
| 24. novembris | 145 $ |
| 27. novembris | 145 $ |

Katrs palielinājums ir atkarīgs no iepriekšējo 3 dienu reālās pirkuma cenas. Ja sāc tikai 15. novembrī, rezerves vairs nav: viens neveiksmīgs solis, un budžets līdz Black Friday nepaspēs divkāršoties.

```text
Tikai nolasi datus un sagatavo plānu. Nemaini budžetu vai iestatījumus. Katru izmaiņu izdaru es.

Izplāno Meta kampaņas {KAMPAŅAS NOSAUKUMS} budžetu līdz piektdienai, 2026. gada 27. novembrim.

Šodiena: {DATUMS}
Pašreizējais dienas budžets: {BUDŽETS}
Black Friday mērķa budžets: {MĒRĶIS}
Mērķa reālā pirkuma cena: {CENA}
Dienas budžeta griesti: {GRIESTI}

Salīdzini manu budžetu ar Meta norādīto. Aprēķini pēdējo 3 pilno dienu reālo pirkuma cenu: Meta tēriņi dalīti ar veikala apmaksātajiem pasūtījumiem.

Palielini plānoto budžetu ne vairāk kā par 20 % vienā solī, starp soļiem atstājot vismaz 3 dienas. Budžeta samazinājumu drīkst plānot jebkurā laikā.

Pirmais palielinājums drīkst būt tikai pēc 4 pilnām kampaņas darbības dienām.

Palielinājums atļauts tikai tad, ja iepriekšējo 3 pilno dienu reālā pirkuma cena nepārsniedz mērķi. Citādi pārbīdi soli un turpmāko plānu par 3 dienām.

Nepārsniedz ne mērķa budžetu, ne griestus.

Tabulā parādi datumu, nedēļas dienu, budžetu veselos skaitļos, attiecību pret sākuma budžetu un rīta pārbaudi.

Norādi rezerves soļu skaitu un sasniedzamo budžetu, ja četri palielinājumi neietilpst laikā. Neiesaki lielu lēcienu starpības kompensēšanai.

Trūkstošus skaitļus neizdomā. Nederīgiem laukiem pārbaudi pieejamo lauku sarakstu.
```

## 7. Uzraksti apturēšanas noteikumus pirms izpārdošanas

Black Friday rītā doma „Pagaidīšu vēl vienu dienu” var šķist pamatota. Iepriekš pierakstīti skaitļi palīdz lēmumu nepārcelt bezgalīgi.

```text
Tikai nolasi datus un sagatavo noteikumu melnrakstu. Neko nemaini reklāmu kontā vai veikalā. Lēmumus pieņemu es.

Mans break-even: {SUMMA}
No vidējā pasūtījuma pēc produkta izmaksām, piegādes, maksājumu komisijām un atgriešanām paliek: {SUMMA}
Black Friday dienas budžets no plāna: {BUDŽETS}
Dienas budžets pēc samazināšanas: {BUDŽETS}

Sagatavo trīs noteikumus ar skaitļiem.

SAMAZINĀT: ja pēdējo 7 dienu reālā pirkuma cena pārsniedz robežu pēc noteiktas iztērētās summas, samazināt budžetu līdz manam norādītajam līmenim. Piedāvā robežu, balstoties uz break-even un to, kas paliek no pasūtījuma, un tēriņu slieksni, balstoties uz dienas budžetu. Parādi aprēķinus.

APTURĒT: ja 3 dienas pēc kārtas nav reālu pirkumu, apturēt kampaņu.

GRIESTI: nepārsniegt konkrētu dienas budžetu bez mana apstiprinājuma. Izmanto budžeta kāpuma plānu.

Pārbaudi pēdējo 14 pilno dienu Meta un veikala datus. Pasaki, vai kāds noteikums jau būtu nostrādājis.

Uzraksti saglabājamu lapu ar šodienas datumu un vienu rindu katram noteikumam. Noslēdz: “Reāli pirkumi ir pasūtījumi manā veikalā, nevis Meta pirkumu skaits.”

Trūkstošus skaitļus neizdomā. Nederīgiem laukiem pārbaudi pieejamo lauku sarakstu.
```

Salīdzini Claude piedāvātos sliekšņus ar savām izmaksām. Nepareizs break-even padara nepareizus arī budžeta noteikumus.

Sāc ar pasūtījumu salīdzinājumu, bet budžeta kāpuma plānu sagatavo ne vēlāk kā 15. novembrī. Saglabā audita secinājumus, datumus un apturēšanas noteikumus vienuviet.

<!-- /gate -->

## Gribi, lai šādu sistēmu sakārtojam Tavā uzņēmumā?

Šādas sistēmas būvējam klientiem: [mārketinga automatizācija](/marketinga-automatizacija/) no pieteikumu plūsmas līdz atskaitēm, kurās pirmie ir klienti, nevis klikšķi. Ja vēl nezini, ar ko sākt, aizpildi [automatizācijas testu](/automatizacijas-tests/): četri jautājumi, un rezultātu redzi uzreiz.
