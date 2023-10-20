const spotModel = require('./spotModel');

exports.getAllSpots = (req, res) => {
  spotModel.getAllSpots((err, spots) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error retrieving spots from database');
    } else {
      res.send(spots);
    }
  });
};
