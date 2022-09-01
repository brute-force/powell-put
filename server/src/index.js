/* eslint-disable no-console */
if (process.env.NODE_ENV !== 'production') {
  console.log(`loading NODE_ENV ${process.env.NODE_ENV}`);
  // eslint-disable-next-line global-require
  require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
}
const dbo = require('./db/conn');
const app = require('./app');

const port = process.env.PORT || 5000;

app.listen(port, () => {
  dbo.connectToServer((err) => {
    if (err) console.error(err);
  });

  console.log(`server up on port ${port}`);
});
