const sharp = require('/opt/npm-tools/node_modules/sharp');
const { spawn } = require('child_process');
const fs = require('fs');
const TL = JSON.parse(fs.readFileSync('timeline.json'));
const SUBS = JSON.parse(fs.readFileSync('subs.json'));
const ep = JSON.parse(fs.readFileSync(process.env.EP || 'episode.json'));
const W = 1080, H = 1920, FPS = 30, N = Math.round(TL.total * FPS);
const F = 'DejaVu Sans', B = TL.bounds;
const NF = ep.files.length;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = x => 1 - Math.pow(1 - clamp(x), 3);
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const C = { cy: '#00f0ff', pk: '#ff4fd8', ye: '#ffd23f', gr: '#3ddc84', rd: '#ff4d6d', wh: '#ffffff', mu: '#b9c6ff', bg: '#0a0f2e' };
const PX = 560, PW = 480;

const T = (x, y, s, txt, o = {}) => { if (o.max) s = Math.min(s, o.max / (String(txt).length * (o.b ? 0.64 : 0.57))); return T0(x, y, s, txt, o); };
const T0 = (x, y, s, txt, o = {}) => `<text x="${x}" y="${y}" font-family="${F}" font-size="${s}" ${o.b ? 'font-weight="bold"' : ''} ${o.i ? 'font-style="italic"' : ''} ${o.a ? `text-anchor="${o.a}"` : ''} fill="${o.c || C.wh}" ${o.op !== undefined ? `opacity="${o.op}"` : ''}>${esc(txt)}</text>`;

const icon = {
  truck: (x, y, c) => `<g fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"><rect x="${x}" y="${y + 8}" width="30" height="24" rx="3"/><path d="M${x + 30} ${y + 16} h12 l8 9 v7 h-20 z"/></g><circle cx="${x + 10}" cy="${y + 36}" r="5" fill="${c}"/><circle cx="${x + 40}" cy="${y + 36}" r="5" fill="${c}"/>`,
  person: (x, y, c) => `<circle cx="${x + 24}" cy="${y + 12}" r="9" fill="none" stroke="${c}" stroke-width="4"/><path d="M${x + 8} ${y + 42} q16 -24 32 0" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`,
  cloud: (x, y, c, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M12 40 a12 12 0 0 1 2 -24 a16 16 0 0 1 30 -4 a11 11 0 0 1 8 28 z" fill="none" stroke="${c}" stroke-width="${4 / s}" stroke-linejoin="round"/>`,
  cal: (x, y, c) => `<rect x="${x + 4}" y="${y + 8}" width="40" height="34" rx="5" fill="none" stroke="${c}" stroke-width="4"/><path d="M${x + 4} ${y + 18} h40 M${x + 14} ${y + 3} v10 M${x + 34} ${y + 3} v10" stroke="${c}" stroke-width="4"/>`,
  money: (x, y, c) => `<circle cx="${x + 24}" cy="${y + 24}" r="19" fill="none" stroke="${c}" stroke-width="4"/>${T(x + 24, y + 34, 26, '$', { a: 'middle', b: true, c })}`,
  check: (x, y, c) => `<rect x="${x + 4}" y="${y + 4}" width="38" height="38" rx="8" fill="none" stroke="${c}" stroke-width="4"/><path d="M${x + 13} ${y + 23} l7 7 l13 -15" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
  film: (x, y, c) => `<rect x="${x + 2}" y="${y + 6}" width="44" height="36" rx="5" fill="none" stroke="${c}" stroke-width="4"/>${[0, 1, 2].map(i => `<rect x="${x + 8 + i * 13}" y="${y + 10}" width="6" height="5" fill="${c}"/><rect x="${x + 8 + i * 13}" y="${y + 33}" width="6" height="5" fill="${c}"/>`).join('')}`,
  down: (x, y, c) => `${[0, 1, 2].map(i => `<rect x="${x + 4 + i * 14}" y="${y + 10 + i * 9}" width="10" height="${32 - i * 9}" fill="${c}"/>`).join('')}<path d="M${x + 6} ${y + 4} L${x + 42} ${y + 30}" stroke="${c}" stroke-width="4"/><path d="M${x + 44} ${y + 18} v14 h-14" fill="none" stroke="${c}" stroke-width="4"/>`,
  box: (x, y, c) => `<path d="M${x + 24} ${y + 4} l20 10 v22 l-20 10 l-20 -10 v-22 z M${x + 4} ${y + 14} l20 10 l20 -10 M${x + 24} ${y + 24} v22" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`,
  quote: (x, y, c) => `<path d="M${x + 4} ${y + 6} h40 v26 h-24 l-10 10 v-10 h-6 z" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`,
};

function row(lt, at, y, ic, color, l1, l2) {
  const a = ease((lt - at) / 0.35);
  if (a <= 0) return '';
  const dx = (1 - a) * 60;
  let s = `<g opacity="${a}" transform="translate(${dx} 0)"><rect x="${PX + 20}" y="${y}" width="${PW - 40}" height="${l2 ? 96 : 72}" rx="16" fill="#ffffff" fill-opacity="0.06" stroke="${color}" stroke-opacity="0.6" stroke-width="2"/>`;
  s += icon[ic](PX + 36, y + (l2 ? 24 : 12), color);
  s += T(PX + 104, y + (l2 ? 42 : 46), 30, l1, { b: true, max: PW - 124 });
  if (l2) s += T(PX + 104, y + 78, 26, l2, { c: C.mu, max: PW - 124 });
  return s + '</g>';
}
function pill(x, y, txt, color, fg = '#0a0f2e', size = 26) {
  const w = txt.length * size * 0.66 + 40;
  return `<rect x="${x}" y="${y}" width="${w}" height="${size + 22}" rx="${(size + 22) / 2}" fill="${color}"/>${T(x + 20, y + size + 4, size, txt, { b: true, c: fg })}`;
}
function count(lt, at, dur, to) { return to * ease((lt - at) / dur); }
const trFmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function panelFrame(lt, len, h, inner) {
  const a = ease(lt / 0.45) * (1 - clamp((lt - (len - 0.3)) / 0.3));
  if (a <= 0) return '';
  const dx = (1 - ease(lt / 0.45)) * 520;
  return `<g opacity="${a}" transform="translate(${dx} 0)"><rect x="${PX}" y="230" width="${PW}" height="${h}" rx="30" fill="${C.bg}" fill-opacity="0.86" stroke="${C.cy}" stroke-width="3"/><rect x="${PX + 30}" y="230" width="140" height="5" fill="${C.pk}"/>${inner}</g>`;
}

const scenes = {
  intro(lt, len) {
    let s = T(PX + 36, 310, 34, 'BUGÜNÜN', { b: true, c: C.mu }) + T(PX + 36, 380, 64, `${NF} DOSYASI`, { b: true, c: C.cy });
    ep.files.forEach((f, i) => {
      const a = ease((lt - 0.8 - i * 0.45) / 0.3);
      if (a > 0) s += `<g opacity="${a}">${pill(PX + 36, 420 + i * 82, `0${i + 1}`, C.pk, '#fff', 26)}${T(PX + 130, 456 + i * 82, 32, f, { b: true, max: PW - 150 })}</g>`;
    });
    return panelFrame(lt, len, 650, s);
  },
  n1(lt, len) {
    let s = pill(PX + 36, 262, 'APPLE', C.cy) + T(PX + 36, 380, 50, 'iPhone Duo', { b: true });
    const open = 0.7 + 0.3 * Math.sin(lt * 1.4);
    s += `<defs><linearGradient id="ph" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7b5cff"/><stop offset="1" stop-color="#00c2ff"/></linearGradient></defs>`;
    s += `<g transform="translate(${PX + 384} 262)"><rect x="0" y="0" width="42" height="88" rx="12" fill="url(#ph)" stroke="#dfe6ff" stroke-width="3"/><g transform="translate(42 0) skewY(${-12 * (1 - open)}) scale(${open} 1)"><rect x="0" y="0" width="42" height="88" rx="12" fill="url(#ph)" stroke="#dfe6ff" stroke-width="3" opacity="0.9"/></g></g>`;
    const v = count(lt, 5.6, 1.0, 2000);
    if (lt > 5.6) s += T(PX + 36, 530, 104, '$' + trFmt(v), { b: true, c: C.ye });
    s += row(lt, 7.6, 580, 'truck', C.cy, 'Teslimatlar', 'Ocak sonuna kaydı');
    s += row(lt, 8.4, 694, 'person', C.pk, 'Kişi başı', 'En fazla 2 sipariş');
    return panelFrame(lt, len, 600, s);
  },
  n2(lt, len) {
    let s = pill(PX + 36, 262, 'AMAZON · AWS', C.ye) + icon.cloud(PX + 360, 250, C.cy, 1.5);
    s += T(PX + 36, 370, 40, 'Bulut kapasitesi', { b: true }) + T(PX + 36, 420, 40, '2026 için tükendi', { b: true, c: C.cy });
    s += row(lt, 0.4, 448, 'quote', C.mu, 'Andy Jassy', 'Amazon CEO');
    s += row(lt, 5.2, 562, 'cal', C.cy, '2027 de', 'Büyük ölçüde dolu');
    if (lt > 6.0) { const v = count(lt, 6.0, 0.9, 220); s += `<g opacity="${ease((lt - 6.0) / 0.3)}">${icon.money(PX + 36, 694, C.ye)}${T(PX + 104, 744, 72, '$' + Math.round(v), { b: true, c: C.ye })}${T(PX + 104 + (String(Math.round(v)).length + 1) * 47 + 18, 744, 36, 'MİLYAR', { b: true, c: C.ye })}${T(PX + 104, 786, 26, 'Bu yılki yatırım', { c: C.mu })}</g>`; }
    return panelFrame(lt, len, 600, s);
  },
  n3(lt, len) {
    let s = pill(PX + 36, 262, 'CURSOR', C.cy) + T(PX + 36, 370, 48, 'Computer Use', { b: true });
    s += `<rect x="${PX + 36}" y="396" width="${PW - 72}" height="190" rx="14" fill="#141b44" stroke="#8aa0ff" stroke-width="2"/><rect x="${PX + 36}" y="396" width="${PW - 72}" height="30" rx="14" fill="#2a3470"/>`;
    s += [0, 1, 2].map(i => `<circle cx="${PX + 58 + i * 20}" cy="411" r="5" fill="${[C.rd, C.ye, C.gr][i]}"/>`).join('');
    s += `<rect x="${PX + 60}" y="446" width="170" height="16" rx="8" fill="#5566aa"/><rect x="${PX + 60}" y="474" width="120" height="16" rx="8" fill="#5566aa"/><rect x="${PX + 250}" y="446" width="140" height="110" rx="10" fill="#3b4a99"/>`;
    const p = (lt * 0.5) % 1, cx = PX + 90 + 240 * Math.abs(Math.sin(p * Math.PI)), cy = 470 + 60 * Math.sin(p * Math.PI * 2);
    const click = (lt * 0.5) % 1 > 0.45 && (lt * 0.5) % 1 < 0.6;
    if (click) s += `<circle cx="${cx}" cy="${cy}" r="${10 + 60 * (((lt * 0.5) % 1) - 0.45)}" fill="none" stroke="${C.cy}" stroke-width="3"/>`;
    s += `<path transform="translate(${cx} ${cy})" d="M0 0 L0 32 L9 24 L16 38 L22 35 L15 22 L27 21 Z" fill="#fff" stroke="#000" stroke-width="2"/>`;
    ['Tıklayabiliyor', 'Yazabiliyor', 'Her uygulamada', 'Ekranı senin gibi'].forEach((l, i) => {
      const a = ease((lt - [3.4, 4.2, 5.4, 6.2][i]) / 0.3);
      if (a > 0) s += `<g opacity="${a}">${icon.check(PX + 36, 606 + i * 58, C.gr)}${T(PX + 100, 642 + i * 58, 30, l, { b: i === 3, c: i === 3 ? C.cy : C.wh })}</g>`;
    });
    return panelFrame(lt, len, 640, s);
  },
  n4(lt, len) {
    let s = pill(PX + 36, 262, 'TERMINAL-BENCH 4.0', C.pk, '#fff', 24) + T(PX + 36, 372, 52, 'Kimi K3.1 Pro', { b: true });
    if (lt > 4.6) {
      const v = count(lt, 4.6, 1.0, 65.7);
      s += T(PX + 36, 490, 100, '%' + v.toFixed(1).replace('.', ','), { b: true, c: C.gr });
      s += `<path d="M${PX + 400} 490 v-62 m-22 22 l22 -24 l22 24" fill="none" stroke="${C.gr}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="${ease((lt - 5.4) / 0.3)}"/>`;
    }
    const g = ease((lt - 7.4) / 1.0);
    if (lt > 7.1) {
      s += T(PX + 36, 560, 28, 'Kimi K3.1 Pro', { b: true, c: C.cy }) + `<rect x="${PX + 36}" y="572" width="${380 * g}" height="30" rx="8" fill="${C.cy}"/>` + T(PX + 36 + 380 * g + 8, 597, 26, g > 0.9 ? '65,7' : '', { b: true });
      s += T(PX + 36, 640, 28, 'GPT-6 Astra', { b: true, c: C.mu }) + `<rect x="${PX + 36}" y="652" width="${337 * g}" height="30" rx="8" fill="#6b7398"/>` + T(PX + 36 + 337 * g + 8, 677, 26, g > 0.9 ? '58,2' : '', { b: true, c: C.mu });
    }
    s += row(lt, 9.2, 712, 'box', C.ye, 'Açık ağırlıklar', "4 Kasım'a kadar geliyor");
    return panelFrame(lt, len, 610, s);
  },
  n5(lt, len) {
    let s = pill(PX + 36, 262, 'SİNEMA · ÇİN', C.ye) + T(PX + 36, 366, 40, 'İlk tamamen', { b: true }) + T(PX + 36, 416, 40, 'yapay zekâ filmi', { b: true, c: C.cy });
    s += `<g opacity="0.9">${[0, 1, 2, 3, 4].map(i => { const x = PX + 36 + ((i * 96 - lt * 40) % 480 + 480) % 480; return x < PX + PW - 120 ? `<rect x="${x}" y="446" width="86" height="64" rx="6" fill="${['#5b3cc4', '#c43c7a', '#2a7fd6', '#3cc48a', '#c49a3c'][i]}"/>` : ''; }).join('')}<rect x="${PX + 30}" y="438" width="${PW - 60}" height="80" fill="none" stroke="#dfe6ff" stroke-width="3" stroke-dasharray="10 8"/></g>`;
    if (lt > 4.6) { const v = count(lt, 4.6, 1.0, 1200000); s += `<g opacity="${ease((lt - 4.6) / 0.3)}">${icon.film(PX + 36, 548, C.ye)}${T(PX + 104, 594, 64, trFmt(v), { b: true, c: C.ye })}${T(PX + 104, 632, 28, 'görselle üretildi', { c: C.mu })}</g>`; }
    s += row(lt, 7.2, 668, 'down', C.rd, 'Ön satışlar', 'Zayıf kaldı');
    return panelFrame(lt, len, 560, s);
  },
  soru(lt, len) {
    const bob = 6 * Math.sin(lt * 3);
    let s = `<g transform="translate(0 ${bob})"><circle cx="${PX + 90}" cy="330" r="52" fill="${C.cy}"/>${T(PX + 90, 356, 76, '?', { a: 'middle', b: true, c: C.bg })}</g>`;
    s += T(PX + 170, 320, 34, 'ARŞİV', { b: true, c: C.mu }) + T(PX + 170, 366, 44, 'SORGUSU', { b: true, c: C.ye });
    const Q = ep.question || ['Yapay zekânın çektiği', 'bir filme bilet', 'alır mıydın?'];
    Q.forEach((q, k) => { s += T(PX + 36, 460 + k * 50, 36, q, { b: true, c: k === Q.length - 1 ? C.cy : C.wh, max: PW - 72 }); });
    const a = ease((lt - Math.min(5.4, len * 0.75)) / 0.4);
    s += `<g opacity="${a}">${T(PX + 36, 640, 40, 'Yorumlara yaz!', { b: true, i: true, c: C.ye })}<path d="M${PX + 380} ${612 + 10 * Math.abs(Math.sin(lt * 4))} v40 m-14 -14 l14 14 l14 -14" fill="none" stroke="${C.ye}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    return panelFrame(lt, len, 460, s);
  },
  outro(lt, len) {
    const cx = PX + PW / 2, cy = 420, r = 130;
    let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#0d2a5c" stroke="${C.cy}" stroke-width="3"/>`;
    for (let k = 0; k < 6; k++) { const ph = (k / 6 + lt * 0.12) % 1; const rx = Math.abs(r * Math.cos(ph * Math.PI)); s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${r}" fill="none" stroke="${C.cy}" stroke-opacity="0.55" stroke-width="2"/>`; }
    for (let k = -2; k <= 2; k++) { const yy = cy + k * r / 3; const rr = Math.sqrt(r * r - (k * r / 3) ** 2); s += `<ellipse cx="${cx}" cy="${yy}" rx="${rr}" ry="${rr * 0.18}" fill="none" stroke="${C.cy}" stroke-opacity="0.45" stroke-width="2"/>`; }
    s += T(cx, 616, 44, 'KAYIT KAPANIYOR', { a: 'middle', b: true }) + T(cx, 656, 25, 'BAĞLANTI YARIN 18:00\'DE', { a: 'middle', b: true, c: C.cy }) + T(cx, 688, 25, 'YENİDEN AÇILACAK', { a: 'middle', b: true, c: C.cy });
    const p = 1 + 0.05 * Math.sin(lt * 6), a = ease((lt - 0.8) / 0.4);
    s += `<g opacity="${a}" transform="translate(${cx} 755) scale(${p}) translate(${-cx} -755)"><rect x="${cx - 170}" y="716" width="340" height="78" rx="39" fill="#ff2d55"/>${T(cx, 768, 36, 'ABONE OL', { a: 'middle', b: true })}</g>`;
    return panelFrame(lt, len + 1, 620, s);
  },
};
const fno = k => '#' + String(ep.fileStart + k).padStart(3, '0');

function statFmt(st, lt, at) {
  const m = st.match(/^([^0-9]*)([0-9][0-9.,]*)(.*)$/);
  if (!m || lt < at) return st;
  const raw = m[2], num = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
  if (!isFinite(num)) return st;
  const p = ease((lt - at) / 0.9), v = num * p;
  const dec = raw.includes(',') ? raw.split(',')[1].length : 0;
  let out = dec ? v.toFixed(dec).replace('.', ',') : trFmt(v);
  return m[1] + out + m[3];
}
function genericScene(key) {
  const P = ep.panels[key];
  return (lt, len) => {
    const news = len * ep.noteAt[key];
    const atStat = news * 0.3, atR = [news * 0.5, news * 0.75];
    let s = pill(PX + 36, 262, P.tag, [C.cy, C.ye, C.pk][(+key[1]) % 3], (+key[1]) % 3 === 2 ? '#fff' : '#0a0f2e', 24);
    const tsz = P.title.length > 18 ? 40 : 48;
    s += T(PX + 36, 372, tsz, P.title, { b: true, max: PW - 72 });
    const sw = (lt * 0.8) % 1;
    s += `<rect x="${PX + 30}" y="${392 + sw * 150}" width="${PW - 60}" height="2" fill="${C.cy}" opacity="${0.35 * (1 - sw)}"/>`;
    if (lt > atStat) {
      const a = ease((lt - atStat) / 0.3), sc = back((lt - atStat) / 0.45);
      const txt = statFmt(P.stat, lt, atStat);
      const fs = P.stat.length > 12 ? 50 : P.stat.length > 8 ? 66 : 84;
      s += `<g opacity="${a}" transform="translate(${PX + 36} 500) scale(${sc}) translate(${-PX - 36} -500)">${T(PX + 36, 500, fs, txt, { b: true, c: C.ye, max: PW - 72 })}</g>`;
    }
    const icons = ['check', 'box', 'cal', 'person', 'quote'];
    (P.rows || []).slice(0, 2).forEach((r, i) => { s += row(lt, atR[i], 540 + i * 114, icons[(+key[1] + i) % icons.length], i ? C.pk : C.cy, r[0], r[1]); });
    return panelFrame(lt, len, 560, s);
  };
}

if (ep.panels) for (const k of Object.keys(ep.panels)) if (ep.panels[k]) scenes[k] = genericScene(k);
const LABEL = { intro: 'BAĞLANTI · 2045', n1: 'ARŞİV DOSYASI ' + fno(0), n2: 'ARŞİV DOSYASI ' + fno(1), n3: 'ARŞİV DOSYASI ' + fno(2), n4: 'ARŞİV DOSYASI ' + fno(3), n5: 'ARŞİV DOSYASI ' + fno(4), soru: 'ARŞİV SORGUSU', outro: 'KAYIT KAPANIYOR' };
function note2045(sec, lt, len) {
  const lines = ep.notes && ep.notes[sec]; if (!lines) return '';
  const at = len * ep.noteAt[sec], a = ease((lt - at) / 0.3) * (1 - clamp((lt - (len - 0.3)) / 0.3));
  if (a <= 0) return '';
  const g = lt - at < 0.35 ? Math.round(Math.sin(lt * 90) * 8) : 0;
  const y = 230 + (ep.panels ? 560 : ({ n1: 600, n2: 600, n3: 640, n4: 610, n5: 560 })[sec]) + 42;
  let o = `<g opacity="${a}" transform="translate(${g} 0)"><rect x="${PX}" y="${y}" width="${PW}" height="170" rx="24" fill="#24083f" fill-opacity="0.92" stroke="#c45bff" stroke-width="3" stroke-dasharray="14 6"/>`;
  o += pill(PX + 24, y - 22, '2045 NOTU', '#c45bff', '#fff', 24);
  o += T(PX + 28, y + 70, 31, lines[0], { i: true, b: true, c: '#f1d9ff', max: PW - 50 }) + T(PX + 28, y + 114, 31, lines[1], { i: true, b: true, c: '#f1d9ff', max: PW - 50 });
  if (g) o += `<rect x="${PX}" y="${y + 40}" width="${PW}" height="10" fill="#00f0ff" opacity="0.6"/><rect x="${PX + 30}" y="${y + 120}" width="${PW - 60}" height="6" fill="#ff4fd8" opacity="0.6"/>`;
  return o + '</g>';
}
function infoBar(t) {
  const blink = Math.sin(t * 5) > -0.3;
  let o = `<rect x="712" y="56" width="328" height="160" rx="14" fill="#06102e" fill-opacity="0.85" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2"/>`;
  o += T(732, 88, 26, ep.date, { b: true, c: C.cy });
  o += T(732, 118, 22, 'Arşiv Taraması', { c: C.wh }) + T(732, 148, 22, 'Bölüm ' + ep.episode, { b: true, c: C.ye });
  o += `<circle cx="740" cy="186" r="7" fill="#ff3355" opacity="${blink ? 1 : 0.2}"/>` + T(756, 194, 21, 'Kayıt Durumu: AKTİF', { b: true, c: '#ff7a8f' });
  return o;
}
function connect(t) {
  let o = '';
  if (t < 1.0) {
    const a = 1 - clamp((t - 0.6) / 0.4);
    for (let k = 0; k < 10; k++) { if (Math.sin(t * 40 + k * 7) > 0.4) o += `<rect x="${(k * 97 + t * 900) % W - 200}" y="${(k * 263) % H}" width="${300 + (k * 53) % 400}" height="${6 + (k % 4) * 6}" fill="${k % 2 ? C.cy : C.pk}" opacity="${0.55 * a}"/>`; }
    o += `<g opacity="${a}"><rect x="220" y="250" width="640" height="64" rx="32" fill="#020615" fill-opacity="0.85" stroke="${C.cy}" stroke-width="3"/>${T(540, 293, 30, 'BAĞLANTI KURULDU · 2045 → 2026', { a: 'middle', b: true, c: C.cy })}</g>`;
  }
  const H1 = ep.cover || ep.hookLines;
  if (H1 && t < 3.4) {
    const a = ease(t / 0.25) * (1 - clamp((t - 3.0) / 0.4)), sc = back(t / 0.35);
    o += `<g opacity="${a}" transform="translate(540 1300) scale(${sc}) translate(-540 -1300)"><rect x="40" y="${1300 - H1.length * 62 - 30}" width="1000" height="${H1.length * 124 + 60}" rx="36" fill="#0a0f2e" fill-opacity="0.92" stroke="${C.pk}" stroke-width="5"/>`;
    H1.forEach((l, i) => { o += T(540, 1300 - H1.length * 62 + 100 + i * 124, 96, l, { a: 'middle', b: true, c: i === H1.length - 1 ? C.ye : C.wh, max: 800 }); });
    o += '</g>';
  }
  return o;
}
function hud(t) {
  let o = '';
  for (let y = 0; y < H; y += 6) o += `<rect y="${y}" width="${W}" height="1" fill="#fff" opacity="0.025"/>`;
  return o;
}
function desk(t) {
  let o = `<path d="M-20 1760 L1100 1760 L1100 ${H} L-20 ${H} Z" fill="#0a1238"/><rect x="0" y="1756" width="${W}" height="8" fill="${C.cy}" opacity="0.9"/>`;
  o += `<rect x="0" y="1764" width="${W}" height="40" fill="#141f5c" opacity="0.8"/>`;
  o += T(540, 1795, 26, ep.brand + ' · 2045 ARŞİV YAYINI', { a: 'middle', b: true, c: C.cy, op: 0.85 });
  const msg = `ARŞİV TARAMASI SÜRÜYOR  •  2045 → 2026 BAĞLANTISI AKTİF  •  BÖLÜM ${ep.episode}  •  DOSYA ${fno(0)} – ${fno(NF - 1)}  •  HABERLER GERÇEK, 2045 NOTLARI KURGUDUR  •  `;
  const w = msg.length * 15.5, x = -((t * 120) % w);
  o += `<rect x="0" y="1850" width="${W}" height="56" fill="#000" opacity="0.55"/><rect x="0" y="1850" width="150" height="56" fill="#ff3355"/>` + T(75, 1888, 26, 'CANLI', { a: 'middle', b: true });
  o += `<svg x="150" y="1850" width="${W - 150}" height="56">${T(x, 38, 26, msg + msg + msg, { b: true, c: C.wh })}</svg>`;
  return o;
}

function wrap(txt, max = 30) {
  if (txt.length <= max) return [txt];
  const w = txt.split(' '); let best = null;
  for (let i = 1; i < w.length; i++) { const a = w.slice(0, i).join(' '), b = w.slice(i).join(' '); const sc = Math.max(a.length, b.length); if (!best || sc < best[0]) best = [sc, a, b]; }
  return [best[1], best[2]];
}
function subtitle(t) {
  const s = SUBS.find(x => t >= x[0] && t < x[1] + 0.15);
  if (!s) return '';
  const a = ease((t - s[0]) / 0.12), lines = wrap(s[2]);
  const h = 40 + lines.length * 58, y0 = 1700 - h;
  let o = `<g opacity="${a}"><rect x="60" y="${y0}" width="960" height="${h}" rx="22" fill="#000" fill-opacity="0.72"/>`;
  lines.forEach((l, i) => { o += T(540, y0 + 66 + i * 58, 44, l, { a: 'middle', b: true }); });
  return o + '</g>';
}

function frame(i) {
  const t = i / FPS;
  const sec = Object.keys(B).find(k => t >= B[k][0] && t < B[k][1]) || 'outro';
  const [s0, s1] = B[sec], lt = t - s0, len = s1 - s0;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`;
  s += `<rect width="${W}" height="200" fill="#000" opacity="0.25"/>`;
  const SW = (1000 - (NF - 1) * 12) / NF; for (let k = 0; k < NF; k++) { const [a, b] = B['n' + (k + 1)], p = clamp((t - a) / (b - a)); s += `<rect x="${40 + k * (SW + 12)}" y="34" width="${SW}" height="8" rx="4" fill="#fff" fill-opacity="0.25"/>` + (p > 0 ? `<rect x="${40 + k * (SW + 12)}" y="34" width="${SW * p}" height="8" rx="4" fill="${C.cy}"/>` : ''); }
  const la = back((lt) / 0.4);
  s += `<g transform="translate(${-300 * (1 - la)} 0)"><rect x="40" y="70" width="${LABEL[sec].length * 24 + 56}" height="70" rx="16" fill="${C.bg}" fill-opacity="0.9" stroke="${C.cy}" stroke-width="3"/>${T(64, 118, 36, LABEL[sec], { b: true })}</g>`;
  s += infoBar(t);
  s += desk(t);
  if (sec !== 'intro' || lt > 3.2) s += scenes[sec](sec === 'intro' ? lt - 3.2 : lt, sec === 'intro' ? len - 3.2 : len);
  s += note2045(sec, lt, len);
  s += subtitle(t);
  s += hud(t);
  const d = t - s0;
  if (sec !== 'intro' && d < 0.25) for (let k = 0; k < 6; k++) s += `<rect x="0" y="${(k * 331 + i * 47) % H}" width="${W}" height="${10 + k * 4}" fill="${k % 2 ? C.cy : C.pk}" opacity="${0.45 * (1 - d / 0.25)}"/>`;
  s += connect(t);
  return s + '</svg>';
}

(async () => {
  if (process.argv[2]) { for (const sec of process.argv[2].split(',')) await sharp(Buffer.from(frame(Math.round(+sec * FPS)))).png().toFile(`ov3_${sec}.png`); return; }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-i', 'char_track.mp4', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-',
    '-filter_complex', '[0:v][1:v]overlay=format=auto,format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-r', `${FPS}`, 'video_nosound.mp4'], { stdio: ['pipe', 'ignore', 'inherit'] });
  for (let i = 0; i < N; i += 8) {
    const bufs = await Promise.all(Array.from({ length: Math.min(8, N - i) }, (_, k) => sharp(Buffer.from(frame(i + k))).ensureAlpha().raw().toBuffer()));
    for (const b of bufs) if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('done', N);
})();
