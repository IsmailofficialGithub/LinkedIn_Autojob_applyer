const { createId, now } = require('../../database/store');
const repository = require('../../database/repository');
const { hashValue } = require('../../utils/hash');
const { ApiError } = require('../../utils/ApiError');
const { canonicalizeUrl } = require('../../utils/url');
const recruiterEmailsService = require('../recruiterEmails/recruiterEmails.service');

const sourceTypes = new Set(['linkedin_job', 'linkedin_post']);

const listJobSubmissions = (userId) =>
  repository.listByUser('jobSubmissions', userId);

const createJobSubmission = async (userId, payload) => {
  const sourceType = payload.sourceType;
  if (!sourceTypes.has(sourceType)) {
    throw new ApiError(400, 'Invalid source type');
  }

  const canonicalUrl = canonicalizeUrl(payload.url);
  const contentHash = hashValue(payload.content || '');
  const duplicate = await repository.findFirstByUser(
    'jobSubmissions',
    userId,
    (submission) => submission.canonicalUrl === canonicalUrl || submission.contentHash === contentHash,
  );

  if (duplicate) {
    return duplicate;
  }

  const submission = {
    id: createId('job_submission'),
    userId,
    sourceType,
    url: payload.url,
    canonicalUrl,
    content: payload.content || '',
    contentHash,
    status: 'submitted',
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
  };

  const saved = await repository.insert('jobSubmissions', submission);
  await recruiterEmailsService.extractForSubmission(userId, saved);
  return saved;
};

const updateJobSubmission = async (userId, id, payload) => {
  const submission = await repository.findById('jobSubmissions', userId, id);
  if (!submission) {
    return null;
  }

  return repository.update('jobSubmissions', {
    ...submission,
    content: payload.content ?? submission.content,
    status: payload.status ?? submission.status,
    updatedAt: now(),
  });
};

const deleteJobSubmission = async (userId, id) => {
  const submission = await repository.findById('jobSubmissions', userId, id);
  if (!submission) {
    return null;
  }

  return repository.update('jobSubmissions', {
    ...submission,
    status: 'deleted',
    deletedAt: now(),
    updatedAt: now(),
  });
};

module.exports = {
  listJobSubmissions,
  createJobSubmission,
  updateJobSubmission,
  deleteJobSubmission,
};
