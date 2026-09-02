# AI assistant for inquiries — plan (not built)

Written 2 Sep 2026 after the floating WhatsApp button shipped. This is the
design for the next step: an on-site assistant that answers from the site's
own facts, collects contact details, and hands every lead to Rihards. Nothing
here is implemented; the n8n workflow can be built from this in an afternoon.

## Why on-site first, not inside WhatsApp

- The site is static (GitHub Pages / SiteGround). Any LLM call needs a
  backend to hold the API key. **n8n is that backend** — one webhook
  workflow, no new hosting.
- Replying *inside* WhatsApp needs the WhatsApp Business Platform (Cloud API)
  with a number registered to the API. +371 26673384 lives in the WhatsApp
  app today; a number is normally on the app *or* the API. Meta's
  "coexistence" mode lifts that, but check availability for Latvia with a
  Business Solution Provider before planning around it. Do it only if the
  on-site assistant shows volume.
- Never automate the personal WhatsApp account (WhatsApp Web bots). It
  breaks the terms and gets numbers banned.

## The flow

```
visitor ──▶ chat bubble (site) ──POST──▶ n8n Webhook /ms-assistant
                                            │
                                   Code: validate + rate-limit (Data Table: sessions)
                                            │
                                   OpenAI "Message a model" (JSON output)
                                            │
                              ┌─────────────┴─────────────┐
                        lead.ready = false           lead.ready = true
                              │                            │
                     Respond to Webhook          ┌─────────┼──────────────┐
                     { reply }                   │         │              │
                                          Telegram msg   MailerLite      Gmail/SMTP
                                          to Rihards     subscriber →    "Jauns pieteikums"
                                          (existing      group "Web —    (optional)
                                          ops bot)       kontaktforma"
                                                 └─────────┼──────────────┘
                                                   Respond to Webhook
                                                   { reply, handoff: wa.me link }
```

### Nodes, in order

1. **Webhook** — `POST /ms-assistant`, JSON body
   `{ session, page, messages: [{role, content}] }`. Respond mode "Using
   Respond to Webhook node". CORS: allow `https://marketingaskola.lv` only.
2. **Code (validate)** — reject bodies over 8 KB or more than 16 turns;
   strip HTML; look up `session` in a **Data Table** `assistant_sessions`
   (columns: session, ip_hash, turns, first_seen, lead_sent). Rate limit:
   30 messages per session, 60 per IP-hash per hour. Return 429 politely.
3. **OpenAI → Message a model** — system prompt below, the site facts block,
   the conversation; response format JSON with the schema
   `{ reply: string, lead: { ready: boolean, name, phone, email, company,
   topic, summary } }`. Small/fast model, temperature 0.3, max 400 tokens.
4. **IF** `lead.ready && !session.lead_sent`.
5. **Telegram → send message** to Rihards (the ops bot already used for the
   other business can host a second chat): name, phone, topic, summary,
   page, and a `wa.me/<their phone>` link so the reply is one tap.
6. **MailerLite → create/update subscriber** in group *Web — kontaktforma*
   (`196419625361082354`) with `message = summary`, `source_page = page`.
   The lead then lives where the form leads already live.
7. **Data Table update** — `lead_sent = true`, append the transcript (kept
   30 days, then a scheduled workflow deletes old rows).
8. **Respond to Webhook** — `{ reply, handoff }`; `handoff` is the WhatsApp
   link with a prefilled summary when the visitor prefers to continue there.

Optional 5b: a **WhatsApp Cloud API** "template message" to +371 26673384.
Needs a WABA and an approved template; Telegram covers the same need for
free until then.

### System prompt (draft, Latvian)

> Tu esi Mārketinga Skolas (SIA "Stonks", marketingaskola.lv) palīgs. Atbildi
> latviski, īsi un konkrēti, uzrunā ar "Tu". Vari stāstīt TIKAI to, kas ir
> faktu blokā zemāk: pakalpojumi, kursi, cenas, kontakti. Ja jautājums ir
> ārpus tā vai prasa solījumu par rezultātiem, saki, ka to precizēs Rihards,
> un piedāvā atstāt kontaktus. Nekad neizdomā cenas, datumus vai rezultātus.
> Bezmaksas ir tikai 20 minūšu iepazīšanās zvans uzņēmumiem, kas apsver
> sadarbību; konsultācijas ir maksas (100 €/h, 60 €/30 min). Kad cilvēks
> izrāda interesi par pakalpojumu vai kursu, pajautā vārdu, tālruni vai
> e-pastu un vienu teikumu par biznesu, tad apstiprini, ka Rihards sazināsies
> 1 darba dienas laikā. Atbildi JSON formātā pēc dotās shēmas.

Facts block: generated at build time from `site.json`, `forms.json`
(course list) and the course front matter (`course:` — name, hours, price),
so prices in the bot can never drift from the pages. Export it as
`_site/assistant-facts.json` and let the workflow fetch it, or paste it into
the node and re-paste when prices change.

### Guardrails

- Grounded facts only; anything else → "to precizēs Rihards" + lead capture.
- Max 16 turns, then hand off to WhatsApp/e-mail.
- No PII beyond what the visitor types; transcripts deleted after 30 days.
- Consent line in the widget: *"Sarunu apstrādā mākslīgais intelekts
  (OpenAI) un tā tiek glabāta 30 dienas — privātuma politika."*
- Privacy policy addendum (section 4, add): *"OpenAI (OpenAI Ireland Ltd.)
  — vietnes palīga sarunu apstrāde, ja to izmanto."*

### Widget on the site

`src/js/assistant.js` + markup in `base.njk`, styled from the existing
tokens: a card that opens from a second floating control next to
`.wa-float` (or replaces its label with "Jautā"), messages as hairline
rows, the input styled like `.blog-search`. Progressive: without JS or if
n8n is down, the control is simply the WhatsApp link. Sends
`{ session (random id in sessionStorage), page, messages }`, renders
`reply`, shows the `handoff` link when present.

### Cost

Per conversation roughly 2–6k tokens on a small model — well under a cent.
n8n executions: one per message. Telegram/MailerLite: free tiers.

### Rollout

1. Build the n8n workflow (Data Table + Webhook + OpenAI + Telegram +
   MailerLite + Respond). Test with `test_workflow` and pinned inputs:
   a price question, an off-topic question, a lead handoff.
2. Add `assistant-facts.json` to the build.
3. Ship the widget behind a flag in `site.json` (`assistant.webhook`), like
   analytics: empty = not rendered.
4. Watch the Telegram feed for a week; tune the prompt from real questions.
