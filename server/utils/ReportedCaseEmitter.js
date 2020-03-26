const { EventEmitter } = require('events');
const Officer = require('../models/Officer');
const ReportedCase = require('../models/ReportedCase');

class ReportedCaseEmitter extends EventEmitter { }

const reportedCaseEmitter = new ReportedCaseEmitter();

reportedCaseEmitter.on('newReportedCase', async (id) => {
  try {
    const unaffectedOfficer = await Officer.query().findOne({
      available: true,
    });

    if (unaffectedOfficer) {
      const newAffectedOfficer = await Officer.query().patchAndFetchById(unaffectedOfficer.id, {
        reported_case_id: id,
        available: false,
      });
      return `ReportedCase: ${id} affcted to officer: ${newAffectedOfficer}`;
    }
    return 'No officer is available now, we will treat your case sooner';
  } catch (error) {
    throw error;
  }
});


reportedCaseEmitter.on('availableReportedCase', async (officerId) => {
  try {
    const unaffectedReportedCase = await ReportedCase.query()
      .findOne({
        case_resolved: false,
      });

    if (Object.keys(unaffectedReportedCase).length) {
      const affectedCaseToOfficer = await Officer.query().patchAndFetchById(officerId, {
        reported_case_id: unaffectedReportedCase.id,
      });
      console.log(`Reported case n°: ${affectedCaseToOfficer.reported_case_id} affected to officer ${affectedCaseToOfficer.id}`);
      return;
    }
    console.log('No unresolved case to be affected');
    return;
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = reportedCaseEmitter;
