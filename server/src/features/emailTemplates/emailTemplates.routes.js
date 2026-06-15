const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const controller = require('./emailTemplates.controller');

const router = express.Router();

router.get('/email-templates', asyncHandler(controller.list));
router.get('/email-templates/active', asyncHandler(controller.getActive));
router.post('/email-templates', asyncHandler(controller.create));
router.put('/email-templates/:id', asyncHandler(controller.update));
router.delete('/email-templates/:id', asyncHandler(controller.remove));

module.exports = router;
