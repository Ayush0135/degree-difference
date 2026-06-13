import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log('HTTP ERROR:', response.status(), response.url());
    }
  });

  console.log('Navigating to live site...');
  await page.goto('https://degree-difference.vercel.app/');
  
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'live_site.png' });
  
  console.log('Done.');
  await browser.close();
})();
