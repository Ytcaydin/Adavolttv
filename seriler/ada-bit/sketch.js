// "Ada & Bit" skeç örneği – dikey 1080x1920, taban katman (Ada ffmpeg ile eklenir)
const sharp = require('/opt/npm-tools/node_modules/sharp');
const fs = require('fs');
const { spawn } = require('child_process');
const W = 1080, H = 1920, FPS = 30, F = 'DejaVu Sans';
const C = { cy: '#00f0ff', pk: '#ff4fd8', ye: '#ffd23f', pu: '#c45bff', bg: '#0a0f2e', mu: '#9fb3ff', gr: '#3dff9a' };
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
const pop = x => { x = clamp(x); return x < 1 ? 1 + Math.sin(x * Math.PI) * 0.12 * (1 - x) + (ease(x) - 1) : 1; };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const T = (x, y, sz, s, o = {}) => `<text x="${x}" y="${y}" font-family="${F}" font-size="${sz}" font-weight="${o.b ? 'bold' : 'normal'}" fill="${o.c || '#fff'}" text-anchor="${o.a || 'start'}" ${o.op !== undefined ? `opacity="${o.op}"` : ''}>${esc(s)}</text>`;
const S = JSON.parse(fs.readFileSync('sketch.json'));
const DUR = S.duration;
let BGBUF;

// --- konuşma balonları
function wrap(s, max) { const w = s.split(' '); const L = []; let cur = ''; for (const x of w) { if ((cur + ' ' + x).trim().length > max) { L.push(cur.trim()); cur = x; } else cur += ' ' + x; } if (cur.trim()) L.push(cur.trim()); return L; }
function bubble(t, b) {
  const [t0, t1, who, text] = b; if (t < t0 || t > t1 + 0.25) return '';
  const k = pop((t - t0) / 0.25), out = 1 - clamp((t - t1) / 0.25);
  const lines = wrap(text, 26), sz = 52, lh = 66;
  const bw = Math.min(900, Math.max(...lines.map(l => l.length)) * sz * 0.6 + 90), bh = lines.length * lh + 60;
  const isAda = who === 'ada';
  const x = isAda ? 60 : W - 60 - bw, y = 190;
  const col = isAda ? C.pk : C.cy;
  const tx = isAda ? x + 160 : x + bw - 160;
  let o = `<g opacity="${out}" transform="translate(${tx} ${y + bh}) scale(${k}) translate(${-tx} ${-(y + bh)})">`;
  o += `<path d="M${tx - 30} ${y + bh - 4} L${tx + (isAda ? -60 : 60)} ${y + bh + 70} L${tx + 30} ${y + bh - 4} Z" fill="#fff"/>`;
  o += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="40" fill="#fff" stroke="${col}" stroke-width="8"/>`;
  o += `<rect x="${x + 30}" y="${y - 26}" width="${isAda ? 170 : 110}" height="48" rx="24" fill="${col}"/>` + T(x + 30 + (isAda ? 85 : 55), y + 8, 30, isAda ? 'ADA' : 'BİT', { b: true, a: 'middle', c: isAda ? '#fff' : C.bg });
  lines.forEach((l, i) => { o += T(x + bw / 2, y + 74 + i * lh, sz, l, { b: true, a: 'middle', c: '#101530' }); });
  return o + '</g>';
}

// --- Bit karakteri
function bitMood(t) { let m = 'happy'; for (const [at, md] of S.bitMoods) if (t >= at) m = md; return m; }
function bitTalking(t) { return S.bubbles.some(b => b[2] === 'bit' && t >= b[0] && t <= b[1]); }
function bit(t) {
  const mood = bitMood(t), talk = bitTalking(t);
  const cx = 860, cy = 1180 + Math.sin(t * 2.6) * 22, s = 1;
  const tilt = mood === 'cool' ? -8 : mood === 'sweat' ? Math.sin(t * 20) * 3 : Math.sin(t * 1.7) * 4;
  let o = `<ellipse cx="${cx}" cy="1500" rx="${120 - Math.sin(t * 2.6) * 12}" ry="22" fill="#000" opacity="0.35"/>`;
  o += `<g transform="translate(${cx} ${cy}) rotate(${tilt}) scale(${s})">`;
  // anten
  o += `<line x1="0" y1="-150" x2="${Math.sin(t * 4) * 14}" y2="-215" stroke="#9fb3ff" stroke-width="10" stroke-linecap="round"/><circle cx="${Math.sin(t * 4) * 14}" cy="-225" r="${18 + (talk ? Math.abs(Math.sin(t * 18)) * 6 : 0)}" fill="${mood === 'sweat' ? '#ff3355' : C.ye}"/>`;
  // kollar
  const arm = mood === 'proud' || mood === 'cool' ? -40 : Math.sin(t * 3) * 10;
  o += `<path d="M-150 10 Q-210 ${-20 + arm} -230 ${-60 + arm}" stroke="#1b2a6b" stroke-width="26" fill="none" stroke-linecap="round"/><path d="M150 10 Q210 ${30 - arm} 225 ${70 - arm}" stroke="#1b2a6b" stroke-width="26" fill="none" stroke-linecap="round"/>`;
  // gövde
  o += `<rect x="-160" y="-150" width="320" height="290" rx="70" fill="#1b2a6b" stroke="${C.cy}" stroke-width="8"/>`;
  o += `<rect x="-120" y="-110" width="240" height="170" rx="40" fill="#050a1f"/>`;
  // yüz
  const blink = (t % 3.3) < 0.12;
  const eye = (x) => {
    if (mood === 'cool') return '';
    if (mood === 'happy' || mood === 'proud') return `<path d="M${x - 26} -15 Q${x} -50 ${x + 26} -15" stroke="${C.cy}" stroke-width="12" fill="none" stroke-linecap="round"/>`;
    if (blink) return `<rect x="${x - 24}" y="-30" width="48" height="8" rx="4" fill="${C.cy}"/>`;
    return `<ellipse cx="${x}" cy="-28" rx="${mood === 'sweat' ? 16 : 20}" ry="${mood === 'sweat' ? 28 : 24}" fill="${C.cy}"/>`;
  };
  o += eye(-50) + eye(50);
  if (mood === 'cool') o += `<rect x="-100" y="-62" width="88" height="46" rx="12" fill="#000" stroke="${C.cy}" stroke-width="4"/><rect x="12" y="-62" width="88" height="46" rx="12" fill="#000" stroke="${C.cy}" stroke-width="4"/><rect x="-14" y="-48" width="28" height="8" fill="${C.cy}"/><rect x="-80" y="-56" width="30" height="8" fill="#fff" opacity="0.6"/>`;
  const mo = talk ? 8 + Math.abs(Math.sin(t * 16)) * 22 : 6;
  if (mood === 'sweat') o += `<path d="M-40 30 Q-20 18 0 30 Q20 42 40 30" stroke="${C.cy}" stroke-width="8" fill="none"/>`;
  else o += `<rect x="-36" y="${22 - mo / 2}" width="72" height="${mo}" rx="${Math.min(mo, 72) / 2}" fill="${C.cy}"/>`;
  if (mood === 'sweat') { const d = (t * 1.5) % 1; o += `<path d="M135 ${-140 + d * 60} q14 26 0 34 q-14 -8 0 -34" fill="#7fd6ff" opacity="${1 - d}"/>`; }
  // göğüs ışığı
  o += `<circle cx="0" cy="105" r="12" fill="${talk ? C.pk : '#3a4a8b'}"/>`;
  o += '</g>';
  if (mood === 'proud' || mood === 'happy' && bitTalking(t)) for (let i = 0; i < 4; i++) { const a = t * 2 + i * 1.6, r = 230; const sx = cx + Math.cos(a) * r, sy = cy - 40 + Math.sin(a) * r * 0.6; const sz = 14 + 8 * Math.abs(Math.sin(t * 5 + i)); o += `<path d="M${sx} ${sy - sz} L${sx + sz * 0.3} ${sy - sz * 0.3} L${sx + sz} ${sy} L${sx + sz * 0.3} ${sy + sz * 0.3} L${sx} ${sy + sz} L${sx - sz * 0.3} ${sy + sz * 0.3} L${sx - sz} ${sy} L${sx - sz * 0.3} ${sy - sz * 0.3} Z" fill="${C.ye}"/>`; }
  return o;
}

// --- 7 parmaklı el çizimi paneli
function handPanel(t) {
  const [p0, p1] = S.panel; if (t < p0 || t > p1) return '';
  const a = ease((t - p0) / 0.35) * (1 - clamp((t - (p1 - 0.3)) / 0.3));
  const px = 60, py = 540, pw = 640, ph = 460;
  let o = `<g opacity="${a}"><rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="30" fill="#f6f1e4" stroke="${C.cy}" stroke-width="8"/>`;
  o += T(px + 30, py + 52, 30, 'BİT_ÇİZİM_FINAL_v7.png', { b: true, c: '#8a8270' });
  const d = ease((t - S.drawAt) / 1.6);
  const cx = px + pw / 2, by = py + ph - 50;
  o += `<g fill="none" stroke="#2a2f55" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">`;
  o += `<path pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1 - d}" d="M${cx - 130} ${by} L${cx - 140} ${by - 170} Q${cx} ${by - 230} ${cx + 140} ${by - 170} L${cx + 130} ${by} Z"/>`;
  const N = 7;
  for (let i = 0; i < N; i++) {
    const ang = -150 + i * (120 / (N - 1)), rad = ang * Math.PI / 180;
    const bx = cx + Math.cos(rad) * 120, byy = by - 170 + Math.sin(rad) * 40 + 20;
    const len = (i === 0 ? 120 : 170 + (i % 3) * 20) * 0.72;
    const ex = bx + Math.cos(rad) * len, ey = byy + Math.sin(rad) * len;
    const fd = clamp(d * N - i * 0.6);
    o += `<line x1="${bx}" y1="${byy}" x2="${bx + (ex - bx) * fd}" y2="${byy + (ey - byy) * fd}" stroke-width="34" stroke="#f0c9a6"/>`;
    o += `<line x1="${bx}" y1="${byy}" x2="${bx + (ex - bx) * fd}" y2="${byy + (ey - byy) * fd}" stroke-width="6"/>`;
    // sayma
    const ct = S.countAt + i * 0.42;
    if (t > ct) { const k = pop((t - ct) / 0.25); o += `<g transform="translate(${ex} ${ey - 20}) scale(${k})"><circle r="34" fill="${i >= 5 ? '#ff3355' : C.pk}" stroke="none"/></g>` + T(ex, ey - 6, 40, String(i + 1), { b: true, a: 'middle', c: '#fff' }); }
  }
  o += `</g>`;
  if (t > S.countAt + 7 * 0.42 + 0.3) { const k = pop((t - S.countAt - 3.24) / 0.3); o += `<g transform="translate(${cx} ${by - 70}) rotate(-8) scale(${k})"><rect x="-150" y="-50" width="300" height="90" rx="14" fill="none" stroke="#ff3355" stroke-width="8"/>` + T(0, 20, 46, '7 PARMAK', { b: true, a: 'middle', c: '#ff3355' }) + '</g>'; }
  return o + '</g>';
}

// --- gerçek bilgi kartı ve kapanış
function factCard(t) {
  const [f0, f1] = S.fact; if (t < f0 || t > f1) return '';
  const a = ease((t - f0) / 0.35) * (1 - clamp((t - (f1 - 0.3)) / 0.3));
  let o = `<g opacity="${a}"><rect x="60" y="250" width="960" height="560" rx="34" fill="${C.bg}" fill-opacity="0.95" stroke="${C.gr}" stroke-width="6"/>`;
  o += `<rect x="100" y="222" width="320" height="56" rx="28" fill="${C.gr}"/>` + T(260, 262, 32, 'GERÇEK BİLGİ', { b: true, a: 'middle', c: C.bg });
  S.factLines.forEach((l, i) => { const k = ease((t - f0 - 0.4 - i * 0.35) / 0.3); o += T(110, 360 + i * 70 + (i > 1 ? 20 : 0), i < 2 ? 54 : 42, l, { b: i < 2, c: i < 2 ? C.ye : '#fff', op: k }); });
  return o + '</g>';
}
function endCard(t) {
  if (t < S.end) return '';
  const a = ease((t - S.end) / 0.4);
  let o = `<g opacity="${a}"><rect x="60" y="250" width="960" height="470" rx="34" fill="${C.bg}" fill-opacity="0.95" stroke="${C.pk}" stroke-width="6"/>`;
  o += T(540, 370, 50, 'Bit\'in bir sonraki', { b: true, a: 'middle' }) + T(540, 440, 50, 'hatası ne olsun?', { b: true, a: 'middle', c: C.ye });
  o += T(540, 530, 40, 'Yorumlara yaz!', { b: true, a: 'middle', c: C.cy });
  o += `<rect x="290" y="590" width="500" height="76" rx="38" fill="${C.pk}"/>` + T(540, 642, 38, 'ABONE OL', { b: true, a: 'middle' });
  return o + '</g>';
}
function topbar(t) {
  let o = `<rect x="0" y="0" width="${W}" height="130" fill="#020615" opacity="0.8"/>`;
  o += T(60, 90, 50, 'ADA', { b: true, c: C.pk }) + T(190, 90, 50, '&', { b: true, c: '#fff' }).replace('&amp;', '&amp;') + T(250, 90, 50, 'BİT', { b: true, c: C.cy });
  o += `<rect x="${W - 330}" y="38" width="270" height="60" rx="30" fill="#16204f"/>` + T(W - 195, 80, 32, 'BÖLÜM 1', { b: true, a: 'middle', c: C.ye });
  o += `<rect x="0" y="130" width="${W * t / DUR}" height="8" fill="${C.pk}"/>`;
  return o;
}
function titleCard(t) { // ilk 1.2 sn: başlık
  if (t > 2.6) return '';
  const a = 1 - clamp((t - 2.2) / 0.4);
  return `<g opacity="${a}"><rect x="90" y="760" width="900" height="150" rx="30" fill="${C.ye}"/>` + T(540, 860, 68, '7 PARMAK SORUNU', { b: true, a: 'middle', c: C.bg }) + '</g>';
}

async function frame(t) {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`;
  svg += `<rect width="${W}" height="${H}" fill="#050a1f" opacity="0.35"/>`;
  svg += topbar(t) + handPanel(t) + factCard(t) + endCard(t) + titleCard(t);
  svg += '</svg>';
  BGBUF ||= await sharp('bg_neon.png').resize(W, H).raw().ensureAlpha().toBuffer();
  return sharp(BGBUF, { raw: { width: W, height: H, channels: 4 } }).composite([{ input: Buffer.from(svg) }]).raw().toBuffer();
}
// üst katman (Ada'nın önünde): Bit + balonlar
async function topFrame(t) {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` + bit(t);
  for (const b of S.bubbles) svg += bubble(t, b);
  svg += '</svg>';
  return sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer();
}

(async () => {
  const mode = process.argv[2];
  if (mode === 'preview') { for (const s of process.argv[3].split(',')) { const b = await frame(+s), tp = await topFrame(+s); await sharp(b, { raw: { width: W, height: H, channels: 4 } }).composite([{ input: tp, raw: { width: W, height: H, channels: 4 } }]).png().toFile(`pv_${s}.png`); } return; }
  const top = mode === 'top';
  const args = ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-'];
  if (top) args.push('-c:v', 'qtrle', '-pix_fmt', 'argb', 'top.mov'); else args.push('-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', 'base.mp4');
  const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(DUR * FPS);
  for (let i = 0; i < N; i++) { const b = top ? await topFrame(i / FPS) : await frame(i / FPS); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log(mode, 'ok');
})();
