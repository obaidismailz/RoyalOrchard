const fs = require('fs');
const path = require('path');

const dir = '/Users/obaidismail/Desktop/Next Projects/RoyalOrchard/royalorchard/components/Admin';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace utility classes with opacities
  content = content.replace(/bg-\[\#0f281e\]\/(\d+)/g, 'bg-[var(--brand-green,#0f281e)] bg-opacity-$1');
  content = content.replace(/text-\[\#0f281e\]\/(\d+)/g, 'text-[var(--brand-green,#0f281e)] text-opacity-$1');
  content = content.replace(/border-\[\#0f281e\]\/(\d+)/g, 'border-[var(--brand-green,#0f281e)] border-opacity-$1');
  content = content.replace(/ring-\[\#0f281e\]\/(\d+)/g, 'ring-[var(--brand-green,#0f281e)] ring-opacity-$1');
  
  // Also handle arbitrary opacity like /[0.03] -> opacity might not match well with bg-opacity-[0.03] but tailwind supports arbitrary bg-opacity-[0.03]
  content = content.replace(/bg-\[\#0f281e\]\/\[([^\]]+)\]/g, 'bg-[var(--brand-green,#0f281e)] bg-opacity-[$1]');
  content = content.replace(/text-\[\#0f281e\]\/\[([^\]]+)\]/g, 'text-[var(--brand-green,#0f281e)] text-opacity-[$1]');
  content = content.replace(/border-\[\#0f281e\]\/\[([^\]]+)\]/g, 'border-[var(--brand-green,#0f281e)] border-opacity-[$1]');
  
  // Replace remaining solid utility classes
  content = content.replace(/bg-\[\#0f281e\]/g, 'bg-[var(--brand-green,#0f281e)]');
  content = content.replace(/text-\[\#0f281e\]/g, 'text-[var(--brand-green,#0f281e)]');
  content = content.replace(/border-\[\#0f281e\]/g, 'border-[var(--brand-green,#0f281e)]');
  content = content.replace(/ring-\[\#0f281e\]/g, 'ring-[var(--brand-green,#0f281e)]');
  content = content.replace(/from-\[\#0f281e\]/g, 'from-[var(--brand-green,#0f281e)]');
  content = content.replace(/to-\[\#0f281e\]/g, 'to-[var(--brand-green,#0f281e)]');
  content = content.replace(/via-\[\#0f281e\]/g, 'via-[var(--brand-green,#0f281e)]');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + filePath);
  }
}

function walk(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

walk(dir);
console.log("Replacement completed.");
