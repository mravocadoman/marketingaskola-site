# Cutover: WordPress on SiteGround → this static site on SiteGround

> **Status (3 Sep 2026): DONE.** The static site has been live on
> marketingaskola.lv since 11:50 UTC. Steps 1–4 below were carried out from
> this repo over SSH rather than by the first workflow run: the build was
> synced to `public_html_static`, verified, then swapped in by renaming, so
> WordPress was never deleted — it sits untouched next to the live root as
> `www/marketingaskola.lv/public_html_wordpress_2026-09-02` (4 GB) and a
> manual Site Tools backup `wordpress-before-static-2026-09-02` exists too.
> Rollback is two renames. Delete the old folder once you are sure (it
> counts against disk space). The SuperCacher dynamic cache had to be
> flushed after the swap (it kept serving cached WordPress HTML); every
> later deploy goes through the workflow.

Written 2 Sep 2026. The domain already lives at SiteGround, so this is a
file swap on the same account, not a migration between hosts.

## What is already true (checked 2 Sep 2026)

- `marketingaskola.lv` nameservers: `ns1/ns2.siteground.net`; A record
  `35.214.202.68` (SiteGround on Google Cloud). **No DNS change needed.**
- `www.` → apex and `http` → `https` are already 301s at the host level.
- Email is Google Workspace (`MX smtp.google.com`) — untouched by any of this.
- Search Console is verified by a DNS TXT record — survives the swap.
- MailerLite domain verification is a DNS TXT record — survives.
- The old site's own redirect (`/7-padomi-…` → `/marketinga-strategijas-izstrade/`)
  and every other WordPress-era URL are reproduced in `src/.htaccess`.

## How deploys work after this

`.github/workflows/deploy.yml` routes every push to `main`:

- **SiteGround** when the `SG_*` secrets exist: build, `npm run check`,
  `rsync --delete` `_site/` into the web root over SSH, then
  `tools/check-live.mjs` smoke-tests https://marketingaskola.lv (every
  sitemap URL 200 + canonical, no noindex, redirects, 404 page, assets).
- **GitHub Pages** otherwise (the old preview: `/marketingaskola-site/`
  prefix + noindex). `workflow_dispatch` → target `pages` forces a preview
  build any time.

`rsync --delete` is what removes WordPress: after the first run the web root
contains exactly the built site (plus `.well-known/`, kept for Let's Encrypt).

## Step by step

1. **Back up WordPress** (do not skip; `--delete` is destructive by design):
   Site Tools → Security → Backups → Create backup. Also WordPress admin →
   Tools → Export → All content, and download `wp-content/uploads/` via
   File Manager. The repo already holds `archive/wordpress-mirror/` and every
   image, but the backup is the rollback.
2. **Add the deploy key to SiteGround**: Site Tools → Devs → SSH Keys Manager
   → Import. Paste the public key printed at the end of this file's setup
   session (it is `~/.ssh/marketingaskola_deploy.pub` on the Mac). Note the
   **host**, **port (18765)** and **username** the page shows.
3. **Web root path**: Site Tools → Site → File Manager. For the primary
   domain it is `www/marketingaskola.lv/public_html` (relative to the SSH
   home). Confirm — that is `SG_PATH`.
4. **GitHub secrets** (run from the repo folder on the Mac):

       gh secret set SG_HOST --body "<host from step 2>"
       gh secret set SG_PORT --body "18765"
       gh secret set SG_USER --body "<username from step 2>"
       gh secret set SG_PATH --body "www/marketingaskola.lv/public_html"
       gh secret set SG_SSH_KEY < ~/.ssh/marketingaskola_deploy

5. **First deploy**: `gh workflow run deploy.yml -f target=siteground`, then
   `gh run watch`. The workflow ends with the live smoke test; green means
   the swap is done and verified.
6. **Right after**:
   - Site Tools → Speed → Caching → Flush cache (old WordPress HTML may be
     cached by SiteGround's nginx for a while).
   - Site Tools → Security → HTTPS Enforce: on (it already is if www/http
     redirect today). After a few days uncomment the HSTS line in
     `src/.htaccess`.
   - Search Console → Sitemaps → submit `https://marketingaskola.lv/sitemap.xml`.
   - GitHub → repo Settings → Pages → disable (or leave; it is noindex).
   - Cancel WordPress-only subscriptions (Divi, Smash Balloon, any
     redirect/SEO plugin licences) once you are sure.
7. **Later**: keep the SiteGround backup at least 30 days, then delete the
   WordPress database (Site Tools → Site → MySQL) — the static site uses none.

## Rollback

Site Tools → Security → Backups → Restore the backup from step 1 (files +
database). Pushing to `main` would deploy the static site again, so pause
by removing the `SG_HOST` secret if you need WordPress back for longer.

## What stops working on purpose

`/wp-admin`, `/wp-login.php`, `/wp-json`, `xmlrpc.php` → 410 Gone.
WordPress search and comments are gone (they were already dropped). `/feed/`
→ `/feed.xml`. The Instagram feed is the static CTA it has been since the
redesign. Forms post to MailerLite, courses to Thinkific — unchanged.
