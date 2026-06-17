const cors = require('cors');
const express = require('express');
const { env } = require('./config/env');
const featureRoutes = require('./features');
const { errorHandler } = require('./middlewares/errorHandler');
const { notFoundHandler } = require('./middlewares/notFoundHandler');

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.FRONTEND_URLS.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin is not allowed'));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api', featureRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
