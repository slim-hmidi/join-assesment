process.env.NODE_ENV = 'test';
const Knex = require('knex');
const request = require('supertest');
const { app } = require('../server/app');
const Officer = require('../server/models/Officer');
const ReportedCase = require('../server/models/ReportedCase');
const ResolvedCase = require('../server/models/ResolvedCase');


const knexConfig = require('../knexfile');

const knex = Knex(knexConfig.test);

describe('Reported Case Controllers ', () => {
  beforeEach(() => knex.migrate.rollback()
    .then(() => knex.migrate.latest())
    .then(() => knex.seed.run()));

  afterEach(() => knex.migrate.rollback());
  describe('Report Case', () => {
    it('Should affect the reported successfully to an available officer', async () => {
      const newReportedCase = {
        name: 'User x',
        email: 'user.x@gmail.com',
        bikeFrameNumber: 333333,
      };
      const { statusCode, body } = await request(app)
        .post('/reported_cases')
        .send(newReportedCase);

      expect(statusCode).toBe(201);
      expect(body.message).toBe('The reported case was saved successfully');
    });


    it('Should returns an error if reported case already exists', async () => {
      await Officer.query().patchAndFetchById(1, {
        available: false,
      });
      const newReportedCase = {
        name: 'User x',
        email: 'user.x@gmail.com',
        bikeFrameNumber: 123456,
      };
      const { statusCode, body } = await request(app)
        .post('/reported_cases')
        .send(newReportedCase);

      expect(statusCode).toBe(400);
      expect(body.message).toBe('The reported case already exists');
    });
  });


  describe('Resolve a given case by an officer', () => {
    it('Should returns an error when the given id is not found', async () => {
      const { statusCode, body } = await request(app)
        .patch('/resolved_cases/9');


      expect(statusCode).toBe(404);
      expect(body.message).toBe('No officer found for the provided id');
    });

    it('Should affect a new case when the officer resolve the previous one', async () => {
      const officer = await Officer.query().insert({
        name: 'officer',
        available: false,
        reported_case_id: 1,
      });
      const { statusCode } = await request(app)
        .patch(`/resolved_cases/${officer.id}`)
        .send({ reportedCaseId: 1 });


      expect(statusCode).toBe(200);
    });
  });

  describe('Fetch reported cases by a given user', () => {
    it('Should return a list of reported cases according to their reporter', async () => {
      const newReportedCase = {
        name: 'User x',
        email: 'user.x@gmail.com',
        bikeFrameNumber: 333333,
      };
      await request(app)
        .post('/reported_cases')
        .send(newReportedCase);


      const { statusCode, body } = await request(app)
        .get('/reported_cases?name=User x');


      expect(statusCode).toBe(200);
      expect(body.result).toHaveLength(1);
    });

    it('Should return an empty list if the reported does not exists', async () => {
      const { statusCode, body } = await request(app)
        .get('/reported_cases?name=User x');

      expect(statusCode).toBe(200);
      expect(body.result).toHaveLength(0);
    });

    it('Should return an error if the reported name undefined', async () => {
      const { statusCode, body } = await request(app)
        .get('/reported_cases?name=');

      expect(statusCode).toBe(400);
      expect(body.message).toBe('The reporter name is not mentioned!');
    });
  });

  describe('Fetch affected case to an officer', () => {
    it('Should return an affected case to a given officer', async () => {
      const reportedCase = await ReportedCase.query().insert({
        name: 'User x',
        email: 'user.x@gmail.com',
        bike_frame_number: 123456789,
      });
      const newOfficer = await Officer.query().insert({
        name: 'officer',
        available: false,
        reported_case_id: reportedCase.id,
      });


      const { statusCode, body } = await request(app)
        .get(`/affected_cases/${newOfficer.id}`);

      expect(statusCode).toBe(200);
      expect(body.result[0].bikeFrameNumber).toBe(reportedCase.bike_frame_number);
    });

    it('Should return an empty object if no case affected to an officer', async () => {
      const newOfficer = await Officer.query().insert({
        name: 'officer',
        available: false,
        reported_case_id: null,
      });
      const { statusCode, body } = await request(app)
        .get(`/affected_cases/${newOfficer.id}`);

      expect(statusCode).toBe(200);
      expect(body.result).toEqual({});
    });
  });

  describe('Delete a reported case', () => {
    it('Should return an error if the case is affected to an officer', async () => {
      const reportedCase = await ReportedCase.query().insert({
        name: 'User x',
        email: 'user.x@gmail.com',
        bike_frame_number: 123456789,
      });
      await Officer.query().insert({
        name: 'officer',
        available: false,
        reported_case_id: reportedCase.id,
      });

      const { statusCode, body } = await request(app)
        .delete(`/reported_cases/${reportedCase.id}`);

      expect(statusCode).toBe(400);
      expect(body.message).toBe('Can not delete an affected reported case!');
    });

    it('Should return an error if the case does not exist', async () => {
      const reportedCaseId = 10;
      const { statusCode, body } = await request(app)
        .delete(`/reported_cases/${reportedCaseId}`);

      expect(statusCode).toBe(404);
      expect(body.message).toBe('Reported case not found');
    });


    it('Should delete the reported case successfully!', async () => {
      const reportedCase = await request(app)
        .post('/reported_cases')
        .send({
          name: 'User x',
          email: 'user.x@gmail.com',
          bikeFrameNumber: 54548454,
        });
      const { statusCode } = await request(app)
        .delete(`/reported_cases/${reportedCase.body.result.caseId}`);

      expect(statusCode).toBe(200);
    });
  });

  describe('Update a reported case', () => {
    it('Should return an error if the case is affected to an officer', async () => {
      const reportedCase = await ReportedCase.query().insert({
        name: 'User x',
        email: 'user.x@gmail.com',
        bike_frame_number: 123456789,
      });
      await Officer.query().insert({
        name: 'officer',
        available: false,
        reported_case_id: reportedCase.id,
      });

      const { statusCode, body } = await request(app)
        .put(`/reported_cases/${reportedCase.id}`)
        .send({ name: 'user y' });

      expect(statusCode).toBe(400);
      expect(body.message).toBe('Can not update an affected reported case!');
    });

    it('Should return an error if the case does not exist', async () => {
      const reportedCaseId = 10;
      const { statusCode, body } = await request(app)
        .put(`/reported_cases/${reportedCaseId}`)
        .send({ name: 'user y' });

      expect(statusCode).toBe(404);
      expect(body.message).toBe('Reported case not found');
    });


    it('Should update the reported case successfully!', async () => {
      const { body } = await request(app)
        .post('/reported_cases')
        .send({
          name: 'User x',
          email: 'user.x@gmail.com',
          bikeFrameNumber: 555,
        });

      const { caseId } = body.result;
      const { statusCode } = await request(app)
        .put(`/reported_cases/${caseId}`)
        .send({ name: 'user y' });


      expect(statusCode).toBe(200);
    });
  });

  describe('List archived reported cases', () => {
    it('Should return an error if the officer id does not exist', async () => {
      const officerId = 132;
      const { statusCode, body } = await request(app)
        .get(`/resolved_cases/${officerId}`);

      expect(statusCode).toBe(404);
      expect(body.message).toBe('Officer not found');
    });

    it('Should return an empty list if there is no resolved cases', async () => {
      const reportedCase = await ReportedCase.query().insert({
        name: 'User x',
        email: 'user.x@gmail.com',
        bike_frame_number: 123456789,
      });
      const affectedOfficer = await Officer.query().insert({
        name: 'officer',
        available: false,
        reported_case_id: reportedCase.id,
      });
      const { statusCode, body } = await request(app)
        .get(`/resolved_cases/${affectedOfficer.id}`);


      expect(statusCode).toBe(200);
      expect(body.result).toHaveLength(0);
    });


    it('Should return the list of cases resolved by a given officer', async () => {
      const reportedCase = await ReportedCase.query().insert({
        name: 'User x',
        email: 'user.x@gmail.com',
        bike_frame_number: 123456789,
        case_resolved: true,
      });
      const affectedOfficer = await Officer.query().insert({
        name: 'officer',
        available: true,
        reported_case_id: reportedCase.id,
      });
      await ResolvedCase.query().insert({
        officer_id: affectedOfficer.id,
        case_id: reportedCase.id,
      });
      const { statusCode, body } = await request(app)
        .get(`/resolved_cases/${affectedOfficer.id}`);

      expect(statusCode).toBe(200);
      expect(body.result).toHaveLength(1);
    });
  });
});
