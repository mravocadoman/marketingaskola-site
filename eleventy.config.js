const { HtmlBasePlugin } = require("@11ty/eleventy");
const { feedPlugin } = require("@11ty/eleventy-plugin-rss");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SRC = path.join(__dirname, "src");
// "/img/a/b.webp" -> absolute path inside src/
const onDisk = (p) => path.join(SRC, ...String(p).split("/").filter(Boolean));
const cleanPath = (u) => {
  const bare = String(u).split(/[?#]/)[0];
  try { return decodeURIComponent(bare); } catch (_) { return bare; }
};

module.exports = function (eleventyConfig) {
  // ---- image path filters --------------------------------------------------
  // Swap a /img/....png|jpg path for its .webp twin when one exists on disk.
  // Used for <img> display; og:image goes through `ogImage` below.
  const webpCache = {};
  eleventyConfig.addFilter("webp", (p) => {
    if (!p || !/\.(png|jpe?g)$/i.test(p)) return p;
    if (webpCache[p] !== undefined) return webpCache[p];
    const w = p.replace(/\.(png|jpe?g)$/i, ".webp");
    webpCache[p] = fs.existsSync(onDisk(w)) ? w : p;
    return webpCache[p];
  });

  // og:image: prefer the `<name>-og.jpg` twin (1200x630, made by
  // tools/derived-images.mjs). Link previews on WhatsApp/LinkedIn and some
  // Facebook scrapers still mishandle WebP, and the generated covers are
  // WebP-only, so every page needs a JPEG to hand out.
  const ogCache = {};
  eleventyConfig.addFilter("ogImage", (p) => {
    if (!p) return p;
    if (ogCache[p] !== undefined) return ogCache[p];
    const twin = p.replace(/\.(webp|png|jpe?g)$/i, "-og.jpg");
    ogCache[p] = twin !== p && fs.existsSync(onDisk(twin)) ? twin : p;
    return ogCache[p];
  });

  // "Kas ir SEO? | Mārketinga Skola" -> "Kas ir SEO?" (WhatsApp prefill, crumbs)
  eleventyConfig.addFilter("bareTitle", (t) => String(t || "").replace(/\s*[-|–—]\s*Mārketinga Skola\s*$/i, "").trim());

  // In-article infographic: generated text-free artwork (tools/generate-images.mjs,
  // style "paper") plus an HTML legend carrying the Latvian labels. Renders
  // nothing until the image exists, so a missing generation never breaks the
  // build. Alt text comes from the imagery manifest, the single source.
  const imagery = JSON.parse(fs.readFileSync(path.join(SRC, "_data", "imagery.json"), "utf8")).slots;
  eleventyConfig.addShortcode("infographic", (o) => {
    const file = onDisk(`/img/gen/${o.id}.webp`);
    if (!fs.existsSync(file)) return "";
    const slot = imagery.find((s) => s.id === o.id) || {};
    const esc = (t) => String(t || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    const items = (o.items || []).map((it) => `<li><strong>${esc(it.label)}</strong>${it.text ? ` <span>${esc(it.text)}</span>` : ""}</li>`).join("");
    return `<figure class="infographic">
  <img src="/img/gen/${o.id}.webp" alt="${esc(slot.alt)}" loading="lazy">
  <figcaption>${o.title ? `<p class="infographic-title">${esc(o.title)}</p>` : ""}<ol class="infographic-list">${items}</ol></figcaption>
</figure>`;
  });

  // JSON-LD: JSON with `<` escaped so it can never close the <script>.
  eleventyConfig.addFilter("jsonld", (obj) => JSON.stringify(obj).replace(/</g, "\\u003c"));

  // schema.org graph for the <head>: Organization + WebSite + WebPage +
  // BreadcrumbList on every page, BlogPosting on articles, Course on course
  // pages (from the `course:` front matter). Every value comes from
  // src/_data/site.json or the page's own front matter - nothing invented.
  eleventyConfig.addFilter("schemaGraph", (c) => {
    const site = c.site;
    const base = site.url;
    const abs = (u) => (u && /^https?:/.test(u) ? u : base + (u || ""));
    const iso = (d) => (d ? new Date(d).toISOString().slice(0, 10) : undefined);
    const orgId = base + "/#organization";
    const siteId = base + "/#website";
    const pageUrl = abs(c.url);
    const isPost = c.layout === "post.njk";
    const bare = (t) => String(t || "").replace(/\s*[-|–—]\s*Mārketinga Skola\s*$/i, "").trim();

    const org = {
      "@type": ["Organization", "ProfessionalService"],
      "@id": orgId,
      name: site.name,
      legalName: site.company.legalName,
      url: base + "/",
      logo: { "@type": "ImageObject", url: abs("/img/logo.png") },
      image: abs(site.image),
      email: site.email,
      telephone: site.phoneIntl,
      vatID: site.company.vat,
      address: {
        "@type": "PostalAddress",
        streetAddress: site.company.street,
        addressLocality: site.company.city,
        addressCountry: "LV",
      },
      areaServed: "LV",
      sameAs: [site.facebook, site.instagram, site.linkedin],
      founder: { "@type": "Person", name: "Rihards Zeiļa", sameAs: site.linkedin },
    };
    const website = {
      "@type": "WebSite",
      "@id": siteId,
      url: base + "/",
      name: site.name,
      inLanguage: "lv",
      publisher: { "@id": orgId },
    };
    const webpage = {
      "@type": "WebPage",
      "@id": pageUrl,
      url: pageUrl,
      name: c.title,
      description: c.description,
      inLanguage: "lv",
      isPartOf: { "@id": siteId },
      primaryImageOfPage: abs(c.image),
    };
    if (isPost) {
      webpage.datePublished = iso(c.date);
      webpage.dateModified = iso(c.updated || c.date);
    }

    const crumbs = [{ name: "Sākums", url: base + "/" }];
    if (isPost) {
      crumbs.push({ name: "Blogs", url: base + "/blogs/" });
      const cat = (c.categories || [])[0];
      if (cat) crumbs.push({ name: (c.categoriesBySlug || {})[cat] || cat, url: base + "/category/" + cat + "/" });
    } else if (c.cat) {
      crumbs.push({ name: "Blogs", url: base + "/blogs/" });
    } else if (c.crumb) {
      crumbs.push({ name: c.crumb.label, url: abs(c.crumb.url) });
    }
    if (c.url !== "/") crumbs.push({ name: c.cat ? c.cat.name : (c.heroTitle || bare(c.title)), url: pageUrl });
    const graph = [org, website, webpage];
    if (crumbs.length > 1) {
      const breadcrumb = {
        "@type": "BreadcrumbList",
        "@id": pageUrl + "#breadcrumb",
        itemListElement: crumbs.map((cr, i) => ({ "@type": "ListItem", position: i + 1, name: cr.name, item: cr.url })),
      };
      webpage.breadcrumb = { "@id": breadcrumb["@id"] };
      graph.push(breadcrumb);
    }

    if (isPost) {
      graph.push({
        "@type": "BlogPosting",
        "@id": pageUrl + "#article",
        headline: c.title,
        description: c.description,
        image: [abs(c.image)],
        datePublished: iso(c.date),
        dateModified: iso(c.updated || c.date),
        author: { "@id": orgId },
        publisher: { "@id": orgId },
        mainEntityOfPage: { "@id": pageUrl },
        inLanguage: "lv",
        articleSection: (c.categories || []).map((s) => (c.categoriesBySlug || {})[s] || s),
      });
    }

    if (c.course) {
      const k = c.course;
      const hours = (h) => {
        if (!h) return undefined;
        const whole = Math.floor(h), mins = Math.round((h - whole) * 60);
        return "PT" + whole + "H" + (mins ? mins + "M" : "");
      };
      const course = {
        "@type": "Course",
        "@id": pageUrl + "#course",
        name: k.name,
        description: c.description,
        url: pageUrl,
        provider: { "@id": orgId },
        inLanguage: "lv",
        educationalLevel: k.level,
        timeRequired: hours(k.hours),
      };
      if (k.price != null) {
        course.offers = {
          "@type": "Offer",
          category: "Paid",
          price: k.price,
          priceCurrency: "EUR",
          url: pageUrl,
          availability: "https://schema.org/InStock",
        };
        if (k.vatIncluded === false) {
          course.offers.priceSpecification = { "@type": "PriceSpecification", price: k.price, priceCurrency: "EUR", valueAddedTaxIncluded: false };
        }
      }
      if (k.mode) {
        const inst = { "@type": "CourseInstance", courseMode: k.mode, courseWorkload: hours(k.hours) };
        if (k.instructor) inst.instructor = { "@type": "Person", name: k.instructor };
        course.hasCourseInstance = [inst];
      }
      graph.push(course);
    }

    return { "@context": "https://schema.org", "@graph": graph };
  });

  // ---- intrinsic image sizes (no layout shift) -----------------------------
  // Every local <img> without width/height gets them from the file on disk,
  // and og:image gets og:image:width/height. Registered BEFORE HtmlBasePlugin
  // so the src attributes are still root-relative here.
  const dimCache = new Map();
  async function dims(p) {
    if (dimCache.has(p)) return dimCache.get(p);
    let d = null;
    try {
      const m = await sharp(onDisk(p)).metadata();
      if (m.width && m.height) d = { width: m.width, height: m.height };
    } catch (_) { /* not a raster we can read; leave the tag alone */ }
    dimCache.set(p, d);
    return d;
  }
  eleventyConfig.addTransform("imgDims", async function (content) {
    if (!this.page.outputPath || !this.page.outputPath.endsWith(".html")) return content;
    const tags = content.match(/<img\b[^>]*>/g);
    if (tags) {
      for (const tag of new Set(tags)) {
        if (/\s(width|height)=/.test(tag)) continue;
        const m = tag.match(/\ssrc="(\/img\/[^"]+)"/);
        if (!m) continue;
        const d = await dims(cleanPath(m[1]));
        if (!d) continue;
        const selfClosing = /\/>$/.test(tag);
        const body = tag.replace(/\s*\/?>$/, "");
        const withDims = `${body} width="${d.width}" height="${d.height}"${selfClosing ? " />" : ">"}`;
        content = content.split(tag).join(withDims);
      }
    }
    const og = content.match(/<meta property="og:image" content="[^"]*?(\/img\/[^"]+)">/);
    if (og && !/og:image:width/.test(content)) {
      const d = await dims(cleanPath(og[1]));
      if (d) {
        content = content.replace(
          og[0],
          `${og[0]}\n  <meta property="og:image:width" content="${d.width}">\n  <meta property="og:image:height" content="${d.height}">`
        );
      }
    }
    return content;
  });

  // "Uzzini vairāk" repeated twenty times is meaningless to a screen-reader
  // link list. Inside a .cell the h3 says what the link is about, so the
  // accessible name becomes "Uzzini vairāk: Video reklāma" (WCAG 2.4.4 /
  // 2.5.3 - the visible text stays at the start of the name).
  eleventyConfig.addTransform("cellLinkLabels", function (content) {
    if (!this.page.outputPath || !this.page.outputPath.endsWith(".html")) return content;
    return content.replace(/<div class="cell(?:\s[^"]*)?">[\s\S]*?<\/div>/g, (block) => {
      const h = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
      if (!h) return block;
      const name = h[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").replace(/"/g, "&quot;").trim();
      return block.replace(/<a class="arrow-link" href="([^"]+)">([^<]+)<\/a>/g, (a, href, text) =>
        `<a class="arrow-link" href="${href}" aria-label="${text.trim()}: ${name}">${text}</a>`
      );
    });
  });

  // Markdown tables come out as bare <table>. Wrapped in .table-scroll they
  // scroll sideways inside the article instead of widening the whole page
  // on phones (the Meta ads article's comparison table was 410px on a 390px
  // screen). Tables that are already wrapped are left alone.
  eleventyConfig.addTransform("tableScroll", function (content) {
    if (!this.page.outputPath || !this.page.outputPath.endsWith(".html")) return content;
    return content.replace(/(<div class="table-scroll">\s*)?<table\b([\s\S]*?)<\/table>(\s*<\/div>)?/g, (m, open, inner, close) =>
      open ? m : `<div class="table-scroll"><table${inner}</table></div>`
    );
  });

  // Rewrites all root-relative URLs when a --pathprefix is set (GitHub project pages).
  eleventyConfig.addPlugin(HtmlBasePlugin);

  // Atom feed of the blog at /feed.xml.
  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: { name: "posts", limit: 20 },
    metadata: {
      language: "lv",
      title: "Mārketinga Skola — blogs",
      subtitle: "Reklāmas padomi uzņēmējiem: Meta un Google reklāma, SEO, mākslīgais intelekts.",
      base: "https://marketingaskola.lv/",
      author: { name: "Mārketinga Skola", email: "rihards@marketingaskola.lv" },
    },
  });

  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });
  // Apache rules for SiteGround (redirects, 404 page, caching, headers).
  // Ignored by GitHub Pages and by the local server; see docs/siteground-cutover.md.
  eleventyConfig.addPassthroughCopy({ "src/.htaccess": ".htaccess" });

  // ---- ship only the assets that pages actually reference -----------------
  // src/img keeps every original next to its .webp twin (the originals are
  // the source of truth for the optimizer and the og twins), so a blanket
  // passthrough shipped ~37 MB of files no page used. After each build, scan
  // the output for /img/, /video/ and /fonts/ references and copy just those.
  // tools/check-site.mjs is the safety net: anything that did not resolve
  // shows up there as BROKEN.
  // A reference starts at a quote/paren/space/= boundary (or at the ../ used
  // in fonts.css), may carry the site host or a PATH_PREFIX segment in front,
  // and ends at a quote/paren/whitespace/?#&. That boundary is what keeps
  // player.vimeo.com/video/123 and &quot;-escaped feed markup out of the set.
  const ASSET_RE = /(?:^|["'(=\s]|\.\.)(?:https?:\/\/(?:www\.)?marketingaskola\.lv)?((?:\/[\w.-]+)*?\/(?:img|video|fonts)\/[^"'()<>\s?#&]+)/g;
  const TEXT_EXT = new Set([".html", ".css", ".js", ".xml", ".json", ".webmanifest", ".txt"]);
  eleventyConfig.on("eleventy.after", async ({ dir }) => {
    const out = path.resolve(__dirname, dir.output);
    if (!fs.existsSync(out)) return;
    const refs = new Set();
    (function walk(d) {
      for (const f of fs.readdirSync(d)) {
        const p = path.join(d, f);
        if (fs.statSync(p).isDirectory()) walk(p);
        else if (TEXT_EXT.has(path.extname(f).toLowerCase())) {
          for (const m of fs.readFileSync(p, "utf8").matchAll(ASSET_RE)) refs.add(m[1].replace(/^\/marketingaskola-site(?=\/)/, ""));
        }
      }
    })(out);
    let copied = 0, bytes = 0;
    const missing = [];
    for (const ref of refs) {
      const rel = cleanPath(ref);
      const from = onDisk(rel);
      if (!fs.existsSync(from) || fs.statSync(from).isDirectory()) { missing.push(rel); continue; }
      const to = path.join(out, ...rel.split("/").filter(Boolean));
      const st = fs.statSync(from);
      const dst = fs.existsSync(to) ? fs.statSync(to) : null;
      if (!dst || dst.size !== st.size || dst.mtimeMs < st.mtimeMs) {
        fs.mkdirSync(path.dirname(to), { recursive: true });
        fs.copyFileSync(from, to);
        copied++;
      }
      bytes += st.size;
    }
    console.log(
      `[assets] ${refs.size} referenced files (${(bytes / 1048576).toFixed(1)} MB), ${copied} copied` +
      (missing.length ? `, ${missing.length} MISSING: ${missing.slice(0, 8).join(", ")}` : "")
    );
  });

  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/posts/*.md").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addFilter("readableDate", (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString("lv-LV", { year: "numeric", month: "long", day: "numeric" });
  });
  eleventyConfig.addFilter("isoDate", (d) => {
    const dt = new Date(d);
    return isNaN(dt) ? "" : dt.toISOString().slice(0, 10);
  });
  eleventyConfig.addFilter("inCategory", (posts, slugs) =>
    posts.filter((p) => (slugs || []).includes(p.fileSlug))
  );

  // --- reading experience -------------------------------------------------
  // Slugify Latvian headings into stable anchor ids.
  const slugify = (s) =>
    s.toLowerCase()
      .replace(/<[^>]+>/g, "")
      .normalize("NFKD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);

  // Ensure every article h2 has an id (posts converted from WordPress have a
  // mix of numeric ids and none at all) — needed by the TOC and scrollspy.
  eleventyConfig.addFilter("withAnchors", (html) => {
    if (!html) return html;
    let n = 0;
    return html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (m, attrs, inner) => {
      n += 1;
      if (/\sid=/.test(attrs)) return m;
      const id = slugify(inner) || "sadala-" + n;
      return `<h2${attrs} id="${id}">${inner}</h2>`;
    });
  });

  // Extract the h2 outline for the in-article table of contents.
  eleventyConfig.addFilter("toc", (html) => {
    if (!html) return [];
    const out = [];
    let n = 0;
    for (const m of html.matchAll(/<h2([^>]*)>([\s\S]*?)<\/h2>/g)) {
      n += 1;
      const idm = m[1].match(/id="([^"]+)"/);
      const text = m[2].replace(/<[^>]+>/g, "").trim();
      if (!text) continue;
      out.push({ id: idm ? idm[1] : slugify(text) || "sadala-" + n, text });
    }
    return out;
  });

  // Reading time in Latvian (~200 wpm).
  eleventyConfig.addFilter("readingTime", (html) => {
    const words = String(html || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  });

  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));
  eleventyConfig.addFilter("head", (arr, n) => (arr || []).slice(0, n));
  // Posts sharing a category with the current one (newest first), padded with
  // the latest posts when the category is thin. Excludes the current post.
  eleventyConfig.addFilter("relatedPosts", (posts, categories, currentSlug, n) => {
    const cats = categories || [];
    const others = (posts || []).filter((p) => p.fileSlug !== currentSlug);
    const same = others.filter((p) => (p.data.categories || []).some((c) => cats.includes(c)));
    const rest = others.filter((p) => !same.includes(p));
    return same.concat(rest).slice(0, n || 3);
  });

  // HtmlBasePlugin does not touch url() inside inline style attributes
  // (hero backgrounds), so prefix those ourselves.
  eleventyConfig.addTransform("styleUrlPathPrefix", function (content) {
    if (!this.page.outputPath || !this.page.outputPath.endsWith(".html")) return content;
    const url = eleventyConfig.getFilter("url");
    return content.replace(/(style="--bg:url\(')(\/[^']+)('\)")/g, (_, a, p, z) => a + url(p) + z);
  });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
