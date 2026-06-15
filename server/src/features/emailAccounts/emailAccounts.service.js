const nodemailer = require('nodemailer');
const { createId, now } = require('../../database/store');
const repository = require('../../database/repository');
const { decrypt, encrypt } = require('../../utils/crypto');

const sanitize = (account) => {
  if (!account) {
    return null;
  }

  const { encryptedAppPassword, ...safeAccount } = account;
  return {
    ...safeAccount,
    hasAppPassword: Boolean(encryptedAppPassword),
  };
};

const listEmailAccounts = (userId) =>
  repository.listByUser('emailAccounts', userId).then((accounts) => accounts.map(sanitize));

const createEmailAccount = async (userId, payload) => {
  const account = {
    id: createId('email_account'),
    userId,
    email: payload.email,
    encryptedAppPassword: encrypt(payload.appPassword),
    enabled: payload.enabled ?? true,
    smtpStatus: 'untested',
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
  };

  return sanitize(await repository.insert('emailAccounts', account));
};

const updateEmailAccount = async (userId, id, payload) => {
  const account = await repository.findById('emailAccounts', userId, id);
  if (!account) {
    return null;
  }

  const updated = {
    ...account,
    email: payload.email ?? account.email,
    encryptedAppPassword: payload.appPassword
      ? encrypt(payload.appPassword)
      : account.encryptedAppPassword,
    enabled: payload.enabled ?? account.enabled,
    updatedAt: now(),
  };

  return sanitize(await repository.update('emailAccounts', updated));
};

const deleteEmailAccount = async (userId, id) => {
  const account = await repository.findById('emailAccounts', userId, id);
  if (!account) {
    return null;
  }

  return sanitize(
    await repository.update('emailAccounts', {
      ...account,
      enabled: false,
      deletedAt: now(),
      updatedAt: now(),
    }),
  );
};

const getActiveEmailAccount = (userId) =>
  repository.findFirstByUser(
    'emailAccounts',
    userId,
    (account) => account.enabled && !account.deletedAt,
  );

const testEmailAccount = async (userId, id) => {
  const account = await repository.findById('emailAccounts', userId, id);
  if (!account) {
    return null;
  }

  if (process.env.NODE_ENV === 'test') {
    return sanitize(
      await repository.update('emailAccounts', {
        ...account,
        smtpStatus: 'verified',
        updatedAt: now(),
      }),
    );
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: account.email,
      pass: decrypt(account.encryptedAppPassword),
    },
  });

  await transporter.verify();
  return sanitize(
    await repository.update('emailAccounts', {
      ...account,
      smtpStatus: 'verified',
      updatedAt: now(),
    }),
  );
};

module.exports = {
  listEmailAccounts,
  createEmailAccount,
  updateEmailAccount,
  deleteEmailAccount,
  testEmailAccount,
  getActiveEmailAccount,
};
