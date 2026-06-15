const crypto = require('crypto');

const createState = () => ({
  profiles: [],
  linkedinAccounts: [],
  resumes: [],
  emailAccounts: [],
  emailTemplates: [],
  keywordSets: [],
  automationSettings: [],
  jobSubmissions: [],
  recruiterEmails: [],
  emailQueue: [],
  emailSendLogs: [],
  automationRuns: [],
});

const state = createState();

const now = () => new Date().toISOString();

const createId = () => crypto.randomUUID();

const resetStore = () => {
  Object.assign(state, createState());
};

const byUser = (collection, userId) => state[collection].filter((item) => item.userId === userId);

const findByIdForUser = (collection, userId, id) =>
  state[collection].find((item) => item.userId === userId && item.id === id);

const upsertOne = (collection, item) => {
  const index = state[collection].findIndex((current) => current.id === item.id);
  if (index >= 0) {
    state[collection][index] = item;
    return item;
  }

  state[collection].push(item);
  return item;
};

module.exports = {
  state,
  now,
  createId,
  resetStore,
  byUser,
  findByIdForUser,
  upsertOne,
};
