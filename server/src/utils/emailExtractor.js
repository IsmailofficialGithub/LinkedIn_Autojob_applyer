const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

const extractEmails = (content) => {
  const matches = content.match(EMAIL_PATTERN) || [];
  return [...new Set(matches.map((email) => email.toLowerCase()))];
};

module.exports = { extractEmails };
