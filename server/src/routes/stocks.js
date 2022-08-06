const express = require('express');
const routerStocks = express.Router();
const Objectid = require('mongodb').ObjectId;
const dbo = require('../db/conn');

routerStocks.route('/stocks').get(async (req, res) => {
  let db_connect = dbo.getDb('powell');
  db_connect
    .collection('stocks')
    .find({})
    .toArray((err, result) => {
      if (err) throw err;

      res.json(result);
    });
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
