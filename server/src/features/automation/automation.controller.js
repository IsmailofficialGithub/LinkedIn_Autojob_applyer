const { sendSuccess } = require('../../helpers/response');
const automationService = require('./automation.service');

const getSettings = async (req, res) =>
  sendSuccess(res, { data: await automationService.getAutomationSettings(req.user.id) });

const updateSettings = async (req, res) =>
  sendSuccess(res, {
    message: 'Automation settings updated',
    data: await automationService.updateAutomationSettings(req.user.id, req.body),
  });

const listRuns = async (req, res) =>
  sendSuccess(res, { data: await automationService.listAutomationRuns(req.user.id) });

const trigger = async (req, res) => {
  const { triggerScrapingForUser } = require('./queues');
  await triggerScrapingForUser(req.user.id);
  return sendSuccess(res, { message: 'Background automation job queued successfully.' });
};

module.exports = { getSettings, updateSettings, listRuns, trigger };
