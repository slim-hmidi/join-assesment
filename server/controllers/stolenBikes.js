const StolenBike = require('../models/StolenBike');
const Officer = require('../models/Officer');

const stolenBikeEmitter = require('../utils/StolenBikeEmitter');

/**
 * Store a stolen bike into database
 * @param {object} req - Express requrest object
 * @param {object} res - Express response object
 */
module.exports.reportStolenBike = async (req, res) => {
  const {
    ownerName,
    ownerPhoneNumber,
    frameNumber,
  } = req.body;

  try {
    // check if the frameNumber is mentioned
    if (!frameNumber) {
      return res.error(400, 'The frameNumber is required!');
    }
    // insert the stolen bike into database
    const reportedStolenBike = await StolenBike
      .query()
      .insert({
        owner_name: ownerName,
        frame_number: frameNumber,
        owner_phone_number: ownerPhoneNumber,
      });

    stolenBikeEmitter.emit('newStolenBike', reportedStolenBike.id);
    return res.success(201,
      'The stolen Bike was saved successfully',
      reportedStolenBike);
  } catch (error) {
    return res.error(500, 'Internal Server Error', error.message);
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
      return res.error(400, 'No officer found for the provided id');
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
    return res.error(500, 'Internal Server Error', error.stack);
  }
};
