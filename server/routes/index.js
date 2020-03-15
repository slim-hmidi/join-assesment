const routes = require('express').Router();
const ctrlReportedCases = require('../controllers/reportedCases');

// middleware to normalize response
routes.use((req, res, next) => {
  res.success = (statusCode, message, result) => res.status(statusCode).send({
    message,
    result,
  });
  res.error = (statusCode, message, error) => res.status(statusCode).send({
    message,
    error,
  });
  return next();
});


routes.route('/reported_cases')
  .post(ctrlReportedCases.reportCase)
  .get(ctrlReportedCases.fetchReportedCasesByUser);

routes.route('/reported_cases/:reportedCaseId')
  .delete(ctrlReportedCases.deleteReportedCase)
  .patch(ctrlReportedCases.updateReportedCase);

routes.route('/resolved_cases/:officerId')
  .patch(ctrlReportedCases.resolveCase);


routes.route('/affected_cases/:officerId')
  .get(ctrlReportedCases.affectedCaseToOfficer);


module.exports = routes;
