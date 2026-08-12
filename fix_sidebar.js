const fs = require('fs');
const path = require('path');

const targetFile = '/Users/obaidismail/Desktop/Next Projects/RoyalOrchard/royalorchard/components/Admin/Sidebar.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add setActiveProjectSlug to the top level destructure
const oldDestructure = `    activeColor,
    activeProjectSlug
  } = useAdmin();`;

const newDestructure = `    activeColor,
    activeProjectSlug,
    setActiveProjectSlug
  } = useAdmin();`;

content = content.replace(oldDestructure, newDestructure);

// 2. Fix the onClick handler
content = content.replace(/useAdmin\(\)\.setActiveProjectSlug\?\.\(p\.slug\);/g, 'setActiveProjectSlug && setActiveProjectSlug(p.slug);');

fs.writeFileSync(targetFile, content);
console.log("Fixed hook rule violation in Sidebar.tsx");
