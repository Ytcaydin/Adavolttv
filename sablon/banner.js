const sharp = require('/opt/npm-tools/node_modules/sharp');
const W=2560,H=1440,F='DejaVu Sans';
function rand(i){const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);}
(async()=>{
 let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#160d3a"/>`;
 s+=`<circle cx="2050" cy="500" r="520" fill="#3b1d8f" opacity="0.6"/><circle cx="420" cy="1100" r="480" fill="#0f4c75" opacity="0.6"/>`;
 for(let y=0;y<H;y+=120) s+=`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#2e2470" stroke-width="3"/>`;
 for(let x=0;x<W;x+=120) s+=`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#2e2470" stroke-width="3"/>`;
 const c=['#ff4fd8','#00f0ff','#ffd23f'];
 for(let i=0;i<70;i++){const px=rand(i)*W,py=rand(i+99)*H; if(px>1000&&px<2120&&py>500&&py<940) continue; s+=`<rect x="${px}" y="${py}" width="${8+rand(i+7)*14}" height="${8+rand(i+7)*14}" fill="${c[i%3]}" opacity="0.75"/>`;}
 // safe area 1546x423 centered: x 507..2053, y 508..931
 s+=`<rect x="960" y="560" width="300" height="72" rx="36" fill="#ff4fd8"/><text x="1110" y="606" text-anchor="middle" font-family="${F}" font-weight="bold" font-size="31" fill="#fff">TEKNO ARŞİV</text>`;
 s+=`<text x="960" y="720" font-family="${F}" font-weight="bold" font-size="100" fill="#fff">ADA VOLT</text>`;
 s+=`<text x="960" y="800" font-family="${F}" font-weight="bold" font-size="58" fill="#00f0ff">İLE TEKNOLOJİ</text>`;
 s+=`<text x="960" y="870" font-family="${F}" font-size="34" fill="#c9d4ff">Her gün 18:00'de · 60 saniyede günün teknolojisi</text></svg>`;
 const ada = await sharp('kanal/ada_cut.png').resize({height:395}).toBuffer();
 const meta = await sharp(ada).metadata();
 await sharp(Buffer.from(s)).composite([{input:ada,left:910-meta.width,top:525}]).png().toFile('kanal/kapak.png');
 console.log('ok',meta.width);
})();
