const fs = require('fs');
const meta = JSON.parse(fs.readFileSync('public/dnd5esrd/snippets/monsters-meta.json'));
const jadTs = fs.readFileSync('libs/util/src/lib/jad-monster-names.ts', 'utf8');
const matches = [...jadTs.matchAll(/\['([^']+)',\s*'([^']+)',\s*'([^']+)'\]/g)];
const jadNames = new Set(matches.map(function(m) { return m[1].toLowerCase(); }));
const groups = {};
for (const slug in meta) {
  const e = meta[slug];
  const key = e.book + '|' + e.file;
  if (!groups[key]) groups[key] = [];
  groups[key].push({ slug, name: e.name, book: e.book, file: e.file });
}
const missing = [];
for (const key in groups) {
  const monsters = groups[key];
  if (monsters.length < 2) continue;
  for (let i = 0; i < monsters.length; i++) {
    const m = monsters[i];
    if (!jadNames.has(m.name.toLowerCase())) missing.push(m);
  }
}
missing.sort(function(a,b) { return a.name.localeCompare(b.name, 'cs'); });
const out = missing.map(function(m) {
  return "  ['" + m.name + "', '" + m.book + "', '" + m.file + "'],";
}).join('\n');
fs.writeFileSync('scripts/missing-out.txt', out, 'utf8');
console.log('Written ' + missing.length + ' entries');

