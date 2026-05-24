import fs from 'fs';
function stripComments(src) {
  let out = '';
  let i = 0;
  const len = src.length;
  let inSingle = false, inDouble = false, inTemplate = false;
  let inLineComment = false, inBlockComment = false;
  while (i < len) {
    const ch = src[i];
    const next = src[i+1];
    if (inLineComment) {
      if (ch === '\n') { inLineComment = false; out += ch; }
      i++; continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') { inBlockComment = false; i += 2; continue; }
      i++; continue;
    }
    if (!inSingle && !inDouble && !inTemplate && ch === '/' && next === '/') { inLineComment = true; i += 2; continue; }
    if (!inSingle && !inDouble && !inTemplate && ch === '/' && next === '*') { inBlockComment = true; i += 2; continue; }
    if (!inSingle && !inDouble && !inTemplate && ch === '`') { inTemplate = true; out += ch; i++; continue; }
    if (inTemplate) {
      if (ch === '\\') { out += ch; out += src[i+1] || ''; i += 2; continue; }
      if (ch === '`') { inTemplate = false; out += ch; i++; continue; }
      out += ch; i++; continue;
    }
    if (!inSingle && !inDouble && !inTemplate && ch === "'") { inSingle = true; out += ch; i++; continue; }
    if (inSingle) {
      if (ch === '\\') { out += ch; out += src[i+1] || ''; i += 2; continue; }
      if (ch === "'") { inSingle = false; out += ch; i++; continue; }
      out += ch; i++; continue;
    }
    if (!inSingle && !inDouble && !inTemplate && ch === '"') { inDouble = true; out += ch; i++; continue; }
    if (inDouble) {
      if (ch === '\\') { out += ch; out += src[i+1] || ''; i += 2; continue; }
      if (ch === '"') { inDouble = false; out += ch; i++; continue; }
      out += ch; i++; continue;
    }
    out += ch; i++;
  }
  return out;
}

const file = process.argv[2];
const src = fs.readFileSync(file, 'utf8');
const stripped = stripComments(src);
fs.writeFileSync(file, stripped, 'utf8');
console.log('Stripped', file);
