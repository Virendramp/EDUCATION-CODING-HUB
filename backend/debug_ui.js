const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:5000/');
  
  // Wait for the courses grid to render
  await page.waitForSelector('.courses-grid');
  await new Promise(r => setTimeout(r, 1000)); // wait a bit for dynamic render

  const result = await page.evaluate(() => {
    const btn = document.querySelector('.btn-submit');
    const allBtns = document.querySelectorAll('.btn-submit');
    
    // Check if event listener is attached (we can't directly check listeners easily, 
    // but we can simulate a click and see if modal opens)
    const modal = document.getElementById('idea-modal');
    const initialDisplay = modal ? window.getComputedStyle(modal).display : 'null';
    
    if (btn) {
      btn.click();
    }
    
    const displayAfterClick = modal ? window.getComputedStyle(modal).display : 'null';
    
    return {
      btnExists: !!btn,
      btnCount: allBtns.length,
      btnHtml: btn ? btn.outerHTML : null,
      modalInitialDisplay: initialDisplay,
      modalDisplayAfterClick: displayAfterClick,
      modalOuterHtml: modal ? modal.outerHTML : null
    };
  });
  
  console.log('EVALUATION RESULT:', JSON.stringify(result, null, 2));

  await browser.close();
})();
