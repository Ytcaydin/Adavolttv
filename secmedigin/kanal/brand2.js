const sharp = require('/opt/npm-tools/node_modules/sharp');
const BG = '#0d0f14', AM = '#ffb547', GH = '#7fe3ff', TX = '#f2efe8', AS = '#2b2f3a', FC = 'DejaVu Sans Condensed';
// Perspektifli yol ayrımı. (cx, by) = yolun alt orta noktası, s = ölçek
function road(cx, by, s) {
  const P = (x, y) => `${cx + x * s} ${by - y * s}`;
  let o = '';
  // ufuk parıltısı (seçilmeyen yol tarafı)
  o += `<defs><radialGradient id="g2" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${GH}" stop-opacity="0.35"/><stop offset="1" stop-color="${GH}" stop-opacity="0"/></radialGradient>
        <radialGradient id="g1" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${AM}" stop-opacity="0.28"/><stop offset="1" stop-color="${AM}" stop-opacity="0"/></radialGradient></defs>`;
  o += `<ellipse cx="${cx - 200 * s}" cy="${by - 455 * s}" rx="${105 * s}" ry="${55 * s}" fill="url(#g1)"/><ellipse cx="${cx + 200 * s}" cy="${by - 455 * s}" rx="${105 * s}" ry="${55 * s}" fill="url(#g2)"/>`;
  // ana gövde (alt)
  o += `<path d="M${P(-230, 0)} L${P(230, 0)} L${P(70, 230)} L${P(-70, 230)} Z" fill="${AS}"/>`;
  // seçilen yol (sola, dolu asfalt, amber kenar)
  o += `<path d="M${P(-70, 230)} L${P(0, 230)} L${P(-190, 470)} L${P(-230, 470)} Z" fill="${AS}"/>`;
  o += `<path d="M${P(-230, 0)} L${P(-70, 230)} L${P(-230, 470)}" stroke="${AM}" stroke-width="${7 * s}" fill="none" stroke-linejoin="round"/>`;
  o += `<path d="M${P(0, 230)} L${P(-190, 470)}" stroke="${AM}" stroke-width="${7 * s}" fill="none"/>`;
  // seçilmeyen yol (sağa, hayalet: sadece kesikli kenar)
  o += `<path d="M${P(0, 230)} L${P(70, 230)} L${P(230, 470)} L${P(190, 470)} Z" fill="${GH}" opacity="0.08"/>`;
  o += `<path d="M${P(230, 0)} L${P(70, 230)} L${P(230, 470)}" stroke="${GH}" stroke-width="${6 * s}" fill="none" stroke-dasharray="${16 * s} ${12 * s}"/>`;
  o += `<path d="M${P(0, 230)} L${P(190, 470)}" stroke="${GH}" stroke-width="${6 * s}" fill="none" stroke-dasharray="${16 * s} ${12 * s}"/>`;
  // orta şerit çizgileri
  for (let i = 0; i < 4; i++) { const y0 = 20 + i * 52, y1 = y0 + 30; o += `<path d="M${P(0, y0)} L${P(0, y1)}" stroke="${TX}" stroke-width="${(10 - i * 1.6) * s}" opacity="0.85"/>`; }
  for (let i = 0; i < 3; i++) { const t0 = 0.12 + i * 0.3, t1 = t0 + 0.15; const L = (t, sgn) => P(sgn * (35 + 175 * t), 230 + 240 * t);
    o += `<path d="M${L(t0, -1)} L${L(t1, -1)}" stroke="${TX}" stroke-width="${(6 - i * 1.4) * s}" opacity="0.85"/>`;
    o += `<path d="M${L(t0, 1)} L${L(t1, 1)}" stroke="${GH}" stroke-width="${(6 - i * 1.4) * s}" opacity="0.5"/>`; }
  // ayrımda duran yüzsüz figür
  const fx = cx, fy = by - 175 * s;
  o += `<circle cx="${fx}" cy="${fy - 62 * s}" r="${16 * s}" fill="${TX}"/><path d="M${fx - 18 * s} ${fy - 40 * s} Q${fx} ${fy - 50 * s} ${fx + 18 * s} ${fy - 40 * s} L${fx + 14 * s} ${fy} L${fx - 14 * s} ${fy} Z" fill="${TX}"/>`;
  return o;
}
(async () => {
  const p = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="800" height="800" fill="${BG}"/>${road(400, 640, 0.95)}</svg>`;
  await sharp(Buffer.from(p)).png().toFile('profil.png');
  let b = `<svg xmlns="http://www.w3.org/2000/svg" width="2560" height="1440"><rect width="2560" height="1440" fill="${BG}"/>`;
  for (let i = 0; i < 40; i++) b += `<circle cx="${(i * 677) % 2560}" cy="${(i * 389) % 1440}" r="${1 + (i % 3)}" fill="${TX}" opacity="0.12"/>`;
  b += road(1800, 895, 0.7);
  b += `<text x="560" y="690" font-family="${FC}" font-weight="bold" font-size="150" fill="${TX}">SEÇMEDİĞİN</text>`;
  b += `<text x="560" y="830" font-family="${FC}" font-weight="bold" font-size="150" fill="${AM}">YOL</text>`;
  b += `<text x="905" y="815" font-family="DejaVu Serif" font-style="italic" font-weight="bold" font-size="60" fill="${TX}">Ya öbürünü seçseydin?</text>`;
  b += `<text x="562" y="905" font-family="${FC}" font-weight="bold" font-size="40" fill="${TX}" opacity="0.7" letter-spacing="4">HER CUMARTESİ · GERÇEK VERİLERLE</text></svg>`;
  await sharp(Buffer.from(b)).png().toFile('banner.png');
})();
