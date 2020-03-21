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
      },
    };
  }

  static get relationMappings() {
    return {
      reportedCase: {
        relation: Model.BelongsToOneRelation,
        modelClass: `${__dirname}/ReportedCase`,
        join: {
          from: 'resolved_cases.case_id',
          to: 'reported_cases.id',
        },
      },
    };
  }
}

module.exports = ResolvedCase;
