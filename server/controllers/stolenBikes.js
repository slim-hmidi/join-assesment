const StolenBike = require('../models/StolenBike');
const Officer = require('../models/Officer');
const {
  filterByCriteria,
  affectCaseToOfficer,
} = require('../utils/stolenBikesUtils');

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

    // fetch avaialable officer to treat the case
    const baseQuery = Officer.query();
    const foundAvailableOfficer = filterByCriteria('available', true);
    const foundOfficer = await foundAvailableOfficer(baseQuery);

    // affect the case to the found officer
    if (foundOfficer.length) {
      const affectedCaseToOfficer = await affectCaseToOfficer(
        reportedStolenBike.id,
        foundOfficer[0].id,
        baseQuery,
      );
      return res.success(201,
        'The stolenBike was saved and affected to a police officer',
        {
          officerName: affectedCaseToOfficer.name,
          stolenBikeId: affectedCaseToOfficer.stolen_bike_id,
        });
    }
    return res.success(201,
      'The stolen Bike was saved successfully',
      reportedStolenBike);
  } catch (error) {
    return res.error(500, 'Internal Server Error', error.message);
  }
};
