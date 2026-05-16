const fs = require('fs');
const path = require('path');

const books = [
  { bookId: 'bestiar', dir: path.join(__dirname, '..', 'public', 'dnd5esrd', 'bestiar') },
  { bookId: 'voluv-pruvodce-netvory', dir: path.join(__dirname, '..', 'public', 'dnd5esrd', 'voluv-pruvodce-netvory') },
  { bookId: 'jeskyne-a-draci-doplnky', dir: path.join(__dirname, '..', 'public', 'dnd5esrd', 'jeskyne-a-draci-doplnky') },
];

const results = [];

for (const { bookId, dir } of books) {
  let files;
  try {
    files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  } catch {
    continue;
  }
  for (const f of files) {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    const re = /[\s]title="([^"]+)"/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      results.push({ file: f, title: m[1], bookId });
    }
  }
}

results.sort((a, b) => a.title.localeCompare(b.title, 'cs'));

// Output as a TS-ready array
console.log('// Total: ' + results.length + ' monsters');
for (const r of results) {
  console.log(`  ['${r.title.replace(/'/g, "\\'")}', '${r.bookId}', '${r.file}'],`);
}
