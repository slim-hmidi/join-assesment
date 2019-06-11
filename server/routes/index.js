const routes = require('express').Router();
const ctrlStolenBikes = require('../controllers/stolenBikes');

// middleware to normalize response
routes.use((req, res, next) => {
  res.success = (statusCode, message, data) => res.status(statusCode).send({
    message,
    data,
  });
  res.error = (statusCode, message, error) => res.status(statusCode).send({
    message,
    error,
  });
  return next();
});


routes.route('/stolenBikes')
  .post(ctrlStolenBikes.reportStolenBike);

routes.route('/stolenBikes/:officerId/:bikeId')
  .put(ctrlStolenBikes.affectStolenBike);


routes.route('/stolenBikes/:officerId')
  .put(ctrlStolenBikes.resolveCase);


module.exports = routes;
