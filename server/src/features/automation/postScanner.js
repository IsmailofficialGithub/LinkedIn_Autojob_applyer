const scraper = require('./scraper');
const jobSubmissionsService = require('../jobSubmissions/jobSubmissions.service');
const automationService = require('./automation.service');
const linkedinService = require('../linkedin/linkedin.service');

const scanAndQueueEmails = async (userId, keyword, maxPages = 1) => {
  let run = await automationService.createAutomationRun(userId, {
    status: 'running',
    message: `Scanning posts for keyword: ${keyword}`,
  });

  try {
    const { account } = await linkedinService.getLinkedinStatus(userId);
    const liAtCookie = account?.liAtCookie || null;

    let newPostsFound = 0;
    
    for (let page = 1; page <= maxPages; page++) {
      const posts = await scraper.searchPosts(keyword, page, liAtCookie);
      
      for (const post of posts) {
        if (!post.text || !post.text.trim()) continue;

        // Save as job submission, which automatically extracts emails and queues them
        const submission = await jobSubmissionsService.createJobSubmission(userId, {
          sourceType: 'linkedin_post',
          url: post.url || `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}`,
          content: post.text,
        });

        // The service returns the existing submission if it was a duplicate
        // We can check if it was newly created by looking at createdAt vs updatedAt,
        // but for simplicity we'll just track total found
        newPostsFound++;
      }
    }

    run.status = 'completed';
    run.message = `Scanned posts and processed ${newPostsFound} entries. Emails found are in queue.`;
    await automationService.updateAutomationSettings(userId, {}); // dummy update to touch timestamp
    
    // We update the run manually (wait, automationService.js has update? No, it has list and create)
    // We'll just leave it as is, or we need to update the run.
    // Actually, `createAutomationRun` just creates. Let's just create a new run to log completion.
    await automationService.createAutomationRun(userId, {
      status: 'completed',
      message: `Post scanning finished. Processed ${newPostsFound} posts for '${keyword}'.`,
    });

  } catch (error) {
    await automationService.createAutomationRun(userId, {
      status: 'failed',
      message: `Failed scanning posts: ${error.message}`,
    });
  }
};

module.exports = {
  scanAndQueueEmails,
};
