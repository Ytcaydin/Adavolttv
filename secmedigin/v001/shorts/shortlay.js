// Dikey Short üst katmanı (1080x1920, şeffaf): marka, kanca, büyük alt yazı, ilerleme, son kart
const sharp = require('/opt/npm-tools/node_modules/sharp');
const fs = require('fs'); const { spawn } = require('child_process');
const W = 1080, H = 1920, FPS = 30, FC = 'DejaVu Sans Condensed', FS = 'DejaVu Serif';
const AM = '#ffb547', GH = '#7fe3ff', TX = '#f2efe8', BG = '#0d0f14', MU = '#8b93a7';
const id = process.argv[2]; const SH = JSON.parse(fs.readFileSync('shorts.json')).find(s => s.id === id);
const SUBS = JSON.parse(fs.readFileSync('shorts_subs.json'))[id];
const CLIP = SH.b - SH.a, END = 2.8, DUR = CLIP + END;
const clamp = x => Math.max(0, Math.min(1, x)), ease = x => { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const T = (x, y, sz, s, o = {}) => `<text x="${x}" y="${y}" font-family="${o.serif ? FS : FC}" font-size="${sz}" font-weight="bold" ${o.it ? 'font-style="italic"' : ''} fill="${o.c || TX}" text-anchor="${o.a || 'middle'}" ${o.op !== undefined ? `opacity="${o.op}"` : ''}>${esc(s)}</text>`;
function frame(t) {
  let o = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`;
  o += `<rect x="0" y="0" width="${W * Math.min(1, t / CLIP)}" height="10" fill="${AM}"/>`;
  o += T(450, 150, 40, 'SEÇMEDİĞİN', { c: TX }) + T(650, 150, 40, 'YOL', { c: AM });
  // kanca
  SH.hook.forEach((l, i) => { const k = ease((t - i * 0.35) / 0.35); const last = i === SH.hook.length - 1; o += `<g opacity="${k}" transform="translate(0 ${(1 - k) * 20})">` + T(540, 290 + i * 100, last ? 84 : 78, l, { c: last ? AM : TX }) + '</g>'; });
  // alt yazı
  const s = SUBS.find((x, i) => t >= x[0] - 0.05 && t < Math.min(x[1] + 0.4, SUBS[i + 1] ? SUBS[i + 1][0] : x[1] + 0.4));
  if (s && t < CLIP) { const L = s[2]; const w = Math.max(...L.map(l => l.length)) * 33 + 90, h = L.length * 78 + 40, y0 = 1400; o += `<rect x="${540 - w / 2}" y="${y0}" width="${w}" height="${h}" rx="22" fill="#000" fill-opacity="0.7"/>`; L.forEach((l, i) => o += T(540, y0 + 76 + i * 78, 62, l)); }
  // son kart
  if (t > CLIP - 0.2) { const k = ease((t - CLIP + 0.2) / 0.4); o += `<g opacity="${k}"><rect width="${W}" height="${H}" fill="${BG}" fill-opacity="0.94"/>` + T(540, 760, 64, 'Hesabın tamamı', { serif: true, it: true }) + T(540, 860, 64, 'kanalda.', { serif: true, it: true }) + T(540, 1060, 110, 'SEÇMEDİĞİN', {}) + T(540, 1180, 110, 'YOL', { c: AM }) + `<rect x="290" y="1270" width="500" height="90" rx="45" fill="${GH}"/>` + T(540, 1330, 48, '@secmedigin', { c: BG }) + '</g>'; }
  return o + '</svg>';
}
(async () => {
  if (process.argv[3] === 'preview') { for (const x of process.argv[4].split(',')) await sharp(Buffer.from(frame(+x))).png().toFile(`${id}_ov_${x}.png`); return; }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-', '-c:v', 'qtrle', '-pix_fmt', 'argb', `${id}_ov.mov`], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(DUR * FPS);
  for (let i = 0; i < N; i++) { const b = await sharp(Buffer.from(frame(i / FPS))).ensureAlpha().raw().toBuffer(); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('ov ok', id, DUR.toFixed(2));
})();
