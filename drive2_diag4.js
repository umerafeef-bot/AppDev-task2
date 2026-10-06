const puppeteer = require('puppeteer-core');
const fs = require('fs');
function findBrowser() {
  const cands = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files/Chrome/Application/chrome.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe'
  ];
  for (const c of cands) { try { if (fs.existsSync(c)) return c; } catch (e) {} }
  return null;
}
function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
async function clickLabel(page, label) {
  const box = await page.evaluate(function(lbl) {
    const arr = Array.prototype.slice.call(document.querySelectorAll('*'));
    const el = arr.find(function(x) { return (x.textContent || '').trim() === lbl; });
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, tag: el.tagName };
  }, label);
  if (!box) return 'NOT_FOUND';
  await page.mouse.click(box.x + box.w / 2, box.y + box.h / 2);
  return 'CLICKED ' + box.tag;
}
(async () => {
  const exe = findBrowser();
  if (!exe) { console.log('NO_BROWSER'); process.exit(2); }
  console.log('BROWSER: ' + exe);
  const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-gpu','--disable-dev-shm-usage','--headless=new'] });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('PAGEERR: ' + e.message));
  page.on('console', (m) => console.log('CONSOLE[' + m.type() + ']: ' + m.text().slice(0, 200)));
  const url = process.argv[2] || 'http://localhost:8091/';
  await page.goto(url, { waitUntil: 'load', timeout: 120000 });
  const origin = new URL(url).origin;
  try { await page.browserContext().overridePermissions(origin, ['clipboard-write', 'clipboard-read']); console.log('PERMS_GRANTED'); }
  catch (e) { console.log('PERMS_ERR: ' + e.message); }
  await page.waitForFunction(() => document.body.innerText.includes('Quotes'), { timeout: 90000 });
  console.log('TITLE_OK');

  const r1 = await clickLabel(page, 'Copy');
  console.log('COPY: ' + r1);
  await sleep(6000);
  const toast = await page.evaluate(() => /(Copied to clipboard|Copy failed)/i.test(document.body.innerText));
  console.log('TOAST_AFTER_COPY: ' + toast);
  const tail = await page.evaluate(() => document.body.innerText.slice(-260));
  console.log('TAIL: ' + tail);

  await browser.close();
  console.log('DONE');
})();