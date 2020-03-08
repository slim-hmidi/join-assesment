const StolenBike = require('../models/StolenBike');
const Officer = require('../models/Officer');

const stolenBikeEmitter = require('../utils/StolenBikeEmitter');
const { ErrorHandler } = require('../utils/error');

/**
 * Store a stolen bike into database
 * @param {object} req - Express requrest object
 * @param {object} res - Express response object
 */
module.exports.reportStolenBike = async (req, res) => {
  const {
    name,
    email,
    bikeFrameNumber,
  } = req.body;

  try {
    // check if the frameNumber is mentioned
    if (!bikeFrameNumber) {
      throw new ErrorHandler(400, 'The bike frame number is required!');
    }
    const existedReportedStolenBike = await StolenBike
      .query()
      .findOne({
        bike_frame_number: bikeFrameNumber,
      });
    if (existedReportedStolenBike) {
      throw new ErrorHandler(400, 'The reported case already exists');
    }
    // insert the stolen bike into database
    const reportedStolenBike = await StolenBike
      .query()
      .insert({
        name,
        bike_frame_number: bikeFrameNumber,
        email,
      });

    stolenBikeEmitter.emit('newStolenBike', reportedStolenBike.id);
    return res.success(201,
      'The stolen Bike was saved successfully',
      reportedStolenBike);
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
      stolen_bike_id: null,
      stolenBike: {
        id: fecthedOfficer.stolen_bike_id,
        case_resolved: true,
      },
    }, options);

    stolenBikeEmitter.emit('availableStolenBikes', officerResolvedCase.id);
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
    const fetchReportedCases = await StolenBike.query().where('name', name);
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
      .whereNotNull('stolen_bike_id');
    if (!fetchAffectedCase) {
      return res.success(200, 'No case affected to officer', {});
    }
    return res.success(200, 'Fetch affected case successfully', fetchAffectedCase);
  } catch (error) {
    return res.error(error.statusCode || 500, error.message);
  }
};
