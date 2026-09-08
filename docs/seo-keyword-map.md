# Keyword → page map, rebuilt from Search Console

Built 8 Sep 2026 from all 986 queries in Search Console (7 Jun – 6 Sep),
cross-checked against every page's actual on-page targeting, with Ahrefs used
only for difficulty and competitors. Replaces guesswork about what to target.

## The number this is all about

**53 buyer-intent queries produced 26,099 impressions and 12 clicks.** That is
0.046%. Three months, twenty-six thousand times someone searched for what this
business sells, saw the site listed, and did not click.

Clustered, the whole picture:

| Cluster | Queries | Impressions | Clicks | CTR |
| --- | --- | --- | --- | --- |
| SEO | 47 | 29,146 | 14 | 0.05% |
| Agency / services | 30 | 13,628 | 8 | 0.06% |
| Google Ads | 21 | 13,075 | 3 | 0.02% |
| Meta / Facebook | 23 | 11,319 | 6 | 0.05% |
| Strategy | 22 | 6,630 | 10 | 0.15% |
| Social | 18 | 6,007 | 2 | 0.03% |
| **Courses** | **7** | **1,998** | **62** | **3.10%** |
| E-mail | 5 | 1,573 | 0 | 0% |

**Courses is the only cluster that works** — 1.6% of the impressions produce
49% of the clicks. That is not luck: the course pages match a narrow intent
exactly, with date, price, instructor and group size on the page. Everything
below is an attempt to make the commercial clusters behave the way courses
already does.

## The actual fault: intent mismatch, not missing pages

18 of the 28 biggest buyer queries **already have a page targeting them** and
still earn nothing, because the page that ranks is the wrong *type*:

| Buyer query | Impr. | What currently answers it | Should be |
| --- | --- | --- | --- |
| mārketinga aģentūra | 2,031 | a blog post + the Google Ads **course** page | `/` |
| digitālā mārketinga aģentūra | 2,715 | a blog post + `/` | `/` |
| mārketinga pakalpojumi | 1,311 | a blog post + `/pakalpojumi/` | `/pakalpojumi/` |
| digitālā mārketinga pakalpojumi | 1,145 | `/pakalpojumi/` | `/pakalpojumi/` ✓ |
| seo pakalpojumi | 1,025 | a blog post | **no SEO service page exists** |
| reklāmas aģentūra | 1,018 | the **course** page + a blog post | `/pakalpojumi/` |
| google reklāmas aģentūra | 876 | the **course** page + a blog post | `/facebook-reklama/`-style Google page |
| google ads pakalpojumi | 755 | a blog post | a Google Ads service page |
| interneta mārketinga aģentūra | 741 | a blog post | `/` |

A person searching "seo pakalpojumi" lands on an article about what a marketing
agency does. A person searching "reklāmas aģentūra" is shown a course. Neither
is a broken page; both are the wrong answer to the question asked.

## Queries with no page at all — 4,011 impressions

| Query | Impr. | Note |
| --- | --- | --- |
| seo speciālists | 939 | part of the SEO-services gap below |
| **cik maksā reklāma google** | **873** | the Facebook cost post exists; the Google one does not |
| seo optimizācijas pakalpojumi | 362 | |
| digitālā mārketinga speciālists | 355 | |
| kas ir reklāmas aģentūra | 315 | |
| profesionāla reklāmas aģentūra | 314 | |
| mārketinga aģentūras latvijā | 293 | local intent, nothing targets it |
| seo izmaksas | 231 | |
| tiešsaistes mārketinga aģentūra | 169 | |
| reklāmas aģentūras rīgā | 160 | local intent |

Add the sibling cost queries and the Google-price gap is bigger than it looks:
`cik maksā reklāma google` 873 + `reklama google cena` 288 + `google reklama
cena` 263 = **1,424 impressions with no page**, against an existing and
well-performing `/cik-maksa-reklama-facebook/`.

## The SEO gap — corrected, then closed

My first pass on this said no SEO service page existed because SEO had been
dropped in the 4 Sep "niche down". **That was wrong.** The 4 Sep decision
removed *sociālo mediju mārketings*, not SEO. `/pakalpojumi/` carries a full
"SEO pakalpojumi" cell — audits, tehniskais SEO, optimizācija, stratēģija —
and two blog posts already used the anchor text "SEO pakalpojumus". The
service was being sold the whole time.

What was missing was the page. The cell's button went to the contact form,
and `/seo-pakalpojumi/` (the WordPress-era URL) 301'd to the services index.
So nothing on the site could rank for:

| Query | Impressions |
| --- | --- |
| seo pakalpojumi | 1,025 |
| seo speciālists | 939 |
| seo optimizācijas pakalpojumi | 362 |
| seo izmaksas | 231 |
| **total** | **2,557** |

`/seo-pakalpojumi/` now exists as a real service page, the 301 is removed, and
it is in the nav, the footer and the services cell. It has a section on what
drives cost (for `seo izmaksas`) and a FAQ answering whether you need a
specialist at all (for `seo speciālists`). **No prices are invented** — cost
is quoted after a call, exactly like the Meta service page.

## The Google Ads gap — flagged, not closed

This one is the owner's call, so it is written down rather than acted on.

| Query | Impressions | What ranks |
| --- | --- | --- |
| google reklāmas aģentūra | 876 | the Google Ads **course** page |
| google ads pakalpojumi | 755 | a blog post |
| **total** | **1,631** | |

There is no Google Ads *service* page and no Google Ads cell in the services
grid — yet the homepage hero sells "Meta un Google reklāmas" and the site
claims more than 10 million euro of managed budgets. Either the grid is
missing a service the agency actually delivers, or the homepage is promising
one it does not. **That inconsistency has to be resolved before a page is
worth building**, which is why one was not built here.

What was closed instead is the *cost* half of the Google cluster, where
intent is informational and a post is the right answer:

| Query | Impressions |
| --- | --- |
| cik maksā reklāma google | 873 |
| reklama google cena | 288 |
| google reklama cena | 263 |
| **total** | **1,424** |

`/cik-maksa-google-reklama/` mirrors `/cik-maksa-reklama-facebook/`, which is
one of the site's better-performing posts. Same working-backwards budget
arithmetic, no invented Latvian click prices.

## One query deliberately not chased

`reklāmas aģentūras rīgā` (160 impressions) and the local cluster around it.
**SIA "Stonks" is registered at Liepu iela 28, Rēzekne.** Writing "reklāmas
aģentūra Rīgā" onto a page would be a false location claim for 160
impressions. `mārketinga aģentūras latvijā` (293) is fair and the homepage
already says "digitālā mārketinga aģentūra Latvijā" — that one is a ranking
problem, not a targeting gap.

## What owns what, going forward

One page per intent, and nothing else competes for it:

| Intent | Owner | Supporting articles link to it |
| --- | --- | --- |
| agency, hire us | `/` | the two agency posts (already repointed 8 Sep) |
| what we do, service list | `/pakalpojumi/` | posts about choosing an agency |
| Meta / Facebook ads done for you | `/facebook-reklama/` | the Meta cluster |
| Google Ads done for you | **gap — no service page** | the Google cluster |
| SEO done for you | **gap, owner's call** | the SEO cluster |
| learn it yourself | `/digitala-marketinga-kursi/` + course pages | course posts |
| paid advice | `/marketinga-konsultacijas/` | every article closer |
| what things cost | `/cik-maksa-reklama-facebook/` + a Google twin | cost queries |

**Rule that must hold:** a blog post never targets a buyer query. Posts answer
questions; service pages answer "who do I hire". When a post starts ranking for
a commercial term, that is cannibalisation, and it is what kept the homepage
off "digitālā mārketinga aģentūra" until 8 Sep.

## What changed on 8 Sep 2026

| Change | Query it serves | Impressions |
| --- | --- | --- |
| `/seo-pakalpojumi/` built; 301 removed; added to nav, footer, services cell | the SEO services cluster | 2,557 |
| `/cik-maksa-google-reklama/` written | Google cost cluster | 1,424 |
| Two "SEO pakalpojumus" anchors repointed off `/pakalpojumi/` | `seo pakalpojumi` | 1,025 |
| Five posts wired inbound to the new pages (house rule: 2 each) | — | — |
| Meta and Google course titles cut to fit; TikTok description cut | the one cluster that converts | 1,998 |

Both new pages pass `npm run seo` clean, and no new cannibalisation appears.
Course-page title errors are gone: the audit went from 7 errors to 3, and all
three remaining sit on pages that are deliberately `noindex`.

**Not done, and why.** No Google Ads service page (see above — needs the
offering settled first). No page chasing Rīga (wrong city). No SEO prices on
the new page (quoted after a call, like every other service here).
