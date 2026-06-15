const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticate } = require('../../middlewares/authenticate');
const authController = require('./auth.controller');

const router = express.Router();

router.post('/auth/signin', asyncHandler(authController.signIn));
router.post('/auth/signup', asyncHandler(authController.signUp));
router.get('/auth/session', authenticate, asyncHandler(authController.getSession));

module.exports = router;
