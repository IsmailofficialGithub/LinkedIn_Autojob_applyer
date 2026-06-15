const { createId, now } = require('../../database/store');
const repository = require('../../database/repository');

const sanitizeProfile = (profile) => profile || null;

const getProfile = async (userId) =>
  sanitizeProfile(await repository.findFirstByUser('profiles', userId));

const createProfile = async (user, payload) => {
  const existing = await getProfile(user.id);
  if (existing) {
    return existing;
  }

  const profile = {
    id: createId('profile'),
    userId: user.id,
    email: user.email,
    fullName: payload.fullName || '',
    phone: payload.phone || '',
    location: payload.location || '',
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
  };

  return repository.insert('profiles', profile);
};

const updateProfile = async (user, payload) => {
  const profile = (await getProfile(user.id)) || (await createProfile(user, {}));
  const updated = {
    ...profile,
    fullName: payload.fullName ?? profile.fullName,
    phone: payload.phone ?? profile.phone,
    location: payload.location ?? profile.location,
    updatedAt: now(),
  };

  return repository.update('profiles', updated);
};

const deleteProfile = async (userId) => {
  const profile = await getProfile(userId);
  if (!profile) {
    return null;
  }

  return repository.update('profiles', {
    ...profile,
    deletedAt: now(),
    updatedAt: now(),
  });
};

const getOnboarding = async (userId) => {
  const linkedinAccounts = await repository.listByUser('linkedinAccounts', userId);
  const resumes = await repository.listByUser('resumes', userId);
  const emailAccounts = await repository.listByUser('emailAccounts', userId);
  const emailTemplates = await repository.listByUser('emailTemplates', userId);
  const keywordSets = await repository.listByUser('keywordSets', userId);

  const linkedinConnected = linkedinAccounts.some(
    (account) => account.connected && !account.deletedAt,
  );
  const hasResume = resumes.some((resume) => resume.active && !resume.deletedAt);
  const hasEmailAccount = emailAccounts.some(
    (account) => account.enabled && !account.deletedAt,
  );
  const hasTemplate = emailTemplates.some(
    (template) => template.active && !template.deletedAt,
  );
  const hasKeywords = keywordSets.some((set) => set.enabled && !set.deletedAt);

  const steps = {
    linkedinConnected,
    hasResume,
    hasEmailAccount,
    hasTemplate,
    hasKeywords,
  };

  return {
    complete: Object.values(steps).every(Boolean),
    steps,
    missing: Object.entries(steps)
      .filter(([, value]) => !value)
      .map(([key]) => key),
  };
};

const getUserContext = async (user) => ({
  user,
  profile: await getProfile(user.id),
  onboarding: await getOnboarding(user.id),
});

const getProfileById = (userId, id) => repository.findById('profiles', userId, id);

module.exports = {
  getProfile,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  getOnboarding,
  getUserContext,
};
