const { sendSuccess } = require('../../helpers/response');
const service = require('./keywords.service');

const list = async (req, res) => sendSuccess(res, { data: await service.listKeywordSets(req.user.id) });

const create = async (req, res) =>
  sendSuccess(res, {
    statusCode: 201,
    message: 'Keyword set saved',
    data: await service.createKeywordSet(req.user.id, req.body),
  });

const update = async (req, res) =>
  sendSuccess(res, {
    message: 'Keyword set updated',
    data: await service.updateKeywordSet(req.user.id, req.params.id, req.body),
  });

const remove = async (req, res) =>
  sendSuccess(res, {
    message: 'Keyword set deleted',
    data: await service.deleteKeywordSet(req.user.id, req.params.id),
  });

module.exports = { list, create, update, remove };
