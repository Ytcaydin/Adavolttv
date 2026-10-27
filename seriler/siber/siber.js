const L = require('./lib.js'); const { W, H, C, T, ease, pop, fade, clamp } = L;
const S = require('./siber.json');
const SP = { ada: { label: 'ADA', col: C.pk, side: 'L' }, olt: { label: 'OLTACI', col: '#8b2bd6', side: 'R' } };
const A = ['PAKETİX: Gönderiniz', 'adres eksik olduğu', 'için bekletiliyor.', '2 saat içinde', 'güncellemezseniz iade', 'edilecek.', 'Ek ücret: 4,90 TL', 'paketix-teslimat.co/a7x'];
const B = ['PAKETİX: 4829-5531', "takip no'lu gönderiniz", "bugün 18:00'e kadar", 'teslim edilecek.', 'Takibi PAKETİX', 'uygulamasından', 'yapabilirsiniz.'];
const CLUE = [[3, '1 · ACELE'], [7, '2 · GARİP LİNK'], [6, '3 · PARA İSTİYOR']];
function phone(x, y, t, lines, label, sender, isA) {
  const a = ease((t - S.phonesIn - (isA ? 0 : 0.25)) / 0.4);
  if (a <= 0) return '';
  const dy = (1 - a) * 80;
  let o = `<g opacity="${a}" transform="translate(0 ${dy})"><rect x="${x}" y="${y}" width="440" height="610" rx="44" fill="#0b0f22" stroke="#5a6599" stroke-width="6"/>`;
  o += `<rect x="${x + 170}" y="${y + 16}" width="100" height="14" rx="7" fill="#1e2546"/>`;
  o += `<rect x="${x + 20}" y="${y + 44}" width="400" height="60" rx="12" fill="#151b3a"/>` + T(x + 40, y + 84, 26, sender, { b: true, c: C.mu });
  o += `<rect x="${x + 20}" y="${y + 120}" width="400" height="${lines.length * 40 + 30}" rx="22" fill="#262f5e"/>`;
  const typ = clamp((t - S.phonesIn - 0.3) / 1.6);
  const shown = Math.floor(typ * lines.length * 10) / 10;
  lines.forEach((l, i) => { if (i < shown) o += T(x + 40, y + 160 + i * 40, l.includes('.co/') ? 23 : 27, l, { b: l.includes('.co/'), c: l.includes('.co/') ? '#7fc8ff' : '#fff', mono: l.includes('.co/') }); });
  // ipucu vurguları
  if (isA) S.clues.forEach((ct, k) => {
    if (t < ct) return; const kk = pop((t - ct) / 0.3);
    const [li, lab] = CLUE[k]; const ly = y + 160 + li * 40;
    o += `<rect x="${x + 28}" y="${ly - 32}" width="384" height="44" rx="12" fill="none" stroke="${C.rd}" stroke-width="5" opacity="${kk}"/>`;
  });
  // damga
  if (t > S.reveal) {
    const k = pop((t - S.reveal) / 0.3), col = isA ? C.rd : C.gr, txt = isA ? 'SAHTE' : 'GERÇEK';
    o += `<g transform="translate(${x + 220} ${y + 560}) rotate(${isA ? -10 : 8}) scale(${k})"><rect x="-130" y="-46" width="260" height="84" rx="14" fill="${C.bg}" fill-opacity="0.85" stroke="${col}" stroke-width="7"/>` + T(0, 20, 52, txt, { b: true, a: 'middle', c: col }) + '</g>';
  }
  o += T(x + 220, y - 18, 34, label, { b: true, a: 'middle', c: C.ye });
  return o + '</g>';
}
function clueTags(t) {
  let o = '';
  S.clues.forEach((ct, k) => { if (t < ct || t > 17.0) return; const kk = pop((t - ct) / 0.3); o += `<g transform="translate(${560 + 220} ${1170 + k * 66}) scale(${kk})"><rect x="-200" y="-28" width="400" height="56" rx="28" fill="${C.rd}"/>` + T(0, 12, 30, CLUE[k][1], { b: true, a: 'middle' }) + '</g>'; });
  return o;
}
function countdown(t) {
  const [c0, c1] = S.countdown; if (t < c0 || t > c1) return '';
  const n = 3 - Math.floor((t - c0 - 0.8) / 1); if (t < c0 + 0.8) return `<g opacity="${ease((t - c0) / 0.3)}"><rect x="140" y="660" width="800" height="120" rx="30" fill="${C.ye}"/>` + T(540, 740, 50, 'Hangisi sahte?', { b: true, a: 'middle', c: C.bg }) + '</g>';
  const k = pop(((t - c0 - 0.8) % 1) / 0.3);
  return `<g transform="translate(540 740) scale(${k})"><circle r="150" fill="${C.bg}" fill-opacity="0.92" stroke="${C.ye}" stroke-width="10"/>` + T(0, 60, 170, String(Math.max(1, n)), { b: true, a: 'middle', c: C.ye }) + '</g>' + `<rect x="230" y="915" width="620" height="66" rx="33" fill="${C.bg}" fill-opacity="0.92"/>` + T(540, 960, 38, 'Tahminini yorumlara yaz!', { b: true, a: 'middle', c: '#fff' });
}
function villain(t) {
  const v = Math.max(fade(t, 0.3, 3.1), fade(t, 17.0, 19.9));
  if (v <= 0) return '';
  const x = 840, y = 1420 + Math.sin(t * 3) * 10, sh = (t > 0.6 && t < 2.4) || (t > 17.3 && t < 19.3) ? Math.sin(t * 40) * 4 : 0;
  let o = `<g opacity="${v}" transform="translate(${x + sh} ${y})">`;
  o += `<path d="M-150 260 Q-160 -40 -60 -170 Q0 -230 60 -170 Q160 -40 150 260 Z" fill="#2a1145" stroke="#8b2bd6" stroke-width="6"/>`;
  o += `<path d="M-80 -60 Q0 -150 80 -60 Q60 20 0 30 Q-60 20 -80 -60 Z" fill="#0a0410"/>`;
  o += `<ellipse cx="-30" cy="-40" rx="14" ry="8" fill="${C.rd}"/><ellipse cx="30" cy="-40" rx="14" ry="8" fill="${C.rd}"/>`;
  o += `<path d="M-30 -5 Q0 ${sh ? 20 : 8} 30 -5" stroke="${C.rd}" stroke-width="5" fill="none"/>`;
  // olta
  o += `<line x1="100" y1="40" x2="-120" y2="-330" stroke="#c9a96e" stroke-width="10" stroke-linecap="round"/>`;
  const sw = Math.sin(t * 2.2) * 25;
  o += `<path d="M-120 -330 Q${-200 + sw} -250 ${-210 + sw} -150" stroke="#ddd" stroke-width="3" fill="none"/>`;
  o += `<g transform="translate(${-210 + sw} -150) rotate(${sw / 3})"><rect x="-45" y="0" width="90" height="62" rx="8" fill="#fff"/><path d="M-45 0 L0 34 L45 0" stroke="#999" stroke-width="4" fill="none"/>` + T(0, 52, 20, 'SMS', { b: true, a: 'middle', c: C.rd }) + '</g>';
  return o + '</g>';
}
L.render({ dur: S.duration, prefix: 'siber', bgPng: () => 'bg_sunucu.png',
  base: t => `<rect width="${W}" height="${H}" fill="#050a1f" opacity="0.55"/>` + (t < S.fact[0] ? phone(80, 520, t, A, 'MESAJ A', '+90 5•• ••• 41 07', true) + phone(560, 520, t, B, 'MESAJ B', 'PAKETİX', false) : '')
    + L.factCard(t, S.fact[0], S.fact[1], S.factLines, C.gr, 'KORUNMA KURALI') + L.card(t, S.end, 30, 'Vaka 002: Sahte QR kod', 'Sen fark eder miydin?', 'TAKİP ET', '#8b2bd6')
    + L.topbar(t, S.duration, 'SİBER DOSYALAR', '#c58bff', 'VAKA 001') + L.titleCard(t, "VAKA 001: KARGO SMS'İ", 2.4, '#c58bff') + L.glitch(t, 0),
  top: t => clueTags(t) + countdown(t) + villain(t) + S.bubbles.map(b => L.bubble(t, b, SP)).join('') });
