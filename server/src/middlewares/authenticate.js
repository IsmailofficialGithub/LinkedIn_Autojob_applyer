const { supabase } = require('../config/supabase');
const { ApiError } = require('../utils/ApiError');

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'Authentication token is required'));
  }

  if (process.env.NODE_ENV === 'test' && token.startsWith('test-token')) {
    req.user = {
      id: 'user_test',
      email: 'test@example.com',
    };
    return next();
  }

  if (!supabase) {
    return next(new ApiError(401, 'Supabase auth is not configured'));
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return next(new ApiError(401, 'Invalid authentication token'));
  }

  req.user = {
    id: data.user.id,
    email: data.user.email,
  };
  return next();
};

module.exports = { authenticate };
