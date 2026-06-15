const { env } = require('../../config/env');
const { sendSuccess } = require('../../helpers/response');
const linkedinService = require('./linkedin.service');

const getConnectUrl = (req, res) =>
  sendSuccess(res, { data: { url: linkedinService.getConnectUrl(req.user.id) } });

const handleCallback = async (req, res) =>
  sendSuccess(res, {
    message: 'LinkedIn connected',
    data: await linkedinService.connectLinkedin(req.user.id, req.query),
  });

const handlePublicCallback = async (req, res) => {
  try {
    await linkedinService.connectLinkedinFromCallback(req.query);
    return res.redirect(`${env.FRONTEND_URL}/setup?linkedin=connected`);
  } catch {
    return res.redirect(`${env.FRONTEND_URL}/setup?linkedin=failed`);
  }
};

const getStatus = async (req, res) =>
  sendSuccess(res, { data: await linkedinService.getLinkedinStatus(req.user.id) });

const disconnect = async (req, res) =>
  sendSuccess(res, {
    message: 'LinkedIn disconnected',
    data: await linkedinService.disconnectLinkedin(req.user.id),
  });

module.exports = { getConnectUrl, handleCallback, handlePublicCallback, getStatus, disconnect };
