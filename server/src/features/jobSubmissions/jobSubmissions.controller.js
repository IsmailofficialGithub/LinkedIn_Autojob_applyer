const { sendSuccess } = require('../../helpers/response');
const service = require('./jobSubmissions.service');

const list = async (req, res) =>
  sendSuccess(res, { data: await service.listJobSubmissions(req.user.id) });

const create = async (req, res) =>
  sendSuccess(res, {
    statusCode: 201,
    message: 'Job submission saved',
    data: await service.createJobSubmission(req.user.id, req.body),
  });

const update = async (req, res) =>
  sendSuccess(res, {
    message: 'Job submission updated',
    data: await service.updateJobSubmission(req.user.id, req.params.id, req.body),
  });

const remove = async (req, res) =>
  sendSuccess(res, {
    message: 'Job submission deleted',
    data: await service.deleteJobSubmission(req.user.id, req.params.id),
  });

module.exports = { list, create, update, remove };
