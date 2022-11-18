const express = require('express');

const routerSearch = express.Router();
const yF = require('yahoo-finance2').default;

routerSearch.route('/search').get(async (req, res) => {
  const queryOptions = {
    newsCount: 0
  };

  try {
    const searchResults = await yF.search(req.query.ticker, queryOptions);
    const item = searchResults.quotes.find((searchResult) => searchResult.symbol === req.query.ticker.toUpperCase());

    res.json(item ? [item] : []);
  } catch (err) {
    res.status(500);
    res.json({ error: err.message });
  }
});

module.exports = routerSearch;
