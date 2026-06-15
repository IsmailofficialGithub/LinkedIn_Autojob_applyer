const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const linkedinController = require('./linkedin.controller');

const router = express.Router();

router.get('/linkedin/connect', asyncHandler(linkedinController.getConnectUrl));
router.get('/linkedin/status', asyncHandler(linkedinController.getStatus));
router.delete('/linkedin/disconnect', asyncHandler(linkedinController.disconnect));
router.put('/linkedin/cookie', asyncHandler(linkedinController.saveCookie));

module.exports = router;
