const ReportedCase = require('../models/ReportedCase');
const Officer = require('../models/Officer');
const ResolvedCase = require('../models/ResolvedCase');

const reportedCaseEmitter = require('../utils/ReportedCaseEmitter');
const { ErrorHandler } = require('../utils/error');
const { formatData } = require('../utils/reportedCasesUtils');

/**
 * Save a report case into database
 * @param {object} req - Express requrest object
 * @param {object} res - Express response object
 * @param {object} next - Express middleware
 */
module.exports.reportCase = async (req, res, next) => {
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
      formatData(reportedCase));
  } catch (error) {
    return next(error);
  }
};


/**
 * Resolve an affected case
 * @param {object} req - Express requrest object
 * @param {object} res - Express response object
 * @param {object} next - Express middleware
 */

module.exports.resolveCase = async (req, res, next) => {
  const {
    officerId,
  } = req.params;

  const { reportedCaseId } = req.body;

  try {
    const oId = parseInt(officerId, 10);
    const returnedResult = await Officer.query()
      .select(['rc.id as caseId', 'rc.name as reporterName', 'rc.email as reporterEmail', 'rc.bike_frame_number as bikeFrameNumber'])
      .joinRelated('reportedCase', { alias: 'rc' })
      .where('officers.id', parseInt(officerId, 10))
      .andWhere('officers.reported_case_id', reportedCaseId);

    const fetchedOfficer = returnedResult[0];

    if (!fetchedOfficer) {
      throw new ErrorHandler(404, 'No officer found for the provided id');
    }

    if (!fetchedOfficer.caseId) {
      return res.success(200, 'No case affected to be resolved', {});
    }

    if (fetchedOfficer.caseId !== reportedCaseId) {
      throw new ErrorHandler(404, 'The provided reported case does not match the affected one');
    }
    // Archive the resolved case
    await ResolvedCase.query().insert({
      officer_id: oId,
      case_id: fetchedOfficer.caseId,
      reporter_name: fetchedOfficer.reporterName,
      reporter_email: fetchedOfficer.reporterEmail,
      bike_frame_number: Number(fetchedOfficer.bikeFrameNumber),
    });


    // update the officer availabilty

    const reportedCaseUpdated = await ReportedCase.query()
      .patchAndFetchById(reportedCaseId, { case_resolved: true });
    let officerResolvedCase;
    if (reportedCaseUpdated) {
      officerResolvedCase = await Officer.query().patchAndFetchById(oId, {
        available: true,
        reported_case_id: null,
      });
    }


    reportedCaseEmitter.emit('availableReportedCases', officerResolvedCase.id);
    return res.success(200, 'Case was resolved successfully', reportedCaseId);
  } catch (error) {
    return next(error);
  }
};

/**
   * Fetch reported cases created by a user
   * @param {object} req - Express requrest object
   * @param {object} res - Express response object
   * @param {object} next - Express middleware
   * @returns {array<object>} - list of reported cases
   */

module.exports.fetchReportedCasesByUser = async (req, res, next) => {
  try {
    const { name } = req.query;
    if (!name) {
      throw new ErrorHandler(400, 'The reporter name is not mentioned!');
    }
    const fetchReportedCases = await ReportedCase.query().where('name', name);
    return res.success(200, 'Fetch reported cases successfully', formatData(fetchReportedCases));
  } catch (error) {
    return next(error);
  }
};
/**
   * Fetch the affected case to a given officer
   * @param {object} req - Express requrest object
   * @param {object} res - Express response object
   * @param {object} next - Express middleware
   * @returns {object} - affected case
   */

module.exports.affectedCaseToOfficer = async (req, res, next) => {
  try {
    const { officerId } = req.params;
    const fetchAffectedCase = await Officer.relatedQuery('reportedCase')
      .for(officerId)
      .where('case_resolved', false);

    if (!fetchAffectedCase.length) {
      return res.success(200, 'No case affected to officer', []);
    }

    return res.success(200, 'Fetch affected case successfully', formatData(fetchAffectedCase));
  } catch (error) {
    return next(error);
  }
};

/**
   * Delete a reported case
   * @param {object} req - Express requrest object
   * @param {object} res - Express response object
   * @param {object} next - Express middleware
   */

module.exports.deleteReportedCase = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const affectedReportedCase = await Officer.query()
      .findOne({ reported_case_id: caseId });

    if (affectedReportedCase) {
      throw new ErrorHandler(400, 'Can not delete an affected reported case!');
    }

    const fetchedReportedCase = await ReportedCase.query().findById(caseId);
    if (!fetchedReportedCase) {
      throw new ErrorHandler(404, 'Reported case not found');
    }

    const deletedReportedCase = await ReportedCase.query().deleteById(caseId).returning('*');
    return res.success(200, 'Reported case deleted successfully!', formatData(deletedReportedCase));
  } catch (error) {
    return next(error);
  }
};


/**
   * Update a reported case
   * @param {object} req - Express requrest object
   * @param {object} res - Express response object
   * @param {object} next - Express middleware
   */

module.exports.updateReportedCase = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const affectedReportedCase = await Officer.query()
      .findOne({ reported_case_id: caseId });

    if (affectedReportedCase) {
      throw new ErrorHandler(400, 'Can not update an affected reported case!');
    }

    const fetchedReportedCase = await ReportedCase.query().findById(caseId);
    if (!fetchedReportedCase) {
      throw new ErrorHandler(404, 'Reported case not found');
    }
    const updatedReportedCase = await ReportedCase
      .query()
      .patchAndFetchById(caseId, {
        id: req.body.caseId,
        name: req.body.name,
        email: req.body.email,
        case_resolved: !!req.body.case_resolved,
        bike_frame_number: Number(req.body.bikeFrameNumber),
      });
    return res.success(200, 'Reported case updated successfully!', formatData(updatedReportedCase));
  } catch (error) {
    return next(error);
  }
};


/**
   * Returns the list of resolved cases by an affected officer
   * @param {object} req - Express requrest object
   * @param {object} res - Express response object
   * @param {object} next - Express middleware
   * @returns {array<object>} - list of resolved cases
   */

module.exports.resolvedReportedCases = async (req, res, next) => {
  try {
    const { officerId } = req.params;
    const returnedResult = await ResolvedCase.query()
      .where('resolved_cases.officer_id', officerId);

    const fetchedOfficer = returnedResult[0];

    if (!fetchedOfficer) {
      throw new ErrorHandler(404, 'Officer not found');
    }

    const fetchedResolvedCases = await ResolvedCase
      .query()
      .select(['case_id as caseId', 'reporter_name as name', 'reporter_email as email', 'bike_frame_number as bikeFrameNumber'])
      .where('resolved_cases.officer_id', officerId);


    const resolvedCasesList = fetchedResolvedCases.length ? fetchedResolvedCases : [];

    return res.success(200, `Resolved cases by officer: ${officerId} are fetched successfully!`, resolvedCasesList);
  } catch (error) {
    return next(error);
  }
};
