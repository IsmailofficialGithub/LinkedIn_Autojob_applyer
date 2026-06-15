const express = require('express');
const healthRoutes = require('./health/health.routes');
const { authenticate } = require('../middlewares/authenticate');
const automationRoutes = require('./automation/automation.routes');
const emailAccountsRoutes = require('./emailAccounts/emailAccounts.routes');
const emailQueueRoutes = require('./emailQueue/emailQueue.routes');
const emailTemplatesRoutes = require('./emailTemplates/emailTemplates.routes');
const jobSubmissionsRoutes = require('./jobSubmissions/jobSubmissions.routes');
const keywordsRoutes = require('./keywords/keywords.routes');
const linkedinRoutes = require('./linkedin/linkedin.routes');
const recruiterEmailsRoutes = require('./recruiterEmails/recruiterEmails.routes');
const resumesRoutes = require('./resumes/resumes.routes');
const usersRoutes = require('./users/users.routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use(authenticate);
router.use(usersRoutes);
router.use(linkedinRoutes);
router.use(resumesRoutes);
router.use(emailAccountsRoutes);
router.use(emailTemplatesRoutes);
router.use(keywordsRoutes);
router.use(automationRoutes);
router.use(jobSubmissionsRoutes);
router.use(recruiterEmailsRoutes);
router.use(emailQueueRoutes);

module.exports = router;
