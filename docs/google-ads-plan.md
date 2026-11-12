# Google Ads: search campaigns for the 350 $ credit (plan, 9 Nov 2026)

Nothing here is built or live. The Google Ads UI would not render in the
automated browser on 9 Nov, so the campaigns below are ready to paste.

## The deal and where to run it

Google gives 350 $ of credit once 350 $ has been spent. The credit lands in the
account that holds the code, so **every campaign runs in that one account**.
That is presumably 629-727-4403 (EUR, billing SIA Stonks), where the Impromotion
Christmas campaign is already a saved draft. Check the code's spend window
under Billing > Promotions; it is usually 60 days.

## What is most lucrative, and why

| # | Campaign | Why | Daily cap |
| --- | --- | --- | --- |
| 1 | Impromotion, Christmas and corporate events | Peak demand is now and ends in mid-December. Three real inquiries came in October with almost no spend, the conversion tag is live, the campaign is drafted. Few advertisers, so cheap clicks | 10 € to 14 Dec |
| 2 | Mārketinga Skola, websites with AI | The biggest ticket (2 000-15 000 €) and delivered remotely. Contested and full of DIY searchers, so tight keywords and long negatives | 7 € |
| 3 | Mārketinga Skola, LIAA export support | 4 900 / 7 900 € bez PVN per sale, few searches and few advertisers. Support runs into 2027 (pieejamā finansējuma ietvaros), so companies plan now | 3 € |
| 4 | Mārketinga Skola, Facebook and Instagram ads management | Added by the owner on 12 Nov. A retainer is the highest lifetime value, but clicks cost about 2 $ and many searchers are DIY, so the ads name the 1 000 € ad-spend floor to screen them before they click | 5 € |

About 20 € a day at most; the two small-volume campaigns will underspend, so
the 350 $ (about 300-330 €) lands by early-to-mid December.

**Left out on purpose:**

- **Marketing automation.** Google suggests nothing for it: no search demand yet.
- **SEO service.** There is no SEO case to show yet.
- **Meta course.** Cheap clicks ("mārketinga kursi" 0,15 $) but only 40 searches
  a month. Add it in January with the credit, when people look for courses.

## Before anything spends

1. **Done 12 Nov: conversion tracking on marketingaskola.lv.** The site loads
   the account's tag (AW-18563708225) after "Piekrītu" and sends `generate_lead`
   to the conversion action "Lead" and every WhatsApp, phone and e-mail click to
   "Contact" (`site.json` `googleAdsLabels`). Those are the actions Impromotion
   already uses; conversions are credited to the clicked ad, so the two sites do
   not mix inside a campaign. For clean account totals, create "MS pieteikums" and
   "MS kontakts" in Goals and paste their labels into `site.json`.
2. **Done 12 Nov: the source of every lead.** The first page of a visit stores
   its utm tags (or "google / cpc" for an auto-tagged click), and every form adds
   "Avots: …" to the message, so the alert e-mail and the n8n table show which
   leads the ads brought, including those of visitors who refused cookies. That
   table is the real count; Google Ads only sees visitors who consented.
3. **Must be deployed before the ads start**, or the tag is not on the live site.
4. **The owner confirms the three website terms** (first design in a few days, a
   simple site in a couple of weeks, the first month of small fixes free). The
   ads repeat the first two.

## Campaign 2: MS | Search | Mājaslapas ar AI

| Setting | Value |
| --- | --- |
| Type | Search only (no Display, no Search partners), AI Max off |
| Location | Latvia, people in the area |
| Language | Latvian |
| Bidding | Maximise clicks, max CPC 2,50 €, for the first two weeks |
| Landing page | `https://marketingaskola.lv/majaslapu-izstrade/?utm_source=google&utm_medium=cpc&utm_campaign=majaslapas` |

**Ad group "Mājaslapa"** (phrase): "mājas lapas izveide", "mājaslapas izveide",
"mājaslapu izstrāde", "mājaslapas izstrāde", "mājaslapu veidošana",
"web lapas izstrāde", "web lapas izveide", "landing page izstrāde"; exact:
[mājas lapas izveide cenas], [mājaslapas izveide cena], [mājas lapas izveides izmaksas].

**Ad group "Interneta veikals"** (phrase): "interneta veikala izveide",
"interneta veikala izveide cena", "e-veikala izveide", "e veikala izstrāde".

**Negatives (campaign):** bezmaksas, par brīvu, pamācība, kā izveidot, pašam,
kursi, kurss, apmācības, vakances, darbs, prakse, studijas, tehnikums, mozello,
wix, wordpress, facebook lapas, liaa, atbalsts.

**Headlines** (all ≤ 30): Mājaslapas izveide ar AI · Vienkārša lapa pāris
nedēļās · Pirmais dizains dažās dienās · Fiksēta cena jau sākumā · Bezmaksas
iepazīšanās zvans · Lapa, kas atved pieteikumus · Teksti dabiskā latviešu
valodā · Formas un uzskaite pārbaudītas · Lapa ar online pierakstu · Interneta
veikala izveide · Landing page reklāmai · Mājaslapa uzņēmumam · Uzzini cenu
savam projektam · Dizains, teksti un mērīšana · Mārketinga Skola

**Descriptions** (all ≤ 90):
1. Vienkāršu lapu ar AI izveidojam pāris nedēļās. Tekstus un formas pārbauda cilvēks.
2. Landing page, uzņēmuma lapa, lapa ar pierakstu vai e-veikals. Fiksēta cena jau sākumā.
3. Pirmo dizaina versiju redzi dažu dienu laikā. Piesakies bezmaksas 20 minūšu zvanam.
4. AI paātrina darbu, cilvēks pārbauda tekstu, formas un reklāmu uzskaiti pirms palaišanas.

Sitelinks: Darbi (`#darbi`), Piemērs (`#piemers`), Pieteikums (`#pieteikums`),
Portfolio (`/portfolio/`). Those are the only anchors the page has.

## Campaign 4: MS | Search | Meta reklāma

The landing page has its own short form since 12 Nov, so a click never has to
reach `/sazinies/` to enquire. The ads must not shorten the no-fee clause: its
condition, "pirms sākuma norunāto", is what makes it enforceable.

| Setting | Value |
| --- | --- |
| Location / language | Latvia / Latvian |
| Bidding | Maximise clicks, max CPC 2,50 € |
| Landing page | `https://marketingaskola.lv/facebook-reklama/?utm_source=google&utm_medium=cpc&utm_campaign=meta` |

**Keywords** (phrase): "facebook reklāma", "facebook reklāmas", "instagram reklāma",
"facebook reklāmas pakalpojumi", "facebook reklāmas izveide",
"facebook reklāmas aģentūra", "meta reklāmas", "sociālo tīklu reklāma";
exact: [reklāma facebook cena], [facebook reklāmas cena].

**Negatives:** kursi, kurss, bezmaksas, pamācība, kā, vakances, darbs,
bloķēts, atbalsts, palīdzība, ads manager, login, cennik,
kaina (the last two are Polish and Lithuanian searches Google autocompletes).

**Headlines** (all ≤ 30): Facebook un Instagram reklāma · Meta reklāmas
pārvaldība · Reklāmas budžets no 1 000 € · The Brew Company: ROAS 13,36 ·
Redzi, cik maksā viens klients · Meta sertificēts speciālists · Bezmaksas
iepazīšanās zvans · Reklāmas materiāli iekļauti · Strādājuši ar 100+ uzņēmumiem
· Konts paliek Tavs · Facebook reklāmas aģentūra · Instagram reklāma uzņēmumiem
· Google vērtējums 5,0 · Mārketinga Skola

**Descriptions:**
1. Facebook un Instagram reklāmas uzņēmumiem ar reklāmas budžetu no 1 000 € mēnesī.
2. Ja pirms sākuma norunāto rezultātu nesasniedzam, par pārvaldību nemaksā.
3. Atskaite sākas ar to, cik maksā viens klients. Reklāmas materiālus veido mūsu komanda.
4. Kampaņas vada Meta sertificēts speciālists. Piesakies bezmaksas 20 minūšu zvanam.

Pin description 1 to position 1, so the budget floor shows with every ad. Pin
"Reklāmas budžets no 1 000 €" to headline position 2 for the same reason. The
floor and "Google vērtējums 5,0" are typed from `site.json` and `reviews.json`:
change the ads if either changes.

Sitelinks: Rezultāti (`#rezultati`), Pieteikums (`#pieteikums`), Portfolio
(`/portfolio/`), Konsultācija (`/marketinga-konsultacijas/`).

## Campaign 3: MS | Search | LIAA eksporta atbalsts

`CONTENT-RULES.md` governs every word: supplier never approver, no guarantee,
prices bez PVN, printing excluded, no LIAA logo. The prices below are typed
from `liaa.json` (4 900 and 7 900): change the ads if that file changes.

| Setting | Value |
| --- | --- |
| Location / language | Latvia / Latvian |
| Bidding | Maximise clicks, max CPC 2 € |
| Landing page | `https://marketingaskola.lv/liaa-eksporta-atbalsts/?utm_source=google&utm_medium=cpc&utm_campaign=liaa` |

**Keywords** (phrase): "liaa eksporta atbalsts", "liaa atbalsts eksportam",
"eksporta atbalsts liaa", "liaa eksporta atbalsta programma",
"liaa eksporta programma", "eksporta atbalsta darbību plāns",
"mvu eksporta atbalsts", "atbalsts eksporta veicināšanai",
"ārvalstu partneru meklēšana".

**Negatives:** mājas lapas, mājaslapas, digitalizācijai, jaunajiem uzņēmējiem,
tūrisma, vakances, darbs, altum, lad. ("liaa atbalsts mājas lapas izveidei" is
a real search, but websites are not an eligible activity; never imply they are.)

**Headlines:** LIAA eksporta atbalsts · 60 % izmaksu var atgūt · Materiāli
4 900 € bez PVN · Telemarketings 7 900 € bez PVN · Partneru meklēšana ārvalstīs
· Buklets, baneri un video · Vismaz 3 notikušas tikšanās · Piedāvājums cenu
aptaujai · Cenu aptaujas sagatave · Fiksēta cena bez PVN · Eksporta mārketings
MVU · Mārketinga Skola

**Descriptions:**
1. LIAA eksporta plānā var atgūt līdz 60 % no izmaksām, ja LIAA plānu apstiprina.
2. Buklets, baneru komplekts un video eksportam: 4 900 € bez PVN. Druka nav iekļauta.
3. Ārvalstu partneru meklēšana: vismaz 3 notikušas tikšanās. 7 900 € bez PVN.
4. Esam piegādātājs, nevis LIAA partneris. Lēmumu par atbalstu pieņem LIAA.

Pin description 4 to position 2, so the supplier line shows with every ad.

## Campaign 1 additions (Impromotion, `~/Impromotion/google-ads-plan.md`)

From Google's own autocomplete, 9 Nov: add "ziemassvētku pasākums darbiniekiem",
"ziemassvētku pasākums kolektīvam", "komandas saliedēšanas pasākumi",
"team building riga", "pasākuma vadītājs cena", "vakara vadītājs cena".
Drop "tamada": its suggestions are all Tomodachi Life. Add negatives: bērniem,
pirmsskolā, skolēniem, idejas, spēles, diskusijas.

## Success lines

- **Websites:** after 300 clicks, at least 3 form leads and 1 call. One sale pays
  for the whole test.
- **LIAA:** any quote request is a win; the campaign mostly feeds the same
  offer as the cold e-mail.
- **After the credit lands:** move it to whichever campaign produced leads. In
  January switch Impromotion to team building and add the Meta course.
