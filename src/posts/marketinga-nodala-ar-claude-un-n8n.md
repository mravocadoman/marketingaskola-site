---
layout: post.njk
title: "Mārketinga nodaļa no deviņām automatizācijām: kā izveidot savu"
seoTitle: "Mārketinga nodaļa ar Claude un n8n | Mārketinga Skola"
description: "Kā deviņas automatizācijas un viens cilvēks katru dienu publicē ierakstus ar Notion, n8n, Zernio un Claude, un kur šāda sistēma lūzt."
date: 2026-11-02
image: "/img/gen/cover-marketinga-nodala-ar-claude-un-n8n.webp"
categories: ["maksligais-intelekets","digitalais-marketings"]
permalink: "/marketinga-nodala-ar-claude-un-n8n/"
keywords: ["mārketinga automatizācija","n8n","Claude","satura plānošana","Notion","sociālo tīklu publicēšana"]
magnet: "KOMANDA"
---
Satura publicēšanu var automatizēt tā, lai modelis nevarētu mainīt nevienu Tevis uzrakstīto teikumu. Mēs ierakstus publicējam ar sistēmu, ko izveidoja un vada Rihards Zeila: deviņas automatizācijas, cilvēka apstiprinājums un skaidrs aizliegums pēc apstiprināšanas pārrakstīt publikācijas tekstu. Pilns apraksts angliski ir viņa [ceļvedī](https://rihardszeila.com/blog/marketing-department-on-claude-and-n8n). Šis ceļvedis palīdzēs Tev izveidot pamata plūsmu: no satura kalendāra Notion līdz publikācijai LinkedIn un Facebook un atgādinājumam atbildēt uz komentāriem.

## Sāc ar publicēšanas sistēmu, kas strādā arī bez AI

Pamata versijā Tu sagatavo ierakstus un atzīmē apstiprinājuma rūtiņu, bet publicē automatizācija. Claude vai ChatGPT vari pieslēgt vēlāk, piemēram, melnrakstiem vai saturam citā valodā.

Darbam nepieciešami šādi rīki:

| Rīks | Uzdevums sistēmā |
|---|---|
| Notion | Satura kalendārs, publikāciju teksti un apstiprinājumi. Pieejams bez maksas. |
| n8n | Savieno darbības vienotā automatizācijā. Pieejama bezmaksas versija savā serverī vai maksas mākoņversija. |
| Zernio vai Buffer | Ieplāno publikācijas LinkedIn un Facebook. Mēs izmantojam Zernio. |
| Telegram | Nosūta kļūdu paziņojumus un atgādinājumus uz telefonu. Pieejams bez maksas. |
| Claude vai ChatGPT | Palīdz sagatavot saturu, ja izvēlies pievienot AI posmu. |

Pamata versijas izveidei paredzi vienu nedēļas nogali. Pamata plūsmai programmēšana nav vajadzīga, izņemot teksta aizsardzības koda ievietošanu.

Svarīgākais ieguldījums būs Tavs laiks: sagatavot saturu, savienot rīkus un pārbaudīt, vai automatizācija dara tieši paredzēto. Rīku savienošana neaizstāj ieradumu rakstīt uz priekšu.

{% infographic { id: "info-marketinga-nodala-ar-claude-un-n8n", title: "Kā ieraksts nonāk tīklā", items: [
  { label: "Rinda", text: "Notion: viens ķeksītis apstiprina" },
  { label: "Sagatavošana", text: "8:00 n8n sadala ierakstu" },
  { label: "Publicēšana", text: "Zernio publicē 10:00" },
  { label: "Trauksme", text: "Telegram ziņo, ja kas salūzt" }
] } %}

## Katrai no deviņām automatizācijām ir savs uzdevums

Nosaukums “mārketinga nodaļa” nenozīmē, ka viena automatizācija pārņem visu mārketingu. Mūsu sistēmā satura sagatavošana, publicēšana un uzraudzība ir sadalītas pa atsevišķām plūsmām.

| Automatizācija | Kad darbojas | Par ko atbild |
|---|---|---|
| Monthly Content Planner | Mēneša 25. datumā | Izlasa dibinātāja piezīmes un izveido nākamā mēneša satura kalendāra struktūru Notion. |
| Post Creation Automation | Darbdienās 08:00 | No apstiprināta ieraksta sagatavo tekstu, attēlu, karuseļa saiti, pirmo komentāru un apstiprinājuma e-pastu. |
| Post generator (magnet) | Kad izsauc cita plūsma | Sagatavo bezmaksas materiālu HTML formātā, augšupielādē un atgriež publisko saiti. |
| Post on Socials | Pēc apstiprinājuma klikšķa | Ieplāno publikāciju LinkedIn un Facebook. |
| Post on Socials (magnet) | Pēc apstiprinājuma klikšķa | Publicēšanas plūsmai pievieno komentāra atslēgvārdu un materiāla saiti. |
| LV Content Adapter | Katru dienu 12:05 | Veido latvisku versiju saturam, kas apstiprināts pēdējās septiņās dienās. |
| Golden hour reminder | Ik pēc desmit minūtēm | Pārbauda, vai ieraksts publicēts, un nosūta Telegram atgādinājumu. |
| Failure notifier | Kļūdas gadījumā | Nosūta kļūdas aprakstu un saiti uz konkrēto izpildi. |
| Database keepalive | Ik pēc sešām stundām | Uztur datubāzes aktivitāti, lai bezmaksas plāns to neapturētu mazas noslodzes dēļ. |

Mūsu sistēmā šobrīd strādā septiņas automatizācijas. Mēneša plānotājs un latviešu satura adapteris pagaidām ir izslēgti.

Bezmaksas materiāla plūsma saglabā gan lejupielādes saiti, gan atslēgvārdu, ko cilvēki raksta komentārā. Šī ceļveža atslēgvārds ir **KOMANDA**.

Tev nav uzreiz jāizveido visas deviņas automatizācijas. Sāc ar apstiprināta teksta publicēšanu un kļūdu paziņojumiem, pirms pievieno satura ģenerēšanu.

<!-- gate -->

## Notion kalendārā nodali melnrakstu no apstiprināta teksta

Izveido Notion datubāzi, kurā katrai publikācijai ir sava rinda. Pamata versijai vajadzīgi šādi lauki:

- **Date**: diena, kurā ierakstu paredzēts publicēt.
- **Approved**: apstiprinājuma rūtiņa. Bez atzīmes publikācija nedrīkst nonākt publicēšanas plūsmā.
- **Status**: publikācijas stāvoklis, lai Tu varētu atšķirt melnrakstu, apstiprinātu un publicētu saturu.

Katras rindas lapā ievieto publikācijas tekstu un pirmo komentāru. Izmanto precīzus sadaļu marķierus, pēc kuriem automatizācija atrod vajadzīgo saturu:

```text
=== FINAL POST ===
Publikācijas teksts tieši tādā formā, kādā to vēlies publicēt.

=== FIRST COMMENT ===
Pirmais komentārs, kas jāpievieno publikācijai.
```

Marķieri ir tehniskas atzīmes, nevis publicējamā teksta daļa. Automatizācijai jāpaņem tikai saturs starp atzīmēm.

Ja vienā Notion lapā glabā tekstu vairākās valodās, latviešu tekstam mēs izmantojam marķieri `=== FINAL POST LV ===`, bet karuseļa PDF saitei `=== CAROUSEL URL ===`.

**Svarīgs nosacījums:** jebkurš nākamais marķieris noslēdz iepriekšējo sadaļu. Mūsu pirmajā versijā teksta nolasīšana apstājās tikai pie tāda paša veida marķiera, tāpēc latviešu teksts nonāca katras angļu publikācijas beigās.

Notion kalendārs ir gatavs, kad nākamās nedēļas ieraksti ir tabulā, katram ierakstam ir datums un neviena apstiprinājuma rūtiņa vēl nav atzīmēta.

## Kļūdu paziņojumus izveido pirms publicēšanas plūsmas

Vispirms izveido n8n automatizāciju, kas citu automatizāciju kļūdu gadījumā nosūta Telegram ziņu. Katras jaunas satura plūsmas iestatījumos norādi šo automatizāciju kā kļūdu apstrādātāju.

Telegram paziņojumā vajadzīga praktiska informācija:

- kurā automatizācijā un darbības solī radās kļūda;
- kāds ir kļūdas ziņojums;
- kur atvērt konkrēto izpildi.

Pārbaudei apzināti izraisi kļūdu un pārliecinies, ka telefons saņem paziņojumu. Ar saglabātu paziņojumu plūsmu nepietiek, ja neviena cita automatizācija kļūdas tai nenodod.

Atsevišķi pievērs uzmanību datubāzei. Mūsu izmantotais bezmaksas Postgres plāns aptur datubāzi, ja to nedēļu gandrīz neizmanto. Publicēšanas plūsma, kas datubāzei pieslēdzas tikai vienu reizi no rīta, rada tieši tik mazu slodzi.

Mūsu risinājums: atsevišķa automatizācija ik pēc sešām stundām nosūta datubāzei pieprasījumu. Datubāzes aktivitātes uzturēšana un kļūdu paziņojumi ir atšķirīgi uzdevumi, tāpēc viens neaizstāj otru.

## Rīta plūsmai jāpublicē tikai apstiprināts saturs

Izveido n8n plūsmu, kas darbojas darbdienās 08:00 pēc Rīgas laika.

Plūsmas darbību secība:

- Atrodi Notion ierakstus ar šodienas datumu un atzīmētu **Approved**.
- Nolasi publikācijas tekstu un pirmo komentāru pēc sadaļu marķieriem.
- Nosūti tekstu un komentāru publicēšanas rīkam.
- Ieplāno LinkedIn publikāciju un tās kopiju Facebook.
- Atjaunini ieraksta statusu, lai automatizācija atkārtoti nepaņemtu jau apstrādātu publikāciju.

LinkedIn ierakstus mēs publicējam plkst. 10:00 pēc Rīgas laika. Tas ir mūsu konta iestatījums, un Tavam kontam piemērotākā stunda var būt cita.

Mūsu pilnajā sistēmā katram ierakstam ir statuss: gaida, ieplānots vai publicēts. Statusam jārāda, kur ieraksts patiešām atrodas: ieraksts, kas nosūtīts plānotājam, sociālajā tīklā vēl nav parādījies.

Testam apstiprini ierakstu ar rītdienas datumu. Nākamajā rītā pēc 08:00 pārbaudi, vai publikācija automātiski nonākusi publicēšanas rīkā.

Pēc katrām izmaiņām n8n plūsmā publicē arī tās jauno versiju. n8n katrai automatizācijai glabā melnrakstu un aktīvo versiju atsevišķi, tāpēc saglabātas izmaiņas vēl nenozīmē, ka automatizācija jau strādā pēc jaunajiem iestatījumiem.

## Apstiprināto tekstu aizsargā kodā, nevis tikai instrukcijā

Sistēmas svarīgākais noteikums: **pēc cilvēka apstiprinājuma modelis nedrīkst pārrakstīt publikācijas tekstu**.

Lūgums “neko nemaini” nav pietiekams tehnisks ierobežojums. Modelis var saīsināt teikumu, izmest komatu vai pārrakstīt beigas pat tad, ja tam lūgts tekstu tikai noformatēt.

Mūsu sistēmā tekstu aizsargā šis koda solis:

```javascript
try {
  const ctx = $('Assemble Story Context').first().json;
  if (ctx && ctx.prewritten_post && String(ctx.prewritten_post).trim().length > 0) {
    parsed.master_linkedin_post = String(ctx.prewritten_post).trim();
  }
} catch (e) {}
```

Kodā ir mūsu plūsmas soļa un datu lauku nosaukumi, tāpēc savā n8n plūsmā nomaini tos pret saviem.

Princips ir vienkāršs: ja ir iepriekš sagatavots publikācijas teksts, modeļa radītais teksts nedrīkst to aizstāt. Modelis joprojām var sagatavot attēla aprakstu vai metadatus, bet publikācijas vārdi paliek cilvēka kontrolē.

Mūsu sistēma katrā izpildē ar md5 pārbauda, vai teksts sakrīt līdz pēdējai zīmei. Pārbaudot savu plūsmu, salīdzini publicēto ierakstu ar apstiprināto tekstu Notion, ieskaitot pieturzīmes un rindkopas.

## Otras valodas versiju veido no faktiem un apstiprini atsevišķi

Arī gramatiski pareizā tulkojumā latvietis uzreiz sadzird angļu teikumu ritmu. Tāpēc mēs modelim neliekam tulkot: dodam faktus un lūdzam uzrakstīt jaunu publikāciju konkrētajai auditorijai.

Claude vai ChatGPT vari izmantot šādu instrukciju:

```text
Netulko. Zemāk ir avota fakti, nevis teksts, ko pārveidot.

Uzraksti no šiem faktiem jaunu publikāciju latviešu valodā. Raksti tā, kā latviešu mārketinga speciālists rakstītu latviešiem.

Saglabā avota faktus, galveno domu un autora balsi.
Nepievieno jaunus faktus, kuriem avotā nav pamata.

Raksti dabiskos latviešu teikumos.
Ja kāds teikums vārdu pa vārdam atkārto angļu teikumu, pārraksti to.

Citi piemēri, cits ritms un cits ievads ir pareizi.

Avota fakti:
[ievieto faktus]
```

Valodas pielāgošana notiek satura sagatavošanas posmā. Izlasi latviešu versiju, izlabo neveiklas vietas un tikai tad apstiprini publicēšanu.

Apstiprināto latviešu versiju aizsargā tieši tāpat kā oriģinālo tekstu. Publicēšanas plūsma nav vieta vēl vienam automātiskam “uzlabojumam”.

## Pēc publicēšanas atgādinājums aicina Tevi atbildēt uz komentāriem

Mūsu atgādinājumu plūsma ik pēc desmit minūtēm laikā no 06:00 līdz 20:00 pārbauda, vai parādījusies jauna publikācija. Kad tā parādās, Telegram pienāk aicinājums veltīt 15 minūtes atbildēm uz komentāriem.

Automatizācijas uzdevums nav aizstāt Tavu iesaisti sarunā. Publicēšanas rīks pārņem tehnisko darbu, bet Tu atbildi uz jautājumiem un turpini diskusiju.

Pirms uztici sistēmai nākamās nedēļas saturu, pārbaudi:

- Vai neapstiprināts ieraksts paliek nepublicēts?
- Vai publicēšanas rīkā saglabājas pareizais laiks un laika josla?
- Vai apstrādāta publikācija netiek ieplānota atkārtoti?
- Vai par kļūdu pienāk Telegram paziņojums?
- Vai publicētais teksts sakrīt ar apstiprināto versiju?
- Vai atgādinājums pienāk, tiklīdz ieraksts ir publicēts?

Automatizācija ietaupa laiku, bet sasniedzamību negarantē. Pēc mūsu pieredzes ieraksta sasniedzamību joprojām visvairāk ietekmē tas, ko Tu dari pirmajā stundā pēc publicēšanas.

Sāc ar Notion tabulu un nākamās nedēļas tekstiem. Vispirms nostiprini ieradumu sagatavot un apstiprināt saturu uz priekšu, pēc tam automatizē pārnešanu uz publicēšanas rīku. Sistēmas pirmais darbs ir uzticami publicēt Tevis apstiprināto tekstu, nevis pašai izlemt, ko Tev teikt.

<!-- /gate -->

## Gribi, lai šādu sistēmu sakārtojam Tavā uzņēmumā?

Šādas sistēmas būvējam klientiem: [mārketinga automatizācija](/marketinga-automatizacija/) no pieteikumu plūsmas līdz atskaitēm, kurās pirmie ir klienti, nevis klikšķi. Ja vēl nezini, ar ko sākt, aizpildi [automatizācijas testu](/automatizacijas-tests/): četri jautājumi, un rezultātu redzi uzreiz.
