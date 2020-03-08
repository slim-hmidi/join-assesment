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


routes.route('/reported_cases')
  .post(ctrlReportedCases.reportStolenBike)
  .get(ctrlReportedCases.fetchReportedCasesByUser);


routes.route('/resolved_cases/:officerId')
  .patch(ctrlReportedCases.resolveCase);


routes.route('/affected_cases/:officerId')
  .get(ctrlReportedCases.affectedCaseToOfficer);


module.exports = routes;
