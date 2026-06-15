const express = require('express');
const featureRoutes = require('./features');
const { errorHandler } = require('./middlewares/errorHandler');
const { notFoundHandler } = require('./middlewares/notFoundHandler');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', featureRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
