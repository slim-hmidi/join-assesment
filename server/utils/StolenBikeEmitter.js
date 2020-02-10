const { EventEmitter } = require('events');
const Officer = require('../models/Officer');

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
      console.log('newAffectedOfficer: ', newAffectedOfficer);
    }
  } catch (error) {
    throw error;
  }
});

module.exports = stolenBikeEmitter;
