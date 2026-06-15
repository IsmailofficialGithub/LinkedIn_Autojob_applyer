const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const controller = require('./automation.controller');

const router = express.Router();

router.get('/automation/settings', asyncHandler(controller.getSettings));
router.put('/automation/settings', asyncHandler(controller.updateSettings));
router.get('/automation/runs', asyncHandler(controller.listRuns));

module.exports = router;
