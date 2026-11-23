module.exports = {
  out: 'wedding', dur: 30, raceEnd: 17.8, rows: require('./data.json'),
  A: { name: 'DOWN PAYMENT', color: '#3ddc84', icon: 'house' },
  B: { name: 'BIG WEDDING', color: '#ff6b9d', icon: 'rings' },
  hook: '$34,000. Two choices.', counterLabel: 'Years later', xTicks: [0, 5, 10, 15, 20],
  minMax: 5000, minMin: -2000,
  events: [
    [0, 'B', 'Wedding · $34K'], [0, 'A', 'Invests $34K'],
    [1, 'B', 'Spent in one day'], [5, 'A', '$43K'], [10, 'A', '$55K'], [15, 'A', '$71K'], [20, 'A', '$90K'],
  ],
  resultLabel: 'After 20 years', resultNote: "$34K · avg. wedding (The Knot 2026) · today's dollars",
  twist: ['$34K spent in a day,', 'or $90K in 20 years.'], twistColor: '#f5c542',
  question: ['Big day,', 'or big start?'],
  footer: [
    "$34,000 = avg. US wedding cost in 2025 (The Knot 2026 Real Weddings Study)",
    "Alternative: invested toward a home at 5%/yr after inflation · money only, not the memories",
    "Simplified model · no taxes or fees · not financial advice",
  ],
};
