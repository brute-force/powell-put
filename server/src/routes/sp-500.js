const express = require('express');
const routerSp500 = express.Router();
const Objectid = require('mongodb').ObjectId;
const dbo = require('../db/conn');

routerSp500.route('/sp-500').get(async (req, res) => {
  let db_connect = dbo.getDb('powell');
  db_connect
    .collection('sp-500')
    .find({})
    .sort({'ticker': 1})
    .toArray((err, result) => {
      if (err) throw err;

      res.json(result);
    });
});

module.exports = routerSp500;
