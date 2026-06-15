const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const linkedinController = require('./linkedin.controller');

const router = express.Router();

router.get('/linkedin/callback', asyncHandler(linkedinController.handlePublicCallback));
router.get('/rest/oauth2-credential/callback', asyncHandler(linkedinController.handlePublicCallback));

module.exports = router;
