---
layout: post.njk
title: "AI, kas pārbauda cita AI darbu un atmaksā klientam naudu"
seoTitle: "AI kvalitātes kontrole e-komercijā | Mārketinga Skola"
description: "Kā otrs modelis vērtē katru AI ģenerēto rezultātu, pirms klients to redz: slieksnis 85 %, trīs mēģinājumi, automātiska atmaksa un cilvēka pārbaude."
date: 2026-11-02
image: "/img/gen/cover-ai-kvalitates-kontrole.webp"
categories: ["maksligais-intelekets"]
permalink: "/ai-kvalitates-kontrole/"
keywords: ["AI kvalitātes kontrole","AI produkts","e-komercija","atmaksa","uzticība","Claude"]
magnet: "KONTROLE"
---
Ja klients samaksā, pirms AI ir paspējis kaut ko izveidot, kvalitātes pārbaudi nevar atstāt klienta ziņā. Rihards Zeila savā [praktiskajā ceļvedī](https://rihardszeila.com/blog/ai-review-layer) apraksta sistēmu, ko izmantojam paši: otrs AI pārbauda pirmā AI darbu, un pēc trim neveiksmīgiem mēģinājumiem sistēma pati atmaksā naudu. Ar šo pieeju Tu vari definēt kvalitātes prasības, pārbaudīt rezultātus un noteikt, kad darbs jālabo, kad jāapstiprina un kad jāpārtrauc.

## Pirms automatizācijas nosaki, kurš maksās par AI kļūdām

Mūsu pašu print-on-demand e-komercijas projektā klients samaksā, pirms rezultāts ir izveidots. Katrā pasūtījumā AI strādā vairākas reizes: analizē iesniegtos materiālus, izveido vairākas versijas un pārbauda katru no tām.

Ar priekšapmaksu Tu sedz AI izmaksas tikai par maksājošu klientu pasūtījumiem, nevis par katru apmeklētāju. Taču lūgt klientu pirkt, vēl neredzot rezultātu, ir daudz prasīts. Tāpēc pasūtījuma formai jāizskaidro process, jāsavāc viss darbam vajadzīgais un skaidri jāpasaka, kas notiks, ja rezultāts neizdosies.

| Jautājums | Vispirms bezmaksas izmēģinājums | Vispirms samaksa |
| :--- | :--- | :--- |
| Kurš sedz AI izmaksas? | Uzņēmums par visiem izmēģinājumiem | Klients par savu pasūtījumu |
| Kad klients redz rezultātu? | Pirms pirkuma | Pēc samaksas |
| Kam jāpievērš uzmanība? | Apmeklētāju piesaistei | Pasūtījuma formai un garantijai |
| Kur ir galvenais risks? | Beidzas nauda, jo jāmaksā arī par tiem, kuri nepērk | Atmaksas un reputācija |

Pirms veido sistēmu, atbildi vienā teikumā: kurš maksā, ja AI rezultāts neizdodas?

Lai testētu manuāli, Tev vajadzēs AI, ko jau izmanto produkta veidošanai, otru AI vērtēšanai un izklājlapu atzīmēm. Vērtēšanai der jebkurš čata AI, kas lasa tekstu un attēlus, piemēram, Claude vai ChatGPT.

Prasību sarakstiem, instrukcijām un kvalitātes slieksnim programmēšana nav vajadzīga. Lai pārbaude notiktu katrā pasūtījumā un atmaksa notiktu automātiski, vajadzēs izstrādātāju. Sagatavošanai pietiek ar nedēļas nogali, un pēc tam seko nedēļa, kurā vēro atzīmes.

{% infographic { id: "info-ai-kvalitates-kontrole", title: "Kā AI pārbauda AI", items: [
  { label: "Pirkums", text: "Vispirms samaksa, tad skaitļošana" },
  { label: "Vērtējums", text: "Divas asis, slieksnis 85 %" },
  { label: "Atmaksa", text: "Trīs neveiksmes, un nauda atpakaļ" },
  { label: "Cilvēks", text: "Pirms nosūtīšanas skatās cilvēks" }
] } %}

## Pārbaudi klienta materiālus pirms maksājuma

Ja ar klienta materiāliem darbu izdarīt nevar, to neizlabos nekāda vērtēšana pēc tam. Ja trūkst būtiskas informācijas, AI vērtējums pēc darba situāciju vairs neglābs.

Pirms maksājuma pārbaudi, vai klienta iesniegtie materiāli ļauj izpildīt pasūtījumu. Atkarībā no uzdevuma pārbaude var attiekties uz attēlu kvalitāti, ierakstu, tekstu vai piezīmēm.

Ievies pasūtījuma formā materiālu pārbaudi:

* Nosaki, kādi trūkumi padara kvalitatīvu rezultātu neiespējamu.
* Noraidi nederīgus materiālus pirms apmaksas.
* Paskaidro klientam, kāpēc materiāls neder.
* Palūdz papildināt trūkstošo informāciju, kamēr klients to vēl var izlabot bez maksas.
* Ja kāda izvēle nav skaidra, pajautā klientam, nevis ļauj AI minēt.

Ja klients uz jautājumu atbildēs labāk, nekā sistēma spēj uzminēt, jautā.

**Darbs paveikts, ja** nederīgu materiālu sistēma noraida jau pirms maksājuma un klients saprot, kāpēc.

## Definē kvalitāti atsevišķi materiāliem un uzdevumam

Ar norādi “pārbaudi kvalitāti” nepietiek. Otrajam AI ir jāzina, ar ko salīdzināt rezultātu.

Mūsu sistēmā pārbaude atbild uz diviem neatkarīgiem jautājumiem:

* Vai rezultāts atbilst klienta iesniegtajiem materiāliem?
* Vai rezultāts izpilda klienta rakstīto uzdevumu?

Rezultāts var precīzi atbilst materiāliem un tomēr ignorēt pusi uzdevuma. Var būt arī otrādi: katra norāde ir izpildīta, bet līdzības ar to, ko klients augšupielādēja, nav.

| Kritērijs | Ar ko salīdzina | Ko pārbaude meklē? |
| :--- | :--- | :--- |
| Atbilstība materiāliem | Klienta attēli, teksts, ieraksts vai piezīmes | Neatbilstības iesniegtajai informācijai |
| Atbilstība uzdevumam | Klienta formulētās prasības | Izlaistas vai ignorētas prasības |

Uzraksti divus īsus prasību sarakstus. Materiālu sarakstā norādi, kas rezultātā jāsaglabā precīzi. Uzdevuma sarakstā norādi, kurām klienta prasībām obligāti jābūt izpildītām.

Neapvieno abus kritērijus vienā kopējā atzīmē. Divas atsevišķas atzīmes parāda, kas jālabo nākamajā mēģinājumā.

<!-- gate -->

## Izveido vairākas versijas un nodod katru otram AI

Katram pasūtījumam izveido vismaz divas rezultāta versijas. Mēs veidojam vairākas. AI nekad neizdara vienu un to pašu divreiz, tāpēc viens rezultāts ir kā monētas mešana, kuras iznākums jāpieņem klientam.

Otrajam AI dod katru versiju kopā ar klienta materiāliem un uzdevumu tieši tā, kā klients to uzrakstīja. Pārbaudei jābalstās uz klienta sniegto informāciju, nevis uz modeļa vispārējo priekšstatu par labu darbu.

Manuālam testam der šī instrukcija:

```text
Tu pārbaudi cita AI darbu, pirms to redz maksājošs klients.

Tu saņem:
* klienta iesniegtos materiālus;
* klienta uzdevumu tieši tā, kā klients to uzrakstīja;
* rezultātu, ko izveidoja cits AI.

Atsevišķi novērtē atbilstību materiāliem un atbilstību uzdevumam.
Nekad neapvieno abus vērtējumus vienā atzīmē.

ATBILSTĪBA MATERIĀLIEM
Vai rezultāts atbilst tam, ko klients augšupielādēja?
Norādi vērtējumu procentos. 100 % nozīmē pilnīgu atbilstību.

ATBILSTĪBA UZDEVUMAM
Vai rezultāts izpilda visas klienta prasības?
Norādi vērtējumu procentos. 100 % nozīmē, ka neviena prasība
nav izlaista vai ignorēta.

Pēc vērtējumiem uzraksti īsu kritiku vienkāršā valodā.
Katram trūkumam norādi, uz kuru kritēriju tas attiecas.
Apraksti katru trūkumu tik konkrēti, lai nākamajā mēģinājumā
to varētu izlabot.

Neraksti, vai rezultāts Tev patīk.
```

Abas atzīmes un kritiku ieraksti izklājlapā pie pasūtījuma un versijas. Pagaidām pēc AI atzīmēm vēl neko neizlem.

## Kvalitātes slieksni izvēlies pēc nedēļas novērojumiem

Nedēļu apskati katru rezultātu un pieraksti savu vērtējumu blakus AI atzīmēm. Salīdzini, vai augstākās AI atzīmes saņem tieši tie rezultāti, kurus Tu droši nodotu klientam.

Mūsu sistēmā kvalitātes slieksnis ir **85 %**. Tas nav universāls ieteikums: savu slieksni Tu nosaki pēc saviem novērojumiem, nevis pēc bloga raksta, arī ne šī.

Pārāk zems slieksnis palaiž cauri viduvējus darbus. Tad cilvēks procesa beigās kļūst par vienīgo īsto kvalitātes filtru.

Pārāk augsts slieksnis liek veidot no jauna arī labus rezultātus. Atkārtotie mēģinājumi apēd maržu, un sistēma atmaksā naudu klientiem, kuri būtu bijuši apmierināti.

Kvalitātes slieksnis ir biznesa lēmums, kas tikai izskatās pēc tehniska. Tas nosaka, cik liels risks paliek klientam un cik daudz Tu tērē, lai šo risku novērstu.

Pieraksti slieksni un tā pamatojumu. Pārskati to, kad reālie rezultāti sāk runāt pretī.

## Atkārtotam mēģinājumam pievieno konkrētu kritiku

Ja rezultāts nesasniedz slieksni, nesūti to pašu instrukciju vēlreiz. Iedod pirmajam AI trūkumus, ko atrada pārbaudītājs.

```text
Izveido šo vēlreiz. Tavs iepriekšējais mēģinājums saņēma atzīmi
zem kvalitātes sliekšņa.

Klienta materiāli un uzdevums:
[ievieto materiālus un uzdevumu]

Iepriekšējā mēģinājuma kritika:
[ievieto pārbaudītāja kritiku]

Kas līdzīgos pasūtījumos iepriekš saņēma labas un sliktas atzīmes:
[ievieto savas piezīmes, ja tādas ir]

Izlabo tieši tās problēmas, ko nosauc kritika.
```

Noderīga kritika nosauc konkrētu izlaistu prasību vai neatbilstību materiāliem. Vispārīgs komentārs “rezultāts nav pietiekami labs” nepasaka, kas jāmaina.

Saglabā katru mēģinājumu, labo un slikto, kopā ar tā atzīmi. Mūsu sistēma šo pieredzi automātiski pievieno nākamo līdzīgo pasūtījumu instrukcijām, lai tā pati kļūda neatkārtotos. Bez programmēšanas pietiek ar piezīmēm, ko ielīmē nākamajā uzdevumā.

Taču pārbaude nevar pievienot kvalitāti, kas netika radīta. Ja pirmais AI regulāri strādā vāji, vispirms uzlabo to un tikai tad pievieno pārbaudi.

## Pēc trim neveiksmīgiem mēģinājumiem sistēma pati atmaksā naudu

Ja arī trešais mēģinājums nesasniedz kvalitātes slieksni, mūsu sistēma atmaksā naudu automātiski. Klientam nav jāraksta e-pasts, jāatver atbalsta pieteikums vai jāpamato neapmierinātība.

Atsaucīgs klientu atbalsts nav tas pats, kas automātiska atmaksa. Ja klientam pašam jālūdz nauda atpakaļ, tas joprojām ir klienta darbs, turklāt brīdī, kad klients jau ir neapmierināts.

Limits arī ierobežo, cik var izmaksāt viens neizdevies pasūtījums: pēc trim mēģinājumiem darbs apstājas.

Izstrādātājam nodod skaidrus nosacījumus:

* Uzskaitīt mēģinājumus katram pasūtījumam.
* Ja rezultāts ir zem kvalitātes sliekšņa, atkārtot darbu ar kritiku.
* Pēc trim neveiksmīgiem mēģinājumiem pārtraukt rezultāta veidošanu.
* Automātiski atmaksāt naudu.
* Pārbaudīt to ar testa pasūtījumu, kas trīs reizes neizdodas un tiek atmaksāts bez cilvēka iejaukšanās.

**Ieslēdz automātisko atmaksu, pirms vispār kādam pastāsti par garantiju.** Garantija mājaslapā neaizstāj procesu, kas tiešām strādā.

Ja atmaksa notiek bieži, AI strādā slikti, un to neizlabos nekāds pārliecinošāks reklāmas teksts.

## Pirms izpildes rezultātu apskata cilvēks un apstiprina klients

AI atzīme noķer kļūdas, bet ne bezgaumību. Rezultāts var saņemt augstu atzīmi un tomēr izskatīties nedzīvs. Tāpēc rezultātu, kas sasniedzis kvalitātes slieksni, pirms tālākas izpildes apskata cilvēks.

Pēc tam rezultātu apstiprina klients. Mūsu sistēmā to dara ar privātu saiti, kas pēc laika vairs nestrādā. Klientam nav jāveido konts un nav jāievada parole.

Brīdī, kad klients apstiprina, sistēma saglabā apstiprinātā rezultāta kopiju, ko vairs nevar mainīt. Šī kopija izbeidz strīdu “es to neapstiprināju”, pirms tas vispār sākas.

Tehniskajā uzdevumā iekļauj arī šīs drošības prasības:

* Saitēm uz privātu saturu jābūt parakstītām ar HMAC un ar ierobežotu derīguma termiņu.
* Klienta materiāli jādzēš automātiski, tiklīdz pasūtījumam tie vairs nav vajadzīgi.
* Neatgriezeniskām ārējām darbībām vajadzīga atomāra bloķēšana, lai atkārtots pieprasījums vai dubultklikšķis vienu pasūtījumu neizpildītu divreiz.

Sāc bez automatizācijas: uzraksti abus prasību sarakstus, iedod Claude vai ChatGPT darbu, ko jau nodevi klientam, kopā ar tā uzdevumu un pārbaudes instrukciju, un pieraksti atzīmes blakus savam vērtējumam. Dari tā ar katru pasūtījumu šonedēļ, un Tu redzēsi, vai AI atzīmes sakrīt ar Tavu vērtējumu un kur aptuveni ir Tavs slieksnis.

Ja ieviesīsi tikai trīs lietas, lai tās ir šīs: salīdzini rezultātu ar klienta materiāliem, iedod kritiku nākamajam mēģinājumam un pēc mēģinājumu limita atmaksā naudu automātiski.

<!-- /gate -->

## Gribi, lai šādu sistēmu sakārtojam Tavā uzņēmumā?

Šādas sistēmas būvējam klientiem: [mārketinga automatizācija](/marketinga-automatizacija/) no pieteikumu plūsmas līdz atskaitēm, kurās pirmie ir klienti, nevis klikšķi. Ja vēl nezini, ar ko sākt, aizpildi [automatizācijas testu](/automatizacijas-tests/): četri jautājumi, un rezultātu redzi uzreiz.
