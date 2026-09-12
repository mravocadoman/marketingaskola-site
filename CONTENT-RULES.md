# CONTENT-RULES.md — the LIAA export-grant pages

Governs `/liaa-eksporta-atbalsts/`, `/eksporta-marketinga-materiali/`,
`/eksporta-telemarketings/`, the quote template and any ad, e-mail or post
that sells them. **These are compliance rules, not style preferences.** The
grant is public money with an audit trail, and the buyer forwards our page and
our quote into their own application file — so anything wrong here becomes
wrong inside somebody else's LIAA submission.

Everything numeric on those pages renders from `src/_data/liaa.json`. Never
type a rate, a cap or a price into copy.

## The seven rules

1. **We are a supplier, never an approver.** Never state or imply that
   Mārketinga Skola is LIAA-approved, LIAA-accredited, an official partner,
   on any list, or in any way endorsed. **No such status exists in this
   programme** — any supplier may be quoted in a cenu aptauja, which is
   exactly why claiming one would be a lie that sounds plausible.
2. **Never guarantee the grant.** LIAA decides eligibility, the application
   and the payout. Write "var tikt attiecināts", "atbalsta saņēmējs",
   "LIAA lemj" — never "saņemsi 60%", "garantējam atbalstu", "mēs nokārtosim".
   The same applies to timelines: we control our delivery term, not LIAA's.
3. **Prices are always ex-VAT (bez PVN),** because the support is calculated
   on net cost. Every price on these pages carries "bez PVN" in the same
   breath. This is the one place on the site where the gross price is NOT
   shown beside the net — the buyer is a company reclaiming VAT, and a gross
   figure here would be the number that ends up in the wrong column.
4. **Printing and production are outside the eligible scope, and we say so
   plainly.** We deliver to artwork/maket stage. Printing, production,
   copying, media buying and filming are quoted separately and are the
   client's own expense. Do not bury this in fine print.
5. **The client runs the procurement.** We supply a quote with itemised
   positions; the cenu aptauja, the three quotes, the protocol and the
   application are theirs. Never offer to "arrange the price survey", to
   supply competing quotes, or to fill in their application.
6. **Every page carries the disclaimer block** (`src/_includes/liaa-disclaimer.njk`),
   word for word, at the foot. It is a legal position, not copy to vary.
7. **No LIAA, ERAF, EU or Atveseļošanas fonds logos, emblems or brand marks**
   anywhere on these pages, in ads or in the quote. Naming the programme in
   plain text is fine; reproducing its identity is not. (The EU funding
   lockup on `/sazinies/` is a separate, legally required disclosure about
   *our own* funding — unrelated, and it stays.)

Plus the two house rules that already apply everywhere and get broken most
often on a page like this: **no em dashes in Latvian body copy**, and
**no invented numbers** — if a figure is not in `liaa.json` or on the LIAA
page, it does not go on the site.

## Verified programme facts

Checked against liaa.business.gov.lv on **12 Sep 2026**. Re-verify before any
edit that touches a number; this programme has already been re-issued once.

| Fact | Value | Where it renders |
| --- | --- | --- |
| Reimbursement rate | 60% of eligible cost | pillar, both product pages |
| Cap per recipient per year | 40 000 € | pillar |
| Ceiling vs turnover | ≤30% of last closed year's net turnover | pillar, eligibility |
| Applications open until | 31.12.2026 | pillar |
| Programme budget | 15 400 000 € | pillar |
| Costs claimed by | 31 March of the following calendar year | pillar |
| Quotes needed in a cenu aptauja | 3 | pillar, both product pages |
| Full procurement above | 70 000 € | pillar |
| Self-assessment minimum | 9 points | eligibility |
| Tax debt allowed | ≤1 000 € | eligibility |
| Excluded sectors | 6, listed in `liaa.json` | eligibility |

**Known conflict, deliberately not repeated:** LIAA's older SKV
(Starptautiskās konkurētspējas veicināšana) page states a **60 000 €** annual
cap. That is the previous programme. The current MVU eksporta atbalsta
darbību plāns caps at 40 000 €, and 40 000 is what the site says. If a client
quotes 60 000 at you, this is why.

## Sources

- Programme page: <https://liaa.business.gov.lv/atbalsta-iespejas/eksporta-atbalsta-darbibu-plans>
  — rate, cap, turnover share, deadlines, budget, self-assessment calculator,
  excluded sectors.
- The same page's cenu aptauja guidance — three quotes, the 70 000 €
  procurement threshold, and the rule that the recipient runs and documents
  the survey.
- Owner (Rihards), 12 Sep 2026: the two prices (4 900 € and 7 900 € bez PVN)
  and the scope rows, published as drafted.

## When a fact changes

`src/_data/liaa.json` first, then this file's table, then re-read the three
pages for any sentence that paraphrases a number instead of rendering it.
`npm run build` fails on an unknown `{% offer %}` key but will happily print a
stale sentence, so the paraphrase check is manual.
