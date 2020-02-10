process.env.NODE_ENV = 'test';
const Knex = require('knex');
const request = require('supertest');
const app = require('../server/app');
const Officer = require('../server/models/Officer');
const StolenBike = require('../server/models/StolenBike');


const knexConfig = require('../knexfile');

const knex = Knex(knexConfig.test);
describe('Stolen Bikes Controllers ', () => {
  beforeEach(() => knex.migrate.rollback()
    .then(() => knex.migrate.latest())
    .then(() => knex.seed.run()));

  afterEach(() => knex.migrate.rollback());
  describe('Report Stolen Bike', () => {
    it('Should affect the stolen bike successfully to an available officer', async () => {
      const newStolenBike = {
        ownerName: 'User x',
        ownerPhoneNumber: '+330612345678',
        frameNumber: 'xxxxxx',
      };
      const { statusCode, body } = await request(app)
        .post('/stolenBikes')
        .send(newStolenBike);

      expect(statusCode).toBe(201);
      expect(body.message).toBe('The stolen Bike was saved successfully');
    });


    it('Should returns an error if the frameNumber already exists', async () => {
      await Officer.query().patchAndFetchById(1, {
        available: false,
      });
      const newStolenBike = {
        ownerName: 'User x',
        ownerPhoneNumber: '+330612345678',
        frameNumber: 'ATU1122CC10F',
      };
      const { statusCode, body } = await request(app)
        .post('/stolenBikes')
        .send(newStolenBike);

      expect(statusCode).toBe(500);
      expect(body.message).toBe('Internal Server Error');
    });

    it('Should returns an error if the frameNumber not mentioned', async () => {
      await Officer.query().patchAndFetchById(1, {
        available: false,
      });
      const newStolenBike = {
        ownerName: 'User x',
        ownerPhoneNumber: '+330612345678',
      };
      const { statusCode, body } = await request(app)
        .post('/stolenBikes')
        .send(newStolenBike);

      expect(statusCode).toBe(400);
      expect(body.message).toBe('The frameNumber is required!');
    });
  });


  describe('Resolve a given case by an officer', () => {
    it('Should returns an error when the given id is not found', async () => {
      const { statusCode, body } = await request(app)
        .put('/stolenBikes/9');


      expect(statusCode).toBe(400);
      expect(body.message).toBe('No officer found for the provided id');
    });

    it('Should affect a new case when the officer resolve the previous one', async () => {
      const { statusCode, body } = await request(app)
        .put('/stolenBikes/2');


      expect(statusCode).toBe(200);
      expect(body.message).toBe('A new case was affected to the officer');
    });

    it('Should returns a message of success when the case was resolved and there is no case to be resolved', async () => {
      await StolenBike.query().patch({
        case_resolved: true,
      })
        .where('id', '>', 0);
      const { statusCode, body } = await request(app)
        .put('/stolenBikes/2');


      expect(statusCode).toBe(201);
      expect(body.message).toBe('The case was resolved successfully and there is no case to resolve for the moment');
    });
  });
});
