const { Model } = require('objection');

class StolenBike extends Model {
  static get tableName() {
    return 'stolen_bikes';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['frame_number', 'owner_name', 'owner_phone_number'],

      properties: {
        id: { type: 'integer' },
        owner_name: { type: 'string' },
        owner_phone_number: { type: 'string' },
        frame_number: { type: 'string' },
        case_resolved: { type: 'boolean' },
      },
    };
  }
}

module.exports = StolenBike;
