const { env } = require('../../config/env');
const { supabase } = require('../../config/supabase');
const { createId, now } = require('../../database/store');
const repository = require('../../database/repository');

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const uploadResume = async (userId, file) => {
  const storagePath = `${userId}/${Date.now()}-${file.originalname}`;

  if (supabase) {
    const { error } = await supabase.storage
      .from(env.SUPABASE_RESUME_BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw error;
    }
  }

  await repository.updateWhere(
    'resumes',
    userId,
    (resume) => !resume.deletedAt,
    (resume) => ({ ...resume, active: false, updatedAt: now() }),
  );

  const resume = {
    id: createId('resume'),
    userId,
    bucket: env.SUPABASE_RESUME_BUCKET,
    storagePath,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    active: true,
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
  };

  return repository.insert('resumes', resume);
};

const attachPreviewUrl = async (resume) => {
  if (!resume || !supabase || resume.mimeType !== 'application/pdf') {
    return resume;
  }

  const { data, error } = await supabase.storage
    .from(resume.bucket)
    .createSignedUrl(resume.storagePath, 60 * 10);

  if (error) {
    return resume;
  }

  return {
    ...resume,
    previewUrl: data.signedUrl,
  };
};

const getActiveResume = async (userId) => {
  const resume = await repository.findFirstByUser(
    'resumes',
    userId,
    (item) => item.active && !item.deletedAt,
  );

  return attachPreviewUrl(resume);
};

const updateResume = async (userId, id, payload) => {
  const resume = await repository.findById('resumes', userId, id);
  if (!resume) {
    return null;
  }

  return repository.update('resumes', {
    ...resume,
    originalName: payload.originalName ?? resume.originalName,
    active: payload.active ?? resume.active,
    updatedAt: now(),
  });
};

const deleteResume = async (userId, id) => {
  const resume = await repository.findById('resumes', userId, id);
  if (!resume) {
    return null;
  }

  return repository.update('resumes', {
    ...resume,
    active: false,
    deletedAt: now(),
    updatedAt: now(),
  });
};

module.exports = {
  allowedMimeTypes,
  uploadResume,
  getActiveResume,
  updateResume,
  deleteResume,
};
