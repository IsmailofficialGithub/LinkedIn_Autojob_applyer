const { env } = require('../../config/env');
const { createId, now } = require('../../database/store');
const repository = require('../../database/repository');

const getAutomationSettings = async (userId) => {
  let settings = await repository.findFirstByUser('automationSettings', userId);

  if (!settings) {
    settings = {
      id: createId('automation_settings'),
      userId,
      autoSendEnabled: false,
      scanEnabled: true,
      maxEmailsPerDay: env.DEFAULT_MAX_EMAILS_PER_DAY,
      createdAt: now(),
      updatedAt: now(),
    };
    settings = await repository.insert('automationSettings', settings);
  }

  return settings;
};

const updateAutomationSettings = async (userId, payload) => {
  const settings = await getAutomationSettings(userId);
  return repository.update('automationSettings', {
    ...settings,
    autoSendEnabled: payload.autoSendEnabled ?? settings.autoSendEnabled,
    scanEnabled: payload.scanEnabled ?? settings.scanEnabled,
    maxEmailsPerDay: payload.maxEmailsPerDay ?? settings.maxEmailsPerDay,
    updatedAt: now(),
  });
};

const listAutomationRuns = async (userId) =>
  repository.listByUser('automationRuns', userId, { includeDeleted: true });

const createAutomationRun = async (userId, payload) => {
  const run = {
    id: createId('automation_run'),
    userId,
    status: payload.status || 'completed',
    message: payload.message || '',
    createdAt: now(),
  };
  return repository.insert('automationRuns', run);
};

const getAutomationSettingsById = (userId, id) =>
  repository.findById('automationSettings', userId, id);

module.exports = {
  getAutomationSettings,
  updateAutomationSettings,
  listAutomationRuns,
  createAutomationRun,
  getAutomationSettingsById,
};
