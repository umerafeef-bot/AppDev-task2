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
function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
async function clickLabel(page, label) {
  const box = await page.evaluate(function(lbl) {
    const arr = Array.prototype.slice.call(document.querySelectorAll('*'));
    const el = arr.find(function(x) { return (x.textContent || '').trim() === lbl; });
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, tag: el.tagName };
  }, label);
  if (!box) return 'NOT_FOUND:' + label;
  await page.mouse.click(box.x + box.w / 2, box.y + box.h / 2);
  return 'OK:' + box.tag;
}

(async () => {
  const exe = findBrowser();
  if (!exe) { console.log('NO_BROWSER'); process.exit(2); }
  console.log('BROWSER: ' + exe);
  const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-gpu','--disable-dev-shm-usage','--headless=new'] });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('PAGEERR: ' + e.message));
  page.on('console', (m) => console.log('CONSOLE[' + m.type() + ']: ' + m.text().slice(0, 200)));

  // Headless Chrome does not resolve the Async Clipboard API without a user
  // gesture, which would hang the app's copy flow. Stub the clipboard in the
  // test sandbox only (real devices use the native API) so the app's own
  // handleCopy -> showToast('Copied to clipboard') logic can be verified.
  await page.evaluateOnNewDocument(() => {
    const nav = navigator;
    if (nav && nav.clipboard) {
      nav.clipboard.writeText = (text) => Promise.resolve(true);
      nav.clipboard.readText = () => Promise.resolve('');
    }
  });
  try { await page.browserContext().overridePermissions('http://localhost:8091', ['clipboard-write']); console.log('PERMS_GRANTED'); }
  catch (e) { console.log('PERMS_SKIP: ' + e.message); }

  const url = process.argv[2] || 'http://localhost:8091/';
  console.log('NAV: ' + url);
  let ok = true;
  let navOk = true;
  try { await page.goto(url, { waitUntil: 'load', timeout: 120000 }); console.log('GOTO_OK'); }
  catch (e) { console.log('NAV_ERR ' + e.message); ok = false; navOk = false; }

  try {
    await page.waitForFunction(() => document.body.innerText.includes('Quotes'), { timeout: 90000 });
    console.log('PASS: title Quotes found');
  } catch { console.log('FAIL: title not found'); ok = false; }

  const snap = await page.evaluate(() => document.body.innerText);
  console.log('HAS_NEW_QUOTE_BTN: ' + snap.includes('New Quote'));
  console.log('HAS_COPY_BTN: ' + snap.includes('Copy'));

  // New Quote -> quote must change
  try {
    const before = await page.evaluate(() => ({ text: document.body.innerText }));
    const r = await clickLabel(page, 'New Quote');
    console.log('NEWQUOTE_CLICK: ' + r);
    await page.waitForFunction((t) => document.body.innerText !== t, { timeout: 90000 }, before.text);
    console.log('PASS: quote changed after New Quote');
  } catch { console.log('FAIL: quote did not change after New Quote'); ok = false; }

  // Copy -> toast "Copied to clipboard"
  try {
    const r = await clickLabel(page, 'Copy');
    console.log('COPY_CLICK: ' + r);
    await page.waitForFunction(() => /Copied to clipboard/i.test(document.body.innerText), { timeout: 8000 });
    console.log('PASS: copy toast Copied to clipboard');
  } catch { console.log('FAIL: copy toast not seen'); ok = false; }

  await browser.close();
  console.log(ok && navOk ? 'ALL_PASS' : 'SOME_FAIL');
  process.exit(ok && navOk ? 0 : 1);
})();