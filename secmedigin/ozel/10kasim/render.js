// 10 Kasım anma Short'u: 1080x1920, siyah-beyaz, yalnız yazı
const sharp = require('/opt/npm-tools/node_modules/sharp');
const { spawn } = require('child_process');
const W = 1080, H = 1920, FPS = 30, DUR = 28;
const F = 'Lora';
const cl = x => Math.max(0, Math.min(1, x));
const ease = x => { x = cl(x); return x * x * (3 - 2 * x); };
// görünürlük: a'da belirmeye başla, b'de kaybolmaya başla
const vis = (t, a, b, fi = 0.9, fo = 0.9) => ease((t - a) / fi) * (1 - ease((t - b) / fo));
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const T = (x, y, sz, s, o = {}) => `<text x="${x}" y="${y}" font-family="${o.f || F}" font-size="${sz}" font-weight="${o.b ? 700 : 400}" ${o.i ? 'font-style="italic"' : ''} fill="${o.c || '#f2f2f2'}" text-anchor="middle" letter-spacing="${o.ls || 0}" opacity="${o.op ?? 1}">${esc(s)}</text>`;
const rise = (t, a) => 18 * (1 - ease((t - a) / 1.2));

function frame(t) {
  let o = `<rect width="${W}" height="${H}" fill="#070707"/>`;
  // hafif vinyet
  o += `<defs><radialGradient id="v" cx="50%" cy="48%" r="75%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.85"/></radialGradient></defs>`;
  const g = (a, b, inner) => { const k = vis(t, a, b); return k > 0.001 ? `<g opacity="${k}" transform="translate(0 ${rise(t, a)})">${inner}</g>` : ''; };
  const C = 900;
  // 1) 0–4.6
  o += g(0.4, 4.0, T(540, C - 40, 96, '10 Kasım 1938.'));
  o += g(1.8, 4.0, T(540, C + 80, 72, 'Saat 09.05.', { c: '#bdbdbd', i: true }));
  // 2) 5.0–8.6
  o += g(5.0, 8.2, T(540, C - 30, 70, 'Bir insan, bir ömürde') + T(540, C + 70, 70, 'kaç karar verir?'));
  // 3) 9.0–14.6
  o += g(9.0, 14.2, T(540, C - 200, 170, '1928', { b: true, ls: 6 }));
  o += g(9.6, 14.2, T(540, C - 60, 60, 'Yeni harfler.', { i: true, c: '#cfcfcf' }));
  o += g(11.0, 14.2, T(540, C + 90, 50, 'Bugün 6 yaş üstü nüfusun') + T(540, C + 160, 50, '%97,8\'i okuma yazma biliyor.') + T(540, C + 250, 30, 'TÜİK, 2024', { c: '#8a8a8a', ls: 2 }));
  // 4) 15.0–21.4
  o += g(15.0, 21.0, T(540, C - 260, 170, '1934', { b: true, ls: 6 }));
  o += g(15.6, 21.0, T(540, C - 120, 54, 'Kadınlara seçme', { i: true, c: '#cfcfcf' }) + T(540, C - 50, 54, 've seçilme hakkı.', { i: true, c: '#cfcfcf' }));
  const ulk = [['Fransa', "1944'te"], ['İtalya', "1946'da"], ['İsviçre', "1971'de"]];
  ulk.forEach(([u, y], i) => { o += g(17.2 + i * 0.8, 21.0, T(540, C + 90 + i * 85, 52, `${u} ${y}.`, { c: '#9a9a9a' })); });
  // 5) 21.8–25.0
  o += g(21.8, 24.8, T(540, C - 30, 70, 'Seçtiği yol,') + T(540, C + 70, 70, 'bugün yürüdüğümüz yol.'));
  // 6) 25.4–28
  o += g(25.4, 99, T(540, C + 10, 80, 'Saygı ve özlemle.', { i: true }));
  o += g(26.2, 99, `<rect x="490" y="${C + 70}" width="100" height="2" fill="#666"/>` + T(540, C + 140, 30, 'SEÇMEDİĞİN YOL', { c: '#6f6f6f', ls: 6 }));
  o += `<rect width="${W}" height="${H}" fill="url(#v)"/>`;
  // baş/son siyah geçiş
  const fade = Math.max(1 - cl(t / 0.4), cl((t - (DUR - 0.8)) / 0.8));
  if (fade > 0) o += `<rect width="${W}" height="${H}" fill="#000" opacity="${fade}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${o}</svg>`;
}

// film greni: birkaç sabit gürültü katmanı döngüde
const grains = [];
async function grain(i) {
  if (!grains[i]) {
    const buf = Buffer.alloc(W * H * 4); let s = 1234 + i * 977;
    for (let p = 0; p < W * H; p++) { s = (s * 1103515245 + 12345) & 0x7fffffff; const v = s % 255; buf[p * 4] = buf[p * 4 + 1] = buf[p * 4 + 2] = v; buf[p * 4 + 3] = 10; }
    grains[i] = await sharp(buf, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
  }
  return grains[i];
}
async function render(t) {
  return sharp(Buffer.from(frame(t))).composite([{ input: await grain(Math.floor(t * FPS) % 4) }]).removeAlpha().raw().toBuffer();
}
(async () => {
  const mode = process.argv[2];
  if (mode === 'preview') {
    for (const s of process.argv[3].split(',')) await sharp(await render(+s), { raw: { width: W, height: H, channels: 3 } }).png().toFile(`pv_${s}.png`);
    return;
  }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-',
    '-f', 'lavfi', '-t', `${DUR}`, '-i', 'anullsrc=r=44100:cl=stereo',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', '10kasim_short.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < DUR * FPS; i++) { const b = await render(i / FPS); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('ok');
})();
