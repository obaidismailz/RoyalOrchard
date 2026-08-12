const fs = require('fs');
const path = require('path');

const targetFile = '/Users/obaidismail/Desktop/Next Projects/RoyalOrchard/royalorchard/components/Admin/pages/PonosDashboard.tsx';

let content = fs.readFileSync(targetFile, 'utf8');
let original = content;

// Replace only solid backgrounds and texts in this file
content = content.replace(/bg-\[\#0f281e\](?!\/)/g, 'bg-[var(--brand-green,#0f281e)]');
content = content.replace(/text-\[\#0f281e\](?!\/)/g, 'text-[var(--brand-green,#0f281e)]');
content = content.replace(/border-\[\#0f281e\](?!\/)/g, 'border-[var(--brand-green,#0f281e)]');

if (content !== original) {
  fs.writeFileSync(targetFile, content);
  console.log('Updated solid colors in ' + targetFile);
}
