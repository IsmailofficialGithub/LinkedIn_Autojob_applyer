const { ApiError } = require('./ApiError');

const canonicalizeUrl = (value) => {
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new ApiError(400, 'Invalid URL');
  }

  if (!url.hostname.includes('linkedin.com')) {
    throw new ApiError(400, 'Only LinkedIn URLs are supported');
  }

  url.hash = '';
  url.searchParams.sort();
  return url.toString();
};

module.exports = { canonicalizeUrl };
