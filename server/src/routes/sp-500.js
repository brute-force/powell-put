const express = require('express');

const routerSp500 = express.Router();
const dbo = require('../db/conn');

routerSp500.route('/sp-500').get(async (req, res) => {
  const dbConnect = dbo.getDb('powell');
  dbConnect
    .collection('sp-500')
    .find({})
    .sort({ ticker: 1 })
    .toArray((err, result) => {
      if (err) throw err;

      res.json(result);
    });
});

module.exports = routerSp500;
