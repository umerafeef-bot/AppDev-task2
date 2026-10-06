const fs = require('fs');
const base = 'C:/Users/UmerAfeef/Downloads/InternShip/AppDev/Task2';
const targets = [
  'app/_layout.tsx',
  'app/index.tsx',
  'src/components/IconButton.tsx',
  'src/components/PrimaryButton.tsx',
  'src/components/QuoteCard.tsx',
  'src/data/quotes.ts',
  'src/theme/typography.ts',
  'src/theme/colors.ts',
  'index.ts',
  'app.json'
];
let bomCount = 0;
for (const rel of targets) {
  const p = base + '/' + rel;
  let s = fs.readFileSync(p, 'utf8');
  let changed = false;
  if (s.charCodeAt(0) === 0xFEFF) { s = s.slice(1); changed = true; bomCount++; }
  if (rel === 'app/index.tsx') {
    const before = s;
    s = s.split('catch (e) {').join('catch {');
    if (s !== before) changed = true;
  }
  if (changed) {
    fs.writeFileSync(p, s, 'utf8');
    console.log('updated: ' + rel);
  } else {
    console.log('ok: ' + rel);
  }
}
console.log('BOMs stripped: ' + bomCount);