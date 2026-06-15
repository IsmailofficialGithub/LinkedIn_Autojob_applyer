const getHealthStatus = () => ({
  status: 'ok',
  uptime: process.uptime(),
});

module.exports = { getHealthStatus };
