// config'ten müzik zamanlamalarını çıkarır
const path = require('path');
process.argv[2] = path.resolve(process.argv[2]);
const CFG = require(process.argv[2]);
const E = require('./engine.js');
const N = CFG.rows.length, x0 = CFG.rows[0][0], dx = CFG.rows[1][0] - x0;
const out = {
  dur: E.DUR, ticks: [...Array(N).keys()].map(i => E.tOf(i)),
  events: CFG.events.map(ev => E.tOf((ev[0] - x0) / dx)),
  low: (CFG.lowCues || []).map(x => E.tOf((x - x0) / dx)),
  rise: (CFG.riseCues || []).map(x => E.tOf((x - x0) / dx)),
  res: E.RES0, q: E.Q0, raceEnd: CFG.raceEnd,
};
console.log(JSON.stringify(out));
