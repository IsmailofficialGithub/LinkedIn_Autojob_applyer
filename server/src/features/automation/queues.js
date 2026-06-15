const { Queue } = require('bullmq');
const { env } = require('../../config/env');

let automationQueue;

const getAutomationQueue = () => {
  if (!automationQueue) {
    automationQueue = new Queue('automation', {
      connection: { url: env.REDIS_URL },
    });
  }

  return automationQueue;
};

module.exports = { getAutomationQueue };
