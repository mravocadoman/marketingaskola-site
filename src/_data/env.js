module.exports = {
  // Set PREVIEW=1 (see .github/workflows/deploy.yml) while the site lives on
  // the github.io preview URL, so search engines don't index the duplicate.
  preview: !!process.env.PREVIEW,
};
