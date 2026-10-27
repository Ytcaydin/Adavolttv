// Seçmediğin Yol · Video 001 — 1920x1080 kod animasyonu
const sharp = require('/opt/npm-tools/node_modules/sharp');
const fs = require('fs');
const { spawn } = require('child_process');
const W = 1920, H = 1080, FPS = 30;
const BG = '#0d0f14', AM = '#ffb547', GH = '#7fe3ff', TX = '#f2efe8', MU = '#8b93a7', RD = '#ff5a5f', GR = '#4fd18b', AS = '#2b2f3a';
const FC = 'DejaVu Sans Condensed', FS = 'DejaVu Serif';
const SENT = JSON.parse(fs.readFileSync('cumleler.json'));
const DATA = JSON.parse(fs.readFileSync('data.json'));
const S = i => SENT[i].t0;
const DUR = 377.4;
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
const eio = x => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const pop = x => { x = clamp(x); return ease(x) + Math.sin(x * Math.PI) * 0.1; };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const T = (x, y, sz, s, o = {}) => `<text x="${x}" y="${y}" font-family="${o.serif ? FS : FC}" font-size="${sz}" font-weight="${o.n ? 'normal' : 'bold'}" ${o.it ? 'font-style="italic"' : ''} fill="${o.c || TX}" text-anchor="${o.a || 'start'}" ${o.op !== undefined ? `opacity="${o.op}"` : ''} ${o.ls ? `letter-spacing="${o.ls}"` : ''}>${esc(s)}</text>`;
const tr = n => Math.round(n).toLocaleString('de-DE');
const fmt = (n, d = 0) => n.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
const win = (t, a, b, f = 0.35) => ease((t - a) / f) * (1 - clamp((t - (b - f)) / f));

// ---------- ortak çizimler
function figure(x, y, s = 1, col = TX, op = 1) { // yüzsüz "sen"
  return `<g opacity="${op}" transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-150" r="34" fill="${col}"/><path d="M-46 -105 Q0 -122 46 -105 L40 0 L-40 0 Z" fill="${col}"/><rect x="-36" y="0" width="28" height="70" rx="10" fill="${col}"/><rect x="8" y="0" width="28" height="70" rx="10" fill="${col}"/></g>`;
}
function road(cx, by, s, opt = {}) {
  const P = (x, y) => `${cx + x * s} ${by - y * s}`;
  let o = `<path d="M${P(-230, 0)} L${P(230, 0)} L${P(70, 230)} L${P(-70, 230)} Z" fill="${AS}"/>`;
  o += `<path d="M${P(-70, 230)} L${P(0, 230)} L${P(-190, 470)} L${P(-230, 470)} Z" fill="${AS}"/>`;
  o += `<path d="M${P(-230, 0)} L${P(-70, 230)} L${P(-230, 470)}" stroke="${AM}" stroke-width="${7 * s}" fill="none"/><path d="M${P(0, 230)} L${P(-190, 470)}" stroke="${AM}" stroke-width="${7 * s}" fill="none"/>`;
  o += `<path d="M${P(0, 230)} L${P(70, 230)} L${P(230, 470)} L${P(190, 470)} Z" fill="${GH}" opacity="0.08"/>`;
  o += `<path d="M${P(230, 0)} L${P(70, 230)} L${P(230, 470)}" stroke="${GH}" stroke-width="${6 * s}" fill="none" stroke-dasharray="${16 * s} ${12 * s}"/><path d="M${P(0, 230)} L${P(190, 470)}" stroke="${GH}" stroke-width="${6 * s}" fill="none" stroke-dasharray="${16 * s} ${12 * s}"/>`;
  for (let i = 0; i < 4; i++) { const y0 = 20 + i * 52; o += `<path d="M${P(0, y0)} L${P(0, y0 + 30)}" stroke="${TX}" stroke-width="${(10 - i * 1.6) * s}" opacity="0.85"/>`; }
  return o;
}
function goldBar(x, y, s = 1, op = 1) {
  return `<g opacity="${op}" transform="translate(${x} ${y}) scale(${s})"><path d="M-90 30 L90 30 L65 -30 L-65 -30 Z" fill="${AM}"/><path d="M-65 -30 L65 -30 L55 -42 L-55 -42 Z" fill="#ffd28a"/><path d="M-50 18 L50 18" stroke="#c98a2a" stroke-width="4"/></g>`;
}
function envelope(x, y, s = 1, op = 1, col = TX) {
  return `<g opacity="${op}" transform="translate(${x} ${y}) scale(${s})"><rect x="-80" y="-50" width="160" height="100" rx="10" fill="#1b1f29" stroke="${col}" stroke-width="5"/><path d="M-80 -50 L0 10 L80 -50" stroke="${col}" stroke-width="5" fill="none"/></g>`;
}
function card(x, y, w, h, col = AM, op = 1) { return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28" fill="#141821" fill-opacity="0.95" stroke="${col}" stroke-width="4" opacity="${op}"/>`; }
function bigNum(x, y, sz, s, col = AM, op = 1, a = 'middle') { return T(x, y, sz, s, { c: col, a, op }); }
function strikeLine(x1, y, x2, p, col = RD) { return `<line x1="${x1}" y1="${y}" x2="${x1 + (x2 - x1) * clamp(p)}" y2="${y}" stroke="${col}" stroke-width="8" stroke-linecap="round"/>`; }

// ---------- arka plan ve başlık
const STARS = Array.from({ length: 70 }, (_, i) => [(i * 733) % W, (i * 397) % H, 1 + (i % 3), (i * 0.37) % 1]);
function bg(t) {
  let o = `<rect width="${W}" height="${H}" fill="${BG}"/>`;
  o += `<defs><radialGradient id="vg" cx="0.5" cy="0.45" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient></defs>`;
  for (const [x, y, r, p] of STARS) o += `<circle cx="${(x + t * 4 * (p + 0.2)) % W}" cy="${y}" r="${r}" fill="${TX}" opacity="${0.06 + 0.08 * Math.abs(Math.sin(t * 0.5 + p * 9))}"/>`;
  return o;
}
const CHAP = [['KANCA', 0, ''], ['KURAL', 25.7, 'BABİL\'İN KURALI'], ['2001', S(29), '2001 KRİZİ'], ['SIKICI', S(38), 'SIKICI YILLAR'], ['2013', S(50), '2013: ŞÜPHE'], ['PATLAMA', S(59), 'PATLAMA'], ['YARIŞ', S(69), 'ALTIN MI, MAAŞ MI?'], ['SONUÇ', S(83), 'KASAYI AÇIYORUZ'], ['OBUR', S(94), 'SEÇMEDİĞİN YOLLAR'], ['UYARI', S(105), 'DÜRÜST OLALIM'], ['KAPANIS', S(111), 'SENİN KARARIN']];
function header(t) {
  if (t < 25.5) return '';
  let c = CHAP[0]; for (const x of CHAP) if (t >= x[1]) c = x;
  const a = ease((t - 25.5) / 0.6);
  let o = `<g opacity="${a}">` + T(60, 70, 30, 'SEÇMEDİĞİN', { c: TX, ls: 2 }) + T(272, 70, 30, 'YOL', { c: AM, ls: 2 });
  const ca = ease((t - c[1]) / 0.5);
  if (c[2]) o += `<g opacity="${ca}"><rect x="${W - 60 - c[2].length * 17 - 40}" y="36" width="${c[2].length * 17 + 40}" height="50" rx="25" fill="#141821" stroke="${MU}" stroke-width="2"/>` + T(W - 80, 71, 26, c[2], { a: 'end', c: MU, ls: 1 }) + '</g>';
  return o + '</g>';
}
// alt yazı: cümleyi en fazla 2 satır x 46 karakterlik parçalara böl
const SUBS = [];
(function buildSubs() {
  const V = s => (s.match(/[aeıioöuüAEIİOÖUÜâ]/g) || []).length || 1;
  for (const r of SENT) {
    const words = r.text.split(' '); const chunks = []; let cur = '';
    for (const w of words) { if ((cur + ' ' + w).trim().length > 46 && cur) { chunks.push(cur.trim()); cur = w; } else cur += ' ' + w; }
    if (cur.trim()) chunks.push(cur.trim());
    const groups = []; for (let i = 0; i < chunks.length; i += 2) groups.push(chunks.slice(i, i + 2));
    const tot = groups.reduce((a, g) => a + V(g.join(' ')), 0); let acc = r.t0; const span = r.t1 - r.t0;
    for (const g of groups) { const d = span * V(g.join(' ')) / tot; SUBS.push([acc, acc + d, g]); acc += d; }
  }
})();
function subtitle(t) {
  const s = SUBS.find(x => t >= x[0] && t < x[1] + 0.15); if (!s) return '';
  const lines = s[2]; const w = Math.max(...lines.map(l => l.length)) * 21 + 70; const h = lines.length * 48 + 28;
  const y0 = H - 70 - h;
  let o = `<rect x="${960 - w / 2}" y="${y0}" width="${w}" height="${h}" rx="16" fill="#000" fill-opacity="0.62"/>`;
  lines.forEach((l, i) => o += T(960, y0 + 50 + i * 48, 38, l, { a: 'middle', c: TX }));
  return o;
}

// ---------- veri yardımcıları
const M = DATA.monthly; // [yıl, gram, ödenen, maaş]
function atYear(y) { let r = M[0]; for (const m of M) if (m[0] <= y) r = m; return r; }
const G = DATA.G;
function gAvg(y) { const Y = Math.min(2026, Math.max(2000, Math.floor(y))); return G[Y]; }
// yolculuk boyunca yıl imleci
const YK = [[S(29), 2000.95], [S(30), 2001.05], [S(37) + 3, 2001.95], [S(38), 2004.6], [S(41), 2005.4], [S(45), 2007.95], [S(49) + 1, 2008.6], [S(50), 2012.4], [S(52) + 1, 2013.5], [S(58) + 1.5, 2013.95], [S(59), 2018.55], [S(62), 2018.9], [S(63), 2021.5], [S(64), 2021.95], [S(65) + 2, 2022.5], [S(65) + 5, 2024.5], [S(65) + 8, 2025.6], [S(66), 2026.8]];
function yearAt(t) { if (t <= YK[0][0]) return YK[0][1]; for (let i = 1; i < YK.length; i++) if (t < YK[i][0]) { const [a, ya] = YK[i - 1], [b, yb] = YK[i]; return ya + (yb - ya) * eio((t - a) / (b - a)); } return YK[YK.length - 1][1]; }

// ---------- sahneler
const SC = [];
const add = (a, b, f) => SC.push({ a, b, f });

// KANCA
add(0, S(1) + 0.2, (t, a) => { const lt = t - 0; let o = road(960, 900, 1.2) + figure(960, 650 + 30, 0.9, TX, ease(lt / 0.6)); o += `<g opacity="${ease(lt / 0.4)}">` + T(960, 230, 150, '2000', { a: 'middle', c: AM }) + '</g>'; return `<g opacity="${a}">${o}</g>`; });
add(S(1), S(2) + 0.1, (t, a) => {
  const lt = t - S(1); let o = envelope(620, 520, 2.2, 1) + T(620, 700, 40, 'MAAŞ', { a: 'middle', c: MU });
  const cut = ease((lt - 1.2) / 0.8); const dx = cut * 520;
  o += `<g transform="translate(${dx} ${-cut * 40})">${envelope(620 + 170, 520, 0.9, 1, AM)}${T(620 + 170, 610, 44, '%10', { a: 'middle', c: AM })}</g>`;
  o += goldBar(1340, 520, 2.0, ease((lt - 2.6) / 0.6)) + T(1340, 680, 44, 'ALTIN', { a: 'middle', c: AM, op: ease((lt - 2.6) / 0.6) });
  return `<g opacity="${a}">${o}</g>`;
});
add(S(2), S(3) + 0.1, (t, a) => { const lt = t - S(2), k = clamp(lt / 2.6); const y = Math.floor(2000 + 26 * eio(k)); let o = card(660, 300, 600, 420, MU) + `<rect x="660" y="300" width="600" height="90" rx="28" fill="${RD}"/>` + T(960, 365, 46, 'TAKVİM', { a: 'middle' }) + T(960, 620, 190, String(y), { a: 'middle', c: y === 2026 ? AM : TX }); o += T(960, 820, 40, 'her ay · hiç bırakmadan', { a: 'middle', c: MU, serif: true, it: true, n: true }); return `<g opacity="${a}">${o}</g>`; });
add(S(3), S(4) + 0.1, (t, a) => { const lt = t - S(3); const v = 2040000 * eio(lt / 2.2); let o = goldBar(960, 330, 2.4) + bigNum(960, 620, 170, '≈ ' + tr(Math.round(v / 1000) * 1000) + ' TL'); return `<g opacity="${a}">${o}</g>`; });
add(S(4), S(6) - 0.1, (t, a) => { const lt = t - S(4); const sh = 1 - 0.45 * ease((lt - 1.0) / 0.8); let o = `<g transform="translate(960 540) scale(${sh}) translate(-960 -540)" opacity="${1 - 0.5 * ease((lt - 1.0) / 0.8)}">${bigNum(960, 560, 170, '≈ 2.040.000 TL')}</g>`; o += `<g opacity="${ease((lt - 1.3) / 0.5)}">` + T(960, 780, 64, 'Ama asıl mesele bu sayı değil.', { a: 'middle', serif: true, it: true }) + '</g>'; return `<g opacity="${a}">${o}</g>`; });
function raceChart(x0, y0, w, h, p, labels = true) { // altın vs maaş, log ölçek, 2000→2026
  const years = Object.keys(G).map(Number); const w0 = 84.2; let pa = '', pw = '';
  const yy = v => y0 + h - (Math.log10(v) / Math.log10(1300)) * h;
  const n = Math.max(2, Math.ceil(years.length * clamp(p)));
  years.slice(0, n).forEach((Y, i) => { const x = x0 + w * (Y - 2000) / 26.8; const ga = (Y === 2026 ? DATA.today : G[Y]) / 5.55; const wa = atYear(Y + 0.9)[3] / w0; pa += `${i ? 'L' : 'M'}${x} ${yy(ga)} `; pw += `${i ? 'L' : 'M'}${x} ${yy(wa)} `; });
  let o = `<line x1="${x0}" y1="${y0 + h}" x2="${x0 + w}" y2="${y0 + h}" stroke="${MU}" stroke-width="2"/>`;
  o += `<path d="${pw}" stroke="${TX}" stroke-width="7" fill="none" stroke-linejoin="round"/><path d="${pa}" stroke="${AM}" stroke-width="9" fill="none" stroke-linejoin="round"/>`;
  if (labels) { o += T(x0, y0 + h + 44, 28, '2000', { c: MU, n: true }) + T(x0 + w, y0 + h + 44, 28, '2026', { c: MU, a: 'end', n: true }); }
  return o;
}
add(S(6), S(8) - 0.3, (t, a) => { const lt = t - S(6); let o = raceChart(460, 260, 1000, 480, lt / 5); o += `<g opacity="${ease((lt - 1) / 0.5)}"><rect x="470" y="250" width="26" height="26" fill="${AM}"/>` + T(510, 274, 32, 'ALTIN', { c: AM }) + `<rect x="680" y="250" width="26" height="26" fill="${TX}"/>` + T(720, 274, 32, 'MAAŞ', { c: TX }) + '</g>'; o += `<g opacity="${ease((lt - 4) / 0.5)}">` + T(1500, 520, 220, '?', { c: GH, a: 'middle' }) + '</g>'; return `<g opacity="${a}">${o}</g>`; });
add(S(8), S(9) + 0.3, (t, a) => { const lt = t - S(8); let o = road(960, 620, 0.85) + `<g opacity="${ease(lt / 0.4)}">` + T(960, 740, 84, 'SEÇMEDİĞİN', { a: 'middle' }) + T(960, 830, 84, 'YOL', { a: 'middle', c: AM }) + '</g>'; return `<g opacity="${a}">${o}</g>`; });

// KURAL
add(S(9), S(12) + 0.1, (t, a) => { const lt = t - S(9); const k = ease((lt - 1.5) / 0.7); let o = `<g opacity="${k}" transform="translate(960 520)"><rect x="-200" y="-260" width="400" height="520" rx="16" fill="#3a2a1a" stroke="${AM}" stroke-width="6"/><rect x="-170" y="-230" width="340" height="460" rx="8" fill="none" stroke="#c98a2a" stroke-width="3"/>` + T(0, -60, 44, "BABİL'İN", { a: 'middle', c: AM }) + T(0, -5, 44, 'EN ZENGİN', { a: 'middle', c: AM }) + T(0, 50, 44, 'ADAMI', { a: 'middle', c: AM }) + T(0, 170, 26, '1926', { a: 'middle', c: '#c98a2a' }) + '</g>'; o += `<g opacity="${ease(lt / 0.4) * (1 - k * 0.6)}">` + T(960, 180, 56, 'Bu fikir yeni değil.', { a: 'middle', serif: true, it: true }) + '</g>'; return `<g opacity="${a}">${o}</g>`; });
add(S(12), S(14) + 0.1, (t, a) => {
  const lt = t - S(12); const parts = [[0.10, AM, '%10', 'SANA', 0.3], [0.70, '#3c4458', '%70', 'YAŞAM', 7.8], [0.20, '#5a3a40', '%20', 'BORÇ', 9.6]];
  let o = T(960, 260, 54, 'Kazandığının onda biri, önce sana.', { a: 'middle', serif: true, it: true, op: ease(lt / 0.4) });
  let x = 260; const tw = 1400;
  for (const [f, c, p, l, at] of parts) { const k = ease((lt - at) / 0.6); const w = tw * f; o += `<g opacity="${k}"><rect x="${x}" y="420" width="${w * k}" height="200" fill="${c}" stroke="${BG}" stroke-width="6"/>` + T(x + w / 2, 535, 60, p, { a: 'middle', c: c === AM ? BG : TX }) + T(x + w / 2, 680, 36, l, { a: 'middle', c: c === AM ? AM : MU }) + '</g>'; x += w; }
  return `<g opacity="${a}">${o}</g>`;
});
add(S(14), S(16) + 0.1, (t, a) => { const lt = t - S(14); let o = card(360, 300, 1200, 420, MU) + T(960, 440, 64, 'Önce harca, kalanı biriktir.', { a: 'middle', c: MU }) + strikeLine(480, 420, 1440, (lt - 1.5) / 0.6) + `<g opacity="${ease((lt - S(15) + S(14)) / 0.4)}">` + T(960, 610, 72, 'Önce biriktir, kalanı harca.', { a: 'middle', c: AM }) + '</g>'; return `<g opacity="${a}">${o}</g>`; });
add(S(16), S(19) + 0.1, (t, a) => {
  const lt = t - S(16); let o = T(960, 250, 60, 'Ocak 2000\'de başlasaydın?', { a: 'middle', serif: true, it: true, op: ease(lt / 0.4) });
  const k1 = ease((t - S(17) - 1.5) / 0.5), k2 = ease((t - S(17) - 3.5) / 0.5), k3 = ease((t - S(18)) / 0.4);
  o += `<g opacity="${k1}">${card(300, 380, 600, 300, TX)}${envelope(600, 490, 1.1)}${T(600, 630, 40, 'HER AYIN MAAŞI', { a: 'middle' })}</g>`;
  o += `<g opacity="${k2}">${card(1020, 380, 600, 300, AM)}${goldBar(1320, 500, 1.2)}${T(1320, 630, 40, 'HER YILIN ALTIN FİYATI', { a: 'middle', c: AM })}</g>`;
  o += `<g opacity="${k3}" transform="translate(960 780) rotate(-4)"><rect x="-210" y="-48" width="420" height="88" rx="14" fill="none" stroke="${GR}" stroke-width="6"/>${T(0, 18, 48, 'GERÇEK VERİ', { a: 'middle', c: GR })}</g>`;
  return `<g opacity="${a}">${o}</g>`;
});
add(S(19), S(24) + 0.1, (t, a) => {
  const lt = t - S(19); let o = T(960, 250, 64, 'OCAK 2000 · NET ASGARİ ÜCRET', { a: 'middle', c: MU, op: ease(lt / 0.4) });
  const k = ease((t - S(20)) / 0.5); o += `<g opacity="${k}">` + T(960, 520, 170, '82.417.500 TL', { a: 'middle' }) + '</g>';
  if (t > S(22)) { const z = ease((t - S(22) - 1.5) / 0.6); o = T(960, 250, 64, '2005: PARADAN 6 SIFIR ATILDI', { a: 'middle', c: RD, op: ease((t - S(22)) / 0.4) });
    o += T(960, 480, 140, '82.417.500 TL', { a: 'middle', op: 1 - 0.6 * z }) + `<g opacity="${z}">` + T(960, 610, 70, '÷ 1.000.000', { a: 'middle', c: RD }) + '</g>';
    o += `<g opacity="${ease((t - S(23)) / 0.4)}">` + T(960, 800, 130, '= 82,42 TL', { a: 'middle', c: AM }) + '</g>'; }
  return `<g opacity="${a}">${o}</g>`;
});
add(S(24), S(27) + 0.1, (t, a) => {
  const lt = t - S(24); let o = '';
  const k1 = ease(lt / 0.4), k2 = ease((t - S(25)) / 0.4), k3 = ease((t - S(26)) / 0.4);
  o += `<g opacity="${k1}">${card(140, 340, 480, 300, TX)}${T(380, 450, 36, 'MAAŞIN %10\'U', { a: 'middle', c: MU })}${T(380, 570, 100, '8,24 TL', { a: 'middle' })}</g>`;
  o += `<g opacity="${k2}">${T(700, 520, 110, '÷', { a: 'middle', c: MU })}${card(780, 340, 480, 300, AM)}${T(1020, 450, 36, 'GRAM ALTIN (2000 ORT.)', { a: 'middle', c: MU })}${T(1020, 570, 100, '5,55 TL', { a: 'middle', c: AM })}</g>`;
  o += `<g opacity="${k3}">${T(1340, 520, 110, '=', { a: 'middle', c: MU })}${card(1420, 340, 400, 300, GH)}${T(1620, 450, 36, 'İLK AY', { a: 'middle', c: MU })}${T(1620, 570, 100, '1,48 g', { a: 'middle', c: GH })}</g>`;
  return `<g opacity="${a}">${o}</g>`;
});
add(S(27), S(29) + 0.2, (t, a) => { const lt = t - S(27); const wx = 500 + 700 * eio((lt - 0.5) / 2.5); let o = `<g opacity="${ease(lt / 0.4)}"><rect x="1200" y="330" width="460" height="420" fill="#1b1f29" stroke="${AM}" stroke-width="5"/><rect x="1180" y="280" width="500" height="90" rx="10" fill="${AM}"/>${T(1430, 342, 52, 'KUYUMCU', { a: 'middle', c: BG })}<rect x="1360" y="540" width="140" height="210" fill="#0d0f14" stroke="${AM}" stroke-width="4"/>${goldBar(1290, 470, 0.6)}${goldBar(1570, 470, 0.6)}</g>` + figure(wx, 750, 1.1); return `<g opacity="${a}">${o}</g>`; });

// YOLCULUK (2001 → bugün): grafik + kasa + yıl
const J0 = S(29), J1 = S(69);
function journey(t) {
  const a = win(t, J0, J1 + 0.3, 0.5); if (a <= 0) return '';
  const y = yearAt(t); const row = atYear(y); const gram = row[1], paid = row[2];
  const price = y >= 2026.5 ? DATA.today : gAvg(y); const value = gram * price;
  let o = `<g opacity="${a}">`;
  // grafik (sol)
  const x0 = 120, y0 = 200, w = 1080, h = 560;
  const yy = v => y0 + h - (Math.log10(v / 4) / Math.log10(7000 / 4)) * h;
  const xx = Y => x0 + w * (Y - 2000) / 27;
  o += `<rect x="${x0 - 40}" y="${y0 - 60}" width="${w + 80}" height="${h + 140}" rx="24" fill="#11141c" stroke="#232838" stroke-width="2"/>`;
  o += T(x0, y0 - 18, 28, 'GRAM ALTIN · YILLIK ORTALAMA (TL, log ölçek)', { c: MU, n: true });
  for (const v of [5, 50, 500, 5000]) o += `<line x1="${x0}" y1="${yy(v)}" x2="${x0 + w}" y2="${yy(v)}" stroke="#232838" stroke-width="2"/>` + T(x0 + w + 10, yy(v) + 8, 22, tr(v), { c: MU, n: true });
  for (const Y of [2000, 2005, 2010, 2015, 2020, 2025]) o += T(xx(Y), y0 + h + 40, 24, String(Y), { c: MU, a: 'middle', n: true });
  let path = ''; const Ys = Object.keys(G).map(Number).filter(Y => Y <= y);
  Ys.forEach((Y, i) => { const v = (Y === 2026 && y >= 2026.5) ? DATA.today : G[Y]; path += `${i ? 'L' : 'M'}${xx(Y + 0.5)} ${yy(v)} `; });
  if (Ys.length) { const last = Ys[Ys.length - 1]; o += `<path d="${path}" stroke="${AM}" stroke-width="7" fill="none" stroke-linejoin="round"/><circle cx="${xx(last + 0.5)}" cy="${yy(Ys.length && last === 2026 && y >= 2026.5 ? DATA.today : G[last])}" r="12" fill="${AM}"/>`; }
  o += `<line x1="${xx(y)}" y1="${y0}" x2="${xx(y)}" y2="${y0 + h}" stroke="${GH}" stroke-width="2" stroke-dasharray="6 8" opacity="0.6"/>`;
  // kasa (sağ)
  const kx = 1300, ky = 140;
  o += card(kx, ky, 540, 700, AM);
  o += T(kx + 270, ky + 70, 34, 'KASAN', { a: 'middle', c: AM, ls: 3 });
  o += T(kx + 270, ky + 190, 120, String(Math.floor(y)), { a: 'middle' });
  o += `<line x1="${kx + 40}" y1="${ky + 230}" x2="${kx + 500}" y2="${ky + 230}" stroke="#2a3040" stroke-width="2"/>`;
  o += T(kx + 50, ky + 300, 30, 'BİRİKEN ALTIN', { c: MU, n: true }) + T(kx + 490, ky + 300, 44, fmt(gram, 1) + ' g', { a: 'end', c: AM });
  o += T(kx + 50, ky + 380, 30, 'CEBİNDEN ÇIKAN', { c: MU, n: true }) + T(kx + 490, ky + 380, 44, tr(paid) + ' TL', { a: 'end' });
  o += T(kx + 50, ky + 460, 30, 'ALTININ DEĞERİ', { c: MU, n: true }) + T(kx + 490, ky + 460, 44, tr(value) + ' TL', { a: 'end', c: GR });
  // gram yığını görseli
  const n = Math.min(24, Math.round(gram / 14));
  for (let i = 0; i < n; i++) { const c = i % 6, r = Math.floor(i / 6); o += goldBar(kx + 120 + c * 60 + (r % 2) * 30, ky + 640 - r * 34, 0.3); }
  return o + '</g>';
}
// yolculuk üstü olay kartları
function evCard(t, a0, a1, title, sub, col = RD, x = 120, y = 860) {
  const a = win(t, a0, a1, 0.35); if (a <= 0) return '';
  return `<g opacity="${a}">` + `<rect x="${x}" y="${y - 70}" width="${title.length * 26 + 80}" height="64" rx="12" fill="${col}"/>` + T(x + 30, y - 25, 40, title, { c: col === AM ? BG : TX }) + (sub ? T(x + title.length * 26 + 110, y - 25, 34, sub, { c: TX, serif: true, it: true, n: true }) : '') + '</g>';
}
function journeyOverlays(t) {
  let o = '';
  o += evCard(t, S(30), S(34), 'ŞUBAT 2001 KRİZİ', '', RD);
  const hl = [['KUR SERBEST BIRAKILDI', S(32)], ['DOLAR UÇTU', S(32) + 1.4], ['BANKALAR BATIYOR', S(32) + 2.8]];
  hl.forEach(([s, at], i) => { const a = win(t, at, S(33) + 0.2); if (a > 0) o += `<g opacity="${a}" transform="translate(${260 + i * 40} ${300 + i * 110}) rotate(${-3 + i * 3})"><rect x="0" y="-50" width="${s.length * 30 + 60}" height="80" fill="#f2efe8"/>${T(30, 10, 46, s, { c: '#111' })}</g>`; });
  const sat = win(t, S(33), S(34) + 0.6); if (sat > 0) for (let i = 0; i < 6; i++) { const x = 200 + (i % 3) * 330, y = 330 + Math.floor(i / 3) * 220; o += `<g opacity="${sat * ease((t - S(33) - i * 0.25) / 0.3)}"><ellipse cx="${x}" cy="${y}" rx="120" ry="60" fill="#f2efe8"/><path d="M${x - 20} ${y + 50} L${x - 50} ${y + 100} L${x + 10} ${y + 55} Z" fill="#f2efe8"/>${T(x, y + 16, 52, 'SAT!', { a: 'middle', c: RD })}</g>`; }
  o += evCard(t, S(34), S(35), 'SEN SATMIYORSUN', '', AM);
  o += evCard(t, S(35), S(36), 'ALTIN ORT. 5,55 → 10,37 TL', '×1,9', AM);
  o += evCard(t, S(36), S(37), 'AYLIK ALIM 1,48 g → 0,99 g', '⅔', GH);
  const les = win(t, S(37), S(38)); if (les > 0) o += `<g opacity="${les}">${card(240, 300, 1440, 420, AM)}${T(960, 420, 40, 'İLK DERS', { a: 'middle', c: AM, ls: 4 })}${T(960, 530, 60, 'Kriz kasandakini büyütür,', { a: 'middle', serif: true, it: true })}${T(960, 620, 60, 'cebindekini küçültür.', { a: 'middle', serif: true, it: true, c: GH })}</g>`;
  // 2005: sıfırlar
  const z = win(t, S(38), S(41)); if (z > 0) { o += `<g opacity="${z}">${card(240, 260, 1440, 500, RD)}${T(960, 360, 44, '1 OCAK 2005', { a: 'middle', c: RD, ls: 3 })}`; const k = ease((t - S(39)) / 1.2); o += T(960, 520, 120, '1.000.000 TL', { a: 'middle', op: 1 - k }) + T(960, 520, 120, '1 YTL', { a: 'middle', c: AM, op: k }); o += `<g opacity="${ease((t - S(40)) / 0.4)}">${T(960, 660, 52, 'Maaş 350 TL · Senin payın 35 TL', { a: 'middle', c: TX })}</g></g>`; }
  // sıkıcı yıllar: arkadaşlar
  const fr = win(t, S(43), S(44) + 0.2); if (fr > 0) { o += `<g opacity="${fr}">${card(240, 300, 1440, 440, MU)}`; ['ARABA', 'TATİL', 'YENİ TELEFON'].forEach((s, i) => o += figure(480 + i * 380, 640, 0.8, MU) + T(480 + i * 380, 400, 40, s, { a: 'middle', c: MU })); o += '</g>'; }
  o += evCard(t, S(44), S(45), 'HER AY · %10 · HİÇ BIRAKMADAN', '', AM);
  o += evCard(t, S(45), S(48), '2008 KÜRESEL KRİZ', '', RD);
  const v8 = win(t, S(48), S(50)); if (v8 > 0) { const k = ease((t - S(48)) / 1.2); o += `<g opacity="${v8}">${card(240, 300, 1440, 440, AM)}${T(600, 400, 40, 'CEBİNDEN ÇIKAN', { a: 'middle', c: MU })}${T(1320, 400, 40, 'ALTININ DEĞERİ', { a: 'middle', c: MU })}<rect x="450" y="${700 - 0}" width="0" height="0"/><rect x="450" y="${700 - 160 * k + 30}" width="300" height="${160 * k - 30 > 0 ? 160 * k - 30 : 0}" fill="${TX}"/><rect x="1170" y="${700 - 220 * k + 30}" width="300" height="${220 * k - 30 > 0 ? 220 * k - 30 : 0}" fill="${GR}"/>${T(600, 665 - 160 * k, 52, '3.048 TL', { a: 'middle', op: k })}${T(1320, 665 - 220 * k, 52, '5.508 TL', { a: 'middle', op: k })}${T(960, 600, 44, '≈ ×1,8', { a: 'middle', c: AM })}</g>`; }
  // 2013
  o += evCard(t, S(50), S(54), '2013 · ALTIN DÜŞÜYOR', '96,58 → 86,15 TL', RD);
  const hd = win(t, S(53), S(54) + 0.3); if (hd > 0) o += `<g opacity="${hd}" transform="translate(300 380) rotate(-3)"><rect x="0" y="-60" width="820" height="100" fill="#f2efe8"/>${T(30, 10, 56, 'ALTIN DEVRİ BİTTİ Mİ?', { c: '#111' })}</g>`;
  const fk = win(t, S(54), S(57) + 0.5); if (fk > 0) { const lt = t - S(54); o += `<g opacity="${fk}"><rect x="0" y="120" width="${W}" height="${H - 120}" fill="${BG}" opacity="0.92"/>${road(960, 1000, 1.25)}${figure(960 - 300 * ease((lt - 3) / 2.5), 1000 - 330 * ease((lt - 3) / 2.5) - 0, 0.75, AM)}${figure(960 + 300 * ease((lt - 3) / 2.5), 1000 - 330 * ease((lt - 3) / 2.5), 0.75, GH, 0.6)}${T(560, 300, 44, 'SEN: DEVAM', { a: 'middle', c: AM, op: ease((lt - 5) / 0.5) })}${T(1360, 300, 44, 'BIRAKAN', { a: 'middle', c: GH, op: ease((lt - 5) / 0.5) })}</g>`; }
  // patlama
  o += evCard(t, S(59), S(62), 'AĞUSTOS 2018 · KUR ŞOKU', '', RD);
  o += evCard(t, S(62), S(64), '2021', '286 gram · 147 bin TL', AM);
  o += evCard(t, S(64), S(67), 'SON DÖRT YIL', '950 → 2.525 → 4.413 → 6.402 TL', AM);
  const calm = win(t, S(67), S(69) + 0.2); if (calm > 0) o += `<g opacity="${calm}">${card(240, 300, 1440, 420, AM)}${T(960, 470, 64, 'Senin yaptığın şey hiç değişmedi.', { a: 'middle', serif: true, it: true })}${T(960, 590, 60, 'Değişen, zamanın senin için çalışması.', { a: 'middle', serif: true, it: true, c: AM, op: ease((t - S(68)) / 0.4) })}</g>`;
  return o;
}

// YARIŞ
add(S(69), S(71) + 0.1, (t, a) => { const lt = t - S(69); let o = T(960, 220, 64, 'Altın mı daha hızlı koştu, maaşın mı?', { a: 'middle', serif: true, it: true }) + raceChart(360, 320, 1200, 520, lt / 4); o += `<g opacity="${ease((lt - 1) / 0.5)}"><rect x="370" y="300" width="26" height="26" fill="${AM}"/>${T(410, 324, 32, 'ALTIN', { c: AM })}<rect x="580" y="300" width="26" height="26" fill="${TX}"/>${T(620, 324, 32, 'ASGARİ ÜCRET', { c: TX })}</g>`; return `<g opacity="${a}">${o}</g>`; });
function pile(cx, by, n, s = 0.42) { let o = ''; let k = 0; for (let r = 0; k < n; r++) { const cnt = Math.max(1, 6 - r); for (let c = 0; c < cnt && k < n; c++, k++) o += goldBar(cx + (c - (cnt - 1) / 2) * 80 * s / 0.42 * 0.95, by - r * 30 * s / 0.42, s); } return o; }
add(S(71), S(76) + 0.1, (t, a) => {
  const lt = t - S(71); let o = '';
  o += `<g opacity="${ease(lt / 0.4)}">${card(160, 220, 760, 620, MU)}${T(540, 300, 44, '2000 · 1 MAAŞ', { a: 'middle', c: MU })}${pile(540, 660, 15, 0.42)}${T(540, 790, 84, '15,2 g', { a: 'middle', c: AM })}</g>`;
  const k = ease((t - S(72)) / 0.5); o += `<g opacity="${k}">${card(1000, 220, 760, 620, MU)}${T(1380, 300, 44, '2026 · 1 MAAŞ', { a: 'middle', c: MU })}${pile(1380, 660, 4, 0.42)}${T(1380, 790, 84, '4,4 g', { a: 'middle', c: GH })}</g>`;
  const e = ease((t - S(73)) / 0.4); o += `<g opacity="${e}">${T(960, 960 - 0, 0, '')}</g>`;
  const r = ease((t - S(75)) / 0.4); if (r > 0) o += `<g opacity="${r}" transform="translate(960 530) scale(${pop((t - S(75)) / 0.4)})"><circle r="120" fill="${AM}"/>${T(0, 30, 90, '3,5×', { a: 'middle', c: BG })}</g>`;
  const ae = win(t, S(73), S(75)); if (ae > 0) o += `<g opacity="${ae}">${T(960, 540, 56, t < S(74) ? 'AYNI EMEK' : 'AYNI BİR AY', { a: 'middle', c: TX })}</g>`;
  return `<g opacity="${a}">${o}</g>`;
});
add(S(76), S(81) + 0.1, (t, a) => {
  const lt = t - S(76); let o = '';
  const k1 = ease((t - S(77)) / 0.4), k2 = ease((t - S(78)) / 0.4), k3 = ease((t - S(79)) / 0.4), k4 = ease((t - S(80)) / 0.4);
  const c1 = Math.round(1154 * eio((t - S(77)) / 1.5)), c2 = Math.round(333 * eio((t - S(78)) / 1.5));
  o += `<g opacity="${k1}">${card(200, 260, 680, 360, AM)}${T(540, 340, 40, 'GRAM ALTIN', { a: 'middle', c: MU })}${T(540, 520, 150, '×' + tr(c1), { a: 'middle', c: AM })}</g>`;
  o += `<g opacity="${k2}">${card(1040, 260, 680, 360, TX)}${T(1380, 340, 40, 'ASGARİ ÜCRET', { a: 'middle', c: MU })}${T(1380, 520, 150, '×' + tr(c2), { a: 'middle' })}</g>`;
  o += `<g opacity="${k3}">${T(960, 760, 80, 'Altın, maaşı ≈ 3,5 kat geçti', { a: 'middle', c: AM })}</g>`;
  o += `<g opacity="${k4}">${T(960, 860, 56, 'yılda ortalama ≈ %5', { a: 'middle', c: GH, serif: true, it: true })}</g>`;
  return `<g opacity="${a}">${o}</g>`;
});
add(S(81), S(83) + 0.2, (t, a) => { let o = T(960, 470, 72, 'Müthiş bir fark değil.', { a: 'middle', serif: true, it: true }) + `<g opacity="${ease((t - S(82)) / 0.4)}">${T(960, 600, 56, '"Altın sadece korur" diyenlerin', { a: 'middle', c: MU })}${T(960, 680, 56, 'söylediğinden daha iyi.', { a: 'middle', c: AM })}</g>`; return `<g opacity="${a}">${o}</g>`; });

// SONUÇ
add(S(83), S(86) + 0.1, (t, a) => {
  const lt = t - S(83); let o = T(960, 220, 60, 'EKİM 2026', { a: 'middle', c: MU, ls: 4 }) + `<g opacity="${ease((t - S(84)) / 0.4)}">${T(960, 300, 54, '26 yıl · 322 ay', { a: 'middle', serif: true, it: true })}</g>`;
  const d = ease((t - S(85)) / 1.2); // kasa kapağı
  o += `<rect x="660" y="380" width="600" height="480" rx="24" fill="#1b1f29" stroke="${AM}" stroke-width="6"/>${pile(960, 760, 18, 0.5)}`;
  o += `<g transform="translate(660 380) scale(${1 - 0.92 * d} 1)"><rect width="600" height="480" rx="24" fill="#2a2f3d" stroke="${MU}" stroke-width="6"/><circle cx="300" cy="240" r="90" fill="none" stroke="${MU}" stroke-width="12"/><path d="M300 150 L300 330 M210 240 L390 240" stroke="${MU}" stroke-width="10"/></g>`;
  return `<g opacity="${a}">${o}</g>`;
});
add(S(86), S(88) + 0.1, (t, a) => { const k = ease((t - S(87)) / 0.5); let o = goldBar(960, 300, 2.2) + T(960, 540, 150, '318,8 gram', { a: 'middle', c: AM }) + `<g opacity="${k}">${T(960, 720, 120, '≈ 2.040.000 TL', { a: 'middle' })}</g>`; return `<g opacity="${a}">${o}</g>`; });
function envGrid(x0, y0, n, cols, s, col, k) { let o = ''; for (let i = 0; i < n; i++) { if (i / n > k) break; const c = i % cols, r = Math.floor(i / cols); o += envelope(x0 + c * 46, y0 + r * 34, s, 1, col); } return o; }
add(S(88), S(93) + 0.1, (t, a) => {
  let o = T(960, 200, 52, 'Asıl hesap: asgari ücretle', { a: 'middle', serif: true, it: true, c: MU });
  const k1 = ease((t - S(90)) / 1.5), k2 = ease((t - S(91)) / 2.5);
  o += `<g opacity="${ease((t - S(89)) / 0.4)}">${card(140, 260, 760, 560, TX)}${T(520, 330, 40, 'AYIRDIĞIN', { a: 'middle', c: MU })}${envGrid(250, 400, 32, 12, 0.24, TX, k1)}${T(520, 770, 110, Math.round(32 * k1) + ' MAAŞ', { a: 'middle' })}</g>`;
  o += `<g opacity="${ease((t - S(91)) / 0.4)}">${card(1020, 260, 760, 560, AM)}${T(1400, 330, 40, 'GERİ ALDIĞIN', { a: 'middle', c: MU })}${envGrid(1130, 400, 73, 12, 0.24, AM, k2)}${T(1400, 770, 110, Math.round(73 * k2) + ' MAAŞ', { a: 'middle', c: AM })}</g>`;
  const k3 = win(t, S(93), S(94) + 0.3); if (k3 > 0) o += `<g opacity="${k3}"><rect x="0" y="120" width="${W}" height="${H - 120}" fill="${BG}" opacity="0.9"/>${T(960, 520, 170, '≈ 6 YIL', { a: 'middle', c: AM })}${T(960, 640, 56, 'çalışmadan yaşayabileceğin kadar', { a: 'middle', serif: true, it: true })}</g>`;
  return `<g opacity="${a}">${o}</g>`;
});
add(S(93), S(94) + 0.3, () => '');

// ÖBÜR YOL
add(S(94), S(105) + 0.2, (t, a) => {
  const lt = t - S(94); let o = T(960, 200, 64, 'Peki seçmediğin yol neydi?', { a: 'middle', serif: true, it: true, op: ease(lt / 0.4) });
  const lanes = [['HARCADIN', S(95), TX, 0, '0'], ['YASTIK ALTI (TL)', S(99), GH, 4.1, '4 maaş'], ['ALTIN', S(102), AM, 72.7, '73 maaş']];
  lanes.forEach(([l, at, c, v, txt], i) => {
    const k = ease((t - at) / 0.5); if (k <= 0) return; const y = 330 + i * 190; const bw = 1100 * (v / 73) * eio((t - at - 0.3) / 1.5);
    o += `<g opacity="${k}">${T(150, y + 70, 44, l, { c })}<rect x="560" y="${y + 20}" width="${Math.max(6, bw)}" height="80" rx="10" fill="${c}"/>${T(580 + Math.max(6, bw), y + 78, 52, txt, { c })}</g>`;
  });
  const it = win(t, S(96), S(97) + 1); if (it > 0) o += `<g opacity="${it}">${['bir yemek', 'bir kıyafet', 'bir hafta sonu'].map((s, i) => T(700 + i * 330, 470, 36, s, { c: MU, serif: true, it: true, a: 'middle', op: ease((t - S(96) - i * 0.7) / 0.3) })).join('')}</g>`;
  const pl = win(t, S(100), S(102)); if (pl > 0) o += `<g opacity="${pl}">${T(1400, 610, 40, 'biriktirdiğin: 115.770 TL', { c: MU, a: 'middle', serif: true, it: true })}</g>`;
  const tk = ease((t - S(104)) / 0.5); if (tk > 0) o += `<g opacity="${tk}" transform="translate(960 960)"><rect x="-330" y="-50" width="660" height="80" rx="40" fill="${AM}"/>${T(0, 12, 42, 'ARADA TEK BİR KARAR VAR', { a: 'middle', c: BG })}</g>`;
  return `<g opacity="${a}">${o}</g>`;
});

// UYARI
add(S(105), S(111) + 0.1, (t, a) => {
  let o = card(260, 200, 1400, 680, MU) + T(960, 300, 48, 'DÜRÜST OLALIM', { a: 'middle', c: AM, ls: 4 });
  const items = [['Yatırım tavsiyesi değil, bir düşünce deneyi.', S(106)], ['Geçmiş getiri geleceği garanti etmez.', S(107)], ['Yıllık ortalama fiyat · işçilik ve makas hariç.', S(108)], ['Tüm veriler ve kaynaklar açıklamada.', S(109)]];
  items.forEach(([s, at], i) => { const k = ease((t - at) / 0.4); o += `<g opacity="${k}"><circle cx="360" cy="${410 + i * 110}" r="12" fill="${AM}"/>${T(400, 425 + i * 110, 46, s, { n: true })}</g>`; });
  return `<g opacity="${a}">${o}</g>`;
});

// KAPANIŞ
add(S(111), S(113) + 0.1, (t, a) => { let o = T(960, 300, 54, 'BUGÜN ASGARİ ÜCRETİN %10\'U', { a: 'middle', c: MU }) + T(960, 500, 180, '2.807 TL', { a: 'middle', c: AM }); const k = ease((t - S(112)) / 0.5); o += `<g opacity="${k}">${T(960, 700, 70, '2052\'de ne olacak?', { a: 'middle', serif: true, it: true, c: GH })}</g>`; return `<g opacity="${a}">${o}</g>`; });
add(S(113), S(117) + 0.1, (t, a) => {
  let o = T(960, 230, 60, 'Sen olsan %10\'u neye ayırırdın?', { a: 'middle', serif: true, it: true });
  const ops = [['ALTIN', AM], ['DOLAR', GR], ['BORSA', GH], ['FAİZ', TX]];
  ops.forEach(([s, c], i) => { const k = pop((t - S(114) - i * 0.3) / 0.4); o += `<g transform="translate(${360 + i * 400} 520) scale(${k})"><rect x="-170" y="-110" width="340" height="220" rx="28" fill="#141821" stroke="${c}" stroke-width="6"/>${T(0, 22, 64, s, { a: 'middle', c })}</g>`; });
  const k = ease((t - S(115)) / 0.4); o += `<g opacity="${k}" transform="translate(960 800)"><rect x="-260" y="-50" width="520" height="90" rx="45" fill="${AM}"/>${T(0, 16, 46, 'YORUMLARA YAZ', { a: 'middle', c: BG })}</g>`;
  const k2 = ease((t - S(116)) / 0.4); o += `<g opacity="${k2}">${T(960, 930, 40, 'En çok seçilen yol → bir sonraki video', { a: 'middle', c: MU })}</g>`;
  return `<g opacity="${a}">${o}</g>`;
});
add(S(117), DUR + 1, (t, a) => { const lt = t - S(117); let o = road(960, 640, 0.85) + figure(960, 640 - 170 * 0.85, 0.45, TX, ease(lt / 0.5)); o += `<g opacity="${ease(lt / 0.5)}">${T(960, 760, 70, 'SEÇMEDİĞİN', { a: 'middle' })}${T(960, 840, 70, 'YOL', { a: 'middle', c: AM })}</g>`; o += `<g opacity="${ease((t - S(117)) / 0.5)}">${T(960, 200, 52, 'Her cumartesi bir karar, iki hayat.', { a: 'middle', serif: true, it: true })}</g>`; return `<g opacity="${a}">${o}</g>`; });

function frameSvg(t) {
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` + bg(t);
  s += journey(t);
  for (const sc of SC) { if (t >= sc.a - 0.01 && t < sc.b + 0.4) { const a = win(t, sc.a, sc.b + 0.35, 0.35); if (a > 0) s += sc.f(t, a); } }
  s += journeyOverlays(t);
  s += `<rect width="${W}" height="${H}" fill="url(#vg)"/>`;
  s += header(t) + subtitle(t);
  return s + '</svg>';
}
(async () => {
  const mode = process.argv[2];
  if (mode === 'preview') { for (const x of process.argv[3].split(',')) await sharp(Buffer.from(frameSvg(+x))).png().toFile(`pv_${x}.png`); return; }
  const [from, to, out] = [+process.argv[3], +process.argv[4], process.argv[5]];
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = from; i < to; i++) { const b = await sharp(Buffer.from(frameSvg(i / FPS))).ensureAlpha().raw().toBuffer(); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('ok', out);
})();
