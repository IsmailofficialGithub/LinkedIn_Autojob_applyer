const { sendSuccess } = require('../../helpers/response');
const service = require('./emailQueue.service');

const list = async (req, res) => sendSuccess(res, { data: await service.listQueue(req.user.id) });

const update = async (req, res) =>
  sendSuccess(res, {
    message: 'Queue item updated',
    data: await service.updateQueueItem(req.user.id, req.params.id, req.body),
  });

const remove = async (req, res) =>
  sendSuccess(res, {
    message: 'Queue item deleted',
    data: await service.deleteQueueItem(req.user.id, req.params.id),
  });

const send = async (req, res) =>
  sendSuccess(res, {
    message: 'Queue item processed',
    data: await service.sendQueueItem(req.user.id, req.params.id),
  });

const listLogs = async (req, res) =>
  sendSuccess(res, { data: await service.listLogs(req.user.id) });

const runNow = async (req, res) =>
  sendSuccess(res, {
    message: 'Automation run completed',
    data: await service.processPendingForUser(req.user.id),
  });

module.exports = { list, update, remove, send, listLogs, runNow };
