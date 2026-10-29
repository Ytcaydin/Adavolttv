// 10 Kasım: vidIQ compose için şeffaf yazı kartları (1080x1920 PNG)
const sharp = require('/opt/npm-tools/node_modules/sharp');
const fs = require('fs');
const W = 1080, H = 1920, C = 900;
const esc = s => s.replace(/&/g, '&amp;');
const T = (y, sz, s, o = {}) => `<text x="540" y="${y}" font-family="Lora" font-size="${sz}" font-weight="${o.b ? 700 : 400}" ${o.i ? 'font-style="italic"' : ''} fill="${o.c || '#f4f4f4'}" text-anchor="middle" letter-spacing="${o.ls || 0}" filter="url(#sh)">${esc(s)}</text>`;
const K = {
  c1a: T(C - 40, 96, '10 Kasım 1938.'),
  c1b: T(C + 80, 72, 'Saat 09.05.', { c: '#d0d0d0', i: true }),
  c2: T(C - 30, 70, 'Bir insan, bir ömürde') + T(C + 70, 70, 'kaç karar verir?'),
  c3a: T(C - 200, 170, '1928', { b: true, ls: 6 }) + T(C - 60, 60, 'Yeni harfler.', { i: true, c: '#dcdcdc' }),
  c3b: T(C + 90, 50, 'Bugün 6 yaş üstü nüfusun') + T(C + 160, 50, "%97,8'i okuma yazma biliyor.") + T(C + 250, 30, 'TÜİK, 2024', { c: '#b0b0b0', ls: 2 }),
  c4a: T(C - 260, 170, '1934', { b: true, ls: 6 }) + T(C - 120, 54, 'Kadınlara seçme', { i: true, c: '#dcdcdc' }) + T(C - 50, 54, 've seçilme hakkı.', { i: true, c: '#dcdcdc' }),
  c4b: T(C + 90, 52, "Fransa 1944'te.", { c: '#c8c8c8' }),
  c4c: T(C + 175, 52, "İtalya 1946'da.", { c: '#c8c8c8' }),
  c4d: T(C + 260, 52, "İsviçre 1971'de.", { c: '#c8c8c8' }),
  c5: T(C - 30, 70, 'Seçtiği yol,') + T(C + 70, 70, 'bugün yürüdüğümüz yol.'),
  c6a: T(C + 10, 80, 'Saygı ve özlemle.', { i: true }),
  c6b: `<rect x="490" y="${C + 70}" width="100" height="2" fill="#aaa"/>` + T(C + 140, 30, 'SEÇMEDİĞİN YOL', { c: '#bdbdbd', ls: 6 }),
};
(async () => {
  fs.mkdirSync('kart', { recursive: true });
  for (const [k, v] of Object.entries(K)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><filter id="sh" x="-20%" y="-50%" width="140%" height="200%"><feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000" flood-opacity="0.85"/></filter></defs>${v}</svg>`;
    await sharp(Buffer.from(svg)).png().toFile(`kart/${k}.png`);
  }
  const sc = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><radialGradient id="v" cx="50%" cy="48%" r="75%"><stop offset="0%" stop-color="#000" stop-opacity="0.45"/><stop offset="100%" stop-color="#000" stop-opacity="0.9"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#v)"/></svg>`;
  await sharp(Buffer.from(sc)).png().toFile('kart/scrim.png');
  console.log('ok');
})();
