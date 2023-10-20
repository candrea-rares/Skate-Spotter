
const pool = require('./database');

exports.getAllSpots = (callback) => {
  pool.query('SELECT * FROM spots_data', (err, result) => {
    if (err) {
      console.error(err);
      callback(err, null);
    } else {
      callback(null, result.rows);
    }
  });
};