// Uzun video deneme sahnesi (16:9) – taban katman: arka plan + grafikler + alt yazı
const sharp = require('/opt/npm-tools/node_modules/sharp');
const fs = require('fs');
const { spawn } = require('child_process');
const W = 1920, H = 1080, FPS = 30, F = 'DejaVu Sans';
const C = { cy: '#00f0ff', pk: '#ff4fd8', ye: '#ffd23f', pu: '#c45bff', bg: '#0a0f2e', mu: '#9fb3ff' };
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const T = (x, y, sz, s, o = {}) => `<text x="${x}" y="${y}" font-family="${F}" font-size="${sz}" font-weight="${o.b ? 'bold' : 'normal'}" fill="${o.c || '#fff'}" text-anchor="${o.a || 'start'}" ${o.op !== undefined ? `opacity="${o.op}"` : ''} ${o.ls ? `letter-spacing="${o.ls}"` : ''}>${esc(s)}</text>`;
const pill = (x, y, s, bg, fg = '#0a0f2e', sz = 26) => { const w = s.length * sz * 0.66 + 36; return `<rect x="${x}" y="${y}" width="${w}" height="${sz + 22}" rx="${(sz + 22) / 2}" fill="${bg}"/>` + T(x + 18, y + sz + 4, sz, s, { b: true, c: fg }); };

const SCN = JSON.parse(fs.readFileSync('demo.json'));
const DUR = SCN.duration;
const BG = {};

// ---- ortak katmanlar
function topbar(t) {
  let o = `<rect x="0" y="0" width="${W}" height="64" fill="#020615" opacity="0.75"/>`;
  o += T(32, 42, 26, 'ADA VOLT', { b: true, c: C.cy, ls: 3 }) + T(222, 42, 26, '· 2045 ARŞİV RAPORU', { b: true, c: C.mu });
  o += `<circle cx="${W - 250}" cy="32" r="8" fill="#ff3355" opacity="${0.5 + 0.5 * Math.sin(t * 6)}"/>` + T(W - 232, 42, 24, 'KAYIT AKTİF', { b: true, c: '#ff8899' });
  o += `<rect x="0" y="64" width="${W}" height="5" fill="#16204f"/><rect x="0" y="64" width="${W * t / DUR}" height="5" fill="${C.pk}"/>`;
  return o;
}
function subtitle(t) {
  const s = SCN.subs.find(x => t >= x[0] && t < x[1]); if (!s) return '';
  const cx = s[3] || 960, w = Math.min(1500, s[2].length * 25 + 80);
  const a = ease((t - s[0]) / 0.15);
  return `<g opacity="${a}"><rect x="${cx - w / 2}" y="${H - 132}" width="${w}" height="74" rx="18" fill="#000" fill-opacity="0.78"/>` + T(cx, H - 82, 40, s[2], { b: true, a: 'middle' }) + '</g>';
}
function glitch(t, at) {
  const d = t - at; if (d < -0.25 || d > 0.35) return '';
  const a = 1 - Math.abs(d) / 0.35; let o = '';
  for (let i = 0; i < 9; i++) { const y = ((i * 137 + Math.floor(t * 40) * 53) % H); o += `<rect x="${(i % 2 ? -1 : 1) * 40 * a}" y="${y}" width="${W}" height="${18 + (i % 3) * 14}" fill="${i % 2 ? C.cy : C.pk}" opacity="${0.35 * a}"/>`; }
  return o + `<rect width="${W}" height="${H}" fill="#fff" opacity="${0.18 * a}"/>`;
}

// ---- sahne 1: stüdyo açılış
function s1(t, lt) {
  let o = '';
  const a = ease((lt - 0.6) / 0.5), dx = (1 - a) * 300;
  o += `<g opacity="${a}" transform="translate(${dx} 0)"><rect x="760" y="170" width="1080" height="440" rx="34" fill="${C.bg}" fill-opacity="0.9" stroke="${C.pk}" stroke-width="5"/>`;
  o += pill(810, 210, 'ARŞİV RAPORU · 001', C.cy, C.bg, 28);
  o += T(810, 360, 92, 'ARŞİVDEN', { b: true }) + T(810, 470, 92, 'SİLİNENLER', { b: true, c: C.ye });
  const b = ease((lt - 1.6) / 0.5);
  o += `<g opacity="${b}">` + T(810, 550, 36, 'Teknoloji devlerinin çöpe attığı 10 efsane ürün', { c: C.mu }) + '</g></g>';
  // 10 dosya sayaç şeridi
  for (let i = 0; i < 10; i++) { const k = ease((lt - 2.4 - i * 0.12) / 0.3); o += `<rect x="${810 + i * 100}" y="640" width="84" height="56" rx="12" fill="${i === 0 ? C.pk : '#16204f'}" opacity="${k}"/>` + T(852 + i * 100, 679, 28, String(10 - i).padStart(2, '0'), { b: true, a: 'middle', op: k }); }
  return o;
}

// ---- sahne 2: arşiv ekranı (Google Glass)
const GLASS = (s) => `<g transform="translate(${s.x} ${s.y}) scale(${s.k})" fill="none" stroke="${C.cy}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
  <path pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1 - s.p}" d="M20 120 L560 120 Q600 120 600 160 L600 175"/>
  <path pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1 - s.p}" d="M20 120 Q0 120 0 150 L0 170"/>
  <path pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1 - s.p}" d="M180 120 Q190 175 260 180 Q330 175 340 120"/>
  <rect x="420" y="60" width="140" height="60" rx="16" stroke="${C.pk}" opacity="${s.p}"/>
  <path d="M440 120 L470 175 Q480 190 500 185 L540 170" stroke="${C.pk}" opacity="${clamp(s.p * 1.5 - 0.5)}"/>
  <circle cx="545" cy="90" r="12" fill="${C.ye}" stroke="none" opacity="${clamp(s.p * 2 - 1)}"/>
</g>`;
function archiveBg(t) {
  let o = `<rect width="${W}" height="${H}" fill="#040822"/>`;
  for (let x = 0; x < W; x += 60) o += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#0e1a4a" stroke-width="2"/>`;
  for (let y = 0; y < H; y += 60) o += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#0e1a4a" stroke-width="2"/>`;
  const sy = (t * 120) % H; o += `<rect x="0" y="${sy}" width="${W}" height="3" fill="${C.cy}" opacity="0.18"/>`;
  return o;
}
function s2(t, lt) {
  let o = archiveBg(t);
  // dosya kartı
  const a = ease(lt / 0.4);
  o += `<g opacity="${a}"><rect x="70" y="110" width="1340" height="610" rx="30" fill="${C.bg}" fill-opacity="0.92" stroke="${C.cy}" stroke-width="4"/>`;
  o += pill(110, 145, 'DOSYA 10 / 10', C.pk, '#fff', 28) + T(420, 182, 28, 'GOOGLE · GİYİLEBİLİR', { b: true, c: C.mu });
  o += T(110, 300, 96, 'GOOGLE GLASS', { b: true }) + T(110, 365, 44, '2013 – 2015', { b: true, c: C.ye });
  o += GLASS({ x: 700, y: 400, k: 1.1, p: ease((lt - 0.8) / 2.2) });
  // fiyat sayacı
  const pa = ease((lt - 3.6) / 0.4);
  if (pa > 0) { const v = Math.round(1500 * ease((lt - 3.6) / 1.0)); o += `<g opacity="${pa}">` + T(110, 470, 30, 'İLK FİYAT', { b: true, c: C.mu }) + T(110, 560, 88, '$' + v.toLocaleString('de-DE'), { b: true, c: C.cy }) + '</g>'; }
  o += '</g>';
  // zaman çizelgesi
  const ev = [[2013, 'Explorer sürümü', 2.4], [2014, 'Kafelerde yasak', 7.3], [2015, 'Satış durdu', 11.2]];
  const x0 = 230, x1 = 1300, y = 800;
  const prog = ev.reduce((p, e, i) => lt > e[2] ? i : p, -1);
  o += `<rect x="${x0}" y="${y - 4}" width="${x1 - x0}" height="8" rx="4" fill="#16204f"/>`;
  if (prog >= 0) { const tgt = prog / (ev.length - 1); const k = ease((lt - ev[prog][2]) / 0.6); const prev = prog > 0 ? (prog - 1) / (ev.length - 1) : 0; o += `<rect x="${x0}" y="${y - 4}" width="${(x1 - x0) * (prev + (tgt - prev) * k)}" height="8" rx="4" fill="${C.pk}"/>`; }
  ev.forEach((e, i) => {
    const x = x0 + (x1 - x0) * i / (ev.length - 1), k = ease((lt - e[2]) / 0.4);
    o += `<circle cx="${x}" cy="${y}" r="${16 + 6 * k}" fill="${k > 0 ? C.pk : '#16204f'}" stroke="${C.bg}" stroke-width="5"/>`;
    o += `<g opacity="${0.35 + 0.65 * k}">` + T(x, y - 34, 34, e[0], { b: true, a: 'middle', c: k > 0 ? C.ye : C.mu }) + T(x, y + 58, 28, e[1], { b: true, a: 'middle' }) + '</g>';
    if (i === 1 && k > 0) o += `<g opacity="${k}" transform="translate(${x + 120} ${y - 120}) rotate(-8)"><rect x="0" y="0" width="220" height="70" rx="10" fill="none" stroke="#ff3355" stroke-width="6"/>` + T(110, 48, 34, 'YASAK', { b: true, a: 'middle', c: '#ff3355' }) + '</g>';
  });
  // Ada PiP çerçevesi (Ada ffmpeg ile yerleşir)
  o += `<rect x="1480" y="110" width="380" height="460" rx="28" fill="#0b1440" stroke="${C.pk}" stroke-width="5"/>`;
  o += pill(1540, 590, 'ADA VOLT · CANLI', C.pk, '#fff', 22);
  return o;
}

// ---- sahne 3: 2045 notu
function s3(t, lt) {
  let o = '';
  const a = ease((lt - 0.3) / 0.4), g = lt < 0.7 ? Math.round(Math.sin(lt * 90) * 10) : 0;
  o += `<g opacity="${a}" transform="translate(${g} 0)"><rect x="80" y="170" width="980" height="250" rx="30" fill="#24083f" fill-opacity="0.94" stroke="${C.pu}" stroke-width="4" stroke-dasharray="16 7"/>`;
  o += pill(110, 146, '2045 NOTU', C.pu, '#fff', 28);
  o += T(130, 290, 52, 'Biz buna hâlâ', { b: true }) + T(130, 365, 52, '“ilk deneme” diyoruz.', { b: true, c: C.ye }) + '</g>';
  const b = ease((lt - 3.6) / 0.4);
  if (b > 0) {
    const gl = (Math.floor(lt * 12) % 7 === 0) ? 6 : 0;
    o += `<g opacity="${b}" transform="translate(${gl} 0)"><rect x="80" y="470" width="980" height="200" rx="30" fill="${C.bg}" fill-opacity="0.92" stroke="${C.cy}" stroke-width="4"/>`;
    o += T(130, 545, 32, 'SIRADAKİ DOSYA', { b: true, c: C.mu }) + T(130, 625, 64, 'DOSYA 09 · ???', { b: true, c: C.cy }) + '</g>';
  }
  return o;
}

async function frame(t) {
  const sc = SCN.scenes.find(s => t >= s.t0 && t < s.t1) || SCN.scenes[SCN.scenes.length - 1];
  const lt = t - sc.t0;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`;
  if (sc.kind === 's1') svg += s1(t, lt); else if (sc.kind === 's2') svg += s2(t, lt); else svg += s3(t, lt);
  svg += topbar(t) + subtitle(t);
  for (const s of SCN.scenes) svg += glitch(t, s.t0);
  svg += '</svg>';
  const base = sc.bg ? (BG[sc.bg] ||= await sharp(`bg16_${sc.bg}.png`).raw().ensureAlpha().toBuffer()) : null;
  const img = base ? sharp(base, { raw: { width: W, height: H, channels: 4 } }).composite([{ input: Buffer.from(svg) }])
                   : sharp(Buffer.from(svg));
  return img.ensureAlpha().raw().toBuffer();
}

(async () => {
  if (process.argv[2]) { for (const s of process.argv[2].split(',')) { const b = await frame(+s); await sharp(b, { raw: { width: W, height: H, channels: 4 } }).png().toFile(`base_${s}.png`); } return; }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', 'base.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(DUR * FPS);
  for (let i = 0; i < N; i++) { const b = await frame(i / FPS); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('base ok');
})();
