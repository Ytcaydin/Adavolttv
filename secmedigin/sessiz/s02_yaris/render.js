// Sessiz veri Short'u #02: "26 yılda kim daha hızlı koştu?" Asgari ücret · Altın · Dolar · Euro (2000 = 1×)
const sharp = require('/opt/npm-tools/node_modules/sharp');
const { spawn } = require('child_process');
const W = 1080, H = 1920, FPS = 30, DUR = 32;
const F = 'Poppins';
const C = { bg: '#0a0f1f', bg2: '#121a33', mu: '#8a96b8', wh: '#f4f6fb', grid: '#26304f', ax: '#55608a' };
const cl = x => Math.max(0, Math.min(1, x));
const ease = x => { x = cl(x); return x * x * (3 - 2 * x); };
const eOut = x => { x = cl(x); return 1 - Math.pow(1 - x, 3); };
const pop = x => { x = cl(x); return x < 1 ? eOut(x) + Math.sin(x * Math.PI) * 0.15 : 1; };
const vis = (t, a, b, fi = 0.4, fo = 0.4) => ease((t - a) / fi) * (1 - ease((t - b) / fo));
const esc = s => String(s).replace(/&/g, '&amp;');
const T = (x, y, sz, s, o = {}) => `<text x="${x}" y="${y}" font-family="${F}" font-size="${sz}" font-weight="${o.w || 700}" fill="${o.c || C.wh}" text-anchor="${o.a || 'middle'}" opacity="${o.op ?? 1}" letter-spacing="${o.ls || 0}">${esc(s)}</text>`;
const fmt = v => v >= 100 ? Math.round(v + 1e-6).toLocaleString('tr-TR') : v >= 10 ? Math.round(v) : v.toFixed(1).replace('.', ',');

// [yıl, asgari ücret, gram altın, dolar, euro] — 2000 yılı ortalaması = 1×; son satır Ekim 2026
const ROWS = require('../../v002/yaris.json');
const S = [
  { k: 'Asgari ücret', c: '#4fc3ff', i: 1 },
  { k: 'Gram altın', c: '#f5c542', i: 2 },
  { k: 'Euro', c: '#b388ff', i: 4 },
  { k: 'Dolar', c: '#3ddc84', i: 3 },
];
const N = ROWS.length;
const X0 = 130, X1 = 820, Y0 = 1560, Y1 = 600, LMAX = Math.log10(1500);
const px = i => X0 + (X1 - X0) * i / (N - 1);
const py = v => Y0 - (Y0 - Y1) * Math.log10(Math.max(1, v)) / LMAX;
const D0 = 4.6, D1 = 21.6;

function valAt(s, p) { const i0 = Math.min(N - 1, Math.floor(p)), fr = p - i0; const a = ROWS[i0][s.i], b = ROWS[Math.min(N - 1, i0 + 1)][s.i]; return Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * fr); }

function frame(t) {
  let o = `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.bg2}"/><stop offset="1" stop-color="${C.bg}"/></linearGradient><filter id="gl"><feGaussianBlur stdDeviation="7"/></filter></defs>`;
  o += `<rect width="${W}" height="${H}" fill="url(#bg)"/>` + T(540, 150, 30, 'SEÇMEDİĞİN YOL', { c: C.mu, ls: 8, w: 600 });

  // 1) kanca 0–4.4
  const k1 = vis(t, 0.1, 4.2);
  if (k1 > 0) {
    o += `<g opacity="${k1}">` + T(540, 700, 64, '26 yılda', { c: C.mu, w: 600 }) + T(540, 820, 100, 'kim daha') + T(540, 940, 100, 'hızlı koştu?');
    S.forEach((s, j) => { const a = pop((t - 1.4 - j * 0.35) / 0.4); o += `<g opacity="${cl(a)}" transform="translate(540 ${1140 + j * 90}) scale(${a}) translate(-540 -${1140 + j * 90})"><circle cx="330" cy="${1125 + j * 90}" r="16" fill="${s.c}"/>` + T(370, 1140 + j * 90, 54, s.k, { a: 'start', c: s.c }) + '</g>'; });
    o += '</g>';
  }

  // 2) yarış 4.4–23.4
  const kg = vis(t, 4.4, 23.2);
  if (kg > 0) {
    const p = cl((t - D0) / (D1 - D0)) * (N - 1);
    const yr = p >= N - 1.01 ? 'Ekim 2026' : String(ROWS[Math.min(N - 1, Math.round(p))][0]);
    let g = `<g opacity="${kg}">` + T(540, 300, 50, "2000'de hepsi 1× · bugün kaç kat?", { c: C.mu, w: 600 }) + T(540, 420, 92, yr);
    for (const v of [1, 10, 100, 1000]) g += `<line x1="${X0}" y1="${py(v)}" x2="${X1}" y2="${py(v)}" stroke="${C.grid}" stroke-width="2"/>` + T(X0 - 14, py(v) + 10, 28, `${v.toLocaleString('tr-TR')}×`, { a: 'end', c: C.ax, w: 500 });
    for (const y of [2000, 2010, 2020]) g += T(px(y - 2000), Y0 + 52, 28, y, { c: C.ax, w: 500 });
    const ends = [];
    for (const s of S) {
      const pts = [];
      const i0 = Math.floor(p);
      for (let i = 0; i <= i0; i++) pts.push([px(i), py(ROWS[i][s.i])]);
      if (i0 < N - 1) pts.push([px(p), py(valAt(s, p))]);
      const d = pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');
      g += `<path d="${d}" fill="none" stroke="${s.c}" stroke-width="14" opacity="0.3" filter="url(#gl)" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${s.c}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>`;
      const e = pts[pts.length - 1]; ends.push({ s, x: e[0], y: e[1], v: valAt(s, p) });
    }
    // uç etiketleri: üst üste binmesin
    ends.sort((a, b) => a.y - b.y); let last = -1e9;
    for (const e of ends) { e.ly = Math.max(e.y, last + 62); last = e.ly; }
    for (const e of ends) {
      g += `<circle cx="${e.x}" cy="${e.y}" r="13" fill="${e.s.c}"/><line x1="${e.x + 14}" y1="${e.y}" x2="${e.x + 34}" y2="${e.ly}" stroke="${e.s.c}" stroke-width="3"/>`;
      g += T(e.x + 42, e.ly + 16, 46, `${fmt(e.v)}×`, { a: 'start', c: e.s.c });
    }
    g += T(540, 1700, 26, '2000 yılı ortalaması = 1× · logaritmik ölçek', { c: C.ax, w: 500 });
    o += g + '</g>';
  }

  // 3) sıralama 23.6–28.6
  const k3 = vis(t, 23.6, 28.4);
  if (k3 > 0) {
    const fin = S.map(s => ({ s, v: ROWS[N - 1][s.i] })).sort((a, b) => b.v - a.v);
    let g = `<g opacity="${k3}">` + T(540, 420, 64, '2000 → Ekim 2026', { c: C.mu, w: 600 });
    fin.forEach((f, j) => {
      const y = 620 + j * 230, a = eOut((t - 24.0 - j * 0.45) / 0.7), wbar = 820 * (f.v / fin[0].v) * a;
      g += T(130, y, 46, `${j + 1}. ${f.s.k}`, { a: 'start', c: f.s.c }) + `<rect x="130" y="${y + 28}" width="${Math.max(8, wbar)}" height="70" rx="14" fill="${f.s.c}"/>`;
      g += T(wbar > 700 ? 130 + wbar - 24 : 130 + wbar + 20, y + 82, 54, `${fmt(f.v * a)}×`, { a: wbar > 700 ? 'end' : 'start', c: wbar > 700 ? C.bg : C.wh });
    });
    o += g + '</g>';
  }

  // 4) sonuç 28.8–32
  const k4 = vis(t, 28.8, 99);
  if (k4 > 0) {
    const b = eOut((t - 29.6) / 0.5);
    o += `<g opacity="${k4}">` + T(540, 760, 62, 'Maaşın dolardan 4,', { c: C.wh }) + T(540, 850, 62, 'eurodan 3,4 kat hızlı koştu.', { c: '#4fc3ff' });
    o += `<g opacity="${b}">` + T(540, 1000, 62, 'Ama altın, maaşı', { c: C.wh }) + T(540, 1090, 62, '3,5 kat geride bıraktı.', { c: '#f5c542' }) + T(540, 1260, 48, 'Senin birikimin hangisinde? ↓', { c: C.mu, w: 600 }) + '</g></g>';
  }
  o += T(540, 1790, 22, 'Kaynak: imer.av.tr · karekod.org · FRED (EUR/USD) · Bloomberg HT, Milli Gazete (27.10.2026)', { c: '#44507a', w: 500 });
  const fade = Math.max(1 - cl(t / 0.25), cl((t - (DUR - 0.25)) / 0.25));
  if (fade > 0) o += `<rect width="${W}" height="${H}" fill="#000" opacity="${fade}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${o}</svg>`;
}

(async () => {
  const mode = process.argv[2];
  if (mode === 'preview') { for (const s of process.argv[3].split(',')) await sharp(Buffer.from(frame(+s))).png().toFile(`pv_${s}.png`); return; }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', 'v.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < DUR * FPS; i++) { const b = await sharp(Buffer.from(frame(i / FPS))).ensureAlpha().raw().toBuffer(); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('ok');
})();
