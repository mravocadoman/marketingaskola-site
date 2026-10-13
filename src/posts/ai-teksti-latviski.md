---
layout: post.njk
title: "Kā panākt, ka AI raksta latviski: instrukcija un pārbaude"
seoTitle: "AI teksti latviski: instrukcija un pārbaude | Mārketinga Skola"
description: "Instrukcija, ar kuru mūsu AI raksta latviešu tekstus, angliskās frāzes, ko labojam visbiežāk, un pārbaude, ko veicam pirms katras publikācijas."
date: 2026-10-13
image: "/img/gen/cover-ai-teksti-latviski.webp"
categories: ["maksligais-intelekets", "digitalais-marketings"]
permalink: "/ai-teksti-latviski/"
keywords: ["AI teksti latviski", "ChatGPT latviski", "Claude latviski", "AI saturs", "latviešu valoda", "mākslīgais intelekts"]
magnet: "LATVISKI"
---
## Kāpēc AI teksts latviski izklausās pēc tulkojuma

Tu iedod AI uzdevumu latviski, un atbilde ir gandrīz pareiza. Vārdi ir latviski, locījumi lielākoties arī, tomēr teksts skan kā tulkots. Parasti vaina ir teikumu uzbūvē: latviešu vārdi ir salikti angļu teikuma kārtībā.

Labā ziņa: lielāko daļu var novērst ar labu instrukciju un vienu pārbaudi. Abas šeit ir tādas, kādas lietojam paši.

{% infographic { id: "info-ai-teksti-latviski", title: "AI teksts latviski trīs soļos", items: [
  { label: "Instrukcija", text: "Noteikumi un fakti pirms rakstīšanas" },
  { label: "Pārbaude", text: "Cits modelis tikai atzīmē aizdomīgo" },
  { label: "Lēmums", text: "Ko mainīt, izlemj cilvēks" }
] } %}

<!-- gate -->

## Instrukcija, ar kuru mūsu AI raksta tekstus

Šo instrukciju dodam modelim pirms katra teksta. Nokopē to, ieliec savu zīmolu un, ja vajag, papildini ar saviem noteikumiem. Der gan ChatGPT, gan Claude, gan citiem modeļiem.

```text
Tu raksti {ZĪMOLS} ({KAS JŪS ESAT}) tekstus {KUR TEKSTS PARĀDĪSIES}.
Raksti dabiskā latviešu valodā, kā to rakstītu latviešu speciālists, nevis tulkotājs: latviskas teikumu konstrukcijas, nevis angļu.
Lieto nozares valodu, kā Latvijas speciālisti runā paši: {NOZARES VĀRDI, PIEMĒRAM: kampaņas optimizācija, konversijas, targetings, landing page, ROAS} ir normāli. Nepārlatvisko terminus un neizdomā jaunvārdus to vietā. Dabiskums nozīmē latviskus teikumus, nevis tīrradņus.
Noteikumi:
- Uzruna ar "Tu"; "Tu, Tev, Tavs" ar lielo burtu. Raksti dzimtei neitrāli: bez divdabjiem, kas atklāj lasītāja dzimti.
- Nelieto domuzīmes un garās svītras kā pieturzīmes. Lieto kolu, komatu vai punktu.
- Izmanto tikai faktus, kas doti. Nekādu citu skaitļu, procentu, datumu, cenu vai solījumu. Neko neizdomā.
- Bez emocijzīmēm, bez izsaukuma zīmju virknēm, bez reklāmas žargona ("revolucionārs", "spēles noteikumu mainītājs").
- Zīmolu un rīku nosaukumi paliek oriģinālā.

Fakti (drīkst izmantot tikai tos):
- {FAKTS 1}
- {FAKTS 2}

Uzdevums: {KAS JĀUZRAKSTA UN CIK GARAM JĀBŪT}
```

Visvairāk palīdz divas rindas. "Izmanto tikai faktus, kas doti" neļauj modelim izdomāt skaitļus, kas skan ticami. "Nepārlatvisko terminus" neļauj tam pārspīlēt pretējā virzienā: teksts ar "galamērķa lapu" landing page vietā skan tikpat mākslīgi kā tulkojums.

## Angliskās frāzes, ko labojam visbiežāk

Visas šīs atradām savos tekstos. Lielākā daļa ir no angļu valodas vārds vārdā pārceltas frāzes, dažas ir gramatikas kļūdas, ko modelis pieļauj atkal un atkal.

| Bija | Kāpēc skan angliski | Labāk |
| --- | --- | --- |
| "bet kampaņas puse ir…" | Angļu "the campaign side". Mūsu blogā tādu "X puse" bija četrpadsmit. | "bet par kampaņu…" |
| "sistēma optimizējas uz konversijām" | Sistēma neoptimizē pati sevi. | "sistēma optimizē uz konversijām" |
| "lai teksts ir skaidrs" | Pēc "lai" latviski vajag vēlējuma izteiksmi. | "lai teksts būtu skaidrs" |
| "vai esi manījis…?" | Uzruna lasītājam piešķir dzimti. | "vai pamanīji…?" |
| "tagad vispārēji pieejama" | Angļu "generally available". | "tagad pieejama visiem" |
| "atkal tas pats roku darbs" | Angļu "manual work". Roku darbs latviski ir kaut kas cits. | "atkal tas pats darbs no jauna" |
| "Paskaties uz teikumu uzbūvi" | Angļu "look at". | "Pievērs uzmanību teikumu uzbūvei" |
| "tos pašus noteikumus jāievēro" | Ar "jā-" formu objekts ir nominatīvā. | "tie paši noteikumi jāievēro" |
| "Piesakies bezmaksas" | "Bezmaksas" ir īpašības vārds, darbībai vajag apstākli. | "Piesakies bez maksas", bet "bezmaksas zvans" |
| "pirkums neparādās uzskaitē" | Angļu "doesn't show up in tracking". | "pirkums netiek uzskaitīts" |

### Ko mēs nelabojam

Nozares vārdus. Optimizācija, konversijas, targetings, landing page, remārketings, ROAS un CTR ir vārdi, ko Latvijas mārketinga speciālisti lieto paši, un tekstam tie jāatstāj. Ja kāds rīks iesaka "galamērķa lapu" vai "potenciālo klientu šķirošanu", ieteikumu atmetam: tā neviens nerunā.

## Pārbaude pirms katras publikācijas

1. **Modelis uzraksta melnrakstu** pēc augstāk dotās instrukcijas.
2. **Otrs modelis to pārlasa un tikai atzīmē aizdomīgās vietas.** Tas neko nepārraksta: pārrakstot modelis pārveido arī labās frāzes, un Tu neuzzini, ko tieši tas mainīja. Instrukcija ir zemāk.
3. **Ko mainīt, izlemj cilvēks.** Pārbaudītājam taisnība ir apmēram vienā gadījumā no trim. Tāpēc šīs atzīmes neuzskatām par labojumu sarakstu. Tās palīdz pamanīt kļūdas, kas atkārtojas daudzos tekstos, un tās izlabojam visur uzreiz.

```text
Tu esi latviešu valodas redaktors. Tavs uzdevums ir ATRAST un NOSAUKT vietas, kas latviski neskan dabiski. Neko nepārraksti veselu tekstu.

Meklē:
- burtiski no angļu valodas tulkotas frāzes un idiomas;
- angļu teikuma uzbūvi latviešu vārdos;
- pārspīlētu reklāmas žargonu ("revolucionārs", "spēles noteikumu mainītājs"), nevis nozares terminus;
- gramatikas kļūdas, īpaši locījumus un darbības vārdu formas;
- vārdus, ko latvietis šajā nozīmē nelietotu.

NEZIŅO par: nozares terminiem un žargonu, ko Latvijas speciālisti paši lieto ({NOZARES VĀRDI}), par zīmolu nosaukumiem, par stila izvēlēm, kas ir pareizas. Nekad neiesaki pārlatviskotu aizvietojumu nozares vārdam. Labo teikumu uzbūvi un gramatiku, nevis vārdu izcelsmi.

Katrai atrastajai vietai atbildi ar trim rindām:
Citāts: <precīzs teikums vai frāze no teksta>
Kāpēc: <īss paskaidrojums>
Ieteikums: <dabiskāks variants>

Ja viss ir kārtībā, atbildi: "Nav piezīmju."
```

Viens padoms par šo soli: palaid pārbaudi atsevišķi no rakstīšanas. Mēs rakstām ar vienu modeli un pārbaudām ar citu, jaunā sarunā.

<!-- /gate -->

## Gribi, lai šādu sistēmu sakārtojam Tavā uzņēmumā?

Šādas sistēmas būvējam klientiem: [mārketinga automatizācija](/marketinga-automatizacija/) no pieteikumu plūsmas līdz atskaitēm, kurās pirmie ir klienti, nevis klikšķi. Ja vēl nezini, ar ko sākt, aizpildi [automatizācijas testu](/automatizacijas-tests/): četri jautājumi, un rezultātu redzi uzreiz.
