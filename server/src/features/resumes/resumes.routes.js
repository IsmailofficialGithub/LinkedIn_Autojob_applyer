const express = require('express');
const multer = require('multer');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { ApiError } = require('../../utils/ApiError');
const resumesController = require('./resumes.controller');
const { allowedMimeTypes } = require('./resumes.service');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new ApiError(400, 'Only PDF and DOCX resumes are allowed'));
    }

    return callback(null, true);
  },
});

const router = express.Router();

router.get('/resumes/active', asyncHandler(resumesController.getActiveResume));
router.post('/resumes', upload.single('resume'), asyncHandler(resumesController.uploadResume));
router.put('/resumes/:id', asyncHandler(resumesController.updateResume));
router.delete('/resumes/:id', asyncHandler(resumesController.deleteResume));

module.exports = router;
