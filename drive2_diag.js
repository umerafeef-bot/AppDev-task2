const puppeteer = require('puppeteer-core');
const fs = require('fs');
function findBrowser() {
  const cands = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files/Chrome/Application/chrome.exe',
    'C:/Program Files/Google/Chrome/Beta/Application/chrome.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe'
  ];
  for (const c of cands) { try { if (fs.existsSync(c)) return c; } catch (e) {} }
  return null;
}
(async () => {
  const exe = findBrowser();
  if (!exe) { console.log('NO_BROWSER'); process.exit(2); }
  console.log('BROWSER: ' + exe);
  const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-gpu','--disable-dev-shm-usage','--headless=new'] });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('PAGEERR: ' + e.message));
  page.on('console', (m) => console.log('CONSOLE[' + m.type() + ']: ' + m.text().slice(0, 200)));
  await page.goto('http://localhost:8091/', { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => document.body.innerText.includes('Quotes'), { timeout: 90000 });
  console.log('TITLE_OK');

  const buttonCount = await page.evaluate(() => document.querySelectorAll('button').length);
  console.log('BUTTON_COUNT: ' + buttonCount);

  const clickables = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('*').forEach(function(el) {
      const t = el.textContent.trim();
      if (t === 'New Quote' || t === 'Copy') {
        out.push(el.tagName + '|role=' + (el.getAttribute('role') || 'none') + '|' + el.outerHTML.slice(0, 140));
      }
    });
    return out.join(' || ');
  });
  console.log('CLICKABLES: ' + clickables);

  let clickedTag = 'NOT_FOUND';
  try {
    clickedTag = await page.evaluate(() => {
      const el = Array.prototype.slice.call(document.querySelectorAll('*')).find(function(x) { return (x.textContent || '').trim() === 'Copy'; });
      if (!el) return 'NOT_FOUND';
      el.click();
      return 'CLICKED:' + el.tagName;
    });
    console.log('COPY_CLICK_RESULT: ' + clickedTag);
  } catch (e) { console.log('COPY_CLICK_ERR: ' + e.message); }

  await new Promise(function(r) { setTimeout(r, 4000); });
  const hasToast = await page.evaluate(() => /(Copied to clipboard|Copy failed)/i.test(document.body.innerText));
  console.log('TOAST_PRESENT: ' + hasToast);
  const tail = await page.evaluate(() => document.body.innerText.slice(-300));
  console.log('TAIL: ' + tail);

  await browser.close();
  console.log('DONE');
})();