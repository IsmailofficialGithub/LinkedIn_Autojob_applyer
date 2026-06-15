const { sendSuccess } = require('../../helpers/response');
const usersService = require('./users.service');

const getMe = async (req, res) => sendSuccess(res, { data: await usersService.getUserContext(req.user) });

const getOnboarding = async (req, res) =>
  sendSuccess(res, { data: await usersService.getOnboarding(req.user.id) });

const createProfile = async (req, res) =>
  sendSuccess(res, {
    statusCode: 201,
    message: 'Profile saved',
    data: await usersService.createProfile(req.user, req.body),
  });

const updateProfile = async (req, res) =>
  sendSuccess(res, {
    message: 'Profile updated',
    data: await usersService.updateProfile(req.user, req.body),
  });

const deleteProfile = async (req, res) =>
  sendSuccess(res, {
    message: 'Profile deleted',
    data: await usersService.deleteProfile(req.user.id),
  });

module.exports = {
  getMe,
  getOnboarding,
  createProfile,
  updateProfile,
  deleteProfile,
};
