const app = require('./app');
const { env } = require('./config/env');
const { initializeWorker } = require('./features/automation/queues');

const server = app.listen(env.PORT, () => {
  initializeWorker();
  console.log(`Server running on port ${env.PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server closed');
  });
});
