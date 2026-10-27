const sharp = require('/opt/npm-tools/node_modules/sharp');
const BG='#0d0f14',AM='#ffb547',GH='#7fe3ff',TX='#f2efe8',FC='DejaVu Sans Condensed';
const bar=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-90 30 L90 30 L65 -30 L-65 -30 Z" fill="${AM}"/><path d="M-65 -30 L65 -30 L55 -42 L-55 -42 Z" fill="#ffd28a"/><path d="M-50 18 L50 18" stroke="#c98a2a" stroke-width="4"/></g>`;
let s=`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="1280" height="720" fill="${BG}"/>
<defs><radialGradient id="g" cx="0.75" cy="0.55" r="0.5"><stop offset="0" stop-color="${AM}" stop-opacity="0.35"/><stop offset="1" stop-color="${AM}" stop-opacity="0"/></radialGradient></defs>
<rect width="1280" height="720" fill="url(#g)"/>`;
// altın yığını
const rows=[6,5,4,3,2,1]; let k=0;
rows.forEach((c,r)=>{for(let i=0;i<c;i++) s+=bar(990+(i-(c-1)/2)*92,600-r*42,0.48);});
s+=`<rect x="60" y="70" width="330" height="62" rx="10" fill="${GH}"/><text x="225" y="114" font-family="${FC}" font-weight="bold" font-size="38" fill="${BG}" text-anchor="middle">2000'DE BAŞLA</text>`;
s+=`<text x="50" y="330" font-family="${FC}" font-weight="bold" font-size="170" fill="${AM}">2 MİLYON</text>`;
s+=`<text x="55" y="450" font-family="${FC}" font-weight="bold" font-size="100" fill="${TX}">TL'LİK ALTIN</text>`;
s+=`<text x="60" y="600" font-family="DejaVu Serif" font-style="italic" font-weight="bold" font-size="54" fill="${TX}">ayda %10 · 26 yıl</text>`;
s+=`</svg>`;
sharp(Buffer.from(s)).jpeg({quality:92}).toFile('kapak_v001_b.jpg').then(()=>console.log('ok'));
