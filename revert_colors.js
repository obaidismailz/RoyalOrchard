const fs = require('fs');
const path = require('path');

const dir = '/Users/obaidismail/Desktop/Next Projects/RoyalOrchard/royalorchard/components/Admin';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Revert Opacity ones first
  content = content.replace(/bg-\[var\(--brand-green,\#0f281e\)\] bg-opacity-\[([^\]]+)\]/g, 'bg-[#0f281e]/[$1]');
  content = content.replace(/text-\[var\(--brand-green,\#0f281e\)\] text-opacity-\[([^\]]+)\]/g, 'text-[#0f281e]/[$1]');
  content = content.replace(/border-\[var\(--brand-green,\#0f281e\)\] border-opacity-\[([^\]]+)\]/g, 'border-[#0f281e]/[$1]');

  content = content.replace(/bg-\[var\(--brand-green,\#0f281e\)\] bg-opacity-(\d+)/g, 'bg-[#0f281e]/$1');
  content = content.replace(/text-\[var\(--brand-green,\#0f281e\)\] text-opacity-(\d+)/g, 'text-[#0f281e]/$1');
  content = content.replace(/border-\[var\(--brand-green,\#0f281e\)\] border-opacity-(\d+)/g, 'border-[#0f281e]/$1');
  content = content.replace(/ring-\[var\(--brand-green,\#0f281e\)\] ring-opacity-(\d+)/g, 'ring-[#0f281e]/$1');

  // Revert solid ones
  content = content.replace(/bg-\[var\(--brand-green,\#0f281e\)\]/g, 'bg-[#0f281e]');
  content = content.replace(/text-\[var\(--brand-green,\#0f281e\)\]/g, 'text-[#0f281e]');
  content = content.replace(/border-\[var\(--brand-green,\#0f281e\)\]/g, 'border-[#0f281e]');
  content = content.replace(/ring-\[var\(--brand-green,\#0f281e\)\]/g, 'ring-[#0f281e]');
  content = content.replace(/from-\[var\(--brand-green,\#0f281e\)\]/g, 'from-[#0f281e]');
  content = content.replace(/to-\[var\(--brand-green,\#0f281e\)\]/g, 'to-[#0f281e]');
  content = content.replace(/via-\[var\(--brand-green,\#0f281e\)\]/g, 'via-[#0f281e]');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Reverted ' + filePath);
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
console.log("Revert completed.");
