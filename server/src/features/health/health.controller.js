const { sendSuccess } = require('../../helpers/response');
const { getHealthStatus } = require('./health.service');

const getHealth = (req, res) => {
  return sendSuccess(res, {
    message: 'Server is healthy',
    data: getHealthStatus(),
  });
};

module.exports = { getHealth };
