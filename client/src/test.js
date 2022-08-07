const moment = require('moment');

moment.defaultFormat = 'YYYY-MM-DD';

const quotes = [
  {
    "date": "2022-07-05T13:30:00.000Z",
    "high": 75.20999908447266,
    "volume": 95589000,
    "open": 71.9800033569336,
    "low": 71.5999984741211,
    "close": 75.19999694824219,
    "adjclose": 75.19999694824219
  },
  {
    "date": "2022-07-06T13:30:00.000Z",
    "high": 76.27999877929688,
    "volume": 85458900,
    "open": 75.16999816894531,
    "low": 73.55000305175781,
    "close": 75.3499984741211,
    "adjclose": 75.3499984741211
  },
  {
    "date": "2022-07-07T13:30:00.000Z",
    "high": 79.98999786376953,
    "volume": 83640900,
    "open": 77.19000244140625,
    "low": 76.9000015258789,
    "close": 79.30000305175781,
    "adjclose": 79.30000305175781
  }
];

// let q = quotes.map((quote) => ({ date: moment(quote.date).format(), ...quote }));
let q = quotes.map((quote) => { 
  let { date, ...other } = quote;

  return {
    date: moment(quote.date).format(),
    ...other
  };
});

console.log(q);


// let d = '2022-07-05T13:30:00.000Z';
// console.log(moment(d).format());
