const nodemailer = require('nodemailer');
const { env } = require('../../config/env');
const { supabase } = require('../../config/supabase');
const { createId, now } = require('../../database/store');
const repository = require('../../database/repository');
const { decrypt } = require('../../utils/crypto');
const automationService = require('../automation/automation.service');
const emailAccountsService = require('../emailAccounts/emailAccounts.service');
const emailTemplatesService = require('../emailTemplates/emailTemplates.service');
const resumesService = require('../resumes/resumes.service');

const listQueue = (userId) => repository.listByUser('emailQueue', userId);

const listLogs = (userId) => repository.listByUser('emailSendLogs', userId, { includeDeleted: true });

const createQueueItem = async (userId, payload) => {
  const duplicate = await repository.findFirstByUser(
    'emailQueue',
    userId,
    (item) =>
      item.jobSubmissionId === payload.jobSubmissionId &&
      item.recruiterEmailId === payload.recruiterEmailId &&
      !item.deletedAt,
  );

  if (duplicate) {
    return duplicate;
  }

  const template = await emailTemplatesService.getActiveTemplate(userId);
  const resume = await resumesService.getActiveResume(userId);
  const item = {
    id: createId('email_queue'),
    userId,
    jobSubmissionId: payload.jobSubmissionId,
    recruiterEmailId: payload.recruiterEmailId,
    recipient: payload.recipient,
    subject: template?.subject || payload.subject || '',
    body: template?.body || payload.body || '',
    resumeId: resume?.id || null,
    status: 'pending',
    attempts: 0,
    maxAttempts: env.EMAIL_QUEUE_MAX_ATTEMPTS,
    lastError: null,
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
  };

  return repository.insert('emailQueue', item);
};

const updateQueueItem = async (userId, id, payload) => {
  const item = await repository.findById('emailQueue', userId, id);
  if (!item) {
    return null;
  }

  return repository.update('emailQueue', {
    ...item,
    status: payload.status ?? item.status,
    subject: payload.subject ?? item.subject,
    body: payload.body ?? item.body,
    updatedAt: now(),
  });
};

const deleteQueueItem = async (userId, id) => {
  const item = await repository.findById('emailQueue', userId, id);
  if (!item) {
    return null;
  }

  return repository.update('emailQueue', {
    ...item,
    status: 'deleted',
    deletedAt: now(),
    updatedAt: now(),
  });
};

const countSentToday = async (userId) => {
  const today = new Date().toISOString().slice(0, 10);
  const logs = await listLogs(userId);
  return logs.filter(
    (log) => log.userId === userId && log.status === 'sent' && log.createdAt.startsWith(today),
  ).length;
};

const getResumeAttachment = async (resume) => {
  if (!resume) {
    return null;
  }

  if (!supabase) {
    return {
      filename: resume.originalName,
      content: Buffer.from('Test resume attachment'),
      contentType: resume.mimeType,
    };
  }

  const { data, error } = await supabase.storage
    .from(resume.bucket)
    .download(resume.storagePath);

  if (error) {
    throw error;
  }

  return {
    filename: resume.originalName,
    content: Buffer.from(await data.arrayBuffer()),
    contentType: resume.mimeType,
  };
};

const writeSendLog = async (userId, item, status, message) => {
  const log = {
    id: createId('email_send_log'),
    userId,
    emailQueueId: item.id,
    recipient: item.recipient,
    status,
    message,
    createdAt: now(),
  };
  return repository.insert('emailSendLogs', log);
};

const sendQueueItem = async (userId, id) => {
  let item = await repository.findById('emailQueue', userId, id);
  if (!item || item.deletedAt) {
    return null;
  }

  const settings = await automationService.getAutomationSettings(userId);
  if ((await countSentToday(userId)) >= settings.maxEmailsPerDay) {
    item.status = 'skipped_limit';
    item.updatedAt = now();
    item = await repository.update('emailQueue', item);
    await writeSendLog(userId, item, 'skipped_limit', 'Daily email limit reached');
    return item;
  }

  const account = await emailAccountsService.getActiveEmailAccount(userId);
  const resume = item.resumeId
    ? await repository.findById('resumes', userId, item.resumeId)
    : await resumesService.getActiveResume(userId);

  try {
    item.status = 'sending';
    item.attempts += 1;
    item.updatedAt = now();
    item = await repository.update('emailQueue', item);

    if (process.env.NODE_ENV !== 'test') {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: account.email,
          pass: decrypt(account.encryptedAppPassword),
        },
      });

      const attachment = await getResumeAttachment(resume);
      await transporter.sendMail({
        from: account.email,
        to: item.recipient,
        subject: item.subject,
        text: item.body,
        attachments: attachment ? [attachment] : [],
      });
    }

    item.status = 'sent';
    item.lastError = null;
    item.updatedAt = now();
    item = await repository.update('emailQueue', item);
    await writeSendLog(userId, item, 'sent', 'Email sent');
    return item;
  } catch (error) {
    item.status = item.attempts >= item.maxAttempts ? 'failed' : 'pending';
    item.lastError = error.message;
    item.updatedAt = now();
    item = await repository.update('emailQueue', item);
    await writeSendLog(userId, item, 'failed', error.message);
    return item;
  }
};

const processPendingForUser = async (userId) => {
  const settings = await automationService.getAutomationSettings(userId);
  let run = await automationService.createAutomationRun(userId, {
    status: 'running',
    message: 'Manual automation run started',
  });

  if (!settings.autoSendEnabled) {
    run.status = 'skipped';
    run.message = 'Auto-send is disabled';
    run = await repository.update('automationRuns', run);
    return run;
  }

  const pending = (await listQueue(userId)).filter((item) => item.status === 'pending');
  for (const item of pending) {
    await sendQueueItem(userId, item.id);
  }

  run.status = 'completed';
  run.message = `Processed ${pending.length} queue items`;
  return repository.update('automationRuns', run);
};

module.exports = {
  listQueue,
  listLogs,
  createQueueItem,
  updateQueueItem,
  deleteQueueItem,
  sendQueueItem,
  processPendingForUser,
};
