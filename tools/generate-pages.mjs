// Converts the extracted WordPress outlines into the committed 11ty source:
//   src/pages/<slug>.html  (front matter + clean section markup, njk-processed)
//   src/posts/<slug>.md    (front matter + markdown body)
//   src/_data/categories.json, src/_data/categoriesBySlug.json
// and downloads every referenced image into src/img/YYYY/MM/<sanitized-name>.
// Usage: node tools/generate-pages.mjs <extract-dir>
// One-shot code generation: the OUTPUT files are the source of truth afterwards.

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';

const extractDir = process.argv[2];
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const md = new MarkdownIt({ html: true, linkify: false });

const DOMAIN = 'https://marketingaskola.lv';
const DARK = new Set(['#00152c', '#00142c', '#00152b']);

// ---------- image mapping ----------
const imgMap = new Map(); // remote url -> local web path
const downloads = [];     // {url, file}

function sanitize(name) {
  return name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function localImage(url) {
  if (!url) return url;
  url = url.split('?')[0].replace(/^http:/, 'https:');
  if (!url.startsWith(DOMAIN + '/wp-content/')) return url;
  if (/instagram-feed|sb-instagram/.test(url)) return null; // IG plugin junk
  if (imgMap.has(url)) return imgMap.get(url);
  const m = url.match(/wp-content\/uploads\/(\d{4})\/(\d{2})\/(.+)$/);
  const web = m ? `/img/${m[1]}/${m[2]}/${sanitize(decodeURIComponent(m[3]))}`
               : `/img/${sanitize(decodeURIComponent(basename(url)))}`;
  imgMap.set(url, web);
  downloads.push({ url, file: join(ROOT, 'src', web.replace(/\//g, '\\').replace(/^\\/, '')) });
  return web;
}

// Links that were already broken or redirected on the live WordPress site.
const REDIRECTS = {
  '/meta-reklamas-kursi/': '/meta-reklamas-kurss/',                                // renamed page (404 live)
  '/7-padomi-marketinga-strategijas-izstrade/': '/marketinga-strategijas-izstrade/', // 301 live
};

function rewriteUrl(href) {
  if (!href) return href;
  if (href.includes('/wp-content/')) return localImage(href) ?? href;
  if (href === DOMAIN || href === DOMAIN + '/') return '/';
  if (href.startsWith(DOMAIN + '/')) {
    let p = href.slice(DOMAIN.length);
    if (!p.endsWith('/') && !p.includes('#') && !p.includes('?') && !/\.[a-z]{2,4}$/.test(p)) p += '/';
    return REDIRECTS[p] || p;
  }
  return href;
}

function rewriteMd(text) {
  if (!text) return text;
  return text
    .replace(/!\[([^\]]*)\]\((data:[^)]+)\)/g, '') // lazy placeholders
    .replace(/\((https?:\/\/marketingaskola\.lv[^)\s]*)\)/g, (_, u) => `(${rewriteUrl(u)})`)
    .replace(/"(https?:\/\/marketingaskola\.lv[^"]*)"/g, (_, u) => `"${rewriteUrl(u)}"`)
    .replace(/\n{3,}/g, '\n\n');
}

const esc = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mdRender = (s) => md.render(rewriteMd(s) || '').trim();

// ---------- module renderers ----------
function renderModule(m, ctx) {
  const html = renderModuleInner(m, ctx);
  if (m.id && html) return `<div id="${esc(m.id)}">${html}</div>`;
  return html;
}

function renderModuleInner(m, ctx) {
  switch (m.type) {
    case 'text': {
      let html = mdRender(m.md);
      if (ctx.hero) {
        // Divi hero pattern: eyebrow h2 before the h1, caps subtitle after it
        if (/^<h2>[^<]{2,60}<\/h2>$/.test(html) && !ctx.seenH1) return html.replace(/^<h2>(.*)<\/h2>$/, '<p class="eyebrow">$1</p>');
        if (/^<h1>/.test(html)) { ctx.seenH1 = true; return html; }
        if (/^<p>[^<]+<\/p>$/.test(html) && ctx.seenH1) return html.replace(/^<p>(.*)<\/p>$/, '<p class="sub">$1</p>');
      }
      return html;
    }
    case 'divider': return '<div class="divider"></div>';
    case 'button': return `<p class="btn-wrap"><a class="btn" href="${esc(rewriteUrl(m.href))}">${esc(m.text)}</a></p>`;
    case 'image': {
      const src = localImage(m.src);
      if (!src) return '';
      const img = `<img src="${esc(src)}" alt="${esc(m.alt)}" loading="lazy">`;
      const plain = ctx.logoRow ? ' img--plain' : '';
      return m.href ? `<figure class="img${plain}"><a href="${esc(rewriteUrl(m.href))}">${img}</a></figure>` : `<figure class="img${plain}">${img}</figure>`;
    }
    case 'blurb': {
      const img = m.img ? `<img src="${esc(localImage(m.img))}" alt="" loading="lazy">` : '';
      return `<div class="blurb">${img}<h3>${esc(m.title)}</h3>${mdRender(m.md)}</div>`;
    }
    case 'testimonial':
      return `<blockquote class="testimonial"><div class="t-body">${mdRender(m.md)}</div><footer><strong>${esc(m.author)}</strong><span>${esc(m.metaInfo)}</span></footer></blockquote>`;
    case 'toggle':
    case 'accordion':
      return (m.items || []).map(t => `<details class="faq"><summary>${esc(t.title)}</summary><div>${mdRender(t.md)}</div></details>`).join('\n');
    case 'cta': {
      const btn = m.button ? `<p class="btn-wrap"><a class="btn" href="${esc(rewriteUrl(m.href))}">${esc(m.button)}</a></p>` : '';
      return `<div class="cta"><h2>${esc(m.title)}</h2>${mdRender(m.md)}${btn}</div>`;
    }
    case 'video': {
      if (!m.src) return '';
      return `<div class="video-embed"><iframe src="${esc(m.src)}" loading="lazy" allowfullscreen title="Video"></iframe></div>`;
    }
    case 'number_counter':
    case 'counters':
      return `<div class="counter center"><span class="num">${esc(m.number)}</span><span>${esc(m.title)}</span></div>`;
    case 'slider':
    case 'fullwidth_header': {
      const btn = m.button ? `<p class="btn-wrap"><a class="btn" href="${esc(rewriteUrl(m.href))}">${esc(m.button)}</a></p>` : '';
      return `${m.title ? `<h2>${esc(m.title)}</h2>` : ''}${mdRender(m.md)}${btn}`;
    }
    case 'gallery':
      return `<div class="row cols-3">${(m.imgs || []).map(u => { const s = localImage(u); return s ? `<figure class="img"><img src="${esc(s)}" alt="" loading="lazy"></figure>` : ''; }).join('')}</div>`;
    case 'contact_form_container':
      return `<div class="cta"><h2>Sazinies ar mums</h2><p><a href="mailto:rihards@marketingaskola.lv">rihards@marketingaskola.lv</a> · +371 26673384 (WhatsApp)</p><p class="btn-wrap"><a class="btn" href="/sazinies/">Piesakies konsultācijai!</a></p></div>`;
    case 'code': {
      const raw = m.md || '';
      if (/sb_instagram|sbi_|instagram-feed/.test(raw)) return ctx.igCta ? '' : (ctx.igCta = true, `<div class="cta"><h2>Seko mums Instagram!</h2><p>Ikdienas padomi un ieskati digitālajā mārketingā — @marketingaskola.lv</p><p class="btn-wrap"><a class="btn" href="https://www.instagram.com/marketingaskola.lv/" target="_blank" rel="noopener">Pieseko Instagram!</a></p></div>`);
      const iframeM = raw.match(/<iframe[^>]*>/i);
      if (iframeM) {
        const tag = iframeM[0];
        const src = tag.match(/(?:data-src|src)="([^"]+)"/)?.[1]?.replace(/&amp;/g, '&');
        if (!src) return '';
        if (src.includes('tally.so')) {
          if (ctx.tallyDone) return '';
          ctx.tallyDone = true;
          return `<div class="form-embed"><iframe src="${esc(src)}" loading="lazy" width="100%" height="600" frameborder="0" title="Kontaktforma"></iframe></div>`;
        }
        return `<div class="video-embed"><iframe src="${esc(src)}" loading="lazy" allowfullscreen title="Video"></iframe></div>`;
      }
      return mdRender(raw);
    }
    default: {
      // 'unknown' and dipi_* fallbacks: keep the text so no copy is lost
      const parts = [];
      if (m.title) parts.push(`<h3>${esc(m.title)}</h3>`);
      if (m.md) parts.push(mdRender(m.md));
      return parts.join('\n');
    }
  }
}

function renderSection(sec, ctx) {
  const style = sec.style || {};
  const isHero = !!style.bgImage;
  const isDark = !isHero && DARK.has((style.bg || '').toLowerCase());
  ctx.hero = isHero; ctx.seenH1 = false;
  const cls = ['sec']; let attr = '';
  if (isHero) {
    cls.push('sec--hero');
    const bg = localImage(style.bgImage);
    if (bg) attr = ` style="--bg:url('${bg}')"`;
  } else if (isDark) cls.push('sec--dark');

  const rows = (sec.rows || []).map(row => {
    const cols = row.cols || [];
    const n = Math.min(cols.length, 6);
    ctx.logoRow = n >= 4 && cols.every(c => c.length === 1 && c[0].type === 'image');
    const isHeadingRow = cols.length === 1 && cols[0].every(m => ['text', 'divider'].includes(m.type)) && cols[0].some(m => /^#{1,3} /.test(m.md || ''));
    const colHtml = cols.map(col => `      <div class="col${isHeadingRow ? ' center' : ''}">\n${col.map(m => renderModule(m, ctx)).filter(Boolean).map(h => '        ' + h.split('\n').join('\n        ')).join('\n')}\n      </div>`).join('\n');
    return `    <div class="row cols-${n}${ctx.logoRow ? ' logo-row' : ''}">\n${colHtml}\n    </div>`;
  }).filter(r => r.includes('<')).join('\n');

  if (!rows.trim()) return '';
  return `<section class="${cls.join(' ')}"${attr}>\n  <div class="container">\n${rows}\n  </div>\n</section>`;
}

// ---------- pages ----------
const catData = JSON.parse(readFileSync(join(extractDir, 'categories.json'), 'utf8'));
mkdirSync(join(ROOT, 'src', 'pages'), { recursive: true });
mkdirSync(join(ROOT, 'src', 'posts'), { recursive: true });
mkdirSync(join(ROOT, 'src', '_data'), { recursive: true });

const onlySlug = process.argv[3]; // optional: regenerate a single page/post
for (const f of readdirSync(join(extractDir, 'pages'))) {
  if (onlySlug && f !== onlySlug + '.json') continue;
  const page = JSON.parse(readFileSync(join(extractDir, 'pages', f), 'utf8'));
  const slug = page.slug;
  const permalink = slug === 'index' ? '/' : `/${slug}/`;
  const ctx = {};
  let body = page.sections.map(s => renderSection(s, ctx)).filter(Boolean).join('\n\n');

  const fm = [
    '---',
    `layout: page.njk`,
    `title: ${JSON.stringify(page.title || '')}`,
    `description: ${JSON.stringify(page.metaDesc || '')}`,
    `permalink: ${JSON.stringify(permalink)}`,
    ...(page.ogImage && localImage(page.ogImage) ? [`image: ${JSON.stringify(localImage(page.ogImage))}`] : []),
    '---',
  ].join('\n');
  writeFileSync(join(ROOT, 'src', 'pages', slug + '.html'), fm + '\n' + body + '\n');
}

// ---------- posts ----------
const postCats = {}; // slug -> [catSlug]
for (const c of catData) for (const p of c.posts) (postCats[p] ||= []).push(c.slug);

for (const f of readdirSync(join(extractDir, 'posts'))) {
  if (onlySlug && f !== onlySlug + '.md') continue;
  const raw = readFileSync(join(extractDir, 'posts', f), 'utf8');
  const metaM = raw.match(/<!--META\n([\s\S]*?)\nMETA-->/);
  const meta = JSON.parse(metaM[1]);
  const body = rewriteMd(raw.slice(metaM[0].length).trim());
  const slug = meta.slug;
  const image = meta.ogImage ? localImage(meta.ogImage) : null;
  const fm = [
    '---',
    `layout: post.njk`,
    `title: ${JSON.stringify(meta.h1 || meta.title)}`,
    `seoTitle: ${JSON.stringify(meta.title || '')}`,
    `description: ${JSON.stringify(meta.metaDesc || '')}`,
    `date: ${meta.published?.slice(0, 10) || '2025-01-01'}`,
    ...(meta.modified ? [`updated: ${meta.modified.slice(0, 10)}`] : []),
    ...(image ? [`image: ${JSON.stringify(image)}`] : []),
    `categories: ${JSON.stringify(postCats[slug] || [])}`,
    `permalink: ${JSON.stringify(`/${slug}/`)}`,
    '---',
  ].join('\n');
  writeFileSync(join(ROOT, 'src', 'posts', slug + '.md'), fm + '\n\n' + body + '\n');
}

// ---------- data ----------
// Named categoryList (not "categories") to avoid colliding with per-post front matter
// under Eleventy's deep data merge.
writeFileSync(join(ROOT, 'src', '_data', 'categoryList.json'), JSON.stringify(catData, null, 2));
writeFileSync(join(ROOT, 'src', '_data', 'categoriesBySlug.json'),
  JSON.stringify(Object.fromEntries(catData.map(c => [c.slug, c.name])), null, 2));

// ---------- fixed assets ----------
downloads.push(
  { url: 'https://marketingaskola.lv/wp-content/uploads/2025/07/MS-Logos-Horizontal-1.png', file: join(ROOT, 'src', 'img', 'logo.png') },
  { url: 'https://marketingaskola.lv/wp-content/uploads/2025/07/cropped-MS-Logos-1-32x32.png', file: join(ROOT, 'src', 'img', 'favicon-32.png') },
  { url: 'https://marketingaskola.lv/wp-content/uploads/2025/07/cropped-MS-Logos-1-192x192.png', file: join(ROOT, 'src', 'img', 'favicon-192.png') },
);

// ---------- downloads ----------
let ok = 0, fail = [];
const queue = [...new Map(downloads.map(d => [d.url, d])).values()];
async function worker() {
  while (queue.length) {
    const { url, file } = queue.shift();
    if (existsSync(file)) { ok++; continue; }
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      ok++;
    } catch (e) { fail.push(url + ' -> ' + e.message); }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
console.log(`pages+posts generated. images ok: ${ok}, failed: ${fail.length}`);
fail.forEach(f => console.log('  FAIL', f));
