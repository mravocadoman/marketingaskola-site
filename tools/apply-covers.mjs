// Points every blog post at its generated cover (src/img/gen/cover-<slug>.webp)
// and records the original WordPress cover as `legacyImage` so nothing is lost.
// Usage: node tools/apply-covers.mjs [--revert]
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const POSTS = join(ROOT, 'src', 'posts');
const REVERT = process.argv.includes('--revert');

let changed = 0, missing = [];

for (const file of readdirSync(POSTS).filter((f) => f.endsWith('.md'))) {
  const slug = basename(file, '.md');
  const path = join(POSTS, file);
  let src = readFileSync(path, 'utf8');
  const cover = `/img/gen/cover-${slug}.webp`;

  if (REVERT) {
    const legacy = src.match(/^legacyImage: "([^"]+)"\s*$/m);
    if (!legacy) continue;
    src = src.replace(/^image: "[^"]*"\s*$/m, `image: "${legacy[1]}"`).replace(/^legacyImage: "[^"]+"\s*\n/m, '');
    writeFileSync(path, src);
    changed++;
    continue;
  }

  if (!existsSync(join(ROOT, 'src', cover.replace(/^\//, '')))) { missing.push(slug); continue; }
  if (src.includes(`image: "${cover}"`)) continue;

  const current = src.match(/^image: "([^"]*)"\s*$/m);
  if (current) {
    if (!/^legacyImage:/m.test(src)) {
      src = src.replace(/^image: "[^"]*"\s*$/m, `image: "${cover}"\nlegacyImage: "${current[1]}"`);
    } else {
      src = src.replace(/^image: "[^"]*"\s*$/m, `image: "${cover}"`);
    }
  } else {
    // no image key at all — insert one right after the title
    src = src.replace(/^(title: .*)$/m, `$1\nimage: "${cover}"`);
  }
  writeFileSync(path, src);
  changed++;
}

console.log(`${REVERT ? 'reverted' : 'updated'}: ${changed} posts`);
if (missing.length) console.log('no generated cover for:', missing.join(', '));
