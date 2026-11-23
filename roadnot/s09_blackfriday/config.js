module.exports = {
  out: 'blackfriday', dur: 30, raceEnd: 17.8, rows: require('./data.json'),
  A: { name: 'INVESTOR', color: '#3ddc84', icon: 'invest' },
  B: { name: 'SHOPPER', color: '#ff6b81', icon: 'bag' },
  hook: 'Every Black Friday.', counterLabel: 'Year', xTicks: [2010, 2015, 2020, 2025],
  minMax: 1500, minMin: -1000,
  events: [
    [2010, 'B', 'Black Friday #1'], [2010, 'A', 'Invests $338 a year'],
    [2013, 'A', 'S&P 500 +32%'], [2017, 'A', '$5K invested'],
    [2022, 'A', 'S&P 500 −18%'], [2025, 'B', '$5.4K spent'],
  ],
  lowCues: [2022], riseCues: [2013],
  resultLabel: 'By 2025', resultNote: '$337.86 a year · S&P 500 with dividends · not inflation-adjusted',
  twist: ['$5,406 spent', 'vs $20,376 grown.'], twistColor: '#f5c542',
  question: ['Was the deal', 'worth it?'],
  footer: [
    "Each year: $337.86 (NRF 2025 avg. Thanksgiving-weekend spend per shopper) spent or invested",
    "S&P 500 annual total returns 2010–2025 (Damodaran, NYU Stern) · nominal dollars",
    "Simplified model · past returns don't predict future ones · not financial advice",
  ],
};
