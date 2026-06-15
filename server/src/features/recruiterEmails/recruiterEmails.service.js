const { createId, now } = require('../../database/store');
const repository = require('../../database/repository');
const { extractEmails } = require('../../utils/emailExtractor');
const emailQueueService = require('../emailQueue/emailQueue.service');

const listRecruiterEmails = (userId) =>
  repository.listByUser('recruiterEmails', userId);

const createRecruiterEmail = async (userId, payload) => {
  const normalized = payload.email.toLowerCase();
  const duplicate = await repository.findFirstByUser(
    'recruiterEmails',
    userId,
    (item) => item.jobSubmissionId === payload.jobSubmissionId && item.email === normalized,
  );

  if (duplicate) {
    return duplicate;
  }

  const recruiterEmail = {
    id: createId('recruiter_email'),
    userId,
    jobSubmissionId: payload.jobSubmissionId,
    email: normalized,
    source: payload.source || 'manual',
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
  };

  const saved = await repository.insert('recruiterEmails', recruiterEmail);
  await emailQueueService.createQueueItem(userId, {
    jobSubmissionId: recruiterEmail.jobSubmissionId,
    recruiterEmailId: saved.id,
    recipient: recruiterEmail.email,
  });
  return saved;
};

const extractForSubmission = async (userId, submission) => {
  const created = [];
  for (const email of extractEmails(submission.content)) {
    created.push(
      await createRecruiterEmail(userId, {
      jobSubmissionId: submission.id,
      email,
      source: 'extracted',
    }),
    );
  }
  return created;
};

const extractFromContent = async (userId, payload) => {
  const created = [];
  for (const email of extractEmails(payload.content || '')) {
    created.push(
      await createRecruiterEmail(userId, {
      jobSubmissionId: payload.jobSubmissionId || null,
      email,
      source: 'manual_extract',
    }),
    );
  }
  return created;
};

const updateRecruiterEmail = async (userId, id, payload) => {
  const recruiterEmail = await repository.findById('recruiterEmails', userId, id);
  if (!recruiterEmail) {
    return null;
  }

  return repository.update('recruiterEmails', {
    ...recruiterEmail,
    email: payload.email ? payload.email.toLowerCase() : recruiterEmail.email,
    updatedAt: now(),
  });
};

const deleteRecruiterEmail = async (userId, id) => {
  const recruiterEmail = await repository.findById('recruiterEmails', userId, id);
  if (!recruiterEmail) {
    return null;
  }

  return repository.update('recruiterEmails', {
    ...recruiterEmail,
    deletedAt: now(),
    updatedAt: now(),
  });
};

module.exports = {
  listRecruiterEmails,
  createRecruiterEmail,
  extractForSubmission,
  extractFromContent,
  updateRecruiterEmail,
  deleteRecruiterEmail,
};
