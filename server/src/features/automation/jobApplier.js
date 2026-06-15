const scraper = require('./scraper');
const jobSubmissionsService = require('../jobSubmissions/jobSubmissions.service');
const automationService = require('./automation.service');
const linkedinService = require('../linkedin/linkedin.service');

const scanAndApplyJobs = async (userId, keyword, maxPages = 1) => {
  await automationService.createAutomationRun(userId, {
    status: 'running',
    message: `Scanning jobs for keyword: ${keyword}`,
  });

  try {
    const { account } = await linkedinService.getLinkedinStatus(userId);
    const liAtCookie = account?.liAtCookie || null;

    let jobsProcessed = 0;
    let appliedCount = 0;

    for (let page = 1; page <= maxPages; page++) {
      const jobs = await scraper.searchJobs(keyword, page, liAtCookie);
      
      for (const job of jobs) {
        if (!job.url) continue;

        // Save the job submission
        await jobSubmissionsService.createJobSubmission(userId, {
          sourceType: 'linkedin_job',
          url: job.url,
          content: `${job.title} at ${job.company}`,
        });

        // Attempt to apply
        const result = await scraper.clickApplyOnJob(job.url, liAtCookie);
        jobsProcessed++;
        
        if (result.success) {
          appliedCount++;
        }
      }
    }

    await automationService.createAutomationRun(userId, {
      status: 'completed',
      message: `Job scanning finished. Processed ${jobsProcessed} jobs and attempted Easy Apply on ${appliedCount} for '${keyword}'.`,
    });

  } catch (error) {
    await automationService.createAutomationRun(userId, {
      status: 'failed',
      message: `Failed scanning jobs: ${error.message}`,
    });
  }
};

module.exports = {
  scanAndApplyJobs,
};
