const { EventEmitter } = require('events');
const Officer = require('../models/Officer');
const StolenBike = require('../models/StolenBike');

class BikeEmitter extends EventEmitter { }

const stolenBikeEmitter = new BikeEmitter();

stolenBikeEmitter.on('newStolenBike', async (id) => {
  try {
    const unaffectedOfficer = await Officer.query().findOne({
      available: true,
    });

    if (unaffectedOfficer) {
      const newAffectedOfficer = await Officer.query().patchAndFetchById(unaffectedOfficer.id, {
        stolen_bike_id: id,
      });
      return `StolenBike: ${id} affcted to officer: ${newAffectedOfficer}`;
    }
    return 'No officer is available now, we will treat your case sooner';
  } catch (error) {
    throw error;
  }
});


stolenBikeEmitter.on('availableStolenBikes', async (officerId) => {
  try {
    const unaffectedStolenBike = await StolenBike.query()
      .findOne({
        case_resolved: false,
      });

    if (Object.keys(unaffectedStolenBike).length) {
      const affectedBikeToOfficer = await Officer.query().patchAndFetchById(officerId, {
        stolen_bike_id: unaffectedStolenBike.id,
      });
      console.log(`Stolen bike n°: ${affectedBikeToOfficer.stolen_bike_id} affected to officer ${affectedBikeToOfficer.id}`);
      return;
    }
    console.log('No unresolved case to be affected');
    return;
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = stolenBikeEmitter;
