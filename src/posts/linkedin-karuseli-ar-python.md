---
layout: post.njk
title: "LinkedIn karuseļi par 0 €, ko zīmē kods: bez Canva un dizainera"
seoTitle: "LinkedIn karuseļi ar Python | Mārketinga Skola"
description: "Kā viens Python skripts no ieraksta skaitļiem uzzīmē LinkedIn karuseli bez Canva un dizainera: instrukcija AI, pārbaude un PDF, ko pievienot ierakstam."
date: 2026-11-02
image: "/img/gen/cover-linkedin-karuseli-ar-python.webp"
categories: ["maksligais-intelekets","digitalais-marketings"]
permalink: "/linkedin-karuseli-ar-python/"
keywords: ["LinkedIn karuselis","LinkedIn dokuments","Python","satura mārketings","Canva alternatīva","AI"]
magnet: "KARUSELIS"
---
LinkedIn karuselis nav obligāti jāmaketē Canva vai jānodod dizaineram: slaidus var uzzīmēt programma, bet tekstu sagatavot Claude vai ChatGPT. Ceļvedis balstīts mūsu praktiskajā pieredzē: ģeneratoru izveidoja Rihards Zeila, un ar to tapuši mūsu LinkedIn karuseļi. Tu sagatavo ierakstu, pārbaudi slaidu saturu un savā datorā ģenerē PDF. Viena karuseļa ģenerēšana maksā 0 €, un pēc sākotnējās uzstādīšanas katram nākamajam PDF vajadzīgs slaidu fails un viena komanda.

## Karuseļa ģenerators pārņem maketēšanu, nevis satura veidošanu

Darba sadalījums ir vienkāršs: **Tu atbildi par domu un faktiem, AI sadala saturu slaidos, bet programma izveido PDF.** PDF failu LinkedIn ierakstam pievieno kā dokumentu, ko lasītājs var pāršķirt.

Ģenerators izmanto iepriekš noteiktus slaidu veidus. Programma izvieto tekstu un pielāgo atsevišķu teksta elementu izmēru, lai Tev nebūtu manuāli jāpārbīda katrs teksta laukums. Vienkāršajā versijā pieejami pieci slaidu veidi:

| Slaida veids | Kad izmantot |
|---|---|
| `cover` | Ievadam ar ieraksta pirmo teikumu |
| `bignum` | Skaitlim, kas izsaka galveno domu |
| `statement` | Apgalvojumam ar īsu paskaidrojumu |
| `list` | Sarakstam ar trim līdz pieciem punktiem |
| `outro` | Secinājumam un aicinājumam sekot |

Darbam vajadzēs Claude vai ChatGPT, bezmaksas Python, papildinājumu `reportlab` un ģeneratora failu `carousel.py`. Gatavo ģeneratoru var nokopēt [mūsu angliskā raksta](https://rihardszeila.com/blog/carousel-generator) sadaļā izstrādātājiem.

**0 € attiecas uz PDF ģenerēšanu savā datorā.** Ģeneratoram nav abonēšanas maksas vai maksas servisa, un pēc uzstādīšanas programma var darboties arī bez interneta. Slaidu tekstu sagatavo Claude vai ChatGPT: der tas, kuru Tu jau lieto.

Pirms uzstādīšanas vari apskatīt rezultātu: [karuseli par ROAS](https://yxdtomxgsqaguqjhutgq.supabase.co/storage/v1/object/public/post_files/roas.pdf) vai [karuseli par pieteikumiem, kas maksāja 0,38 €](https://yxdtomxgsqaguqjhutgq.supabase.co/storage/v1/object/public/post_files/cheap-leads.pdf).

{% infographic { id: "info-linkedin-karuseli-ar-python", title: "Kā kods uzzīmē karuseli", items: [
  { label: "Ieraksts", text: "Vispirms teksts un tā skaitļi" },
  { label: "Skripts", text: "7-8 slaidi no tiem pašiem skaitļiem" },
  { label: "Pārbaude", text: "Nesaglabā, ja teksts nesader" },
  { label: "PDF", text: "Pievienojas ierakstam pats" }
] } %}

## Izvēlies ierakstu, kuram slaidi palīdz izskaidrot domu

Ne katram LinkedIn ierakstam vajag karuseli. Sāc ar gatavu tekstu, kura pamatā ir saraksts, darbību secība vai skaitļu salīdzinājums.

Karuselim piemērots saturs:

* praktisks kontrolsaraksts;
* pamācība ar secīgiem soļiem;
* kampaņas rezultātu analīze;
* skaitļu salīdzinājums;
* automatizācijas darbības skaidrojums.

Personisku stāstu labāk atstāt ieraksta formātā ar īstu fotogrāfiju. Sadalot stāstu īsos slaidos, var pazust stāstījuma plūdums un konteksts.

Pirms dod tekstu AI, pārbaudi ieraksta pirmo teikumu. Pirmais teikums kļūs par vāka virsrakstu, tāpēc ievadam jāpasaka konkrēta doma, nevis tikai jāpiesaka tēma.

**Posms pabeigts, kad Tev ir viens gatavs ieraksts ar skaidru struktūru.** Ģeneratora uzstādīšana vēl nav vajadzīga.

<!-- gate -->

## Uzdod AI sagatavot slaidus vienkāršā ģeneratora formātā

Claude vai ChatGPT čatā ielīmē zemāk redzamo instrukciju un pievieno savu ierakstu. Instrukcija ir pielāgota ģeneratoram `carousel.py`: bez zīmēta vāka attēla un bez akcentu iezīmēšanas ar zvaigznītēm, jo vienkāršais ģenerators zvaigznītes izdrukātu kā tekstu.

Lauku nosaukumus, piemēram, `type` un `headline`, atstāj angliski. Pēc šiem nosaukumiem ģenerators saprot, kuru tekstu likt katrā slaidā.

```text
Pārveido manu gatavo LinkedIn ierakstu par slaidu specifikāciju ģeneratoram carousel.py.

Sagatavo 5 līdz 8 slaidus. Jo mazāk slaidu, jo labāk. Nepievieno slaidus tikai apjoma dēļ.

Raksti latviski un saglabā ieraksta toni. Neizmanto pārspīlējumus un neizdomā faktus. Katram slaida teikumam jābūt saprotamam arī bez ieraksta teksta.

Izmanto tikai šādus slaidu veidus un laukus:

cover: type, headline, kicker, swipe
bignum: type, eyebrow, number, label, body, red
statement: type, eyebrow, headline, body
list: type, eyebrow, headline, items
outro: type, headline, body, name, tagline, cta

Pirmais slaids ir cover. Laukā headline ieliec ieraksta pirmo teikumu vārds vārdā. Nepievieno zvaigznītes vai citus izcēluma marķierus. Vēlams, lai virsrakstā būtu mazāk par 12 vārdiem. Ja pirmais teikums ir garāks, saglabā oriģinālu, nevis pārraksti.

Lieto bignum, ja slaida galveno domu izsaka skaitlis. Laukā number ieraksti skaitli kā tekstu. Ja skaitlis raksturo negatīvu rezultātu, izmanto red: true.

Lieto statement konkrētam apgalvojumam ar īsu paskaidrojumu.

Iekļauj vismaz vienu list slaidu ar 3 līdz 5 punktiem. Lauks items ir tekstu masīvs.

Pēdējais slaids ir outro ar secinājumu un aicinājumu sekot. Laukos name un tagline izmanto tikai manis norādīto informāciju.

Katram skaitlim jābūt atrodamam sākotnējā ierakstā. Neizdomā nevienu skaitli. Ja ierakstā rakstīts “vairums”, arī slaidā raksti “vairums”, nevis procentus.

Slaida pamatteksts nedrīkst būt garāks par aptuveni 40 vārdiem. Ja doma neietilpst, sadali to divos slaidos vai saīsini, saglabājot faktus.

Naudas summām valūtu raksti aiz skaitļa. Decimāldaļām izmanto komatu.

Atbildē dod tikai JSON bez Markdown noformējuma:
{"title": "...", "slides": [{"type": "..."}]}

Mans vārds vai zīmols:
[IEVIETO]

Īss darbības apraksts:
[IEVIETO]

Aicinājums sekot:
[IEVIETO]

Gatavais LinkedIn ieraksts:
[IEVIETO]
```

AI atbilde izskatīsies pēc koda, bet patiesībā tā ir Tavu slaidu saraksts formātā, ko ģenerators prot nolasīt: katram slaidam norādīts veids un teksts. Tev nav jāraksta slaidu struktūra ar roku, bet teksts pirms ģenerēšanas ir jāizlasa.

## Pārbaudi katru skaitli un slaida domu pret oriģinālu

Atver AI atbildi blakus savam ierakstam. Katram slaidos izmantotajam skaitlim atrodi atbilstošo vietu sākotnējā tekstā.

**Izdomāts skaitlis slaidā izskatās labi līdz brīdim, kad kāds pajautā, no kurienes tas ņemts.** AI var aizstāt vārdu “vairums” ar procentiem, lai slaids izskatītos pārliecinošāks. Karuselī drīkst palikt tikai sākotnējā ieraksta dati.

Pārbaudē pievērs uzmanību arī saturam:

* Vai saīsinājums saglabā sākotnējā apgalvojuma nozīmi?
* Vai secinājumu var saprast bez ieraksta teksta?
* Vai sarakstā nav atkārtota viena doma dažādos vārdos?
* Vai slaida pamatteksts nepārsniedz aptuveni 40 vārdus?
* Vai karuselī nav lieku slaidu, kas pievienoti tikai tāpēc, lai sanāktu astoņi?

Ja slaids ir pārāk garš, saīsini tekstu vai sadali to divos slaidos. Nepaļaujies tikai uz automātisku burtu samazināšanu.

Slaidu var saglabāt kā ekrānuzņēmumu un izplatīt bez ieraksta teksta. Tāpēc svarīga atruna jāliek pašā slaidā blakus apgalvojumam, nevis tikai LinkedIn ieraksta tekstā.

## Uzstādi ģeneratoru un pārbaudi to ar gatavu piemēru

Uzstādīšana ir vienreizējs tehnisks darbs. Ja Tev nav pieredzes ar komandrindu, uztici uzstādīšanu cilvēkam ar tehniskām zināšanām.

Rīkojies šādā secībā:

1. Instalē Python.
2. Atver termināli jeb logu, kurā ievada komandas.
3. Instalē PDF veidošanas papildinājumu.
4. No [angliskā raksta](https://rihardszeila.com/blog/carousel-generator) sadaļas izstrādātājiem nokopē ģeneratora kodu un saglabā to atsevišķā mapē kā `carousel.py`.
5. No tās pašas sadaļas nokopē piemēra failu un saglabā to tajā pašā mapē kā `cheap-leads.json`.

Papildinājuma instalēšanas komanda:

```text
pip install reportlab
```

Ģeneratora mapē palaid piemēru:

```text
python3 carousel.py cheap-leads.json cheap-leads.pdf
```

Mapē jāparādās failam `cheap-leads.pdf` ar sešiem slaidiem. Atver PDF un salīdzini ar raksta sākumā minēto karuseli par pieteikumiem, kas maksāja 0,38 €.

Sākumā izmanto tieši gatavo piemēru, nevis savu ierakstu. Ja piemēra PDF izskatās pareizi, ģenerators ir uzstādīts, un tikai tad ir vērts ķerties pie sava teksta un zīmola pielāgojumiem.

## Pielāgo krāsas, parakstu un fontu latviešu valodai

Atver `carousel.py` teksta redaktorā. Viss, ko maini, atrodas faila sākumā vai tajā daļā, kas zīmē pēdējo slaidu.

* **Krāsas:** `rgb()` rindās aizstāj krāsu kodus ar sava zīmola krāsu kodiem.
* **Nosaukums kājenē:** nomaini vērtību `BRAND`.
* **Noslēguma paraksts:** funkcijā `s_outro` ieraksti savu vārdu, īsu aprakstu un aicinājumu sekot.
* **Latviešu burti:** ieslēdz fonta iegulšanu un norādi atbilstošus fonta failus.

Latviešu tekstam fonta iestatījums ir obligāts: noklusējuma PDF fontos nav visu latviešu burtu.

Failā iestati:

```text
EMBED_FONTS = True
```

Pēc tam trijās `TTFont` rindās jānorāda fonta failu atrašanās vietas Tavā datorā. Izvēlētajam fontam jāatbalsta latviešu burti. Nepietiek tikai nomainīt `False` uz `True`, ja kodā norādītajā vietā fonta failu nav.

Ar iegultu fontu PDF izmērs pieaug līdz aptuveni 60 KB. Palaid ģeneratoru vēlreiz un pārbaudi krāsas, parakstu un latviešu burtus.

## Ģenerē savu PDF un pievieno to LinkedIn ierakstam

Pēc satura pārbaudes saglabā AI atbildi tajā pašā mapē, piemēram, failā `my-post.json`. Failā jābūt tikai JSON tekstam. AI paskaidrojumus un Markdown zīmes sākumā vai beigās izdzēs.

Palaid komandu:

```text
python3 carousel.py my-post.json my-post.pdf
```

Pirms publicēšanas pāršķir visu PDF:

* pārbaudi, vai teksts nav nogriezts un elementi nepārklājas;
* pārliecinies, ka virsraksti un pamatteksts ir salasāmi;
* apskati latviešu burtus;
* pārbaudi savu vārdu vai zīmolu;
* izlasi noslēguma secinājumu.

Vienkāršais ģenerators maketu automātiski nepārbauda, to prot tikai jaunākā versija. Tāpēc pāršķir PDF tāpat, kā to darīs Tavi lasītāji.

LinkedIn uzraksti ierakstu kā parasti un pievieno PDF kā dokumentu. Dokumenta nosaukumam vari izmantot ieraksta pirmo teikumu: tā darām arī mēs.

## Biežākās kļūdas ar karuseļu ģeneratoru

* **Lieki slaidi.** Bez ierobežojuma AI piepilda karuseli līdz astoņiem slaidiem. Tāpēc instrukcijā rakstīts: jo mazāk slaidu, jo labāk. Ja slaidu ir vairāk par astoņiem, iesaiste krītas, un sanāk garš raksts, tikai sadalīts slaidos.
* **Izdomāti skaitļi.** Precīzs skaitlis slaidā izskatās labāk, tāpēc “vairums” nemanāmi pārvēršas par “80 %”. Skaitļu pārbaude pret oriģinālo ierakstu ir tieši tam, lai šādu aizstāšanu pamanītu.
* **Zvaigznītes vāka virsrakstā.** Ja AI tomēr iezīmē galveno skaitli ar dubultām zvaigznītēm, vienkāršais ģenerators tās izdrukā kā tekstu. Izdzēs zvaigznītes no virsraksta, pirms ģenerē PDF.
* **Latviešu burti.** Noklusējuma fontos latviešu burtu nav. Latviešu karuselim jāieslēdz iepriekš aprakstītais fonta iestatījums `EMBED_FONTS`.
* **Visi karuseļi izskatās vienādi.** Vienas nedēļas ierakstiem nevajadzētu izskatīties kā vienam garam ierakstam. Jaunākajā ģeneratorā mijas tumšs un gaišs noformējums. Mēs izmēģinājām arī trešo noformējumu ciāna krāsā, bet 30. septembrī no tā atteicāmies, jo tas neizskatījās labi.

## Datu vizualizācijām izvēlies jaunāko ģeneratoru, ja Tev ir tehnisks atbalsts

Angliskajā rakstā pieejams arī jaunāks ģenerators `deck2.py`, ar kuru kopš 2026. gada oktobra veidojam savus karuseļus. Ja Tev ir tehnisks atbalsts un vajag datu vizualizācijas, apskati jaunāko versiju, pirms uzstādi vienkāršo.

| Kritērijs | `carousel.py` | `deck2.py` |
|---|---|---|
| Slaidu veidi | Pieci, galvenokārt tekstam | Četrpadsmit, arī diagrammām un salīdzinājumiem |
| Satura ievade | JSON fails | Koda bloka pielāgošana veidošanas failā |
| Teksta apjoms | Instrukcijā aptuveni 40 vārdi pamattekstam | Ne vairāk kā 32 vārdi slaidā, to pārbauda programma |
| Maketa pārbaude | Nav, PDF jāpārskata ar acīm | Nesaglabā PDF, ja teksts pārklājas vai ir nogriezts |

Jaunākā versija izmēra katru teksta rindu, pirms to izvieto, un kļūdas gadījumā nosauc slaidu, kurā ir problēma. Tad saīsini tekstu, nevis pārbīdi maketu.

Sākumam pietiek ar vienu gatavu ierakstu un slaidu instrukciju. Vēl pirms ģeneratora uzstādīšanas Tu vari pārbaudīt galveno: vai ierakstā ir skaidra doma, kuru vērts sadalīt pāršķiramos slaidos.

<!-- /gate -->

## Gribi, lai šādu sistēmu sakārtojam Tavā uzņēmumā?

Šādas sistēmas būvējam klientiem: [mārketinga automatizācija](/marketinga-automatizacija/) no pieteikumu plūsmas līdz atskaitēm, kurās pirmie ir klienti, nevis klikšķi. Ja vēl nezini, ar ko sākt, aizpildi [automatizācijas testu](/automatizacijas-tests/): četri jautājumi, un rezultātu redzi uzreiz.
