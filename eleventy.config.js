const { HtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function (eleventyConfig) {
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
  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));
  eleventyConfig.addFilter("head", (arr, n) => (arr || []).slice(0, n));

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
