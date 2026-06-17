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
      console.log(`[jobApplier] Searching jobs for keyword '${keyword}' page ${page}...`);
      const jobs = await scraper.searchJobs(keyword, page, liAtCookie);
      console.log(`[jobApplier] Found ${jobs.length} jobs on page ${page}.`);
      
      for (const job of jobs) {
        if (!job.url) continue;

        // Save the job submission
        await jobSubmissionsService.createJobSubmission(userId, {
          sourceType: 'linkedin_job',
          url: job.url,
          content: `${job.title} at ${job.company}`,
        });

        // Attempt to apply
        console.log(`[jobApplier] Attempting to apply for job: ${job.title} at ${job.company} (${job.url})`);
        const result = await scraper.clickApplyOnJob(job.url, liAtCookie);
        console.log(`[jobApplier] Apply result for ${job.title}: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message}`);
        jobsProcessed++;
        
        if (result.success) {
          appliedCount++;
        }
      }
    }

    console.log(`[jobApplier] Finished. Processed ${jobsProcessed} jobs, attempted apply on ${appliedCount}.`);
    await automationService.createAutomationRun(userId, {
      status: 'completed',
      message: `Job scanning finished. Processed ${jobsProcessed} jobs and attempted Easy Apply on ${appliedCount} for '${keyword}'.`,
    });

  } catch (error) {
    console.error(`[jobApplier] Error scanning jobs for '${keyword}':`, error);
    await automationService.createAutomationRun(userId, {
      status: 'failed',
      message: `Failed scanning jobs: ${error.message}`,
    });
    throw error; // Rethrow so BullMQ knows it failed
  }
};

module.exports = {
  scanAndApplyJobs,
};
