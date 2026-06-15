const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const controller = require('./recruiterEmails.controller');

const router = express.Router();

router.get('/recruiter-emails', asyncHandler(controller.list));
router.post('/recruiter-emails/extract', asyncHandler(controller.extract));
router.put('/recruiter-emails/:id', asyncHandler(controller.update));
router.delete('/recruiter-emails/:id', asyncHandler(controller.remove));

module.exports = router;
