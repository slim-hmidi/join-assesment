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
        reported_case_id: { type: ['integer', 'null'] },
      },
    };
  }

  static get relationMappings() {
    return {
      reportedCase: {
        relation: Model.BelongsToOneRelation,
        modelClass: `${__dirname}/ReportedCase`,
        join: {
          from: 'officers.reported_case_id',
          to: 'reported_cases.id',
        },
      },
      resolvedCase: {
        relation: Model.HasManyRelation,
        modelClass: `${__dirname}/ResolvedCase`,
        join: {
          from: 'officers.id',
          to: 'resolved_cases.officer_id',
        },
      },
    };
  }
}

module.exports = Officer;
