const { sendSuccess } = require('../../helpers/response');
const service = require('./recruiterEmails.service');

const list = async (req, res) =>
  sendSuccess(res, { data: await service.listRecruiterEmails(req.user.id) });

const extract = async (req, res) =>
  sendSuccess(res, {
    statusCode: 201,
    message: 'Emails extracted',
    data: await service.extractFromContent(req.user.id, req.body),
  });

const update = async (req, res) =>
  sendSuccess(res, {
    message: 'Recruiter email updated',
    data: await service.updateRecruiterEmail(req.user.id, req.params.id, req.body),
  });

const remove = async (req, res) =>
  sendSuccess(res, {
    message: 'Recruiter email deleted',
    data: await service.deleteRecruiterEmail(req.user.id, req.params.id),
  });

module.exports = { list, extract, update, remove };
