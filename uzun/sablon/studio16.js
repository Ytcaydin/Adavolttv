const sharp = require('/opt/npm-tools/node_modules/sharp');
const W = 1920, H = 1080;
function rand(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
const SX = 520, SY = 80, SW = 1300, SH = 620; // wall screen

const screens = {
  neon() {
    let s = `<rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="#2a0f5c"/><circle cx="${SX + 700}" cy="${SY + 220}" r="170" fill="#ff4fd8" opacity="0.45"/>`;
    for (let i = 0; i < 16; i++) {
      const x = SX + i * 62 - 10, bw = 50 + rand(i) * 40, top = SY + 300 + rand(i + 5) * 300;
      s += `<rect x="${x}" y="${top}" width="${bw}" height="${SY + SH - top}" fill="${i % 2 ? '#150833' : '#1f0d4a'}"/>`;
      for (let r = 0; r < 12; r++) if (rand(i * 50 + r) > 0.5) s += `<rect x="${x + 10}" y="${top + 14 + r * 30}" width="${bw - 24}" height="8" fill="${rand(i + r) > 0.5 ? '#00f0ff' : '#ffd23f'}" opacity="0.7"/>`;
    }
    return s;
  },
  lab() {
    let s = `<rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="#0f2f5c"/>`;
    for (let i = 0; i < 8; i++) s += `<rect x="${SX + 60 + i * 110}" y="${SY + 560 - i * 50}" width="70" height="${i * 50 + 120}" fill="#3ad1ff" opacity="${0.35 + i * 0.07}"/>`;
    s += `<path d="M${SX + 40} ${SY + 520} ${Array.from({ length: 12 }, (_, i) => `L${SX + 40 + i * 78} ${SY + 480 - i * 30 - rand(i) * 60}`).join(' ')}" fill="none" stroke="#ffd23f" stroke-width="8"/>`;
    s += `<rect x="${SX + 60}" y="${SY + 60}" width="320" height="40" rx="20" fill="#ffffff" opacity="0.5"/><rect x="${SX + 60}" y="${SY + 120}" width="220" height="30" rx="15" fill="#ffffff" opacity="0.35"/>`;
    return s;
  },
  sunucu() {
    let s = `<rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="#061b2b"/>`;
    for (let k = 0; k < 6; k++) {
      const x = SX + 30 + k * 155;
      s += `<rect x="${x}" y="${SY + 40}" width="130" height="${SH - 80}" fill="#0c2c44"/>`;
      for (let r = 0; r < 24; r++) for (let c = 0; c < 4; c++) if (rand(k * 400 + r * 9 + c) > 0.35) s += `<circle cx="${x + 20 + c * 30}" cy="${SY + 70 + r * 27}" r="5" fill="${rand(r + c + k) > 0.85 ? '#ff4d6d' : '#00e5ff'}"/>`;
    }
    return s;
  },
  uzay() {
    let s = `<rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="#030616"/>`;
    for (let i = 0; i < 220; i++) s += `<circle cx="${SX + rand(i) * SW}" cy="${SY + rand(i + 700) * SH}" r="${0.8 + rand(i + 3) * 2.4}" fill="#fff" opacity="${0.4 + rand(i + 9) * 0.6}"/>`;
    s += `<circle cx="${SX + 640}" cy="${SY + 560}" r="330" fill="#2a6fd6"/><circle cx="${SX + 580}" cy="${SY + 500}" r="290" fill="#3d8bff" opacity="0.6"/><ellipse cx="${SX + 640}" cy="${SY + 560}" rx="480" ry="70" fill="none" stroke="#9fe0ff" stroke-width="10" opacity="0.5"/>`;
    return s;
  },
  sinema() {
    let s = `<rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="#1a0610"/>`;
    s += `<rect x="${SX + 90}" y="${SY + 60}" width="${SW - 180}" height="400" rx="10" fill="#3a63b8"/><circle cx="${SX + SW / 2}" cy="${SY + 260}" r="110" fill="#9fd0ff" opacity="0.55"/>`;
    s += `<rect x="${SX}" y="${SY}" width="70" height="${SH}" fill="#6b1226"/><rect x="${SX + SW - 70}" y="${SY}" width="70" height="${SH}" fill="#6b1226"/>`;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 11; c++) s += `<rect x="${SX + 40 + c * 82}" y="${SY + 500 + r * 64}" width="66" height="48" rx="14" fill="${r % 2 ? '#7a1028' : '#8c1530'}"/>`;
    return s;
  },
};

function studio(name) {
  let s = `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050a1f"/><stop offset="1" stop-color="#0b1440"/></linearGradient><clipPath id="sc"><rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" rx="34"/></clipPath>
  <linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1a55"/><stop offset="1" stop-color="#050a1f"/></linearGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#g)"/>`;
  for (let i = 0; i < 4; i++) s += `<path d="M${-100 + i * 40} ${60 + i * 22} Q960 ${-60 + i * 22} ${2020 - i * 40} ${60 + i * 22}" fill="none" stroke="#00f0ff" stroke-opacity="${0.3 - i * 0.06}" stroke-width="4"/>`;
  s += `<g clip-path="url(#sc)">${screens[name]()}`;
  for (let y = SY; y < SY + SH; y += 8) s += `<rect x="${SX}" y="${y}" width="${SW}" height="2" fill="#000" opacity="0.18"/>`;
  s += `</g><rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" rx="34" fill="none" stroke="#00f0ff" stroke-width="7"/><rect x="${SX - 12}" y="${SY - 12}" width="${SW + 24}" height="${SH + 24}" rx="44" fill="none" stroke="#00f0ff" stroke-opacity="0.3" stroke-width="4"/>`;
  for (const x of [40, 400]) { s += `<rect x="${x}" y="90" width="18" height="640" rx="9" fill="#0e1b52"/><rect x="${x + 5}" y="110" width="8" height="600" rx="4" fill="#ff4fd8" opacity="0.8"/>`; }
  s += `<rect x="0" y="760" width="${W}" height="${H - 760}" fill="url(#fl)"/>`;
  for (let i = -12; i <= 12; i++) s += `<line x1="${960 + i * 80}" y1="760" x2="${960 + i * 300}" y2="${H}" stroke="#00f0ff" stroke-opacity="0.2" stroke-width="3"/>`;
  for (let k = 0; k < 6; k++) { const y = 760 + Math.pow(k / 6, 1.8) * 320; s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#00f0ff" stroke-opacity="0.18" stroke-width="3"/>`; }
  s += `<rect x="0" y="752" width="${W}" height="8" fill="#00f0ff" opacity="0.5"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${s}</svg>`;
}

(async () => {
  for (const n of Object.keys(screens)) await sharp(Buffer.from(studio(n))).blur(3.5).png().toFile(`bg16_${n}.png`);
  console.log('ok');
})();
