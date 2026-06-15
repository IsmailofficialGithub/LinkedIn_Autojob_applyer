const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const controller = require('./jobSubmissions.controller');

const router = express.Router();

router.get('/job-submissions', asyncHandler(controller.list));
router.post('/job-submissions', asyncHandler(controller.create));
router.put('/job-submissions/:id', asyncHandler(controller.update));
router.delete('/job-submissions/:id', asyncHandler(controller.remove));

module.exports = router;
