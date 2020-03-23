const express = require('express');
const bodyParser = require('body-parser');
const { Model } = require('objection');
const Knex = require('knex');
// const WebSocket = require('ws');
const knexConfig = require('../knexfile');
const routes = require('./routes/index');
const { errorMiddleware } = require('./utils/error');

const environment = process.env.NODE_ENV || 'development';
// Initialize knex
const knex = Knex(knexConfig[environment]);

// Bind all Models to knex instance
Model.knex(knex);


const app = express();
// const wss = new WebSocket.Server({ port: 9090 });

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use('/', routes);
app.use(errorMiddleware);

module.exports = { app };
