# Mārketinga Skola — marketingaskola.lv

Static site for the Mārketinga Skola digital-marketing agency, migrated from
WordPress/Divi (August 2026). Built with [Eleventy](https://www.11ty.dev/),
deployed to GitHub Pages via GitHub Actions on every push to `main`.

- 19 pages + 31 blog posts + 6 category archives, all original URLs preserved
- Content: pages in `src/pages/` (HTML), posts in `src/posts/` (Markdown)
- Design: single stylesheet `src/css/style.css`, nav/contacts in `src/_data/site.json`
- Forms: Tally embeds · Course checkout: Thinkific · both work unchanged on static hosting

```bash
npm install
npm run build     # -> _site/
npm run serve     # local preview at http://localhost:8385
npm run check     # integrity check (links, thin pages)
```

See `CLAUDE.md` for the full operating guide, deploy/cutover checklist, and
the rules that must not be broken (permalinks, legal notices, payment links).
