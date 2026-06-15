const { sendSuccess } = require('../../helpers/response');
const emailAccountsService = require('./emailAccounts.service');

const list = async (req, res) =>
  sendSuccess(res, { data: await emailAccountsService.listEmailAccounts(req.user.id) });

const create = async (req, res) =>
  sendSuccess(res, {
    statusCode: 201,
    message: 'Email account saved',
    data: await emailAccountsService.createEmailAccount(req.user.id, req.body),
  });

const update = async (req, res) =>
  sendSuccess(res, {
    message: 'Email account updated',
    data: await emailAccountsService.updateEmailAccount(req.user.id, req.params.id, req.body),
  });

const remove = async (req, res) =>
  sendSuccess(res, {
    message: 'Email account deleted',
    data: await emailAccountsService.deleteEmailAccount(req.user.id, req.params.id),
  });

const test = async (req, res) =>
  sendSuccess(res, {
    message: 'SMTP test completed',
    data: await emailAccountsService.testEmailAccount(req.user.id, req.body.id),
  });

module.exports = { list, create, update, remove, test };
