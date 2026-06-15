const { createClient } = require('@supabase/supabase-js');
const { env } = require('./env');

const canCreateClient = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = canCreateClient
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

module.exports = { supabase };
