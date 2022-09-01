const { MongoClient } = require('mongodb');

const Db = process.env.ATLAS_URI;
const client = new MongoClient(Db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let returnDb;

module.exports = {
  connectToServer: (callback) => {
    client.connect((err, db) => {
      // Verify we got a good 'db' object
      if (db) {
        returnDb = db.db('powell');
        // eslint-disable-next-line no-console
        console.log('Successfully connected to MongoDB.');
      }

      return callback(err);
    });
  },
  getDb: () => returnDb
};
