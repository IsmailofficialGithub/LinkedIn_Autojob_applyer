const { ApiError } = require('../../utils/ApiError');
const { sendSuccess } = require('../../helpers/response');
const resumesService = require('./resumes.service');

const getActiveResume = async (req, res) =>
  sendSuccess(res, { data: await resumesService.getActiveResume(req.user.id) });

const getResumeFile = async (req, res) => {
  const file = await resumesService.getResumeFile(req.user.id, req.params.id);
  if (!file) {
    throw new ApiError(404, 'Resume not found');
  }

  res.setHeader('Content-Type', file.resume.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${file.resume.originalName}"`);
  return res.send(file.buffer);
};

const uploadResume = async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Resume file is required');
  }

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Resume uploaded',
    data: await resumesService.uploadResume(req.user.id, req.file),
  });
};

const updateResume = async (req, res) =>
  sendSuccess(res, {
    message: 'Resume updated',
    data: await resumesService.updateResume(req.user.id, req.params.id, req.body),
  });

const deleteResume = async (req, res) =>
  sendSuccess(res, {
    message: 'Resume deleted',
    data: await resumesService.deleteResume(req.user.id, req.params.id),
  });

module.exports = { getActiveResume, getResumeFile, uploadResume, updateResume, deleteResume };
