// The Other Path — iki yol yarışı Short motoru (1080x1920). Kullanım: node engine.js <config.js> [preview t1,t2 | render]
const sharp = require('/opt/npm-tools/node_modules/sharp');
const { spawn } = require('child_process');
const path = require('path');
const CFG = require(path.resolve(process.argv[2]));
const W = 1080, H = 1920, FPS = 30, DUR = CFG.dur || 30;
const F = 'Poppins';
const C = { bg: '#0a0f1f', bg2: '#121a33', mu: '#8a96b8', wh: '#f4f6fb', grid: '#26304f', ax: '#55608a', au: '#f5c542' };
const cl = x => Math.max(0, Math.min(1, x));
const ease = x => { x = cl(x); return x * x * (3 - 2 * x); };
const eOut = x => { x = cl(x); return 1 - Math.pow(1 - x, 3); };
const pop = x => { x = cl(x); return x < 1 ? eOut(x) + Math.sin(x * Math.PI) * 0.15 : 1; };
const vis = (t, a, b, fi = 0.4, fo = 0.4) => ease((t - a) / fi) * (1 - ease((t - b) / fo));
const esc = s => String(s).replace(/&/g, '&amp;');
const T = (x, y, sz, s, o = {}) => `<text x="${x}" y="${y}" font-family="${F}" font-size="${sz}" font-weight="${o.w || 700}" fill="${o.c || C.wh}" text-anchor="${o.a || 'middle'}" opacity="${o.op ?? 1}" letter-spacing="${o.ls || 0}">${esc(s)}</text>`;
const money = v => { const s = v < 0 ? '−' : ''; v = Math.abs(v); return s + (v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${Math.round(v / 1e3)}K` : `$${Math.round(v)}`); };

// ikon kütüphanesi: (x, y, r, renk)
const G = (x, y, r, inner) => `<g transform="translate(${x} ${y}) scale(${r / 50})">${inner}</g>`;
const ICONS = {
  doctor: (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>` + G(x, y, r, `<rect x="-7" y="-25" width="14" height="50" rx="3" fill="#fff"/><rect x="-25" y="-7" width="50" height="14" rx="3" fill="#fff"/>`),
  plumber: (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>` + G(x, y, r, `<g transform="rotate(-45)"><rect x="-7" y="-28" width="14" height="56" rx="6" fill="#fff"/><path d="M-20 -30 a20 20 0 1 0 40 0 l-10 0 l0 10 l-20 0 l0 -10 z" fill="#fff"/></g>`),
  invest: (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>` + G(x, y, r, `<polyline points="-26,18 -8,0 4,10 26,-14" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><polygon points="14,-22 30,-22 30,-6" fill="#fff"/>`),
  smoke: (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>` + G(x, y, r, `<rect x="-30" y="4" width="46" height="12" rx="2" fill="#fff"/><rect x="16" y="4" width="12" height="12" rx="2" fill="#ffd0a0"/><path d="M-22 -4 q-8 -10 0 -18 q8 -8 0 -16" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.85"/>`),
  house: (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>` + G(x, y, r, `<polygon points="0,-28 -28,-2 -20,-2 -20,24 20,24 20,-2 28,-2" fill="#fff"/><rect x="-6" y="6" width="12" height="18" fill="${c}"/>`),
  rent: (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>` + G(x, y, r, `<rect x="-20" y="-28" width="40" height="54" rx="3" fill="#fff"/>` + [-16, -2, 12].map(yy => [-12, 4].map(xx => `<rect x="${xx}" y="${yy}" width="8" height="8" fill="${c}"/>`).join('')).join('')),
  lawyer: (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>` + G(x, y, r, `<g transform="rotate(-35)"><rect x="-22" y="-26" width="34" height="16" rx="4" fill="#fff"/><rect x="-8" y="-12" width="6" height="40" rx="3" fill="#fff"/></g><rect x="-26" y="20" width="40" height="8" rx="3" fill="#fff"/>`),
  electrician: (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>` + G(x, y, r, `<polygon points="6,-30 -18,4 -2,4 -8,30 18,-6 2,-6" fill="#fff"/>`),
  laptop: (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>` + G(x, y, r, `<rect x="-24" y="-22" width="48" height="32" rx="4" fill="#fff"/><rect x="-18" y="-16" width="36" height="20" fill="${c}"/><rect x="-30" y="12" width="60" height="8" rx="3" fill="#fff"/>`),
  truck: (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>` + G(x, y, r, `<rect x="-30" y="-16" width="34" height="28" rx="3" fill="#fff"/><path d="M6 -6 h14 l10 12 v12 h-24 z" fill="#fff"/><circle cx="-18" cy="16" r="7" fill="${c}" stroke="#fff" stroke-width="4"/><circle cx="16" cy="16" r="7" fill="${c}" stroke="#fff" stroke-width="4"/>`),
  nurse: (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>` + G(x, y, r, `<path d="M0 26 C-34 4 -26 -26 0 -10 C26 -26 34 4 0 26 z" fill="#fff"/><rect x="-3" y="-8" width="6" height="22" fill="${c}"/><rect x="-11" y="0" width="22" height="6" fill="${c}"/>`),
  teacher: (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>` + G(x, y, r, `<path d="M-30 4 v-16 q15 -6 30 4 q15 -10 30 -4 v16 q-15 -6 -30 4 q-15 -10 -30 -4 z" fill="#fff"/><path d="M-30 12 q15 -6 30 4 q15 -10 30 -4" fill="none" stroke="#fff" stroke-width="5"/>`),
  coffee: (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>` + G(x, y, r, `<path d="M-22 -10 h36 v18 q0 16 -18 16 q-18 0 -18 -16 z" fill="#fff"/><path d="M14 -4 q14 0 14 10 q0 10 -14 10" fill="none" stroke="#fff" stroke-width="6"/><path d="M-10 -18 q-4 -6 0 -12 M2 -18 q-4 -6 0 -12" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`),
  clock: (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>` + G(x, y, r, `<circle cx="0" cy="0" r="26" fill="none" stroke="#fff" stroke-width="7"/><path d="M0 -14 V0 L10 8" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`),
};
const ic = (k, x, y, r) => ICONS[CFG[k].icon](x, y, r, CFG[k].color);

const ROWS = CFG.rows; // [x, A, B]
const N = ROWS.length;
const X0 = 150, X1 = 760, Y0 = 1480, Y1 = 640;
const D0 = 0.0, D1 = CFG.raceEnd || 17.8, SPLIT = CFG.split; // SPLIT: [u, p] yavaş başlangıç
const pOf = tt => { const u = cl((tt - D0) / (D1 - D0)); if (!SPLIT) return u * (N - 1); return u < SPLIT[0] ? u / SPLIT[0] * SPLIT[1] : SPLIT[1] + (u - SPLIT[0]) / (1 - SPLIT[0]) * (N - 1 - SPLIT[1]); };
const tOf = pe => { if (!SPLIT) return D0 + pe / (N - 1) * (D1 - D0); const uu = pe <= SPLIT[1] ? pe / SPLIT[1] * SPLIT[0] : SPLIT[0] + (pe - SPLIT[1]) / (N - 1 - SPLIT[1]) * (1 - SPLIT[0]); return D0 + uu * (D1 - D0); };
function valAt(col, p) { const i0 = Math.min(N - 1, Math.floor(p)), fr = p - i0, a = ROWS[i0][col], b = ROWS[Math.min(N - 1, i0 + 1)][col]; return a + (b - a) * fr; }
const STEPS = [10e3, 25e3, 50e3, 100e3, 250e3, 500e3, 1e6, 2e6, 5e6];
function scaleOf(p) {
  let a = CFG.minMax || 150000, b = CFG.minMin ?? -60000;
  for (let i = 0; i <= Math.min(N - 1, Math.ceil(p)); i++) { a = Math.max(a, ROWS[i][1], ROWS[i][2]); b = Math.min(b, ROWS[i][1], ROWS[i][2]); }
  a = Math.max(a, valAt(1, p), valAt(2, p)) * 1.18; b = b * 1.25;
  return { mx: a, mn: b, step: STEPS[STEPS.findIndex(s => (a - b) / s <= 5)] || 5e6 };
}
const R1 = CFG.raceEnd + 1.2, RES0 = R1 + 0.2, RES1 = RES0 + 5.2, Q0 = RES1 + 0.2;

function frame(t) {
  let o = `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.bg2}"/><stop offset="1" stop-color="${C.bg}"/></linearGradient><filter id="gl"><feGaussianBlur stdDeviation="7"/></filter></defs>`;
  o += `<rect width="${W}" height="${H}" fill="url(#bg)"/>` + T(540, 150, 30, 'THE OTHER PATH', { c: C.mu, ls: 8, w: 600 });

  // yarış
  const kg = vis(t, -1, R1, 0.3, 0.4);
  if (kg > 0) {
    const p = pOf(t);
    const xv = Math.round(ROWS[0][0] + p * (ROWS[1][0] - ROWS[0][0]));
    const va = valAt(1, p), vb = valAt(2, p);
    const { mx, mn, step } = scaleOf(p);
    const py = v => Y0 - (Y0 - Y1) * (v - mn) / (mx - mn);
    const px = i => X0 + (X1 - X0) * i / (N - 1);
    let flash = 0; for (let dt = 0; dt <= 0.7; dt += 1 / FPS) if (scaleOf(pOf(t - dt)).step !== step) { flash = 1 - dt / 0.7; break; }
    const hk = 1 - ease((t - 1.9) / 0.35), sb = ease((t - 2.0) / 0.35);
    let g = `<g opacity="${kg}">`;
    g += `<g opacity="${sb}">` + T(540, 300, 46, CFG.counterLabel, { c: C.mu, w: 600 }) + T(540, 420, 110, (CFG.counterFmt || (v => v))(xv));
    g += ic('A', 250, 535, 30) + T(295, 552, 46, money(va), { a: 'start', c: CFG.A.color }) + ic('B', 620, 535, 30) + T(665, 552, 46, money(vb), { a: 'start', c: CFG.B.color }) + '</g>';
    if (hk > 0) g += `<g opacity="${hk}">` + ic('A', 200, 330, 62) + T(200, 450, 40, CFG.A.name, { c: CFG.A.color }) + T(540, 345, 44, 'vs', { c: C.mu }) + ic('B', 880, 330, 62) + T(880, 450, 40, CFG.B.name, { c: CFG.B.color }) + T(540, 560, CFG.hook.length > 22 ? 58 : 70, CFG.hook, { c: C.au }) + '</g>';
    for (let v = Math.ceil(mn / step) * step; v <= mx; v += step) g += `<line x1="${X0}" y1="${py(v)}" x2="${X1}" y2="${py(v)}" stroke="${v === 0 ? '#3d4a75' : C.grid}" stroke-width="${v === 0 ? 3 : 2}"/>` + T(X0 - 12, py(v) + 9, 26 + 6 * flash, money(v), { a: 'end', c: flash > 0 ? C.au : C.ax, w: flash > 0 ? 700 : 500 });
    for (const a of CFG.xTicks) g += T(px((a - ROWS[0][0]) / (ROWS[1][0] - ROWS[0][0])), Y0 + 50, 28, a, { c: C.ax, w: 500 });
    for (const [col, k] of [[2, 'B'], [1, 'A']]) {
      const pts = []; const i0 = Math.floor(p);
      for (let i = 0; i <= i0; i++) pts.push([px(i), py(ROWS[i][col])]);
      if (i0 < N - 1) pts.push([px(p), py(valAt(col, p))]);
      const d = pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');
      const c = CFG[k].color;
      g += `<path d="${d}" fill="none" stroke="${c}" stroke-width="16" opacity="0.3" filter="url(#gl)" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>`;
      const e = pts[pts.length - 1]; g += ic(k, e[0], e[1], 24);
    }
    const tev = ev => tOf((ev[0] - ROWS[0][0]) / (ROWS[1][0] - ROWS[0][0]));
    const shown = CFG.events.filter(ev => t >= tev(ev) && t < tev(ev) + 2.4);
    shown.forEach((ev, j) => {
      const a = eOut((t - tev(ev)) / 0.3) * (1 - cl((t - tev(ev) - 2.0) / 0.4));
      const k = ev[1], col = CFG[k].color, y = 700 + j * 120, bw = 290;
      g += `<g opacity="${a}"><rect x="${X1 + 10}" y="${y}" width="${bw}" height="96" rx="20" fill="${col}" fill-opacity="0.16" stroke="${col}" stroke-width="3"/>` + T(X1 + 10 + bw / 2, y + 38, 24, `${CFG[k].name} · ${(CFG.eventFmt || (v => v))(ev[0])}`, { c: col, w: 600 }) + T(X1 + 10 + bw / 2, y + 76, ev[2].length > 15 ? 24 : 30, ev[2], { c: C.wh }) + '</g>';
    });
    o += g + '</g>';
  }

  // sonuç
  const k3 = vis(t, RES0, RES1);
  if (k3 > 0) {
    const a = pop((t - RES0 - 0.3) / 0.4), b = pop((t - RES0 - 0.9) / 0.4), c = eOut((t - RES0 - 2.0) / 0.5);
    const L = ROWS[N - 1];
    o += `<g opacity="${k3}">` + T(540, 450, 54, CFG.resultLabel, { c: C.mu, w: 600 });
    o += `<g transform="translate(540 680) scale(${a}) translate(-540 -680)">${ic('A', 250, 660, 60)}` + T(350, 690, 110, money(L[1]), { a: 'start', c: CFG.A.color }) + '</g>';
    o += `<g transform="translate(540 880) scale(${b}) translate(-540 -880)">${ic('B', 250, 860, 60)}` + T(350, 890, 110, money(L[2]), { a: 'start', c: CFG.B.color }) + '</g>' + T(540, 990, 28, CFG.resultNote || '', { c: C.ax, w: 500 });
    o += `<g opacity="${c}">` + T(540, 1110, 60, CFG.twist[0], { c: C.wh }) + T(540, 1200, 60, CFG.twist[1], { c: CFG.twistColor || CFG.B.color }) + '</g></g>';
  }

  // soru (açılış düzeniyle döngü)
  const k4 = vis(t, Q0, 99);
  if (k4 > 0) o += `<g opacity="${k4}">${ic('A', 300, 700, 110)}` + T(300, 880, 60, CFG.A.name, { c: CFG.A.color }) + ic('B', 780, 700, 110) + T(780, 880, 60, CFG.B.name, { c: CFG.B.color }) + T(540, 720, 54, 'vs', { c: C.mu }) + T(540, 1080, 84, CFG.question[0]) + T(540, 1180, 84, CFG.question[1], { c: C.au }) + T(540, 1330, 46, 'Comment below ↓', { c: C.mu, w: 600 }) + '</g>';

  o += `<g opacity="${ease((t - 2.4) / 0.4)}">` + CFG.footer.map((l, i) => T(540, 1735 + i * 27, 21, l, { c: '#44507a', w: 500 })).join('') + '</g>';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${o}</svg>`;
}
module.exports = { frame, tOf, DUR, RES0, Q0 };

if (require.main === module) (async () => {
  const mode = process.argv[3], out = CFG.out;
  if (mode === 'preview') { for (const s of process.argv[4].split(',')) await sharp(Buffer.from(frame(+s))).png().toFile(`${out}_pv_${s}.png`); return; }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', `${out}_v.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < DUR * FPS; i++) { const b = await sharp(Buffer.from(frame(i / FPS))).ensureAlpha().raw().toBuffer(); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('ok');
})();
