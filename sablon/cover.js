const sharp = require('/opt/npm-tools/node_modules/sharp');
const [, , bg, ada, out, ep, l1, l2, l3] = process.argv;
const W = 1080, H = 1920, F = 'DejaVu Sans';
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fit = (t, max, s) => Math.min(s, max / (t.length * 0.74));
(async () => {
  const lines = [l1, l2, l3].filter(Boolean);
  let o = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`;
  o += `<rect x="0" y="0" width="${W}" height="${H}" fill="#020615" opacity="0.25"/>`;
  o += `<rect x="60" y="150" width="${ep.length * 30 + 70}" height="84" rx="20" fill="#0a0f2e" stroke="#00f0ff" stroke-width="4"/><text x="95" y="208" font-family="${F}" font-weight="bold" font-size="44" fill="#fff">${esc(ep)}</text>`;
  o += `<rect x="40" y="1180" width="1000" height="${70 + lines.length * 120}" rx="36" fill="#0a0f2e" fill-opacity="0.9" stroke="#ff4fd8" stroke-width="5"/>`;
  lines.forEach((l, i) => { const s = fit(l, 920, 104); o += `<text x="540" y="${1290 + i * 120}" text-anchor="middle" font-family="${F}" font-weight="bold" font-size="${s}" fill="${i === lines.length - 1 ? '#ffd23f' : '#ffffff'}">${esc(l)}</text>`; });
  o += `<text x="540" y="${1180 + 70 + lines.length * 120 + 80}" text-anchor="middle" font-family="${F}" font-weight="bold" font-size="40" fill="#00f0ff">ADA VOLT · 2045 ARŞİV YAYINI</text></svg>`;
  const adaImg = await sharp(ada).resize({ height: 1500 }).toBuffer();
  const m = await sharp(adaImg).metadata();
  await sharp(bg).resize(W, H).composite([{ input: adaImg, left: Math.round((W - m.width) / 2), top: 280 }, { input: Buffer.from(o) }]).jpeg({ quality: 90 }).toFile(out);
})();
