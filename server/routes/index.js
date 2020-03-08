const routes = require('express').Router();
const ctrlReportedCases = require('../controllers/reportedCases');

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


routes.route('/reported_case')
  .post(ctrlReportedCases.reportStolenBike);


routes.route('/resolve_case/:officerId')
  .patch(ctrlReportedCases.resolveCase);


module.exports = routes;
