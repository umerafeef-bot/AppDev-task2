const fs = require('fs');
const p = 'C:/Users/UmerAfeef/Downloads/InternShip/AppDev/Task2/package.json';
const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
pkg.main = 'index.ts';
pkg.scripts = {
  start: 'expo start',
  web: 'expo start --web --port 8091',
  lint: 'expo lint',
  typecheck: 'tsc --noEmit'
};
fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('package.json updated: main=' + pkg.main + ' scripts.web=' + pkg.scripts.web);