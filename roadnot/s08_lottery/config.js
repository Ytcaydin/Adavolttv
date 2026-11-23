module.exports = {
  out: 'lottery', dur: 30, raceEnd: 17.8, rows: require('./data.json'),
  A: { name: 'SAVER', color: '#3ddc84', icon: 'invest' },
  B: { name: 'WINNER', color: '#ff9f43', icon: 'ticket' },
  hook: 'Who has more at 60?', counterLabel: 'Money at age', xTicks: [30, 40, 50, 60],
  minMax: 5000, minMin: 0,
  events: [
    [30, 'B', 'Wins $1M · $630K net'], [30, 'A', 'Invests $13K a year'],
    [36, 'A', '$100K saved'], [40, 'B', '$397K left'],
    [44, 'A', 'Passes the winner'], [51, 'B', 'Money is gone'], [51, 'A', '$500K saved'],
  ],
  lowCues: [51], riseCues: [44],
  resultLabel: 'At 60', resultNote: "winner: $630K after 37% tax, spends $50K/yr · today's dollars",
  twist: ['Winner broke at 51.', 'Saver has $928K.'], twistColor: '#f5c542',
  question: ['Take the $1M,', 'or the habit?'],
  footer: [
    "Winner nets $630K at 30 ($1M prize, 37% top federal rate) and spends $50K/yr from it",
    "Saver invests 15% of $87,460 (Census 2025 median household income) · 5%/yr after inflation",
    "Simplified model · today's dollars · not financial advice",
  ],
};
