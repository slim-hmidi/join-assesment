const WebSocket = require('ws');
const { v4 } = require('uuid');
const ReportedCase = require('../models/ReportedCase');
const Officer = require('../models/Officer');
const ResolvedCase = require('../models/ResolvedCase');

const reportedCaseEmitter = require('../utils/ReportedCaseEmitter');
const { ErrorHandler } = require('../utils/error');
const { formatData } = require('../utils/reportedCasesUtils');


const wss = new WebSocket.Server({ port: 9090 });
const uuidv4 = v4;

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
      formatData(reportedCase));
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

  const { reportedCaseId } = req.body;

  try {
    const oId = parseInt(officerId, 10);
    const fetchedOfficer = await Officer.query().findById(oId);

    if (!fetchedOfficer) {
      throw new ErrorHandler(404, 'No officer found for the provided id');
    }
    const options = {
      relate: true,
      unrelate: true,
    };

    if (!fetchedOfficer.reported_case_id) {
      return res.success(200, 'No case affected to be resolved', {});
    }

    if (fetchedOfficer.reported_case_id !== reportedCaseId) {
      throw new ErrorHandler(404, 'The provided reported case does not match the affected one');
    }
    // Archive the resolved case
    const resolvedCase = await ResolvedCase.query().insert({
      officer_id: oId,
      case_id: parseInt(reportedCaseId, 10),
    });

    if (process.env.NODE_ENV !== 'test'
      && resolvedCase && Object.keys(resolvedCase).length) {
      wss.on('connection', (ws) => {
        ws.send(JSON.stringify({
          caseId: uuidv4(),
          message: `The reported case n°: ${resolvedCase.case_id} was resolved`,
        }));
      });
    }
    // update the officer availabilty
    const officerResolvedCase = await Officer.query().upsertGraph({
      id: oId,
      available: true,
      reported_case_id: null,
      reportedCase: {
        id: parseInt(reportedCaseId, 10),
        case_resolved: true,
      },
    }, options);

    reportedCaseEmitter.emit('availableReportedCases', officerResolvedCase.id);
    return res.success(200, 'Case was resolved successfully', reportedCaseId);
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
    return res.success(200, 'Fetch reported cases successfully', formatData(fetchReportedCases));
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
    const fetchAffectedCase = await Officer.relatedQuery('reportedCase')
      .for(officerId)
      .where('case_resolved', false);

    if (!fetchAffectedCase.length) {
      return res.success(200, 'No case affected to officer', []);
    }

    return res.success(200, 'Fetch affected case successfully', formatData(fetchAffectedCase));
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
    return res.error(error.statusCode || 500, error.message);
  }
};


/**
   * Returns the list of resolved cases by an affected officer
   * @param {object} req - Express requrest object
   * @param {object} res - Express response object
   * @returns {array<object>} - list of resolved cases
   */

module.exports.resolvedReportedCases = async (req, res) => {
  try {
    const { officerId } = req.params;
    const fetchedOfficer = await Officer.query().findById(officerId);

    if (!fetchedOfficer) {
      throw new ErrorHandler(404, 'Officer not found');
    }

    const fetchedResolvedCases = await Officer
      .relatedQuery('resolvedCase')
      .select(['rc.id as caseId', 'rc.name', 'rc.email', 'rc.bike_frame_number as bikeFrameNumber'])
      .for(officerId)
      .joinRelated('reportedCase', { alias: 'rc' });


    const resolvedCasesList = fetchedResolvedCases.length ? fetchedResolvedCases : [];

    return res.success(200, `Resolved cases by officer: ${officerId} are fetched successfully!`, resolvedCasesList);
  } catch (error) {
    return res.error(error.statusCode || 500, error.message);
  }
};
