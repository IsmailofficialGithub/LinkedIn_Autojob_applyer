const { sendSuccess } = require('../../helpers/response');
const authService = require('./auth.service');

const signIn = async (req, res) =>
  sendSuccess(res, {
    message: 'Signed in',
    data: await authService.signIn(req.body),
  });

const signUp = async (req, res) =>
  sendSuccess(res, {
    statusCode: 201,
    message: 'Account created',
    data: await authService.signUp(req.body),
  });

const getSession = async (req, res) =>
  sendSuccess(res, {
    data: {
      user: req.user,
    },
  });

module.exports = { signIn, signUp, getSession };
