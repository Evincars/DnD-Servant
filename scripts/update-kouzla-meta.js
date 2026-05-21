// @ts-check
/**
 * Regenerates level, school and ritual fields in kouzla-meta.json.
 * Run with: node scripts/update-kouzla-meta.js
 */

const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '../public/dnd5esrd');
const metaPath = path.join(BASE, 'snippets/kouzla-meta.json');
const snippetDir = path.join(BASE, 'snippets/kouzla');
const jadDir = path.join(BASE, 'jeskyne-a-draci');
const JAD_SPELL_FILES = ['10c-magie-kouzla-0-3.md', '10d-magie-kouzla-4-9.md'];

// Canonical school names using Unicode escapes to avoid script encoding issues
const S = {
  NEK: 'Nekromancie',
  ZAK: 'Zakl\u00EDn\u00E1n\u00ED',   // Zaklínání
  VYM: 'Vym\u00EDt\u00E1n\u00ED',    // Vymítání
  VYV: 'Vyvol\u00E1v\u00E1n\u00ED',  // Vyvolávání
  ILU: 'Iluze',
  TRA: 'Transmutace',
  VES: 'V\u011B\u0161tectv\u00ED',   // Věštectví
  OCA: 'O\u010Darov\u00E1n\u00ED',   // Očarování
};

function norm(s) {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

// Lookup using normalised keys
const SCHOOL_MAP = {
  'nekromancie':   S.NEK, 'nekromantick': S.NEK, 'nekromanticky': S.NEK,
  'zaklnn':        S.ZAK, 'zaklinani':    S.ZAK, 'zaklnac':       S.ZAK,
  'zaklnaci':      S.ZAK, 'zaklinaci':    S.ZAK,
  'vymtn':         S.VYM, 'vymitani':     S.VYM, 'vymtac':        S.VYM,
  'vymitaci':      S.VYM,
  'vyvolvn':       S.VYV, 'vyvolavani':   S.VYV, 'vyvolvac':      S.VYV,
  'vyvolvc':       S.VYV, 'vyvolvaci':    S.VYV,
  'iluze':         S.ILU, 'iluzorni':     S.ILU, 'iluzorn':       S.ILU,
  'transmutace':   S.TRA, 'transmutacni': S.TRA, 'transmutacn':   S.TRA,
  'vestectvi':     S.VES, 'vesteck':      S.VES, 'vesteni':       S.VES,
  'vestecky':      S.VES, 'vestectt':     S.VES,
  'ocarovani':     S.OCA, 'ocarovn':      S.OCA, 'ocarovac':      S.OCA,
  'ocarovaci':     S.OCA,
};

function canonicalSchool(raw) {
  if (!raw) return undefined;
  const n = norm(raw);
  if (SCHOOL_MAP[n]) return SCHOOL_MAP[n];
  // Prefix match for variants like "Nekromantick..."
  for (const [k, v] of Object.entries(SCHOOL_MAP)) {
    if (n.length >= 5 && k.startsWith(n.substring(0, 5))) return v;
    if (k.length >= 5 && n.startsWith(k.substring(0, 5))) return v;
  }
  return undefined;
}

function parseLevelLine(line) {
  const t = line.trim();
  if (!t.startsWith('*') || t.startsWith('***') || t.startsWith('**')) return null;

  const schoolToken = (t.match(/^\*([^\s*]+)/) || [])[1];

  // Cantrip
  if (/\btrik\b/i.test(t)) {
    return { level: 0, school: canonicalSchool(schoolToken), ritual: false };
  }

  // Levelled: digit + dot anywhere in line, plus rovn or stup somewhere
  // Handles both "rovně" and "úrovně" since we just look for "rovn" anywhere
  const numM = t.match(/(\d+)\./);
  if (numM && /(?:rovn|stup)/i.test(t)) {
    return {
      level: parseInt(numM[1], 10),
      school: canonicalSchool(schoolToken),
      ritual: /ritu/i.test(t),
    };
  }

  return null;
}

function extractFromSnippet(filePath) {
  if (!fs.existsSync(filePath)) return null;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const r = parseLevelLine(line);
    if (r) return r;
  }
  return null;
}

function buildJadMap() {
  const result = {};
  for (const fname of JAD_SPELL_FILES) {
    const fpath = path.join(jadDir, fname);
    if (!fs.existsSync(fpath)) continue;
    const lines = fs.readFileSync(fpath, 'utf8').split('\n');
    let currentLevel = null;
    let currentSpellNorm = null;

    for (const line of lines) {
      const t = line.trim();
      if (/^#{1,4}\s+Triky/i.test(t)) { currentLevel = 0; currentSpellNorm = null; continue; }
      const lm = t.match(/^#{1,4}\s+(?:Kouzla?\s+)?(\d+)\.\s+stup/i);
      if (lm) { currentLevel = parseInt(lm[1]); currentSpellNorm = null; continue; }
      const sm = t.match(/^#{2,4}\s+(.+)$/);
      if (sm && currentLevel !== null) {
        currentSpellNorm = norm(sm[1].trim());
        result[currentSpellNorm] = { level: currentLevel, school: undefined, ritual: false };
        continue;
      }
      if (currentSpellNorm && result[currentSpellNorm] && !result[currentSpellNorm].school) {
        const r = parseLevelLine(line);
        if (r && r.school) {
          result[currentSpellNorm].school = r.school;
          result[currentSpellNorm].ritual = r.ritual;
        }
      }
    }
  }
  return result;
}

// --- Main ---
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

// Clear stale fields
for (const data of Object.values(meta)) {
  delete data.level;
  delete data.school;
  delete data.ritual;
}

console.log('Building JAD article map...');
const jadMap = buildJadMap();
console.log('JAD spells found:', Object.keys(jadMap).length);

let fromSnippet = 0, fromJad = 0, missing = 0;

for (const [slug, data] of Object.entries(meta)) {
  const snippetResult =
    extractFromSnippet(path.join(snippetDir, slug + '-jad.md')) ||
    extractFromSnippet(path.join(snippetDir, slug + '.md'));

  if (snippetResult) {
    if (snippetResult.level !== undefined) data.level = snippetResult.level;
    if (snippetResult.school) data.school = snippetResult.school;
    if (snippetResult.ritual) data.ritual = true;
    fromSnippet++;
    continue;
  }

  const jadResult = jadMap[norm(data.name)];
  if (jadResult) {
    if (jadResult.level !== undefined) data.level = jadResult.level;
    if (jadResult.school) data.school = jadResult.school;
    if (jadResult.ritual) data.ritual = true;
    fromJad++;
    continue;
  }

  missing++;
}

fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');

let withLevel = 0;
const schoolCounts = {};
for (const d of Object.values(meta)) {
  if (d.level !== undefined) withLevel++;
  const s = d.school || '(none)';
  schoolCounts[s] = (schoolCounts[s] || 0) + 1;
}

console.log(`Done. snippet=${fromSnippet}  jad=${fromJad}  missing=${missing}  total=${Object.keys(meta).length}`);
console.log(`Spells with level: ${withLevel}/${Object.keys(meta).length}`);
console.log('School distribution:', JSON.stringify(schoolCounts, null, 2));
// Check abi specifically
console.log('\nabi:', JSON.stringify(meta['abi-dalzimovo-straslive-sucho']));
