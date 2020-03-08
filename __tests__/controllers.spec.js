process.env.NODE_ENV = 'test';
const Knex = require('knex');
const request = require('supertest');
const app = require('../server/app');
const Officer = require('../server/models/Officer');


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
        .post('/reported_case')
        .send(newStolenBike);

      expect(statusCode).toBe(201);
      expect(body.message).toBe('The stolen Bike was saved successfully');
    });


    it('Should returns an error if the frameNumber already exists', async () => {
      await Officer.query().patchAndFetchById(1, {
        available: false,
      });
      const newStolenBike = {
        name: 'User x',
        email: 'user.x@gmail.com',
        bikeFrameNumber: 'ATU1122CC10F',
      };
      const { statusCode, body } = await request(app)
        .post('/reported_case')
        .send(newStolenBike);

      expect(statusCode).toBe(500);
      expect(body.message).toBe('Internal Server Error');
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
        .post('/reported_case')
        .send(newStolenBike);

      expect(statusCode).toBe(400);
      expect(body.message).toBe('The bike frame number is required!');
    });
  });


  describe('Resolve a given case by an officer', () => {
    it('Should returns an error when the given id is not found', async () => {
      const { statusCode, body } = await request(app)
        .patch('/resolve_case/9');


      expect(statusCode).toBe(400);
      expect(body.message).toBe('No officer found for the provided id');
    });

    it('Should affect a new case when the officer resolve the previous one', async () => {
      const { statusCode } = await request(app)
        .patch('/resolve_case/2');


      expect(statusCode).toBe(200);
    });
  });
});
