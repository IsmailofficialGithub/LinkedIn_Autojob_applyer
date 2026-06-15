const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const controller = require('./emailQueue.controller');

const router = express.Router();

router.get('/email-queue', asyncHandler(controller.list));
router.post('/email-queue/:id/send', asyncHandler(controller.send));
router.put('/email-queue/:id', asyncHandler(controller.update));
router.delete('/email-queue/:id', asyncHandler(controller.remove));
router.get('/email-send-logs', asyncHandler(controller.listLogs));
router.post('/automation/run-now', asyncHandler(controller.runNow));

module.exports = router;
