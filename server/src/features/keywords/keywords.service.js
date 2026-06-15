const { createId, now } = require('../../database/store');
const repository = require('../../database/repository');

const listKeywordSets = (userId) => repository.listByUser('keywordSets', userId);

const createKeywordSet = async (userId, payload) => {
  const keywordSet = {
    id: createId('keyword_set'),
    userId,
    keywords: payload.keywords || [],
    filters: payload.filters || {},
    enabled: payload.enabled ?? true,
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
  };

  return repository.insert('keywordSets', keywordSet);
};

const updateKeywordSet = async (userId, id, payload) => {
  const keywordSet = await repository.findById('keywordSets', userId, id);
  if (!keywordSet) {
    return null;
  }

  return repository.update('keywordSets', {
    ...keywordSet,
    keywords: payload.keywords ?? keywordSet.keywords,
    filters: payload.filters ?? keywordSet.filters,
    enabled: payload.enabled ?? keywordSet.enabled,
    updatedAt: now(),
  });
};

const deleteKeywordSet = async (userId, id) => {
  const keywordSet = await repository.findById('keywordSets', userId, id);
  if (!keywordSet) {
    return null;
  }

  return repository.update('keywordSets', {
    ...keywordSet,
    enabled: false,
    deletedAt: now(),
    updatedAt: now(),
  });
};

module.exports = { listKeywordSets, createKeywordSet, updateKeywordSet, deleteKeywordSet };
