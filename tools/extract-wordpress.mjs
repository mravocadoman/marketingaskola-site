// Extracts structured content from the mirrored WordPress/Divi HTML.
// Usage: node tools/extract-wordpress.mjs <mirror-dir> <out-dir>
// Pages  -> <out>/pages/<slug>.json   (section/module outline, copy preserved verbatim)
// Posts  -> <out>/posts/<slug>.md     (front matter + markdown body)
// Also   -> <out>/images.json         (every wp-content image URL seen, with where it's used)

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parse } from 'node-html-parser';
import TurndownService from 'turndown';

const [mirrorDir, outDir] = process.argv.slice(2);
mkdirSync(join(outDir, 'pages'), { recursive: true });
mkdirSync(join(outDir, 'posts'), { recursive: true });

const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced' });
td.keep(['iframe']);
// Headings that carry an id (in-article TOC anchors) must keep it -> emit raw HTML heading
td.addRule('headingWithId', {
  filter: (node) => /^H[1-6]$/.test(node.nodeName) && node.getAttribute('id'),
  replacement: (content, node) => `\n\n<${node.nodeName.toLowerCase()} id="${node.getAttribute('id')}">${content.trim()}</${node.nodeName.toLowerCase()}>\n\n`,
});
// Lazy-load placeholders: drop data: URI images entirely
td.addRule('dropDataImgs', {
  filter: (node) => node.nodeName === 'IMG' && (node.getAttribute('src') || '').startsWith('data:'),
  replacement: () => '',
});

const images = {}; // url -> [slugs]
const categories = [];
const noteImg = (url, slug) => {
  if (!url || !url.includes('wp-content')) return;
  url = url.split('?')[0];
  (images[url] ||= []).push(slug);
};

const meta = (root, sel, attr = 'content') => root.querySelector(sel)?.getAttribute(attr) ?? null;
const txt = (el) => el ? el.text.replace(/\s+/g, ' ').trim() : null;

// Pull class->style map from inline <style> blocks (Divi writes .et_pb_section_3 { background-color:#00152c } etc.)
function styleMap(root) {
  const map = {};
  for (const st of root.querySelectorAll('style')) {
    const css = st.text;
    for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selectors = m[1].split(',').map(s => s.trim());
      const body = m[2];
      const bg = body.match(/background-color\s*:\s*([^;!]+)/)?.[1]?.trim();
      const bgi = body.match(/background(?:-image)?\s*:[^;{}]*url\(([^)]+)\)/)?.[1]?.replace(/['"]/g, '');
      const grad = body.match(/background-image\s*:\s*(linear-gradient\([^)]*(?:\([^)]*\)[^)]*)*\))/)?.[1];
      const col = body.match(/(?:^|;)\s*color\s*:\s*([^;!]+)/)?.[1]?.trim();
      if (!bg && !bgi && !col && !grad) continue;
      for (const sel of selectors) {
        const cls = sel.match(/\.(et_pb_(?:section|row|column|text|blurb|button|cta|toggle|testimonial|module)_\d+)\b/)?.[1];
        if (!cls) continue;
        map[cls] ||= {};
        if (bg) map[cls].bg = bg;
        if (bgi) map[cls].bgImage = bgi;
        if (grad) map[cls].gradient = grad;
        if (col) map[cls].color = col;
      }
    }
  }
  return map;
}

const numberedClass = (el, kind) => (el.getAttribute('class') || '').split(/\s+/).find(c => new RegExp(`^et_pb_${kind}_\\d+$`).test(c));

function extractModule(mod, slug, styles) {
  const cls = mod.getAttribute('class') || '';
  const inline = mod.getAttribute('style') || '';
  const type = (cls.match(/et_pb_(text|image|button_module_wrapper|blurb|toggle|accordion|testimonial|number_counter|counters|contact_form_container|video|cta|pricing_tables|gallery|slider|fullwidth_header|post_slider|shop|code|divider|social_media_follow|icon|dipi_[a-z_]+)/) || [])[1] || 'unknown';
  const styleInfo = {};
  for (const c of (cls.split(/\s+/))) if (styles[c]) Object.assign(styleInfo, styles[c]);
  const bgInline = inline.match(/background-color\s*:\s*([^;]+)/)?.[1];
  if (bgInline) styleInfo.bg = bgInline.trim();

  const out = { type, ...((Object.keys(styleInfo).length) ? { style: styleInfo } : {}) };
  const modId = mod.getAttribute('id');
  if (modId) out.id = modId;

  switch (type) {
    case 'text':
    case 'code': {
      const inner = mod.querySelector('.et_pb_text_inner') || mod;
      out.md = td.turndown(inner.innerHTML).trim();
      for (const img of inner.querySelectorAll('img')) noteImg(img.getAttribute('src'), slug);
      break;
    }
    case 'image': {
      const img = mod.querySelector('img');
      if (img) { out.src = img.getAttribute('src'); out.alt = img.getAttribute('alt') || ''; noteImg(out.src, slug); }
      const a = mod.querySelector('a');
      if (a) out.href = a.getAttribute('href');
      break;
    }
    case 'button_module_wrapper': {
      const a = mod.querySelector('a.et_pb_button');
      if (a) { out.type = 'button'; out.text = txt(a); out.href = a.getAttribute('href'); }
      break;
    }
    case 'blurb': {
      out.title = txt(mod.querySelector('.et_pb_module_header'));
      const body = mod.querySelector('.et_pb_blurb_description');
      out.md = body ? td.turndown(body.innerHTML).trim() : null;
      const img = mod.querySelector('.et_pb_main_blurb_image img');
      if (img) { out.img = img.getAttribute('src'); noteImg(out.img, slug); }
      const icon = mod.querySelector('.et-pb-icon');
      if (icon) out.icon = txt(icon);
      break;
    }
    case 'toggle':
    case 'accordion': {
      out.items = mod.querySelectorAll('.et_pb_toggle').map(t => ({
        title: txt(t.querySelector('.et_pb_toggle_title')),
        md: td.turndown(t.querySelector('.et_pb_toggle_content')?.innerHTML || '').trim(),
      }));
      if (!out.items.length) out.items = [{ title: txt(mod.querySelector('.et_pb_toggle_title')), md: td.turndown(mod.querySelector('.et_pb_toggle_content')?.innerHTML || '').trim() }];
      break;
    }
    case 'testimonial': {
      out.author = txt(mod.querySelector('.et_pb_testimonial_author'));
      out.metaInfo = txt(mod.querySelector('.et_pb_testimonial_meta'));
      out.md = td.turndown(mod.querySelector('.et_pb_testimonial_description_inner')?.innerHTML || mod.querySelector('.et_pb_testimonial_content')?.innerHTML || '').trim();
      const img = mod.querySelector('.et_pb_testimonial_portrait');
      const bg = img?.getAttribute('style')?.match(/url\(([^)]+)\)/)?.[1]?.replace(/['"]/g, '');
      if (bg) { out.portrait = bg; noteImg(bg, slug); }
      break;
    }
    case 'number_counter':
    case 'counters': {
      out.number = mod.getAttribute('data-number-value') || txt(mod.querySelector('.percent-value'));
      out.title = txt(mod.querySelector('.title'));
      break;
    }
    case 'contact_form_container': {
      out.fields = mod.querySelectorAll('input,textarea').map(i => i.getAttribute('placeholder') || i.getAttribute('name')).filter(Boolean);
      break;
    }
    case 'video': {
      const iframe = mod.querySelector('iframe');
      const video = mod.querySelector('video source');
      out.src = iframe?.getAttribute('src') || iframe?.getAttribute('data-src') || video?.getAttribute('src') || null;
      break;
    }
    case 'cta': {
      out.title = txt(mod.querySelector('h2, .et_pb_module_header'));
      const body = mod.querySelector('.et_pb_promo_description div');
      out.md = body ? td.turndown(body.innerHTML).trim() : null;
      const a = mod.querySelector('a.et_pb_button');
      if (a) { out.button = txt(a); out.href = a.getAttribute('href'); }
      break;
    }
    case 'slider':
    case 'fullwidth_header': {
      out.title = txt(mod.querySelector('.et_pb_slide_title, .et_pb_module_header'));
      const body = mod.querySelector('.et_pb_slide_content, .et_pb_header_content');
      out.md = body ? td.turndown(body.innerHTML).trim() : null;
      const a = mod.querySelector('a.et_pb_button, a.et_pb_more_button');
      if (a) { out.button = txt(a); out.href = a.getAttribute('href'); }
      break;
    }
    case 'gallery': {
      out.imgs = mod.querySelectorAll('img').map(i => i.getAttribute('src'));
      out.imgs.forEach(u => noteImg(u, slug));
      break;
    }
    default: {
      // dipi_* (divi-pixel) and unknowns: capture text + imgs so nothing is lost
      out.title = txt(mod.querySelector('h1,h2,h3,h4,.et_pb_module_header')) || undefined;
      const raw = mod.innerHTML || '';
      out.md = td.turndown(raw).trim().slice(0, 3000) || undefined;
      for (const img of mod.querySelectorAll('img')) { noteImg(img.getAttribute('src'), slug); }
    }
  }
  if (out.md === '') delete out.md;
  return out;
}

for (const f of readdirSync(mirrorDir).filter(f => f.endsWith('.html'))) {
  const slug = basename(f, '.html');
  const html = readFileSync(join(mirrorDir, f), 'utf8');
  const root = parse(html);
  const bodyClass = root.querySelector('body')?.getAttribute('class') || '';
  const common = {
    slug,
    url: meta(root, 'link[rel="canonical"]', 'href'),
    title: root.querySelector('title')?.text ?? null,
    metaDesc: meta(root, 'meta[name="description"]'),
    ogImage: meta(root, 'meta[property="og:image"]'),
  };

  if (/\bsingle-post\b/.test(bodyClass)) {
    // Blog post: Divi Theme Builder renders the article body inside a .et_pb_post_content module
    const content = root.querySelector('.et_pb_post_content') || root.querySelector('.entry-content') || root.querySelector('#main-content article');
    const h1 = txt(root.querySelector('h1.entry-title') || root.querySelector('h1'))
      || meta(root, 'meta[property="og:title"]')?.replace(/ - Mārketinga Skola$/, '')
      || common.title?.replace(/ - Mārketinga Skola$/, '');
    const published = meta(root, 'meta[property="article:published_time"]');
    const modified = meta(root, 'meta[property="article:modified_time"]');
    // Category via Yoast JSON-LD articleSection
    let catLinks = [];
    const ld = root.querySelector('script.yoast-schema-graph')?.text;
    if (ld) { try { const g = JSON.parse(ld)['@graph'] || []; const art = g.find(n => (n['@type'] === 'Article' || (Array.isArray(n['@type']) && n['@type'].includes('Article')))); if (art?.articleSection) catLinks = [].concat(art.articleSection).map(name => ({ name })); } catch {} }
    if (!catLinks.length) catLinks = root.querySelectorAll('a[rel="category tag"], a[rel="tag"]').map(a => ({ name: txt(a), href: a.getAttribute('href') }));
    // strip junk: sharing buttons, nav, comments, related
    for (const sel of ['.et_social_inline', '.sharedaddy', '.post-meta', 'script', 'style', '.wp-block-comments', '#comment-wrap', '.nav-single', '.dipi_', 'form']) {
      content?.querySelectorAll(sel).forEach(n => n.remove());
    }
    for (const img of content?.querySelectorAll('img') || []) noteImg(img.getAttribute('src'), slug);
    const md = content ? td.turndown(content.innerHTML).trim() : '';
    const fm = { ...common, h1, published, modified, categories: catLinks };
    writeFileSync(join(outDir, 'posts', slug + '.md'), '<!--META\n' + JSON.stringify(fm, null, 2) + '\nMETA-->\n\n' + md + '\n');
    continue;
  }

  if (/\bcategory\b/.test(bodyClass) || slug.startsWith('category_')) {
    // capture which posts belong to this category (for the rebuilt archive pages)
    const catName = txt(root.querySelector('h1'))?.replace(/\s*Raksti\s*$/, '') || slug.replace('category_', '');
    const postSlugs = [...new Set(root.querySelectorAll('a.entry-featured-image-url').map(a => (a.getAttribute('href') || '').replace('https://marketingaskola.lv/', '').replace(/\/$/, '')))];
    categories.push({ slug: slug.replace('category_', ''), name: catName, posts: postSlugs });
    continue;
  }

  // Divi builder page
  const styles = styleMap(root);
  let sectionNodes = root.querySelectorAll('#main-content .et_pb_section, #et-boc .et_pb_section');
  if (!sectionNodes.length) {
    // Some pages break node-html-parser's tree upstream; re-parse just the builder fragment.
    const start = html.indexOf('<div class="et_pb_section');
    const end = html.lastIndexOf('</article>');
    if (start !== -1 && end > start) {
      const fragment = parse(html.slice(start, end));
      sectionNodes = fragment.querySelectorAll('.et_pb_section').filter(s => !s.closest('.et_pb_section .et_pb_section'));
      // keep only top-level sections
      sectionNodes = fragment.querySelectorAll(':scope > .et_pb_section').length ? fragment.querySelectorAll(':scope > .et_pb_section') : sectionNodes;
    }
  }
  const sections = sectionNodes.map(sec => {
    const secOut = { style: {} };
    for (const c of (sec.getAttribute('class') || '').split(/\s+/)) if (styles[c]) Object.assign(secOut.style, styles[c]);
    const inline = sec.getAttribute('style') || '';
    const bgInline = inline.match(/background-color\s*:\s*([^;]+)/)?.[1];
    if (bgInline) secOut.style.bg = bgInline.trim();
    const bgImgInline = inline.match(/background-image\s*:\s*url\(([^)]+)\)/)?.[1]?.replace(/['"]/g, '');
    if (bgImgInline) { secOut.style.bgImage = bgImgInline; noteImg(bgImgInline, slug); }
    if (secOut.style.bgImage) noteImg(secOut.style.bgImage, slug);
    // Collect LEAF columns (handles regular rows AND specialty sections with
    // et_pb_row_inner/et_pb_column_inner), grouped by their parent row element.
    const leafCols = sec.querySelectorAll('.et_pb_column').filter(c => !c.querySelector('.et_pb_column'));
    const rowsOut = [];
    let curParent = null;
    for (const col of leafCols) {
      if (col.parentNode !== curParent) { rowsOut.push({ cols: [] }); curParent = col.parentNode; }
      rowsOut[rowsOut.length - 1].cols.push(
        col.querySelectorAll(':scope > .et_pb_module, :scope > .et_pb_button_module_wrapper, :scope > div[class*="et_pb_"]')
          .filter(m => !/et_pb_(row|column)/.test(m.getAttribute('class') || ''))
          .map(m => extractModule(m, slug, styles))
      );
    }
    secOut.rows = rowsOut;
    if (!Object.keys(secOut.style).length) delete secOut.style;
    return secOut;
  });
  writeFileSync(join(outDir, 'pages', slug + '.json'), JSON.stringify({ ...common, sections }, null, 2));
}

writeFileSync(join(outDir, 'images.json'), JSON.stringify(images, null, 2));
writeFileSync(join(outDir, 'categories.json'), JSON.stringify(categories, null, 2));
console.log('done. images:', Object.keys(images).length, 'categories:', categories.length);
