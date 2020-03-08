process.env.NODE_ENV = 'test';
const Knex = require('knex');
const request = require('supertest');
const app = require('../server/app');
const Officer = require('../server/models/Officer');
const StolenBike = require('../server/models/StolenBike');


const knexConfig = require('../knexfile');

const knex = Knex(knexConfig.test);
describe('Reported Case Controllers ', () => {
  beforeEach(() => knex.migrate.rollback()
    .then(() => knex.migrate.latest())
    .then(() => knex.seed.run()));

  afterEach(() => knex.migrate.rollback());
  describe('Report Stolen Bike', () => {
    it('Should affect the stolen bike successfully to an available officer', async () => {
      const newStolenBike = {
        name: 'User x',
        email: 'user.x@gmail.com',
        bikeFrameNumber: 'xxxxxx',
      };
      const { statusCode, body } = await request(app)
        .post('/reported_cases')
        .send(newStolenBike);

      expect(statusCode).toBe(201);
      expect(body.message).toBe('The stolen Bike was saved successfully');
    });


    it('Should returns an error if reported case already exists', async () => {
      await Officer.query().patchAndFetchById(1, {
        available: false,
      });
      const newStolenBike = {
        name: 'User x',
        email: 'user.x@gmail.com',
        bikeFrameNumber: 'ATU1122CC10F',
      };
      const { statusCode, body } = await request(app)
        .post('/reported_cases')
        .send(newStolenBike);

      expect(statusCode).toBe(400);
      expect(body.message).toBe('The reported case already exists');
    });

    it('Should returns an error if the bikeframeNumber not mentioned', async () => {
      await Officer.query().patchAndFetchById(1, {
        available: false,
      });
      const newStolenBike = {
        name: 'User x',
        email: 'user.x@gmail.com',
      };
      const { statusCode, body } = await request(app)
        .post('/reported_cases')
        .send(newStolenBike);

      expect(statusCode).toBe(400);
      expect(body.message).toBe('The bike frame number is required!');
    });
  });


  describe('Resolve a given case by an officer', () => {
    it('Should returns an error when the given id is not found', async () => {
      const { statusCode, body } = await request(app)
        .patch('/resolved_cases/9');


      expect(statusCode).toBe(400);
      expect(body.message).toBe('No officer found for the provided id');
    });

    it('Should affect a new case when the officer resolve the previous one', async () => {
      const { statusCode } = await request(app)
        .patch('/resolved_cases/2');


      expect(statusCode).toBe(200);
    });
  });

  describe('Fetch reported cases by a given user', () => {
    it('Should return a list of reported cases according to their reporter', async () => {
      const newStolenBike = {
        name: 'User x',
        email: 'user.x@gmail.com',
        bikeFrameNumber: 'xxxxxx',
      };
      await request(app)
        .post('/reported_cases')
        .send(newStolenBike);


      const { statusCode, body } = await request(app)
        .get('/reported_cases?name=User x');


      expect(statusCode).toBe(200);
      expect(body.data).toHaveLength(1);
    });

    it('Should return an empty list if the reported does not exists', async () => {
      const { statusCode, body } = await request(app)
        .get('/reported_cases?name=User x');

      expect(statusCode).toBe(200);
      expect(body.data).toHaveLength(0);
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
      const reportedCase = await StolenBike.query().insert({
        name: 'User x',
        email: 'user.x@gmail.com',
        bike_frame_number: 'xxxxxx',
      });
      const newOfficer = await Officer.query().insert({
        name: 'officer',
        available: false,
        stolen_bike_id: reportedCase.id,
      });


      const { statusCode, body } = await request(app)
        .get(`/affected_cases/${newOfficer.id}`);

      expect(statusCode).toBe(200);
      expect(body.data.stolen_bike_id).toBe(reportedCase.id);
    });

    it('Should return an empty object if no case affected to an officer', async () => {
      const newOfficer = await Officer.query().insert({
        name: 'officer',
        available: false,
        stolen_bike_id: null,
      });
      const { statusCode, body } = await request(app)
        .get(`/affected_cases/${newOfficer.id}`);

      expect(statusCode).toBe(200);
      expect(body.data).toEqual({});
    });
  });
});
