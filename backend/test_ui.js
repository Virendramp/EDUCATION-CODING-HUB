const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.goto('http://localhost:5000/');
  console.log('Navigated to http://localhost:5000/');

  // Wait for the Request a Track card to be rendered
  await page.waitForSelector('.btn-submit');
  console.log('Found Submit Idea button on card. Clicking...');
  
  // Click the card button to open the modal
  await page.click('.btn-submit');
  
  // Wait for modal to be visible
  await page.waitForSelector('#idea-modal', { visible: true });
  console.log('Modal opened!');

  // Fill out the form
  await page.type('#idea-name', 'Test User');
  await page.type('#idea-email', 'test@example.com');
  await page.type('#idea-desc', 'This is a test idea from puppeteer.');
  console.log('Filled out form.');

  // Click the submit button inside the modal
  console.log('Clicking modal submit button...');
  await page.click('#idea-submit-btn');

  // Wait for response message
  await page.waitForSelector('#idea-response-msg', { visible: true });
  const responseMsg = await page.$eval('#idea-response-msg', el => el.textContent);
  console.log('Response message text:', responseMsg);

  await browser.close();
})();
