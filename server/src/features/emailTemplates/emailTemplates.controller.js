const { sendSuccess } = require('../../helpers/response');
const service = require('./emailTemplates.service');

const list = async (req, res) => sendSuccess(res, { data: await service.listTemplates(req.user.id) });

const getActive = async (req, res) =>
  sendSuccess(res, { data: await service.getActiveTemplate(req.user.id) });

const create = async (req, res) =>
  sendSuccess(res, {
    statusCode: 201,
    message: 'Email template saved',
    data: await service.createTemplate(req.user.id, req.body),
  });

const update = async (req, res) =>
  sendSuccess(res, {
    message: 'Email template updated',
    data: await service.updateTemplate(req.user.id, req.params.id, req.body),
  });

const remove = async (req, res) =>
  sendSuccess(res, {
    message: 'Email template deleted',
    data: await service.deleteTemplate(req.user.id, req.params.id),
  });

module.exports = { list, getActive, create, update, remove };
