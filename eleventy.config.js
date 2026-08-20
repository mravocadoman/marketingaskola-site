const { HtmlBasePlugin } = require("@11ty/eleventy");
const fs = require("fs");
const path = require("path");

module.exports = function (eleventyConfig) {
  // Swap a /img/....png|jpg path for its .webp twin when one exists on disk.
  // Used for <img> display; og:image keeps the original for link previews.
  const webpCache = {};
  eleventyConfig.addFilter("webp", (p) => {
    if (!p || !/\.(png|jpe?g)$/i.test(p)) return p;
    if (webpCache[p] !== undefined) return webpCache[p];
    const w = p.replace(/\.(png|jpe?g)$/i, ".webp");
    const onDisk = path.join(__dirname, "src", ...w.split("/").filter(Boolean));
    webpCache[p] = fs.existsSync(onDisk) ? w : p;
    return webpCache[p];
  });
  // Rewrites all root-relative URLs when a --pathprefix is set (GitHub project pages).
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/img": "img" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });

  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/posts/*.md").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addFilter("readableDate", (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString("lv-LV", { year: "numeric", month: "long", day: "numeric" });
  });
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));
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
