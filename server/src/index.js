if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
}

const app = require('./app');
const port = process.env.PORT || 5000;

const dbo = require("./db/conn");

app.listen(port, () => {
  dbo.connectToServer((err) => {
    if (err) console.error(err);
  });

  console.log(`server up on port ${port}`);
});
