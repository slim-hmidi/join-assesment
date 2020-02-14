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


routes.route('/stolen_bikes')
  .post(ctrlStolenBikes.reportStolenBike);


routes.route('/resolve_case/:officerId')
  .patch(ctrlStolenBikes.resolveCase);


module.exports = routes;
