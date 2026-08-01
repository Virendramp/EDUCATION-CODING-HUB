const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  let networkResponse = null;
  page.on('response', async (response) => {
    if (response.url().includes('/api/submit-idea')) {
      networkResponse = {
        status: response.status(),
        ok: response.ok(),
        body: await response.text()
      };
    }
  });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:5000/');
  
  // Wait for the courses grid to render
  await page.waitForSelector('.courses-grid');
  await new Promise(r => setTimeout(r, 1000)); 

  const result = await page.evaluate(async () => {
    const btn = document.querySelector('.btn-submit');
    if (btn) btn.click();
    
    await new Promise(r => setTimeout(r, 500));
    
    const nameInput = document.getElementById('idea-name');
    const emailInput = document.getElementById('idea-email');
    const descInput = document.getElementById('idea-desc');
    const submitBtn = document.getElementById('idea-submit-btn');
    
    if (nameInput && emailInput && descInput && submitBtn) {
      nameInput.value = 'Auto Test';
      emailInput.value = 'test@example.com';
      descInput.value = 'This is an automatic test.';
      
      submitBtn.click();
      return 'Form submitted via JS click';
    }
    return 'Form inputs not found';
  });
  
  console.log('EVALUATION:', result);
  
  // Wait for network response
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('NETWORK RESPONSE:', JSON.stringify(networkResponse, null, 2));

  // Check UI response message
  const uiMessage = await page.evaluate(() => {
    const msgEl = document.getElementById('idea-response-msg');
    return {
      display: window.getComputedStyle(msgEl).display,
      text: msgEl.textContent,
      color: msgEl.style.color
    };
  });
  
  console.log('UI MESSAGE:', JSON.stringify(uiMessage, null, 2));

  await browser.close();
})();
