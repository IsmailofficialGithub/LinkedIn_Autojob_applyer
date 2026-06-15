require('dotenv').config();

const parseList = (value, fallback = []) =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .concat(fallback)
    .filter((item, index, list) => list.indexOf(item) === index);

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 5000),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  FRONTEND_URLS: parseList(process.env.FRONTEND_URLS, [
    process.env.FRONTEND_URL || 'http://localhost:5173',
  ]),
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  SUPABASE_RESUME_BUCKET: process.env.SUPABASE_RESUME_BUCKET || 'resumes',
  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID || '',
  LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET || '',
  LINKEDIN_REDIRECT_URI:
    process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:5000/api/linkedin/callback',
  LINKEDIN_SCOPES: process.env.LINKEDIN_SCOPES || 'openid profile email',
  ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET || 'dev-only-change-this-secret',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JOB_SCAN_INTERVAL_MINUTES: Number(process.env.JOB_SCAN_INTERVAL_MINUTES || 30),
  DEFAULT_MAX_EMAILS_PER_DAY: Number(process.env.DEFAULT_MAX_EMAILS_PER_DAY || 100),
  EMAIL_QUEUE_MAX_ATTEMPTS: Number(process.env.EMAIL_QUEUE_MAX_ATTEMPTS || 3),
};

const validateEnv = () => {
  if (env.NODE_ENV === 'production') {
    const required = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'LINKEDIN_CLIENT_ID',
      'LINKEDIN_CLIENT_SECRET',
      'ENCRYPTION_SECRET',
      'REDIS_URL',
    ];

    const missing = required.filter((key) => !env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required env values: ${missing.join(', ')}`);
    }
  }
};

validateEnv();

module.exports = { env };
