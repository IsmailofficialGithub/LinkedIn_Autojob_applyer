const axios = require('axios');
const { env } = require('../../config/env');
const { createId, now } = require('../../database/store');
const repository = require('../../database/repository');

const getLinkedinAccount = (userId) =>
  repository.findFirstByUser('linkedinAccounts', userId);

const getConnectUrl = () => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env.LINKEDIN_CLIENT_ID,
    redirect_uri: env.LINKEDIN_REDIRECT_URI,
    scope: env.LINKEDIN_SCOPES,
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
};

const fetchLinkedinIdentity = async (code) => {
  const tokenResponse = await axios.post(
    'https://www.linkedin.com/oauth/v2/accessToken',
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: env.LINKEDIN_CLIENT_ID,
      client_secret: env.LINKEDIN_CLIENT_SECRET,
      redirect_uri: env.LINKEDIN_REDIRECT_URI,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );

  const userResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
  });

  return userResponse.data;
};

const connectLinkedin = async (userId, query) => {
  const identity =
    query.mock === '1' || process.env.NODE_ENV === 'test'
      ? {
          sub: query.sub || 'linkedin_test_sub',
          name: query.name || 'LinkedIn Test User',
          email: query.email || 'linkedin@example.com',
          picture: query.picture || '',
        }
      : await fetchLinkedinIdentity(query.code);

  const existing = await getLinkedinAccount(userId);
  const account = {
    id: existing?.id || createId('linkedin'),
    userId,
    linkedinSub: identity.sub,
    name: identity.name || '',
    email: identity.email || '',
    picture: identity.picture || '',
    connected: true,
    connectedAt: now(),
    updatedAt: now(),
    deletedAt: null,
  };

  return existing
    ? repository.update('linkedinAccounts', account)
    : repository.insert('linkedinAccounts', account);
};

const disconnectLinkedin = async (userId) => {
  const account = await getLinkedinAccount(userId);
  if (!account) {
    return null;
  }

  return repository.update('linkedinAccounts', {
    ...account,
    connected: false,
    deletedAt: now(),
    updatedAt: now(),
  });
};

const getLinkedinStatus = async (userId) => {
  const account = await getLinkedinAccount(userId);
  return {
    connected: Boolean(account?.connected),
    account,
  };
};

module.exports = {
  getConnectUrl,
  connectLinkedin,
  disconnectLinkedin,
  getLinkedinStatus,
};
