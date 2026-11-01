// Sessiz veri Short'u #01: "Asgari ücret kaç dolar? 2000 → 2026"  (1080x1920, 30 sn, yalnız yazı + müzik)
const sharp = require('/opt/npm-tools/node_modules/sharp');
const { spawn } = require('child_process');
const W = 1080, H = 1920, FPS = 30, DUR = 30;
const F = 'Poppins';
const C = { bg: '#0a0f1f', bg2: '#121a33', gr: '#3ddc84', au: '#f5c542', rd: '#ff5a5a', mu: '#8a96b8', wh: '#f4f6fb' };
const cl = x => Math.max(0, Math.min(1, x));
const ease = x => { x = cl(x); return x * x * (3 - 2 * x); };
const eOut = x => { x = cl(x); return 1 - Math.pow(1 - x, 3); };
const pop = x => { x = cl(x); return x < 1 ? eOut(x) + Math.sin(x * Math.PI) * 0.15 : 1; };
const vis = (t, a, b, fi = 0.4, fo = 0.4) => ease((t - a) / fi) * (1 - ease((t - b) / fo));
const esc = s => String(s).replace(/&/g, '&amp;');
const T = (x, y, sz, s, o = {}) => `<text x="${x}" y="${y}" font-family="${F}" font-size="${sz}" font-weight="${o.w || 700}" fill="${o.c || C.wh}" text-anchor="${o.a || 'middle'}" opacity="${o.op ?? 1}" letter-spacing="${o.ls || 0}">${esc(s)}</text>`;

// yıllık ortalama: net asgari ücret / ortalama USD-TRY (2000–2025), son nokta Ekim 2026 (27.10.2026 kuru)
const DATA = [[2000,135],[2001,91],[2002,115],[2003,151],[2004,218],[2005,261],[2006,266],[2007,316],[2008,381],[2009,347],[2010,392],[2011,386],[2012,402],[2013,415],[2014,397],[2015,358],[2016,431],[2017,385],[2018,333],[2019,356],[2020,332],[2021,318],[2022,295],[2023,419],[2024,518],[2025,560],[2026,564]];
const N = DATA.length;
const X0 = 110, X1 = 970, Y0 = 1430, Y1 = 760, VMAX = 650;
const px = i => X0 + (X1 - X0) * i / (N - 1);
const py = v => Y0 - (Y0 - Y1) * v / VMAX;
const NOTES = { 1: ['2001 krizi', C.rd], 13: ['', C.au], 22: ['2022', C.rd], 26: ['', C.gr] };
const DRAW0 = 6.2, DRAW1 = 21.5;

function frame(t) {
  let o = `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.bg2}"/><stop offset="1" stop-color="${C.bg}"/></linearGradient>
  <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.gr}" stop-opacity="0.35"/><stop offset="1" stop-color="${C.gr}" stop-opacity="0"/></linearGradient>
  <filter id="gl"><feGaussianBlur stdDeviation="8"/></filter></defs>`;
  o += `<rect width="${W}" height="${H}" fill="url(#bg)"/>`;
  // üst marka şeridi
  o += T(540, 150, 30, 'SEÇMEDİĞİN YOL', { c: C.mu, ls: 8, w: 600 });

  // 1) kanca 0–5.6
  const k1 = vis(t, 0.1, 5.3);
  if (k1 > 0) {
    o += `<g opacity="${k1}">` + T(540, 760, 78, "2000'de", { w: 600, c: C.mu }) + T(540, 880, 96, 'asgari ücret') + T(540, 1000, 96, 'kaç dolardı?', { c: C.gr }) + '</g>';
    // sayaç 2.4–4.6
    const k = eOut((t - 2.4) / 1.6), v = Math.round(135 * k);
    const s = pop((t - 2.4) / 0.4);
    if (t > 2.4) o += `<g opacity="${k1}" transform="translate(540 1290) scale(${s}) translate(-540 -1290)">` + T(540, 1330, 230, `${v} $`, { c: C.au }) + '</g>';
  }

  // 2) grafik 5.8–23.6
  const kg = vis(t, 5.8, 23.4);
  if (kg > 0) {
    const p = cl((t - DRAW0) / (DRAW1 - DRAW0)) * (N - 1); // kaçıncı noktaya kadar çizildi
    const i0 = Math.floor(p), fr = p - i0;
    const pts = [];
    for (let i = 0; i <= i0; i++) pts.push([px(i), py(DATA[i][1])]);
    if (i0 < N - 1) pts.push([px(i0) + (px(i0 + 1) - px(i0)) * fr, py(DATA[i0][1] + (DATA[i0 + 1][1] - DATA[i0][1]) * fr)]);
    const cur = pts[pts.length - 1];
    const curV = Math.round(i0 < N - 1 ? DATA[i0][1] + (DATA[i0 + 1][1] - DATA[i0][1]) * fr : DATA[N - 1][1]);
    const year = DATA[Math.min(N - 1, Math.round(p))][0];
    let g = `<g opacity="${kg}">`;
    // ızgara
    for (const v of [0, 200, 400, 600]) g += `<line x1="${X0}" y1="${py(v)}" x2="${X1}" y2="${py(v)}" stroke="#2a3456" stroke-width="2"/>` + T(X0 - 14, py(v) + 10, 28, `${v}$`, { a: 'end', c: '#55608a', w: 500 });
    for (const y of [2000, 2005, 2010, 2015, 2020, 2025]) { const i = y - 2000; g += T(px(i), Y0 + 52, 28, y, { c: '#55608a', w: 500 }); }
    // alan + çizgi
    const d = pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');
    g += `<path d="${d} L${cur[0]} ${Y0} L${X0} ${Y0} Z" fill="url(#fill)"/>`;
    g += `<path d="${d}" fill="none" stroke="${C.gr}" stroke-width="16" stroke-linejoin="round" stroke-linecap="round" opacity="0.35" filter="url(#gl)"/>`;
    g += `<path d="${d}" fill="none" stroke="${C.gr}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>`;
    g += `<circle cx="${cur[0]}" cy="${cur[1]}" r="16" fill="${C.wh}"/><circle cx="${cur[0]}" cy="${cur[1]}" r="30" fill="${C.gr}" opacity="0.25"/>`;
    // notlar (nokta geçildikten sonra kalıcı)
    for (const [ii, [lab, col]] of Object.entries(NOTES)) {
      const i = +ii; if (p < i) continue;
      const a = eOut((p - i) / 0.6), X = px(i), Y = py(DATA[i][1]);
      const up = DATA[i][1] > 380, ly = DATA[i][1] < 150 ? Y + 66 : (up ? Y - 70 : Y + 90);
      g += `<g opacity="${a}"><circle cx="${X}" cy="${Y}" r="11" fill="${col}"/>` + T(Math.min(Math.max(X + (DATA[i][1] < 150 ? 130 : 0), 150), 930), ly, 40, `${DATA[i][1]} $`, { c: col }) + (lab ? T(Math.min(Math.max(X + (DATA[i][1] < 150 ? 130 : 0), 150), 930), ly - 46, 26, lab, { c: col, w: 500 }) : '') + '</g>';
    }
    // başlık + canlı sayaç
    g += T(540, 300, 54, 'Asgari ücret, dolar olarak', { w: 600, c: C.mu });
    const lbl = p >= N - 1.01 ? 'Ekim 2026' : String(year);
    g += T(540, 420, 76, lbl, { c: C.wh });
    g += T(540, 610, 170, `${curV} $`, { c: C.gr });
    g += T(540, 1590, 26, 'Yıllık ortalama · net asgari ücret ÷ ortalama dolar kuru', { c: '#55608a', w: 500 });
    o += g + '</g>';
  }

  // 3) karşılaştırma 23.8–27.4
  const k3 = vis(t, 23.8, 27.3);
  if (k3 > 0) {
    const a = pop((t - 24.0) / 0.4), b = pop((t - 24.9) / 0.4), c = eOut((t - 25.6) / 0.5);
    o += `<g opacity="${k3}">`;
    o += `<g transform="translate(300 900) scale(${a}) translate(-300 -900)">` + T(300, 760, 44, '2000', { c: C.mu, w: 600 }) + T(300, 900, 130, '135 $', { c: C.au }) + '</g>';
    o += `<g transform="translate(780 900) scale(${b}) translate(-780 -900)">` + T(780, 760, 44, 'Ekim 2026', { c: C.mu, w: 600 }) + T(780, 900, 130, '564 $', { c: C.gr }) + '</g>';
    o += `<g opacity="${c}">` + T(540, 1120, 66, 'Dolar: 80 kat', { c: C.wh }) + T(540, 1220, 66, 'Asgari ücret: 333 kat', { c: C.gr }) + '</g>';
    o += '</g>';
  }

  // 4) soru 27.6–30
  const k4 = vis(t, 27.5, 99);
  if (k4 > 0) {
    o += `<g opacity="${k4}">` + T(540, 820, 70, 'Peki neden kimse', { c: C.wh }) + T(540, 920, 70, 'daha zengin', { c: C.wh }) + T(540, 1020, 70, 'hissetmiyor?', { c: C.au }) + T(540, 1180, 48, 'Yorumlara yaz ↓', { c: C.mu, w: 600 }) + '</g>';
  }
  o += T(540, 1790, 24, 'Kaynak: imer.av.tr · karekod.org · Bloomberg HT (27.10.2026)', { c: '#44507a', w: 500 });
  const fade = Math.max(1 - cl(t / 0.25), cl((t - (DUR - 0.25)) / 0.25));
  if (fade > 0) o += `<rect width="${W}" height="${H}" fill="#000" opacity="${fade}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${o}</svg>`;
}

(async () => {
  const mode = process.argv[2];
  if (mode === 'preview') {
    for (const s of process.argv[3].split(',')) await sharp(Buffer.from(frame(+s))).png().toFile(`pv_${s}.png`);
    return;
  }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', 'v.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < DUR * FPS; i++) { const b = await sharp(Buffer.from(frame(i / FPS))).ensureAlpha().raw().toBuffer(); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('ok');
})();
