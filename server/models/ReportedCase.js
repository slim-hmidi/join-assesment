const { Model } = require('objection');

class ReportedCase extends Model {
  static get tableName() {
    return 'reported_cases';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['bike_frame_number', 'name', 'email'],

      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        email: { type: 'string' },
        bike_frame_number: { type: 'string' },
        case_resolved: { type: 'boolean' },
      },
    };
  }
}

module.exports = ReportedCase;
