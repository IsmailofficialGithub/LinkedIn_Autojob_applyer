const { Queue, Worker } = require('bullmq');
const { env } = require('../../config/env');
const postScanner = require('./postScanner');
const jobApplier = require('./jobApplier');
const repository = require('../../database/repository');

let automationQueue;
let automationWorker;

const getAutomationQueue = () => {
  if (!automationQueue) {
    automationQueue = new Queue('automation', {
      connection: { url: env.REDIS_URL },
    });
  }

  return automationQueue;
};

const initializeWorker = () => {
  if (!automationWorker) {
    automationWorker = new Worker(
      'automation',
      async (job) => {
        const { type, userId, keyword } = job.data;
        if (type === 'scrape_posts') {
          await postScanner.scanAndQueueEmails(userId, keyword, 1);
        } else if (type === 'scrape_jobs') {
          await jobApplier.scanAndApplyJobs(userId, keyword, 1);
        }
      },
      { connection: { url: env.REDIS_URL } }
    );

    automationWorker.on('failed', (job, err) => {
      console.error(`Automation job ${job.id} failed:`, err);
    });
  }
};

const triggerScrapingForUser = async (userId) => {
  // Get user's keywords to use for search
  const keywordsSets = await repository.listByUser('keywordSets', userId);
  const enabledSets = keywordsSets.filter(k => k.enabled && !k.deletedAt);
  
  const queue = getAutomationQueue();
  for (const set of enabledSets) {
    for (const keyword of set.keywords || []) {
      await queue.add('scrape', { type: 'scrape_posts', userId, keyword });
      await queue.add('scrape', { type: 'scrape_jobs', userId, keyword });
    }
  }
};

module.exports = { getAutomationQueue, initializeWorker, triggerScrapingForUser };
