const { raw } = require('objection');
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


/**
 * Affect a stolen bike to an available police officer
 * @param {object} req - Express requrest object
 * @param {object} res - Express response object
 */
module.exports.affectStolenBike = async (req, res) => {
  const {
    officerId,
    bikeId,
  } = req.params;

  const oId = parseInt(officerId, 10);
  const bId = parseInt(bikeId, 10);

  try {
    const fetchedOfficer = await Officer.query().findById(oId);

    // check the existence of the officer
    if (!fetchedOfficer) {
      return res.error(400, 'No Officer found for the provided id');
    }

    // check the availability the officer
    if (fetchedOfficer && !fetchedOfficer.available) {
      return res.error(400, 'The fetched officer was affected to another case');
    }

    // update the availability of the fetched officer
    const updatedOfficer = await Officer.query().patchAndFetchById(oId, {
      available: false,
      stolen_bike_id: bId,
    });
    return res.success(200, 'The case was affected successfully!', {
      officerName: updatedOfficer.name,
      stolenBikeId: updatedOfficer.stolen_bike_id,
    });
  } catch (error) {
    return res.error(500, 'Internal Server Error', error);
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
    await Officer.query().upsertGraph({
      id: oId,
      available: true,
      stolen_bike_id: 0,
      stolenBike: {
        id: fecthedOfficer.stolen_bike_id,
        case_resolved: true,
      },
    }, options);

    // affect unresolved cases to the officer
    const unresolvedCase = await StolenBike.query()
      .select('id')
      .whereNotIn('id', raw(`
          select stolen_bike_id as id from stolen_bikes as b
          inner join officers as o
          on o.stolen_bike_id = b.id
        `))
      .andWhere('case_resolved', 0);

    if (unresolvedCase.length) {
      const officerBaseQuery = Officer.query();
      const newAffectedCase = await affectCaseToOfficer(
        unresolvedCase[0].id,
        officerId,
        officerBaseQuery,
      );

      return res.success(200, 'A new case was affected to the officer', newAffectedCase);
    }


    return res.success(201, 'The case was resolved successfully and there is no case to resolve for the moment', {});
  } catch (error) {
    return res.error(500, 'Internal Server Error', error.message);
  }
};
