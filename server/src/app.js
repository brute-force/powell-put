const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(require('./routes/stocks'));
app.use(require('./routes/historical'));


if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
  app.use(express.static(path.resolve(__dirname, "../client/build")));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
  });
}
 
const dbo = require("./db/conn");

module.exports = app;
