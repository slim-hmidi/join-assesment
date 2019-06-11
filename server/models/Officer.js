const { Model } = require('objection');

class Officer extends Model {
  static get tableName() {
    return 'officers';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        available: { type: 'boolean' },
        stolen_bike_id: { type: 'integer' },
      },
    };
  }

  static get relationMappings() {
    return {
      stolenBike: {
        relation: Model.BelongsToOneRelation,
        modelClass: `${__dirname}/StolenBike`,
        join: {
          from: 'officers.stolen_bike_id',
          to: 'stolen_bikes.id',
        },
      },
    };
  }
}

module.exports = Officer;
