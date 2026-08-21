// Reads the real pixel dimensions of the case-study MP4s so the markup can use
// each video's actual aspect ratio instead of forcing everything into 16:9.
// Parses the MP4 box tree for tkhd (track header) rather than shelling out to
// ffprobe, which is not installed here.
const URLS = process.argv.slice(2);

function readBoxes(buf, start, end, want, out) {
  let p = start;
  while (p + 8 <= end) {
    const size = buf.readUInt32BE(p);
    const type = buf.toString('latin1', p + 4, p + 8);
    if (size < 8) break;
    const bodyStart = p + 8;
    const bodyEnd = Math.min(p + size, end);
    if (type === want[0]) {
      if (want.length === 1) out.push([bodyStart, bodyEnd]);
      else readBoxes(buf, bodyStart, bodyEnd, want.slice(1), out);
    }
    p += size;
  }
}

for (const url of URLS) {
  try {
    const res = await fetch(url);
    const buf = Buffer.from(await res.arrayBuffer());
    const traks = [];
    readBoxes(buf, 0, buf.length, ['moov', 'trak', 'tkhd'], traks);

    let w = 0, h = 0;
    for (const [s] of traks) {
      const version = buf[s];
      // tkhd layout: after version+flags come the times/id/duration, 8 reserved,
      // layer+alt_group, volume+reserved, then a 36-byte matrix, and only then
      // width/height as 16.16 fixed point. That puts them at 76 (v0) / 88 (v1)
      // from the body start -- 84 lands past the end of a v0 box and returns junk.
      const off = s + (version === 1 ? 88 : 76);
      const tw = buf.readUInt32BE(off) / 65536;
      const th = buf.readUInt32BE(off + 4) / 65536;
      if (tw > w) { w = tw; h = th; }   // the video track, not the audio track
    }
    const name = url.split('/').pop();
    const ratio = w && h ? (w / h) : 0;
    const shape = ratio > 1.2 ? 'landscape' : ratio < 0.85 ? 'VERTICAL' : 'square';
    console.log(
      `${name.padEnd(28)} ${String(w).padStart(5)}x${String(h).padEnd(5)} ` +
      `${ratio.toFixed(3).padStart(6)}  ${shape.padEnd(9)} ${(buf.length / 1e6).toFixed(1)} MB`
    );
  } catch (e) {
    console.log(`${url.split('/').pop().padEnd(28)} FAILED: ${e.message}`);
  }
}
