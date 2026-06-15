const { supabase } = require('../config/supabase');
const { byUser, findByIdForUser, state, upsertOne } = require('./store');

const tableNames = {
  profiles: 'profiles',
  linkedinAccounts: 'linkedin_accounts',
  resumes: 'resumes',
  emailAccounts: 'email_accounts',
  emailTemplates: 'email_templates',
  keywordSets: 'keyword_sets',
  automationSettings: 'automation_settings',
  jobSubmissions: 'job_submissions',
  recruiterEmails: 'recruiter_emails',
  emailQueue: 'email_queue',
  emailSendLogs: 'email_send_logs',
  automationRuns: 'automation_runs',
};

const collectionsWithoutDeletedAt = new Set([
  'automationSettings',
  'emailSendLogs',
  'automationRuns',
]);

const useSupabase = () => Boolean(supabase) && process.env.NODE_ENV !== 'test';

const toSnake = (value) =>
  value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const toCamel = (value) =>
  value.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const convertKeys = (input, keyConverter) => {
  if (Array.isArray(input)) {
    return input.map((item) => convertKeys(item, keyConverter));
  }

  if (!input || typeof input !== 'object' || input instanceof Buffer) {
    return input;
  }

  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [keyConverter(key), convertKeys(value, keyConverter)]),
  );
};

const toDb = (item) => convertKeys(item, toSnake);
const fromDb = (item) => convertKeys(item, toCamel);

const table = (collection) => tableNames[collection];

const listByUser = async (collection, userId, options = {}) => {
  if (!useSupabase()) {
    return byUser(collection, userId).filter((item) => options.includeDeleted || !item.deletedAt);
  }

  let query = supabase.from(table(collection)).select('*').eq('user_id', userId);
  if (!options.includeDeleted && !collectionsWithoutDeletedAt.has(collection)) {
    query = query.is('deleted_at', null);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return fromDb(data || []);
};

const findFirstByUser = async (collection, userId, predicate = () => true) => {
  const items = await listByUser(collection, userId);
  return items.find(predicate) || null;
};

const findById = async (collection, userId, id) => {
  if (!useSupabase()) {
    return findByIdForUser(collection, userId, id) || null;
  }

  const { data, error } = await supabase
    .from(table(collection))
    .select('*')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? fromDb(data) : null;
};

const insert = async (collection, item) => {
  if (!useSupabase()) {
    state[collection].push(item);
    return item;
  }

  const { data, error } = await supabase
    .from(table(collection))
    .insert(toDb(item))
    .select()
    .single();

  if (error) {
    throw error;
  }

  return fromDb(data);
};

const update = async (collection, item) => {
  if (!useSupabase()) {
    return upsertOne(collection, item);
  }

  const { data, error } = await supabase
    .from(table(collection))
    .update(toDb(item))
    .eq('id', item.id)
    .eq('user_id', item.userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return fromDb(data);
};

const updateWhere = async (collection, userId, predicate, updater) => {
  const items = await listByUser(collection, userId);
  const updatedItems = [];

  for (const item of items.filter(predicate)) {
    updatedItems.push(await update(collection, updater(item)));
  }

  return updatedItems;
};

module.exports = {
  useSupabase,
  listByUser,
  findFirstByUser,
  findById,
  insert,
  update,
  updateWhere,
};
