# Iepirkumu radars: weekly public-procurement digest (design)

Owner asked, 13 Oct 2026: *"an automation that does weekly publiskie iepirkumi
calls for ai / automation / marketing services for Mārketinga Skola to
potentially apply for."* Approved the same day as option 1 below.

## Outcome

One e-mail on Monday morning listing the Latvian public procurements published
in the previous seven days that Mārketinga Skola could bid on, skimmable in two
minutes, with nothing relevant missing. No e-mail on a week with no fits.

## Source: IUB open data, and only that

`https://open.iub.gov.lv/data/notice/YYYY/MM/DD-MM-YYYY.json`, one file per
day, about 1 MB, a JSON array of every notice IUB published that day. No key.
It carries the small "9. panta" procurements and the above-threshold ones that
are also forwarded to TED, so the TED API adds nothing for Latvian buyers.
Procurements under 10 000 € are published nowhere and cannot be caught.

Measured on 6-12 Oct 2026: 1 278 notices, 452 of them open calls, 39 through a
rough CPV + keyword filter, about five genuine fits. A filter alone would spam;
the AI step is what makes the e-mail worth reading.

Fields used (all present in the e-forms JSON):

| Field | Path |
| --- | --- |
| Title | `name` |
| Description | `procurementProject.description`, `lots[].name`, `lots[].description` |
| Buyer | `organizationData.name` |
| CPV | `cpvType`, `additionalCpvType[]` |
| Notice type | `noticeType` |
| Deadline | `lots[].tenderingProcess.deadlineReceiptTendersEndDate` + `…EndTime`; for market consultations `tenderingProcess.deadlineTimeComment` (dd/mm/yyyy) |
| Estimated value | sum of `lots[].additionalInformation.estimatedValue` when given |
| EIS link | `tenderingProcess.documentsURL` |
| Public notice | `https://eformsb.pvs.iub.gov.lv/show/<identifier>` (no login) |
| Corrected notice | `clonedFrom` not null |

## What counts as a fit (owner, 13 Oct 2026: all four)

1. **Ads and campaigns**: digital advertising, social media, communication, PR
   and awareness campaigns, media planning for those.
2. **Video and content**: video production, photo, content creation.
3. **Web, automation, AI**: websites, landing pages, marketing automation, AI
   solutions. Not general IT systems or software maintenance.
4. **Training and mentoring**: digital-marketing training, seminars, mentoring.

Explicitly NOT a fit: event technical production (sound, lighting, stages, LED
screens; the Liepāja 2027 tender of 11 Oct is the example), printing,
translation, CCTV, supply of goods, information-system maintenance.

## The workflow: n8n, "Mārketinga Skola — iepirkumu radars"

1. **Schedule**: Monday 07:00 Europe/Riga.
2. **Fetch**: the seven daily files for the previous Monday-Sunday. A 404 or a
   failed day is skipped and named in the e-mail footer; if all seven fail the
   workflow throws, and the shared alert workflow `R9OmXjBXdhYetZkM` e-mails
   the owner.
3. **Rough filter** (Code node, no AI):
   - keep open calls `pil-contract`, `pil-planned-contract`, `mk-contract`,
     `sps-contract`, `pil-contract-social`, `sps-iv-contract`, and early
     warnings `pil-discussion`, `pil-prior-information`, `pil-prior-shorten`;
   - drop anything whose deadline is before the run date (unknown deadline is
     kept);
   - keep a notice if any CPV starts with one of `7934 7941 7931 7932 79822
     7996 9211 9222 72212 72413 7242 72316 7226 8050 8051 8052 8042 8057
     80533 73`, or the text matches `reklām|mārketing|sociāl… tīkl/medij|
     kampaņ|komunikācij|publicitāt|video|mājaslap|tīmekļvietn|SEO|mākslīg…
     intelekt|MI|AI|automatiz|digitāl|zīmol|sabiedrisk… attiecīb|satura
     veido/izstrād|foto|filmēšan|dizain` (case-insensitive).
4. **AI triage**: one Anthropic call, `claude-sonnet-5-5`, credential
   *Anthropic account*. Input: each candidate as `{i, title, description
   (clipped to 400 chars), buyer, cpv}` plus the fit definition above. Output:
   JSON `[{i, score, why}]` for fits only, `score` 3 = strong fit, 2 = worth a
   look, `why` one Latvian sentence. The node keeps only `i` values that exist,
   clips `why` to 200 characters and strips tags. Every other field in the
   e-mail comes from the notice itself, so the model cannot invent a deadline,
   a value or a link.
   **If the call fails or returns invalid JSON**, the e-mail still goes out
   with the rough list, marked `nešķirots` in the subject, so nothing is lost.
5. **E-mail**: Gmail credential *Marketinga skola* →
   rihards@marketingaskola.lv, only when at least one fit exists.
   - Subject: `Iepirkumi: 3 piemēroti (6.–12. okt.)`.
   - Section "Iesniedzami": score 3 first, then 2, each group by deadline.
   - Section "Gaidāmie (tirgus izpēte)": market consultations and prior
     information notices.
   - Per item: title linked to the public IUB notice, buyer, deadline, value if
     given, EIS link, the one-line reason, `(labots)` if `clonedFrom`.
   - Footer: notices read, rough matches, days that could not be fetched.
6. **Settings**: failures to `R9OmXjBXdhYetZkM`; successful executions not
   stored, like the other site workflows.

No data table: each run covers seven fresh days, so nothing repeats. A
corrected notice reappears in a later week and is tagged.

## Testing

1. Check that n8n Cloud can fetch `open.iub.gov.lv` at all (SiteGround once
   challenged n8n's IP; a government site might do the same).
2. Run on 6-12 Oct 2026 with the e-mail node disabled. It must surface the Rīga
   Mājokļu un vides departaments media-planning consultation and the VIAA PR
   contract, and must NOT surface the Liepāja 2027 event production tender or
   the CCTV and printing notices.
3. One real e-mail to the owner.

## Deliberately left out

- Reading the nolikums for turnover or reference requirements: not in the open
  data. Add it if many fits turn out to be ones the company cannot qualify for.
- A trainee category (event production and the like): a second fit definition
  and a second recipient, when wanted.
- A dead-man's switch for a cron that silently stops: the same gap the uptime
  monitor has.
