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

module.exports = { getSettings, updateSettings, listRuns };
