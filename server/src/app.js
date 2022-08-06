const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(require('./routes/stocks'));
app.use(require('./routes/historical'));

const dbo = require("./db/conn");

module.exports = app;
