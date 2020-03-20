const ReportedCase = require('../models/ReportedCase');
const Officer = require('../models/Officer');

const reportedCaseEmitter = require('../utils/ReportedCaseEmitter');
const { ErrorHandler } = require('../utils/error');

/**
 * Save a report case into database
 * @param {object} req - Express requrest object
 * @param {object} res - Express response object
 */
module.exports.reportCase = async (req, res) => {
  const {
    name,
    email,
    bikeFrameNumber,
  } = req.body;


  try {
    const existedReportedCase = await ReportedCase
      .query()
      .findOne({
        bike_frame_number: bikeFrameNumber,
      });
    if (existedReportedCase) {
      throw new ErrorHandler(400, 'The reported case already exists');
    }
    // insert the stolen bike into database
    const reportedCase = await ReportedCase
      .query()
      .insert({
        name,
        bike_frame_number: bikeFrameNumber,
        email,
      });

    reportedCaseEmitter.emit('newReportedCase', reportedCase.id);
    return res.success(201,
      'The reported case was saved successfully',
      reportedCase);
  } catch (error) {
    return res.error(error.statusCode || 500, error.message);
  }
};


/**
 * Resolve an affected case
 * @param {object} req - Express requrest object
 * @param {object} res - Express response object
 */

module.exports.resolveCase = async (req, res) => {
  const {
    officerId,
  } = req.params;

  try {
    const oId = parseInt(officerId, 10);
    const fecthedOfficer = await Officer.query().findById(oId);

    if (!fecthedOfficer) {
      throw new ErrorHandler(400, 'No officer found for the provided id');
    }
    const options = {
      relate: true,
      unrelate: true,
    };

    // update the officer availabilty
    const officerResolvedCase = await Officer.query().upsertGraph({
      id: oId,
      available: true,
      reported_case_id: null,
      reportedCase: {
        id: fecthedOfficer.reported_case_id,
        case_resolved: true,
      },
    }, options);

    reportedCaseEmitter.emit('availableReportedCases', officerResolvedCase.id);
    return res.send(officerResolvedCase);
  } catch (error) {
    return res.error(error.statusCode || 500, error.message);
  }
};

/**
 * Fetch reported cases created by a user
 * @param {object} req - Express requrest object
 * @param {object} res - Express response object
 * @returns {array<object>} - list of reported cases
 */

module.exports.fetchReportedCasesByUser = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      throw new ErrorHandler(400, 'The reporter name is not mentioned!');
    }
    const fetchReportedCases = await ReportedCase.query().where('name', name);
    return res.success(200, 'Fetch reported cases successfully', fetchReportedCases);
  } catch (error) {
    return res.error(error.statusCode || 500, error.message);
  }
};
/**
 * Fetch the affected case to a given officer
 * @param {object} req - Express requrest object
 * @param {object} res - Express response object
 * @returns {object} - affected case
 */

module.exports.affectedCaseToOfficer = async (req, res) => {
  try {
    const { officerId } = req.params;
    const fetchAffectedCase = await Officer.query()
      .findById(officerId)
      .whereNotNull('reported_case_id');
    if (!fetchAffectedCase) {
      return res.success(200, 'No case affected to officer', {});
    }
    return res.success(200, 'Fetch affected case successfully', fetchAffectedCase);
  } catch (error) {
    return res.error(error.statusCode || 500, error.message);
  }
};

/**
 * Delete a reported case
 * @param {object} req - Express requrest object
 * @param {object} res - Express response object
 */

module.exports.deleteReportedCase = async (req, res) => {
  try {
    const { reportedCaseId } = req.params;
    const affectedReportedCase = await Officer.query()
      .findOne({ reported_case_id: reportedCaseId });


    if (affectedReportedCase) {
      throw new ErrorHandler(400, 'Can not delete an affected reported case!');
    }

    const fetchedReportedCase = await ReportedCase.query().findById(reportedCaseId);
    if (!fetchedReportedCase) {
      throw new ErrorHandler(404, 'Reported case not found');
    }
    const deletedReportedCase = await ReportedCase.query().deleteById(reportedCaseId);
    return res.success(200, 'Reported case deleted successfully!', deletedReportedCase);
  } catch (error) {
    return res.error(error.statusCode || 500, error.message);
  }
};


/**
 * Update a reported case
 * @param {object} req - Express requrest object
 * @param {object} res - Express response object
 */

module.exports.updateReportedCase = async (req, res) => {
  try {
    const { reportedCaseId } = req.params;
    const affectedReportedCase = await Officer.query()
      .findOne({ reported_case_id: reportedCaseId });


    if (affectedReportedCase) {
      throw new ErrorHandler(400, 'Can not update an affected reported case!');
    }

    const fetchedReportedCase = await ReportedCase.query().findById(reportedCaseId);
    if (!fetchedReportedCase) {
      throw new ErrorHandler(404, 'Reported case not found');
    }
    const updatedReportedCase = await ReportedCase
      .query()
      .patchAndFetchById(reportedCaseId, req.body);
    return res.success(200, 'Reported case updated successfully!', updatedReportedCase);
  } catch (error) {
    return res.error(error.statusCode || 500, error.message);
  }
};


/**
 * Returns the list of resolved cases by an affected officer
 * @param {object} req - Express requrest object
 * @param {object} res - Express response object
 * @returns {array<object>} - list of resolved cases
 */

module.exports.reolvedReportedCases = async (req, res) => {
  try {
    const { officerId } = req.params;
    const fetchedOfficer = await Officer.query().findById(officerId);


    if (!fetchedOfficer) {
      throw new ErrorHandler(404, 'Officer not found');
    }

    const fetchedResolvedCases = await Officer.relatedQuery('reportedCase')
      .for(officerId)
      .where('case_resolved', true);

    let resolvedCasesList = [];
    if (fetchedResolvedCases.length > 1
      || (fetchedResolvedCases.length === 1 && Object.keys(fetchedResolvedCases[0]).length)) {
      resolvedCasesList = fetchedResolvedCases.map(c => ({
        name: c.name,
        email: c.email,
        bikeFrameNumber: c.bike_frame_number,
      }));
    }

    return res.success(200, `Resolved cases by officer: ${officerId} are fetched successfully!`, resolvedCasesList);
  } catch (error) {
    return res.error(error.statusCode || 500, error.message);
  }
};