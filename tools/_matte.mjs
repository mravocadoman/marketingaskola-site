// Isolated matting worker. Deliberately does NOT import sharp: loading libvips
// and onnxruntime in one process crashes with a GLib-GObject error on Windows.
// Reads a PNG, writes a PNG with the subject's alpha cut out.
import { readFileSync, writeFileSync } from 'node:fs';
import { removeBackground } from '@imgly/background-removal-node';

const [, , inPath, outPath] = process.argv;
try {
  const buf = readFileSync(inPath);
  const blob = await removeBackground(new Blob([buf], { type: 'image/png' }), { output: { format: 'image/png' } });
  writeFileSync(outPath, Buffer.from(await blob.arrayBuffer()));
  console.log('MATTE_OK');
} catch (e) {
  console.error('MATTE_FAIL ' + (e && e.message ? e.message : String(e)));
  process.exit(1);
}
