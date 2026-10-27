const L = require('./lib.js'); const { W, H, C, T, ease, pop, fade, clamp } = L;
const S = require('./mahsur.json');
const SP = { ada: { label: 'ADA', col: C.pk, side: 'L' }, yolcu: { label: 'YOLCU', col: C.am, side: 'R', dark: true } };
function signal(t) {
  const lvl = t < S.end ? 3 : 3 + 9 * ease((t - S.end - 0.4) / 1.5);
  const blink = t < S.end ? (Math.floor(t * 3) % 2 ? 1 : 0.4) : 1;
  const col = lvl < 10 ? C.rd : C.ye;
  let o = `<g transform="translate(0 150)"><rect x="560" y="10" width="480" height="70" rx="20" fill="#020615" fill-opacity="0.85" stroke="${col}" stroke-width="4"/>`;
  o += T(585, 56, 26, 'SİNYAL · 2045', { b: true, c: L.C.mu });
  o += `<rect x="830" y="30" width="150" height="30" rx="8" fill="#16204f"/><rect x="830" y="30" width="${150 * lvl / 100 * 4}" height="30" rx="8" fill="${col}" opacity="${blink}"/>`;
  o += T(1020, 56, 28, `%${Math.round(lvl)}`, { b: true, a: 'end', c: col }) + '</g>';
  return o;
}
function person(x, y, s, t, i, pct) {
  const sway = Math.sin(t * 1.5 + i) * 4;
  let o = `<g transform="translate(${x} ${y + sway}) scale(${s})">`;
  o += `<circle cx="0" cy="-230" r="48" fill="#46508a"/><path d="M-70 -170 Q0 -195 70 -170 L85 40 L-85 40 Z" fill="#46508a"/>`;
  o += `<path d="M40 -150 Q95 -110 70 -70" stroke="#46508a" stroke-width="30" fill="none" stroke-linecap="round"/>`;
  o += `<rect x="45" y="-105" width="44" height="78" rx="9" fill="#0a0f2e" stroke="${C.cy}" stroke-width="4"/>`;
  o += `<rect x="52" y="-96" width="30" height="16" rx="3" fill="none" stroke="${C.rd}" stroke-width="3"/><rect x="54" y="-94" width="${3 + pct / 4}" height="12" fill="${C.rd}"/>`;
  o += '</g>';
  const bx = x + 67 * s, by = y + sway - 30 * s;
  o += `<path d="M${bx} ${by} C${bx + 20} ${by + 120}, ${x + 150} ${1080}, ${x + 120} 1105" stroke="#e8e8e8" stroke-width="5" fill="none"/>`;
  const fl = Math.floor(t * 2 + i) % 2;
  o += `<g opacity="${0.6 + 0.4 * fl}"><rect x="${x - 30}" y="${y + sway - 340 * s}" width="${100 * s + 30}" height="50" rx="12" fill="${C.rd}"/>` + T(x + 35 * s, y + sway - 340 * s + 37, 32, `%${pct}`, { b: true, a: 'middle' }) + '</g>';
  return o;
}
function scene(t) {
  if (t > S.fact[0] + 0.3) return '';
  const a = ease((t - 0.4) / 0.5) * (1 - clamp((t - S.fact[0]) / 0.3));
  let o = `<g opacity="${a}"><rect x="460" y="560" width="590" height="600" rx="30" fill="#141a3a" stroke="${C.am}" stroke-width="5"/>`;
  o += `<rect x="470" y="1090" width="570" height="60" fill="#0d1230"/>`;
  o += `<rect x="900" y="1095" width="130" height="40" rx="8" fill="#ddd"/>`;
  for (let k = 0; k < 3; k++) o += `<rect x="${915 + k * 38}" y="1105" width="22" height="20" rx="4" fill="#555"/>`;
  o += person(560, 1060, 0.95, t, 0, 3) + person(700, 1070, 0.9, t, 1, 1) + person(830, 1055, 0.95, t, 2, 7);
  o += T(490, 620, 30, 'İSTANBUL · 2026', { b: true, c: C.am });
  return o + '</g>';
}
L.render({ dur: S.duration, prefix: 'mahsur', bgPng: () => 'bg_neon.png',
  base: t => `<rect width="${W}" height="${H}" fill="#050a1f" opacity="0.4"/>` + scene(t) + L.factCard(t, S.fact[0], S.fact[1], S.factLines)
    + L.card(t, S.end + 0.3, 30, 'Ada eve dönebilecek mi?', 'Bağlantı yükseliyor...', 'TAKİP ET', C.pk)
    + L.topbar(t, S.duration, "2026'DA MAHSUR", C.am, 'BÖLÜM 1') + signal(t) + L.titleCard(t, "BAĞLANTI KOPTU!", 2.3, C.rd) + L.glitch(t, 0) + L.glitch(t, S.end),
  top: t => S.bubbles.map(b => L.bubble(t, b, SP)).join('') });
