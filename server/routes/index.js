const routes = require('express').Router();
const ctrlReportedCases = require('../controllers/reportedCases');

// middleware to normalize response
routes.use((req, res, next) => {
  res.success = (statusCode, message, result) => res.status(statusCode).send({
    message,
    result,
  });
  return next();
});
routes.route('/reported_cases')
  .post(ctrlReportedCases.reportCase)
  .get(ctrlReportedCases.fetchReportedCasesByUser);

routes.route('/reported_cases/:caseId')
  .delete(ctrlReportedCases.deleteReportedCase)
  .put(ctrlReportedCases.updateReportedCase);


routes.route('/resolved_cases/:officerId')
  .get(ctrlReportedCases.resolvedReportedCases)
  .patch(ctrlReportedCases.resolveCase);


routes.route('/affected_cases/:officerId')
  .get(ctrlReportedCases.affectedCaseToOfficer);


module.exports = routes;
