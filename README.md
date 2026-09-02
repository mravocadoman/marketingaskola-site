# Mārketinga Skola — marketingaskola.lv

Static site for the Mārketinga Skola digital-marketing agency, migrated from
WordPress/Divi (August 2026). Built with [Eleventy](https://www.11ty.dev/),
deployed by GitHub Actions on every push to `main` — to SiteGround (production) once the
`SG_*` secrets exist, to GitHub Pages (noindex preview) until then. See `docs/siteground-cutover.md`.

- 19 pages + 31 blog posts + 6 category archives, all original URLs preserved
- Content: pages in `src/pages/` (HTML), posts in `src/posts/` (Markdown)
- Design: single stylesheet `src/css/style.css`, nav/contacts in `src/_data/site.json`
- Forms: hand-coded, submit to MailerLite · Course checkout: Thinkific · both work on static hosting
- Fonts self-hosted (`src/fonts/`), case-study videos local (`src/video/`), privacy policy at `/privatuma-politika/`

```bash
npm install
npm run build     # -> _site/
npm run serve     # local preview at http://localhost:8385
npm run check     # integrity check (links, thin pages)
npm run derived   # og:image twins, default social image, favicon.ico
npm run check:live  # smoke-test a deployed copy (BASE=https://… to pick which)
```

See `CLAUDE.md` for the full operating guide, deploy/cutover checklist, and
the rules that must not be broken (permalinks, legal notices, payment links).
