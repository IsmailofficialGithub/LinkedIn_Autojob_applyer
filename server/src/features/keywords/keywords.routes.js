const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const controller = require('./keywords.controller');

const router = express.Router();

router.get('/keyword-sets', asyncHandler(controller.list));
router.post('/keyword-sets', asyncHandler(controller.create));
router.put('/keyword-sets/:id', asyncHandler(controller.update));
router.delete('/keyword-sets/:id', asyncHandler(controller.remove));

module.exports = router;
