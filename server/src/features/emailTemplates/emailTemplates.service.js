const { createId, now } = require('../../database/store');
const repository = require('../../database/repository');

const listTemplates = (userId) =>
  repository.listByUser('emailTemplates', userId);

const createTemplate = async (userId, payload) => {
  if (payload.active ?? true) {
    await repository.updateWhere(
      'emailTemplates',
      userId,
      (template) => template.active && !template.deletedAt,
      (template) => ({ ...template, active: false, updatedAt: now() }),
    );
  }

  const template = {
    id: createId('email_template'),
    userId,
    subject: payload.subject,
    body: payload.body,
    active: payload.active ?? true,
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
  };

  return repository.insert('emailTemplates', template);
};

const updateTemplate = async (userId, id, payload) => {
  const template = await repository.findById('emailTemplates', userId, id);
  if (!template) {
    return null;
  }

  return repository.update('emailTemplates', {
    ...template,
    subject: payload.subject ?? template.subject,
    body: payload.body ?? template.body,
    active: payload.active ?? template.active,
    updatedAt: now(),
  });
};

const deleteTemplate = async (userId, id) => {
  const template = await repository.findById('emailTemplates', userId, id);
  if (!template) {
    return null;
  }

  return repository.update('emailTemplates', {
    ...template,
    active: false,
    deletedAt: now(),
    updatedAt: now(),
  });
};

const getActiveTemplate = (userId) =>
  repository.findFirstByUser('emailTemplates', userId, (template) => template.active);

module.exports = {
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getActiveTemplate,
};
