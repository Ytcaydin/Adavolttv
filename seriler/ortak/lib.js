// Ortak skeç motoru: dikey 1080x1920, taban (arka plan+grafik) + üst katman (balonlar, karakterler)
const sharp = require('/opt/npm-tools/node_modules/sharp');
const { spawn } = require('child_process');
const W = 1080, H = 1920, FPS = 30, F = 'DejaVu Sans';
const C = { cy: '#00f0ff', pk: '#ff4fd8', ye: '#ffd23f', pu: '#c45bff', bg: '#0a0f2e', mu: '#9fb3ff', gr: '#3dff9a', rd: '#ff3355', am: '#ffb347' };
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
const pop = x => { x = clamp(x); return x < 1 ? ease(x) + Math.sin(x * Math.PI) * 0.12 : 1; };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const T = (x, y, sz, s, o = {}) => `<text x="${x}" y="${y}" font-family="${o.mono ? 'DejaVu Sans Mono' : F}" font-size="${sz}" font-weight="${o.b ? 'bold' : 'normal'}" fill="${o.c || '#fff'}" text-anchor="${o.a || 'start'}" ${o.op !== undefined ? `opacity="${o.op}"` : ''}>${esc(s)}</text>`;
const fade = (t, a, b, d = 0.3) => ease((t - a) / d) * (1 - clamp((t - (b - d)) / d));
function wrap(s, max) { const w = s.split(' '); const L = []; let cur = ''; for (const x of w) { if ((cur + ' ' + x).trim().length > max) { L.push(cur.trim()); cur = x; } else cur += ' ' + x; } if (cur.trim()) L.push(cur.trim()); return L; }

// speakers: {ada:{label,col,side:'L'}, x:{label,col,side:'R'}}
function bubble(t, b, SP, y = 190) {
  const [t0, t1, who, text] = b; if (t < t0 || t > t1 + 0.25) return '';
  const sp = SP[who], k = pop((t - t0) / 0.25), out = 1 - clamp((t - t1) / 0.25);
  const lines = wrap(text, 26), sz = 50, lh = 64;
  const bw = Math.min(940, Math.max(...lines.map(l => l.length)) * sz * 0.6 + 90), bh = lines.length * lh + 56;
  const L = sp.side === 'L', x = L ? 60 : W - 60 - bw;
  const tx = L ? x + 150 : x + bw - 150;
  let o = `<g opacity="${out}" transform="translate(${tx} ${y + bh}) scale(${k}) translate(${-tx} ${-(y + bh)})">`;
  o += `<path d="M${tx - 30} ${y + bh - 4} L${tx + (L ? -60 : 60)} ${y + bh + 66} L${tx + 30} ${y + bh - 4} Z" fill="#fff"/>`;
  o += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="38" fill="#fff" stroke="${sp.col}" stroke-width="8"/>`;
  const lw = sp.label.length * 19 + 50;
  o += `<rect x="${x + 30}" y="${y - 26}" width="${lw}" height="48" rx="24" fill="${sp.col}"/>` + T(x + 30 + lw / 2, y + 8, 28, sp.label, { b: true, a: 'middle', c: sp.dark ? C.bg : '#fff' });
  lines.forEach((l, i) => { o += T(x + bw / 2, y + 70 + i * lh, sz, l, { b: true, a: 'middle', c: '#101530' }); });
  return o + '</g>';
}
function topbar(t, dur, left, leftCol, right) {
  let o = `<rect x="0" y="0" width="${W}" height="130" fill="#020615" opacity="0.85"/>`;
  o += T(50, 88, 44, left, { b: true, c: leftCol });
  const rw = right.length * 22 + 60;
  o += `<rect x="${W - rw - 40}" y="38" width="${rw}" height="60" rx="30" fill="#16204f"/>` + T(W - rw / 2 - 40, 80, 32, right, { b: true, a: 'middle', c: C.ye });
  o += `<rect x="0" y="130" width="${W * t / dur}" height="8" fill="${C.pk}"/>`;
  return o;
}
function factCard(t, t0, t1, lines, col = C.gr, label = 'GERÇEK BİLGİ') {
  if (t < t0 || t > t1) return '';
  const a = fade(t, t0, t1);
  const h = 170 + (lines.length - 2) * 62 + 90;
  let o = `<g opacity="${a}"><rect x="60" y="250" width="960" height="${h}" rx="34" fill="${C.bg}" fill-opacity="0.95" stroke="${col}" stroke-width="6"/>`;
  const lw = label.length * 21 + 60;
  o += `<rect x="100" y="222" width="${lw}" height="56" rx="28" fill="${col}"/>` + T(100 + lw / 2, 262, 32, label, { b: true, a: 'middle', c: C.bg });
  lines.forEach((l, i) => { const k = ease((t - t0 - 0.4 - i * 0.3) / 0.3); o += T(110, 350 + i * 66 + (i > 1 ? 20 : 0), i < 2 ? 54 : 42, l, { b: i < 2, c: i < 2 ? C.ye : '#fff', op: k }); });
  return o + '</g>';
}
function card(t, t0, t1, l1, l2, l3, col = C.pk) {
  if (t < t0 || t > t1) return '';
  const a = fade(t, t0, t1);
  let o = `<g opacity="${a}"><rect x="60" y="250" width="960" height="430" rx="34" fill="${C.bg}" fill-opacity="0.95" stroke="${col}" stroke-width="6"/>`;
  o += T(540, 370, 52, l1, { b: true, a: 'middle' }) + T(540, 445, 52, l2, { b: true, a: 'middle', c: C.ye });
  o += `<rect x="240" y="520" width="600" height="80" rx="40" fill="${col}"/>` + T(540, 574, 38, l3, { b: true, a: 'middle' });
  return o + '</g>';
}
function titleCard(t, text, until = 2.4, col = C.ye) {
  if (t > until + 0.4) return '';
  const a = 1 - clamp((t - until) / 0.4), k = pop(t / 0.3);
  return `<g opacity="${a}" transform="translate(540 835) scale(${k}) translate(-540 -835)"><rect x="70" y="760" width="940" height="150" rx="30" fill="${col}"/>` + T(540, 860, text.length > 18 ? 58 : 68, text, { b: true, a: 'middle', c: C.bg }) + '</g>';
}
function glitch(t, at, dur = 0.35) {
  const d = t - at; if (d < 0 || d > dur) return '';
  const a = 1 - d / dur; let o = '';
  for (let i = 0; i < 10; i++) { const y = ((i * 197 + Math.floor(t * 40) * 61) % H); o += `<rect x="${(i % 2 ? -1 : 1) * 50 * a}" y="${y}" width="${W}" height="${16 + (i % 3) * 18}" fill="${i % 2 ? C.cy : C.pk}" opacity="${0.4 * a}"/>`; }
  return o + `<rect width="${W}" height="${H}" fill="#fff" opacity="${0.2 * a}"/>`;
}

async function render(opts) {
  // opts: {dur, base(t)->svg inner, top(t)->svg inner, bgPng(t)->filename|null, prefix}
  const mode = process.argv[2];
  const BG = {};
  const baseFrame = async t => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${opts.base(t)}</svg>`;
    const bgf = opts.bgPng ? opts.bgPng(t) : null;
    if (!bgf) return sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer();
    BG[bgf] ||= await sharp(bgf).resize(W, H).raw().ensureAlpha().toBuffer();
    return sharp(BG[bgf], { raw: { width: W, height: H, channels: 4 } }).composite([{ input: Buffer.from(svg) }]).raw().toBuffer();
  };
  const topFrame = async t => sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${opts.top(t)}</svg>`)).ensureAlpha().raw().toBuffer();
  if (mode === 'preview') {
    for (const s of process.argv[3].split(',')) {
      const b = await baseFrame(+s), tp = await topFrame(+s);
      await sharp(b, { raw: { width: W, height: H, channels: 4 } }).composite([{ input: tp, raw: { width: W, height: H, channels: 4 } }]).png().toFile(`${opts.prefix}_pv_${s}.png`);
    }
    return;
  }
  const top = mode === 'top';
  const args = ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-'];
  if (top) args.push('-c:v', 'qtrle', '-pix_fmt', 'argb', `${opts.prefix}_top.mov`); else args.push('-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', `${opts.prefix}_base.mp4`);
  const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(opts.dur * FPS);
  for (let i = 0; i < N; i++) { const b = top ? await topFrame(i / FPS) : await baseFrame(i / FPS); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log(opts.prefix, mode, 'ok');
}
module.exports = { W, H, FPS, C, clamp, ease, pop, esc, T, fade, wrap, bubble, topbar, factCard, card, titleCard, glitch, render };
