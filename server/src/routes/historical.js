const express = require('express');
const yF = require('yahoo-finance2').default;
const dbo = require('../db/conn');

const routerStocks = express.Router();

routerStocks.route('/historical').get(async ({ query }, res) => {
  try {
    const queryOptions = {
      period1: query.period1,
      period2: query.period2
    };

    // console.log(queryOptions);
    // eslint-disable-next-line no-underscore-dangle
    const result = await yF._chart(query.ticker, queryOptions);
    // console.log(result);

    const resultDetail = await yF.quoteSummary(query.ticker, { modules: ['price', 'summaryDetail', 'summaryProfile'] });

    //   if (resultDetail) {
    //     resultDetail = {
    //       price: {
    //         longName = 'N/A',
    //         regularMarketPrice: price
    //       } = {},
    //       summaryDetail: {
    //         trailingPE,
    //         forwardPE,
    //         fiftyTwoWeekLow,
    //         fiftyTwoWeekHigh
    //       } = {},
    //       summaryProfile: {
    //         sector = 'N/A',
    //         industry = 'N/A'
    //       } = {}
    //     } = resultDetail;
    //  }

    res.json({ ...result, ...resultDetail });
  } catch (err) {
    res.status(500);
    res.json({ message: err.message });
  }
});

routerStocks.route('/sp-500').get(async (req, res) => {
  const dbConnect = dbo.getDb('powell');
  dbConnect
    .collection('sp-500')
    .find({})
    .toArray((err, result) => {
      if (err) throw err;

      res.json(result);
    });
});

module.exports = routerStocks;
