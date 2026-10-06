const fs = require('fs');
const p = 'C:/Users/UmerAfeef/Downloads/InternShip/AppDev/Task2/app/index.tsx';
let s = fs.readFileSync(p, 'utf8');
const before = s;
s = s.replace("import * as FileSystem from 'expo-file-system';", "import * as FileSystem from 'expo-file-system/legacy';");
if (s === before) { console.log('NO_CHANGE'); process.exit(1); }
fs.writeFileSync(p, s, 'utf8');
console.log('FileSystem import updated to legacy');