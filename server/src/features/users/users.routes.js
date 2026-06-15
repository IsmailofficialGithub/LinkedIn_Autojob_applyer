const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const usersController = require('./users.controller');

const router = express.Router();

router.get('/me', asyncHandler(usersController.getMe));
router.get('/onboarding', asyncHandler(usersController.getOnboarding));
router.post('/users/profile', asyncHandler(usersController.createProfile));
router.put('/users/profile', asyncHandler(usersController.updateProfile));
router.delete('/users/profile', asyncHandler(usersController.deleteProfile));

module.exports = router;
