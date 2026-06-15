const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const controller = require('./emailAccounts.controller');

const router = express.Router();

router.get('/email-accounts', asyncHandler(controller.list));
router.post('/email-accounts', asyncHandler(controller.create));
router.post('/email-accounts/test', asyncHandler(controller.test));
router.put('/email-accounts/:id', asyncHandler(controller.update));
router.delete('/email-accounts/:id', asyncHandler(controller.remove));

module.exports = router;
