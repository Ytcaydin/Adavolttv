// Global silent Short #01: "Doctor vs Plumber: Who Retires Richer?" (1080x1920)
const sharp = require('/opt/npm-tools/node_modules/sharp');
const { spawn } = require('child_process');
const W = 1080, H = 1920, FPS = 30, DUR = 32;
const F = 'Poppins';
const C = { bg: '#0a0f1f', bg2: '#121a33', mu: '#8a96b8', wh: '#f4f6fb', grid: '#26304f', ax: '#55608a', dr: '#4fc3ff', pl: '#ff9f43', rd: '#ff5a5a' };
const cl = x => Math.max(0, Math.min(1, x));
const ease = x => { x = cl(x); return x * x * (3 - 2 * x); };
const eOut = x => { x = cl(x); return 1 - Math.pow(1 - x, 3); };
const pop = x => { x = cl(x); return x < 1 ? eOut(x) + Math.sin(x * Math.PI) * 0.15 : 1; };
const vis = (t, a, b, fi = 0.4, fo = 0.4) => ease((t - a) / fi) * (1 - ease((t - b) / fo));
const esc = s => String(s).replace(/&/g, '&amp;');
const T = (x, y, sz, s, o = {}) => `<text x="${x}" y="${y}" font-family="${F}" font-size="${sz}" font-weight="${o.w || 700}" fill="${o.c || C.wh}" text-anchor="${o.a || 'middle'}" opacity="${o.op ?? 1}" letter-spacing="${o.ls || 0}">${esc(s)}</text>`;
const money = v => { const s = v < 0 ? '−' : ''; v = Math.abs(v); return s + (v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${Math.round(v / 1e3)}K` : `$${Math.round(v)}`); };

const ROWS = require('./data.json'); // [age, plumber, doctor(net), doctorDebt]
const N = ROWS.length;
const X0 = 150, X1 = 760, Y0 = 1480, Y1 = 640;
const D0 = 2.3, D1 = 19.9;

// basit ikonlar
const docIcon = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.dr}"/><rect x="${x - r * 0.14}" y="${y - r * 0.5}" width="${r * 0.28}" height="${r}" fill="#fff" rx="${r * 0.05}"/><rect x="${x - r * 0.5}" y="${y - r * 0.14}" width="${r}" height="${r * 0.28}" fill="#fff" rx="${r * 0.05}"/>`;
const plIcon = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.pl}"/><g transform="translate(${x} ${y}) rotate(-45) scale(${r / 50})"><rect x="-7" y="-28" width="14" height="56" rx="6" fill="#fff"/><path d="M-20 -30 a20 20 0 1 0 40 0 l-10 0 l0 10 l-20 0 l0 -10 z" fill="#fff"/></g>`;

const EVENTS = [ // [yaş, kim, metin]
  [18, 'pl', 'Starts working'],
  [18, 'dr', 'College'],
  [22, 'dr', 'Med school'],
  [26, 'dr', 'Debt: −$223K'],
  [29, 'dr', 'Salary: $276K/yr'],
  [34, 'dr', 'Takes the lead'],
];

function valAt(col, p) { const i0 = Math.min(N - 1, Math.floor(p)), fr = p - i0, a = ROWS[i0][col], b = ROWS[Math.min(N - 1, i0 + 1)][col]; return a + (b - a) * fr; }

function frame(t) {
  let o = `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.bg2}"/><stop offset="1" stop-color="${C.bg}"/></linearGradient><filter id="gl"><feGaussianBlur stdDeviation="7"/></filter></defs>`;
  o += `<rect width="${W}" height="${H}" fill="url(#bg)"/>` + T(540, 150, 30, 'THE ROAD NOT TAKEN', { c: C.mu, ls: 8, w: 600 });

  // 1) kanca 0–6
  const k1 = 1 - ease((t - 1.6) / 0.35);
  if (k1 > 0) {
    const a = 1, b = 1, c = 1;
    o += `<g opacity="${k1}">`;
    o += `<g transform="translate(300 700) scale(${a}) translate(-300 -700)">${docIcon(300, 700, 110)}` + T(300, 880, 60, 'DOCTOR', { c: C.dr }) + '</g>';
    o += `<g transform="translate(780 700) scale(${b}) translate(-780 -700)">${plIcon(780, 700, 110)}` + T(780, 880, 60, 'PLUMBER', { c: C.pl }) + '</g>';
    o += T(540, 720, 54, 'vs', { c: C.mu });
    o += `<g opacity="${c}">` + T(540, 1080, 84, 'Who retires') + T(540, 1180, 84, 'richer?', { c: '#f5c542' }) + '</g>';
    o += '</g>';
  }

  // 2) yarış 6–25.6
  const kg = vis(t, 1.75, 21.3, 0.3, 0.4);
  if (kg > 0) {
    const u = cl((t - D0) / (D1 - D0)), p = u < 0.6 ? u / 0.6 * 18 : 18 + (u - 0.6) / 0.4 * (N - 1 - 18);
    const age = Math.round(18 + p);
    const vp = valAt(1, p), vd = valAt(2, p);
    // dinamik ölçek (geçmişin min/max'ı)
    let mx = 150000, mn = -60000;
    for (let i = 0; i <= Math.min(N - 1, Math.ceil(p)); i++) { mx = Math.max(mx, ROWS[i][1], ROWS[i][2]); mn = Math.min(mn, ROWS[i][2]); }
    mx = Math.max(mx, vp, vd) * 1.18; mn = mn * 1.25;
    const py = v => Y0 - (Y0 - Y1) * (v - mn) / (mx - mn);
    const px = i => X0 + (X1 - X0) * i / (N - 1);
    let g = `<g opacity="${kg}">`;
    g += T(540, 300, 46, 'Net worth at age', { c: C.mu, w: 600 }) + T(540, 420, 110, age);
    // canlı skor tablosu
    g += `${docIcon(250, 535, 30)}` + T(295, 552, 46, money(vd), { a: 'start', c: C.dr }) + `${plIcon(620, 535, 30)}` + T(665, 552, 46, money(vp), { a: 'start', c: C.pl });
    // ızgara: 0 çizgisi + birkaç seviye
    const STEPS = [50e3, 100e3, 250e3, 500e3, 1e6, 2e6];
    const stepOf = q => { let a = 150000, b = -60000; for (let i = 0; i <= Math.min(N - 1, Math.ceil(q)); i++) { a = Math.max(a, ROWS[i][1], ROWS[i][2]); b = Math.min(b, ROWS[i][2]); } a = Math.max(a, valAt(1, q), valAt(2, q)) * 1.18; b *= 1.25; return STEPS[STEPS.findIndex(s => (a - b) / s <= 5)] || 2e6; };
    const pOf = tt => { const uu = cl((tt - D0) / (D1 - D0)); return uu < 0.6 ? uu / 0.6 * 18 : 18 + (uu - 0.6) / 0.4 * (N - 1 - 18); };
    const step = stepOf(p);
    let flash = 0; for (let dt = 0; dt <= 0.7; dt += 1 / FPS) if (stepOf(pOf(t - dt)) !== step) { flash = 1 - dt / 0.7; break; }
    for (let v = Math.ceil(mn / step) * step; v <= mx; v += step) g += `<line x1="${X0}" y1="${py(v)}" x2="${X1}" y2="${py(v)}" stroke="${v === 0 ? '#3d4a75' : C.grid}" stroke-width="${v === 0 ? 3 : 2}"/>` + T(X0 - 12, py(v) + 9, 26 + 6 * flash, money(v), { a: 'end', c: flash > 0 ? '#f5c542' : C.ax, w: flash > 0 ? 700 : 500 });
    for (const a of [18, 30, 40, 50, 65]) g += T(px(a - 18), Y0 + 50, 28, a, { c: C.ax, w: 500 });
    for (const [col, c] of [[1, C.pl], [2, C.dr]]) {
      const pts = []; const i0 = Math.floor(p);
      for (let i = 0; i <= i0; i++) pts.push([px(i), py(ROWS[i][col])]);
      if (i0 < N - 1) pts.push([px(p), py(valAt(col, p))]);
      const d = pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');
      g += `<path d="${d}" fill="none" stroke="${c}" stroke-width="16" opacity="0.3" filter="url(#gl)" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>`;
      const e = pts[pts.length - 1];
      g += col === 2 ? docIcon(e[0], e[1], 24) : plIcon(e[0], e[1], 24);
    }
    // olay balonları: yaşa gelince 2.2 sn göster (sağ sütunda)
    const tev = ev => { const pe = ev[0] - 18, uu = pe <= 18 ? pe / 18 * 0.6 : 0.6 + (pe - 18) / (N - 1 - 18) * 0.4; return D0 + uu * (D1 - D0); };
    const shown = EVENTS.filter(ev => t >= tev(ev) && t < tev(ev) + 2.4);
    shown.forEach((ev, j) => {
      const a = eOut((t - tev(ev)) / 0.3) * (1 - cl((t - tev(ev) - 2.0) / 0.4));
      const col = ev[1] === 'dr' ? C.dr : C.pl, y = 700 + j * 120, bw = 250;
      g += `<g opacity="${a}"><rect x="${X1 + 30}" y="${y}" width="${bw}" height="96" rx="20" fill="${col}" fill-opacity="0.16" stroke="${col}" stroke-width="3"/>` + T(X1 + 30 + bw / 2, y + 38, 24, `${ev[1] === 'dr' ? 'DOCTOR' : 'PLUMBER'} · ${ev[0]}`, { c: col, w: 600 }) + T(X1 + 30 + bw / 2, y + 76, ev[2].length > 13 ? 26 : 30, ev[2], { c: C.wh }) + '</g>';
    });
        o += g + '</g>';
  }

  // 3) sonuç 25.6–31
  const k3 = vis(t, 21.5, 26.7);
  if (k3 > 0) {
    const a = pop((t - 21.8) / 0.4), b = pop((t - 22.4) / 0.4), c = eOut((t - 23.5) / 0.5);
    const L = ROWS[N - 1];
    o += `<g opacity="${k3}">` + T(540, 450, 54, 'At 65', { c: C.mu, w: 600 });
    o += `<g transform="translate(540 680) scale(${a}) translate(-540 -680)">${docIcon(250, 660, 60)}` + T(350, 690, 110, money(L[2]), { a: 'start', c: C.dr }) + '</g>';
    o += `<g transform="translate(540 880) scale(${b}) translate(-540 -880)">${plIcon(250, 860, 60)}` + T(350, 890, 110, money(L[1]), { a: 'start', c: C.pl }) + '</g>' + T(540, 990, 28, "pre-tax · today's dollars", { c: C.ax, w: 500 });
    o += `<g opacity="${c}">` + T(540, 1110, 60, 'But the plumber', { c: C.wh }) + T(540, 1200, 60, 'was ahead for 16 years.', { c: C.pl }) + '</g></g>';
  }

  // 4) soru 31–36
  const k4 = vis(t, 26.9, 99);
  if (k4 > 0) o += `<g opacity="${k4}">${docIcon(300, 700, 110)}` + T(300, 880, 60, 'DOCTOR', { c: C.dr }) + plIcon(780, 700, 110) + T(780, 880, 60, 'PLUMBER', { c: C.pl }) + T(540, 720, 54, 'vs', { c: C.mu }) + T(540, 1080, 84, 'Which path') + T(540, 1180, 84, 'would you take?', { c: '#f5c542' }) + T(540, 1330, 46, 'Comment below ↓', { c: C.mu, w: 600 }) + '</g>';

  o += T(540, 1745, 22, "Both start at 18 · 15% of pre-tax pay invested at 5%/yr after inflation · today's dollars", { c: '#44507a', w: 500 }) + T(540, 1778, 22, 'Sources: BLS OEWS May 2025 (median pay) · AAMC 2025 (resident pay)', { c: '#44507a', w: 500 }) + T(540, 1811, 22, 'Avg. med-school debt, class of 2025 (educationdata.org)', { c: '#44507a', w: 500 });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${o}</svg>`;
}

(async () => {
  const mode = process.argv[2];
  if (mode === 'preview') { for (const s of process.argv[3].split(',')) await sharp(Buffer.from(frame(+s))).png().toFile(`pv_${s}.png`); return; }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', 'v.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < DUR * FPS; i++) { const b = await sharp(Buffer.from(frame(i / FPS))).ensureAlpha().raw().toBuffer(); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('ok');
})();
