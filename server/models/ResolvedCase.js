const { Model } = require('objection');

class ResolvedCase extends Model {
  static get tableName() {
    return 'resolved_cases';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      properties: {
        id: { type: 'integer' },
        officer_id: { type: 'integer' },
        case_id: { type: 'integer' },
        reporter_name: { type: 'string' },
        reporter_email: { type: 'string' },
        bike_frame_number: { type: 'integer' },
      },
    };
  }
}

module.exports = ResolvedCase;
