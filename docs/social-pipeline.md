# Mārketinga Skola social media pipeline: plan

Status: **calendar approved (12 Oct 2026); designs rendered by `tools/social-render.mjs` into `social/out/`, awaiting checkpoint 2.** Owner's brief: an automated social
pipeline in the site's brand style, closer to the Cowork "social content engine"
than to the n8n build. Decided the same day: only for Mārketinga Skola (the
English personal-brand pipeline in n8n stays as it is), visuals as AI artwork
plus HTML templates, publishing through Zernio.

## What exists, and what to keep from it

- **n8n personal pipeline** (Notion → `content_log` → Zernio): English, Rihards's
  own accounts. Worth reusing: Zernio scheduling and the LinkedIn first-comment
  trick. Not reused: everything else. It has published nothing for a month and
  hit the plan's execution cap on 29-30 Sep.
- **Security, owner action:** the Zernio API keys are typed into the HTTP
  headers of "Post on Socials" (both variants), with an old getlate.dev key in a
  test node. Move them into an n8n credential and rotate them before anything new
  uses Zernio.
- **Telegram Brain Dump v2** files "Social Content" notes into a Notion database
  the integration cannot open (a 404 lost an idea on 6 Oct). Fix that, and it
  becomes a free source of post ideas.
- **The engine's pattern, adopted as is:** learn the voice first; one standing
  calendar extended on every run; three checkpoints (calendar → designs → copy);
  a generation budget before any generation; never present an unseen design;
  never state a price the data did not give; stage, never publish on its own.

## The shape

```
site data + brain dump ─▶ calendar (checkpoint 1) ─▶ designs (checkpoint 2)
   ─▶ Latvian copy + lv:review (checkpoint 3) ─▶ Zernio, scheduled ─▶ weekly numbers
```

One weekly session runs the first three steps, in the Code tab against this
repo: the templates, fonts, artwork, data files, the OpenAI key and the n8n
connection are all here. Only publishing and metrics are always-on, and they
live in n8n with the Zernio credential, so no key sits on the Mac. Running the
session in the Cowork app later is possible once rendering does not need local
Chrome.

## 1. Sources: what the site already knows

Every post starts from a fact the site holds, so nothing is invented:

| Source | File | Post types |
| --- | --- | --- |
| Blog, 42 posts | `src/posts/*.md` | carousel of the main points, one-insight card |
| Course dates and prices | `src/_data/courseSessions.json` | "next group" card, countdown story |
| Consultation | `src/_data/booking.json` | offer card |
| Reviews | `src/_data/reviews.json` | testimonial card |
| Portfolio cases | `src/pages/portfolio.html` | result card with the real Ads Manager screenshot |
| LIAA | `src/_data/liaa.json` | deadline card (CONTENT-RULES.md applies) |
| Automation test | aggregate only, never one visitor | "what we see most" card |
| Brain dump | Notion, once fixed | anything Rihards says out loud |

Prices, hours and dates are read from the data files at render time, the same
rule as the site: never typed into a post.

## 2. Brand-style visuals: AI artwork inside HTML templates

- **Templates** in `social/templates/`, built on the site's own tokens, fonts,
  logo, square geometry, indexed eyebrow, cyan budget and dark canvas: 1080x1350
  feed, carousel (cover, point slide, closing CTA), 1080x1920 story, testimonial,
  result-with-screenshot, date card.
- **Text is real HTML text**, so the Latvian is always exact and editable. No
  words are ever baked into a picture.
- **AI artwork** (gpt-image-2, the house style already in
  `tools/generate-images.mjs`) fills the picture slot where a post needs one. Many
  posts can reuse the 137 images the site already has.
- **Animated covers:** a carousel with `"motion": true` also gets `01.mp4`, a
  6 s loop where the artwork takes itself apart and assembles again from the
  same pieces the site headers use (`piecesSvg`, exported by
  `tools/build-motifs.mjs`). It opens and ends on the finished cover, so any
  thumbnail frame is a complete picture. The still slides follow it.
- **Post artwork** has its own manifest, `social/art.json`, and lands in
  `social/art/` through the site's generator (`--manifest`/`--out`), so it never
  ships with the site. Each image is ground-matched and trimmed to its drawing.
- `tools/social-render.mjs` renders through puppeteer, the same way as the quote
  PDF and the screenshots, and writes a contact sheet per batch. The session
  shows every design before asking for approval.

## 3. Voice and Latvian

**The Latvian is written by an OpenAI model** (owner, 11 Oct 2026: "for natural
latvian use OPEN AI api, as it writes better"). `tools/social-write-lv.mjs`
fills each calendar row's `lv` from its English brief and sourced facts with
`gpt-6-astra` by default. It rejects punctuation dashes, numbers that are not in
the facts, "kreatīvs" as a noun and headlines over 60 characters, and asks once
more before leaving a note for a human. `lv:review` then reads the result; the
first run caught a gendered participle ("esi manījis") and a purpose clause
without the conditional ("lai Tu vari"), so both checks stay.

**Topics, set by the owner the same day:** AI, advertising, marketing
automation, the newest models and news in ads. News items carry their source
and date in `facts`, and anything a source only reported second-hand is marked
VERIFY until checked.

- `social/voice.md`: the site's copy rules (Tu, no punctuation dashes, no
  invented claims, one name per rung, prices from data), plus what the best
  existing Facebook and Instagram posts show. It is built once, then confirmed by
  Rihards.
- Every caption goes through `npm run lv:review`. Written gender-neutral, like
  the newsletter.

## 4. The standing calendar

**One schedule since 3 Nov 2026: the Notion Content Calendar.** Rihards asked to merge the two Latvian
calendars and "put everything in the system going forward". So the posts for this page and Instagram sit in
the same Notion database as his English Batch One posts, and Post Desk (claude.ai artifact
5h4HzhZ2T12f85m5pmyEQT, source in acquisition-md/post-desk) is where he reads, edits, reorders and approves
them. Its Plan view changes dates and swaps neighbours.

- **Accounts:** English goes to his LinkedIn, then X and Threads. Latvian goes to the Mārketinga Skola
  Facebook page and Instagram: both the `FINAL POST LV` of a Batch One row and this pipeline's own posts.
- **A post of this pipeline** is a row named `MS · <Day d Mon> · <virsraksts> (KEYWORD)`, with
  `=== FINAL POST LV ===`, `=== LV SLIDES ===` (and `=== MAGNET URL ===` for a lead magnet) in its body.
  It is approved with the **Post Ready** box, never **Approved**: the English 08:00 packager takes the
  oldest Approved row and fails on one without an English post, every morning, holding up the English ones.
- **Two Latvian posts a day on the page** only when one is a story. Post Desk flags two `MS ·` rows on one
  day; a Batch One row on the same day is fine for LinkedIn but means a second feed post on this page.
- `social/calendar.json` stays the workshop: one row per post with brief, facts, path, the Latvian copy
  and status (planned, approved, designed, written, published, killed). After checkpoint 3,
  `node tools/social-handoff.mjs <id> [--date=…]` hosts the slides (JPGs and the moving cover, checked
  byte for byte) and writes `social/out/<id>/notion.md`; the session creates the Notion row from it and adds
  the `notion` link here. From then on the date in Notion is the one that counts.
- The 3 Nov merge: `2026-11-05-ai-latvian` moved to 11 Nov (the Latvian ADS post, keyword META, has 5 Nov),
  `2026-11-03-conversion-signal` to 17 Nov (it never went out), `2026-11-06-result-story` kept its Friday,
  and `2026-11-10-claude-meta-rules` was killed as a duplicate of the Latvian ADS post. The October posts
  marked approved never went out either (no publisher); they need a freshness check (course dates) before
  they are handed over.

## 5. Publishing: n8n + Zernio

A new workflow, "Mārketinga Skola — sociālie ieraksti" (not built yet; until it exists the Latvian posts go
out by hand from Post Desk). Since 3 Nov it reads the Notion calendar: rows with `FINAL POST LV`, approved by
**Post Ready** (an `MS ·` row) or **Approved** (a Batch One row), on their date. It:

- takes the caption, media URLs, channels and time;
- schedules the post in Zernio;
- saves a row in an n8n data table;
- answers with the Zernio ids.

It is one execution per approved post, so the execution cap is not at risk.

**Media hosting** is still open: Zernio needs a public URL or an upload.
Supabase storage is what the personal pipeline uses.

## 6. What worked

A weekly n8n run pulls reach, saves, shares and clicks per post, from Zernio
analytics or Meta Insights. It appends them to the data table, and the next
calendar session reads them first, before choosing formats and topics.

## Order of work

1. **Owner:** connect the Mārketinga Skola Facebook page and Instagram business
   account in Zernio (3 Nov: Instagram is still not in any publisher); move the Zernio key into an n8n
   credential and rotate it.
2. **Templates and the render tool;** render one sample week from real site data
   for the owner to judge the look. Nothing is published yet.
3. **Voice profile;** confirmed by the owner.
4. **The weekly session as a project skill,** with the three checkpoints and the
   calendar Artifact.
5. **The n8n publisher and media hosting;** one real post end to end.
6. **The weekly metrics pull.**

## Open questions

- Cadence: three posts a week (two feed, one story) is the suggested start.
- LinkedIn: a Mārketinga Skola company page, or none.
- Media hosting: Supabase storage, or a path on the site.
- Poll stories: Instagram's publishing API cannot add interactive stickers, so a
  poll story is posted by hand from the phone, or becomes a static story.
- Can the existing Facebook and Instagram posts be read (Zernio or Meta) to
  build the voice profile, or does Rihards paste a few?

## Evidence (researched 13 Oct 2026)

Three research passes: platform data, how top accounts build posts, and what
Baltic agencies post. Vendor studies are correlational; re-check before relying
on a number.

- **Carousels lead on engagement and saves; Reels lead on reach.** Instagram
  engagement per reach: carousels 6.9%, images 4.4%, Reels 3.3% (Buffer, Mar
  2026). Reels reach ~1.36x carousels (Buffer, 2022-24 data). For 1-5K accounts
  carousels still out-view Reels, 993 vs 580 (Socialinsider, Feb 2026).
- **Top Instagram signals:** watch time, likes per reach, sends per reach (Mosseri,
  Jan 2025). A skipped carousel is re-shown from slide 2, so slide 2 needs a hook.
- **Slide count:** engagement rises to ~8-12 slides (MagicPost 2026, LinkedIn;
  older Instagram data peaks at 10). The publishing API caps carousels at 10.
- **Facebook links:** reported since 15 Sep 2026 (Meta One), affected Pages get 2
  link posts or link comments a month; link posts already get the fewest views
  (Socialinsider, Mar 2026: links 20 vs albums 85 views at 1-5K followers). Meta's
  own help page could not be read; check whether the Page is affected.
- **Facebook cannot take video and images in one post** through the API; albums
  are the best-viewed format for small Pages.
- **Instagram caption links do not click.** Link stickers in stories do.
- **Hashtags** are capped at 5 and do not add reach; keywords in the first ~125
  characters matter for Instagram search and Google indexing (since Jul 2025).
- **Comment-keyword-to-DM** is allowed when it delivers something (a lead step);
  a bare "comment X" ask can lose recommendation (Instagram, Jun 2024).
- **Frequency:** 3-5 posts a week reach ~12% more per post than 1-2 (Buffer, Aug 2025).
- **Baltic gap:** Latvian agencies post on LinkedIn, mostly in English, mostly
  awards and team life; their teaching posts get 0-9 reactions. No regular
  Latvian-language teaching carousel series, real-number case posts or ad
  teardowns were found (Instagram itself could not be viewed logged out).

## Lead magnets: comment a keyword, get it by DM (13 Oct 2026)

Owner: the English pipeline's lead-magnet flow is "the whole backbone of
generating engagement and followers", so Mārketinga Skola gets it too.

- **A magnet post** carries `magnet: { keyword, slug, title, items }` in the
  calendar. The cover's footer says "Komentē KEYWORD", the closing slide is the
  gate (what is inside, the keyword in a cyan block, "nosūtīsim saiti privātā
  ziņā"), and the caption ends on the same keyword. **The guide asks for an
  e-mail since 13 Oct 2026** (owner: gate the magnets so readers get access
  when they join the mailing list): the DM carries the link, the post shows its
  first part to everyone and opens the copyable part after a newsletter
  sign-up. So no post or caption may promise "bez e-pasta" again.
- **Delivery is Zernio's comment-to-DM** (`POST /v1/comment-automations`), one
  per-post automation per channel (`platformPostId`), `keywords` + `matchMode:
  word` + `typoTolerance`, `dmMessage` with a link button, rotating
  `commentReply` lines. It uses Meta's private replies: one DM per comment,
  within 7 days of the comment. Instagram also offers `followGate`. Verify the
  fields against Zernio's API reference when building; they come from Zernio's
  own blog (13 Oct 2026).
- **Links travel in the DM**, so magnet posts stay link-free on Facebook too.
- **Magnets live on the site** under `/materiali/<slug>/` (noindex), so they
  carry the site's design, analytics and UTM tags.
- In the English pipeline the LinkedIn delivery engine (Unipile) is inactive and
  fulfilment there is by hand; its API key, like the Zernio one, is typed into
  the workflow and should move into a credential.

## What wins comments on LinkedIn, read in the owner's feed (13 Oct 2026)

Read in the owner's own LinkedIn (feed, his comment history, a few searches),
with his permission, read-only. The posts he commented on are the magnets he
wanted himself, so they are the best brief there is.

| Post (creator) | Reactions / comments | Keyword | Visual |
| --- | --- | --- | --- |
| Claude + Meta Ads system, "$2.42M in 30 days" (Kalash Jain) | 115 / 508 | META | real Ads Manager screenshot, revenue column boxed in red, black bar "Comment META for Free Access" |
| Claude 5.5 workflow replaced 12 h/week of Meta research (Dusan Radovanovic) | 45 / 272 | ACCESS | screen recording of the Claude project ("Meta Ads Creative Strategist"), banner "Full FREE system below", keyword pill |
| Complete guide to paid traffic with Claude (Ahad Shams) | 54 / 259 | Claude | the guide's own cover in a PDF viewer, 10-chapter contents with page numbers, big keyword button |
| Claude Code + Higgsfield ad engine, "brief in, winners out" (Dusan Radovanovic) | 60 / 204 | ENGINE | product-UI mock: 4-step pipeline, 5 AI avatar video thumbnails, keyword pill |
| 9 Grok bots that run your marketing (Johnny Lee); copied word for word by Ira Bodnar | 181 / 849; 421 / 992 | grok / Jev | numbered list |
| 5 Claude Code tricks, Claude Code mods (Angel Pichardo) | small | KEYS, MODS | talking head video |

**Patterns:** comments run 4-10x the reactions on a gated post; the keyword
sits ON the cover image, not only in the caption; the visual is the proof or
the system itself (a real screenshot, the tool's UI, the guide's contents),
not an illustration; the hook is a big claim with a number ("replaced a
$7,000/month agency", "12 hours a week"); the keyword is the topic word.
**And the backlash:** copied magnets are being called out (the owner did so
himself), and a viral "Claude CMO guide" funnel drew an article about
LinkedIn's credibility. Our magnets are only our own systems and our own
numbers.

**What we took into the templates:** a magnet cover carries the keyword as a
cyan bar ("Komentē META · bez maksas"), slide 2 carries proof, one rule per
slide, the gate closes the carousel. The cover art can show the system as an
app screen.

## Lead magnet backlog

| Keyword | Guide | Source | Status |
| --- | --- | --- | --- |
| META | Meta reklāmas ar Claude: 7 noteikumi | owner's ADS kit | guide built `/materiali/meta/`, example post 2026-11-10 |
| LATVISKI | Kā mēs panākam, ka AI raksta latviski | our writer and reviewer prompts, the phrases fixed on the site | guide built `/materiali/latviski/`, post 2026-11-05 |
| TESTS | automatizācijas tests | `/automatizacijas-tests/` | exists |
| KOMANDA | Mārketinga nodaļa uz Claude un n8n | owner's TEAM kit | to adapt |
| ROAS | Četras Zoles: kā tika ROAS 36,34 | portfolio case + real screenshot | needs the campaign set-up from the owner |
| DZINĒJS | AI reklāmu dzinējs ecom (brief in, variants out) | owner's Starfleet creative process | needs the owner's real process, nothing invented |
| SEO | Kā mēs automatizējām SEO savai lapai | this site's own setup (schema, llms.txt, IndexNow) | can be written from the repo |
| VEIKALS | E-komercija ar AI: būves žurnāls | owner's START kit, the POD store | to adapt; never name the store |
