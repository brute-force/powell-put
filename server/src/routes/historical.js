const express = require('express');
const routerStocks = express.Router();
const yF = require('yahoo-finance2').default;
const moment = require('moment');

routerStocks.route('/historical').get(async (req, res) => {
  const now = moment();

  let periodStart = req.query.period.length > 0 
    ? now.clone().subtract(1, req.query.period).format()
    : now.clone().startOf('year').format();

  // console.log('periodStart', periodStart);
  
  try {
    const result = await yF._chart(req.query.ticker, {
      period1: periodStart
    }); 
  
    // console.log(result);

    let resultDetail = await yF.quoteSummary(req.query.ticker, { modules: ['price', 'summaryDetail', 'summaryProfile', 'defaultKeyStatistics']});

    if (resultDetail) {
      resultDetail = { 
        price: {
          longName = 'N/A',
          regularMarketPrice: price
        } = {},
        summaryDetail: {
          trailingPE,
          forwardPE,
          fiftyTwoWeekLow,
          fiftyTwoWeekHigh
        } = {},
        summaryProfile: {
          sector = 'N/A',
          industry = 'N/A'
        } = {},
        defaultKeyStatistics: {
          pegRatio = 'N/A'
        } = {}
      } = resultDetail;
   }

    res.json({ ...result, ...resultDetail });
  } catch(err) {
    console.log(req.params.ticker, err.message);
  }
});

routerStocks.route('/sp-500').get(async (req, res) => {
  let db_connect = dbo.getDb('powell');
  db_connect
    .collection('sp-500')
    .find({})
    .toArray((err, result) => {
      if (err) throw err;

      res.json(result);
    });
});

module.exports = routerStocks;
