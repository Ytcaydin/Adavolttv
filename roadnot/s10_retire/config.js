module.exports = {
  out: 'retire', dur: 30, raceEnd: 17.8, rows: require('./data.json'),
  A: { name: 'RETIRES AT 67', color: '#3ddc84', icon: 'briefcase' },
  B: { name: 'RETIRES AT 55', color: '#ff9f43', icon: 'beach' },
  hook: 'Who runs out of money?', counterLabel: 'Savings at age', xTicks: [25, 45, 65, 85, 95],
  minMax: 5000, minMin: 0,
  events: [
    [25, 'A', 'Saves $13K a year'], [25, 'B', 'Same savings'],
    [55, 'B', 'Retires · $928K'], [62, 'B', 'Claims Social Security'],
    [67, 'A', 'Retires · $1.8M'], [81, 'B', 'Money runs out'],
  ],
  lowCues: [81], riseCues: [67],
  resultLabel: 'At 95', resultNote: "both spend $70K/yr · Social Security included · today's dollars",
  twist: ['Retiring at 55', 'ran dry at 81.'], twistColor: '#f5c542',
  question: ['Retire at 55,', 'or work to 67?'],
  footer: [
    "Both save 15% of $87,460 (Census 2025 median household income) from 25 until they retire",
    "Spend $70K/yr · avg. Social Security $1,424/mo at 62, $2,016/mo at 67 (SSA via Motley Fool, 2026)",
    "5%/yr after inflation · simplified model · not financial advice",
  ],
};
