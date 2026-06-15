const puppeteer = require('puppeteer');
const { env } = require('../../config/env');

let browserInstance = null;

const getBrowser = async () => {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: 'new', // Or true, depending on version
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-notifications'],
    });
  }
  return browserInstance;
};

const closeBrowser = async () => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
};

const getPage = async () => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  // Basic stealth configurations to avoid immediate blocks
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
  );
  await page.setViewport({ width: 1280, height: 800 });

  // Optional: Set li_at cookie if provided in environment (or from user settings later)
  if (env.LINKEDIN_COOKIE_LI_AT) {
    await page.setCookie({
      name: 'li_at',
      value: env.LINKEDIN_COOKIE_LI_AT,
      domain: '.linkedin.com',
      path: '/',
      secure: true,
      httpOnly: true,
    });
  }

  return page;
};

const searchPosts = async (keyword, pageNum = 1) => {
  const page = await getPage();
  const encodedKeyword = encodeURIComponent(keyword);
  // Using the exact URL format provided by the user in the prompt, with skipRedirect=true
  const searchUrl = `https://www.linkedin.com/search/results/content/?skipRedirect=true&keywords=${encodedKeyword}&origin=SWITCH_SEARCH_VERTICAL&page=${pageNum}`;
  
  try {
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Check if we hit a login wall
    const url = page.url();
    if (url.includes('login') || url.includes('signup')) {
      throw new Error('LinkedIn forced login wall. A valid li_at cookie is required.');
    }

    // Wait for feed items to load
    await page.waitForSelector('.feed-shared-update-v2', { timeout: 10000 }).catch(() => null);

    // Extract posts
    const posts = await page.evaluate(() => {
      const postElements = Array.from(document.querySelectorAll('.feed-shared-update-v2'));
      return postElements.map(el => {
        // Extract text content from the post body
        const textElement = el.querySelector('.feed-shared-update-v2__description, .update-components-text');
        const text = textElement ? textElement.innerText : '';
        
        // Try to find the post author
        const authorElement = el.querySelector('.update-components-actor__name');
        const author = authorElement ? authorElement.innerText : 'Unknown';

        // Try to get post URL (usually in the timestamp link)
        const linkElement = el.querySelector('a.update-components-actor__timestamp');
        const url = linkElement ? linkElement.href : '';

        return { text, author, url };
      });
    });

    await page.close();
    return posts;
  } catch (error) {
    await page.close();
    throw error;
  }
};

const searchJobs = async (keyword, pageNum = 1) => {
  const page = await getPage();
  const encodedKeyword = encodeURIComponent(keyword);
  // Job search URL
  const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodedKeyword}&origin=SWITCH_SEARCH_VERTICAL&start=${(pageNum - 1) * 25}`;

  try {
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Check if we hit a login wall
    const url = page.url();
    if (url.includes('login') || url.includes('signup')) {
      throw new Error('LinkedIn forced login wall. A valid li_at cookie is required.');
    }

    // Wait for job cards
    await page.waitForSelector('.job-card-container, .base-card', { timeout: 10000 }).catch(() => null);

    // Extract job links
    const jobs = await page.evaluate(() => {
      const jobElements = Array.from(document.querySelectorAll('.job-card-container, .base-card'));
      return jobElements.map(el => {
        const titleEl = el.querySelector('.job-card-list__title, .base-search-card__title');
        const title = titleEl ? titleEl.innerText.trim() : 'Unknown Title';

        const companyEl = el.querySelector('.job-card-container__company-name, .base-search-card__subtitle');
        const company = companyEl ? companyEl.innerText.trim() : 'Unknown Company';

        const linkEl = el.querySelector('a.job-card-list__title, a.base-card__full-link');
        const link = linkEl ? linkEl.href : '';

        return { title, company, url: link };
      });
    });

    await page.close();
    return jobs;
  } catch (error) {
    await page.close();
    throw error;
  }
};

const clickApplyOnJob = async (jobUrl) => {
  const page = await getPage();
  try {
    await page.goto(jobUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Check for Easy Apply button
    const easyApplyButton = await page.$('.jobs-apply-button--top-card button');
    
    let result = { success: false, message: 'No Easy Apply button found' };

    if (easyApplyButton) {
      const buttonText = await page.evaluate(el => el.innerText, easyApplyButton);
      if (buttonText.includes('Easy Apply')) {
        await easyApplyButton.click();
        // Here a complex state machine would normally take over to handle form variations.
        // For this best-effort implementation, we return success on clicking the button.
        result = { success: true, message: 'Easy Apply button clicked. Form filling not fully automated.' };
      } else {
        result = { success: false, message: 'Standard Apply button found (external site)' };
      }
    }

    await page.close();
    return result;
  } catch (error) {
    await page.close();
    throw error;
  }
};

module.exports = {
  getBrowser,
  closeBrowser,
  searchPosts,
  searchJobs,
  clickApplyOnJob,
};
