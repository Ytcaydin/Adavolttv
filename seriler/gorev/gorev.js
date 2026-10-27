const L = require('./lib.js'); const { W, H, C, T, ease, pop, fade, clamp } = L;
const S = require('./gorev.json');
const SP = { ada: { label: 'ADA', col: C.pk, side: 'L' }, sis: { label: 'ARŞİV SİSTEMİ', col: C.rd, side: 'R' } };
const AM = '#ffb000';
const inPast = t => t >= S.past[0] && t < S.past[1];
function retroBg(t) {
  let o = `<rect width="${W}" height="${H}" fill="#140a00"/>`;
  for (let x = 0; x < W; x += 60) o += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${AM}" stroke-opacity="0.08" stroke-width="2"/>`;
  for (let y = 0; y < H; y += 60) o += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${AM}" stroke-opacity="0.08" stroke-width="2"/>`;
  for (let y = 0; y < H; y += 6) o += `<rect x="0" y="${y}" width="${W}" height="2" fill="#000" opacity="0.25"/>`;
  const a = ease((t - S.past[0]) / 0.5);
  o += `<g opacity="${a}">` + T(990, 540, 64, '2003', { b: true, a: 'end', c: AM }) + '</g>';
  return o;
}
function archive(t) {
  if (inPast(t) || (t > S.portal[0] && t < S.past[0])) return '';
  const rows = t < S.cliff ? [['011', 'MacBook dokunmatik', 0], ['009', 'Nokia N-Gage · 2003', 1], ['007', 'Google Glass · 2013', 0], ['005', 'Microsoft Kin · 2010', 0]]
                           : [['011', 'MacBook dokunmatik', 0], ['009', 'Nokia N-Gage · 2003', 2], ['007', '????? · 2016', 1], ['005', 'Microsoft Kin · 2010', 0]];
  let o = `<rect x="70" y="520" width="940" height="${rows.length * 110 + 80}" rx="30" fill="${C.bg}" fill-opacity="0.92" stroke="${C.cy}" stroke-width="4"/>` + T(110, 580, 30, '2045 ARŞİV DİZİNİ', { b: true, c: C.mu });
  const t0 = t < S.cliff ? 0 : S.cliff;
  rows.forEach(([no, name, st], i) => {
    const y = 620 + i * 110;
    const col = st === 1 ? C.rd : st === 2 ? C.gr : '#2a3570';
    o += `<rect x="100" y="${y}" width="880" height="90" rx="18" fill="${st === 1 ? '#3a0a18' : '#111840'}" stroke="${col}" stroke-width="${st ? 5 : 2}"/>`;
    o += T(130, y + 58, 34, no, { b: true, c: C.ye }) + T(220, y + 58, 34, name, { b: true, c: st === 1 && Math.floor(t * 8) % 2 ? '#ff99aa' : '#fff' });
    if (st === 1) { const p = Math.max(12, 100 - (t - t0) * 30); o += `<rect x="760" y="${y + 30}" width="140" height="30" rx="8" fill="#16204f"/><rect x="760" y="${y + 30}" width="${140 * p / 100}" height="30" rx="8" fill="${C.rd}"/>` + T(960, y + 56, 30, `%${Math.round(p)}`, { b: true, a: 'end', c: C.rd }); if (t >= S.cliff) o += flame(735, y + 60, t); }
    if (st === 2) o += T(960, y + 58, 34, 'KURTARILDI', { b: true, a: 'end', c: C.gr }).replace('font-size="34"', 'font-size="26"');
  });
  return o;
}
function flame(x, y, t) { const f = 1 + Math.sin(t * 20) * 0.1; return `<g transform="translate(${x} ${y}) scale(${f})"><path d="M0 -40 Q22 -12 16 6 Q12 22 0 24 Q-12 22 -16 6 Q-20 -14 0 -40 Z" fill="#ff7a1a"/><path d="M0 -14 Q9 0 6 10 Q0 16 -6 10 Q-8 0 0 -14 Z" fill="${C.ye}"/></g>`; }
function portal(t) {
  const [p0, p1] = S.portal; if (t < p0 || t > p1) return '';
  const k = (t - p0) / (p1 - p0);
  let o = `<rect width="${W}" height="${H}" fill="#000" opacity="${0.5 * Math.sin(k * Math.PI)}"/>`;
  for (let i = 0; i < 8; i++) { const r = ((k * 3 + i / 8) % 1) * 900; o += `<circle cx="540" cy="800" r="${r}" fill="none" stroke="${i % 2 ? C.cy : AM}" stroke-width="${10 - i}" opacity="${1 - r / 900}"/>`; }
  const yr = Math.round(2045 - (2045 - 2003) * ease(k * 1.1));
  o += `<rect x="290" y="720" width="500" height="160" rx="30" fill="#000" fill-opacity="0.8" stroke="${AM}" stroke-width="5"/>` + T(540, 845, 120, String(yr), { b: true, a: 'middle', c: AM });
  return o;
}
function ngage(x, y, s, a) {
  return `<g opacity="${a}" transform="translate(${x} ${y}) scale(${s})" stroke-linejoin="round">
  <path d="M-260 30 Q-270 -90 -150 -110 Q0 -135 150 -110 Q270 -90 260 30 Q250 110 150 115 Q0 125 -150 115 Q-250 110 -260 30 Z" fill="#3d4a5c" stroke="${AM}" stroke-width="6"/>
  <rect x="-62" y="-95" width="124" height="165" rx="10" fill="#9fd36a" stroke="#222" stroke-width="6"/>
  <rect x="-48" y="-80" width="96" height="70" fill="#6fae3a"/><path d="M-40 -30 L-20 -55 L0 -35 L20 -60 L40 -30" stroke="#2c5a14" stroke-width="5" fill="none"/>
  <path d="M-190 -20 h40 v-40 h40 v40 h40 v40 h-40 v40 h-40 v-40 h-40 Z" fill="#20262f" transform="translate(5 10) scale(0.85)"/>
  ${[0, 1, 2].map(r => [0, 1, 2].map(c => `<circle cx="${120 + c * 42}" cy="${-45 + r * 42}" r="15" fill="#20262f"/>`).join('')).join('')}
  </g>`;
}
function past(t) {
  if (!inPast(t)) return '';
  let o = retroBg(t);
  const step = t < 10.9 ? 0 : t < 13.7 ? 1 : t < 16.5 ? 2 : 3;
  const a0 = ease((t - 7.8) / 0.4);
  o += `<rect x="70" y="470" width="940" height="540" rx="30" fill="#1f1200" fill-opacity="0.9" stroke="${AM}" stroke-width="5"/>`;
  if (step === 0 || step === 3) o += ngage(540, 700, 1.25, a0) + T(540, 930, 44, 'NOKIA N-GAGE', { b: true, a: 'middle', c: AM, op: a0 });
  if (step === 3) o += T(540, 985, 34, '~3 milyon satış · 2003–2006', { b: true, a: 'middle', c: '#fff' });
  if (step === 1) { // yan konuşma
    const k = ease((t - 10.9) / 0.4);
    o += `<g opacity="${k}"><circle cx="400" cy="700" r="150" fill="#f0c9a6" stroke="#222" stroke-width="6"/><path d="M250 690 Q215 720 252 740" fill="#f0c9a6" stroke="#222" stroke-width="6"/><circle cx="340" cy="660" r="12" fill="#222"/><path d="M300 600 Q400 520 520 600 Q545 640 545 680 L540 690 Q420 610 300 640 Z" fill="#2a1a10"/>`;
    o += `<ellipse cx="545" cy="710" rx="22" ry="38" fill="#e8b48e" stroke="#222" stroke-width="5"/>`;
    o += `<g transform="translate(600 700) rotate(90) scale(0.55)">${ngage(0, 0, 1, 1).replace(/<g opacity="1" transform="translate\(0 0\) scale\(1\)"/, '<g')}</g>`;
    o += `<path d="M690 520 Q760 560 720 620" stroke="${C.rd}" stroke-width="8" fill="none" marker-end=""/>` + T(540, 940, 52, 'YAN KONUŞMA', { b: true, a: 'middle', c: C.rd }) + '</g>';
  }
  if (step === 2) { // pil adımları
    const items = [['1', 'KAPAT'], ['2', 'PİLİ ÇIKAR'], ['3', 'OYUNU TAK']];
    items.forEach(([n, l], i) => { const k = pop((t - 13.9 - i * 0.6) / 0.3); const x = 230 + i * 310; o += `<g transform="translate(${x} 700) scale(${k})"><circle r="110" fill="#2a1800" stroke="${AM}" stroke-width="6"/>` + T(0, 25, 80, n, { b: true, a: 'middle', c: AM }) + '</g>' + (k > 0.5 ? T(x, 870, 34, l, { b: true, a: 'middle' }) : ''); if (i < 2 && k > 0.8) o += `<path d="M${x + 125} 700 l40 0 m-14 -14 l14 14 l-14 14" stroke="${AM}" stroke-width="7" fill="none"/>`; });
    o += T(540, 960, 34, 'Her oyun değişiminde!', { b: true, a: 'middle', c: C.rd });
  }
  // kurtarma çubuğu
  const p = t >= S.restoreDone ? 100 : 37 + 63 * clamp((t - 8) / (S.restoreDone - 8));
  const done = t >= S.restoreDone, col = done ? C.gr : AM;
  o += `<rect x="70" y="1030" width="940" height="80" rx="20" fill="#000" fill-opacity="0.7" stroke="${col}" stroke-width="4"/><rect x="90" y="1050" width="${600 * p / 100}" height="40" rx="10" fill="${col}"/>` + T(1000 - 20, 1083, 32, done ? 'KURTARILDI ✓' : `KURTARILIYOR %${Math.round(p)}`, { b: true, a: 'end', c: col }).replace('✓', '');
  return o;
}
function silhouette(t) {
  if (t < S.cliff + 1.0 || t > S.end + 0.2) return '';
  const a = fade(t, S.cliff + 1.0, S.end + 0.2, 0.5);
  return `<g opacity="${0.85 * a}" transform="translate(880 1380)"><path d="M-120 300 Q-130 0 -50 -110 Q0 -160 50 -110 Q130 0 120 300 Z" fill="#000"/><ellipse cx="-22" cy="-40" rx="9" ry="5" fill="${C.cy}"/><ellipse cx="22" cy="-40" rx="9" ry="5" fill="${C.cy}"/></g>` + T(880, 1260, 120, '?', { b: true, a: 'middle', c: C.cy, op: a });
}
L.render({ dur: S.duration, prefix: 'gorev', bgPng: t => inPast(t) ? null : 'bg_neon.png',
  base: t => (inPast(t) ? past(t) : `<rect width="${W}" height="${H}" fill="#050a1f" opacity="0.5"/>` + (t < S.end ? archive(t) : ''))
    + L.card(t, S.end, 30, 'Görev 002: 2016', 'Sence arşivi kim siliyor?', 'YORUMLARA YAZ', C.rd)
    + L.topbar(t, S.duration, 'ARŞİV GÖREVLERİ', inPast(t) ? AM : C.cy, 'GÖREV 001') + L.titleCard(t, 'GÖREV 001: N-GAGE', 2.2, C.rd)
    + portal(t) + L.glitch(t, S.past[0]) + L.glitch(t, S.past[1]) + L.glitch(t, S.cliff),
  top: t => silhouette(t) + S.bubbles.map(b => L.bubble(t, b, SP)).join('') });
