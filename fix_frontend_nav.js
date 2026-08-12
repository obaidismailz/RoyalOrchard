const fs = require('fs');
const path = require('path');

const targetFile = '/Users/obaidismail/Desktop/Next Projects/RoyalOrchard/royalorchard/app/[project]/page.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Remove the PROJECTS dropdown from multan-nav-links
const navLinksRegex = /<div \s*style=\{\{ position: 'relative' \}\}\s*onMouseEnter=\{.*?\}[\s\S]*?<\/div>\s*<a href="#overview"/;
content = content.replace(navLinksRegex, '<a href="#overview"');

// 2. Add styles for project-toggle-btn and project-panel right next to theme-toggle-btn
const themeToggleBtnRegex = /\.theme-toggle-btn \{[\s\S]*?right: 20px;[\s\S]*?\}/;
if (content.match(themeToggleBtnRegex)) {
  const replacement = `.theme-toggle-btn {
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--theme-nav-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--theme-nav-border);
          color: var(--theme-nav-text);
          cursor: pointer;
          transition: all 0.3s ease;
          position: absolute;
          right: 74px; /* Moved left to make room for project toggle */
        }
        
        .project-toggle-btn {
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--theme-pill-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--theme-btn-border);
          color: var(--theme-pill-text);
          cursor: pointer;
          transition: all 0.3s ease;
          position: absolute;
          right: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .project-toggle-btn:hover {
          transform: scale(1.05);
          box-shadow: var(--theme-glow);
        }`;
  content = content.replace(themeToggleBtnRegex, replacement);
}

// 3. Add the project-toggle-btn and its panel in the JSX, right after theme-toggle-btn
const jsxTarget = /<button className="theme-toggle-btn"[\s\S]*?<\/button>\s*\{\/\* Settings Panel \*\/\}/;
if (content.match(jsxTarget)) {
  const newJsx = `<button className="theme-toggle-btn" onClick={() => { setIsSettingsOpen(!isSettingsOpen); setIsProjectsDropdownOpen(false); }} aria-label="Toggle Settings">
          <Settings2 size={20} />
        </button>

        <button className="project-toggle-btn" onClick={() => { setIsProjectsDropdownOpen(!isProjectsDropdownOpen); setIsSettingsOpen(false); }} aria-label="Switch Project">
          <Building2 size={20} />
        </button>

        {/* Projects Panel */}
        <div className={\`settings-panel \${isProjectsDropdownOpen ? 'open' : ''}\`} style={{ right: '20px' }}>
          <div className="settings-group">
            <span className="settings-label">SWITCH PROJECT</span>
            <div className="flex flex-col gap-2 mt-2 max-h-64 overflow-y-auto custom-scrollbar">
              {allProjects.map(p => (
                <Link 
                  key={p.slug} 
                  href={\`/\${p.slug}\`}
                  className={\`toggle-btn flex justify-between items-center w-full px-4 py-3 \${slug === p.slug ? 'active' : ''}\`}
                  style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}
                >
                  <span className="font-bold">{p.name}</span>
                  {slug === p.slug && <span className="text-[9px] bg-black/10 px-2 py-0.5 rounded-full">Active</span>}
                </Link>
              ))}
              {allProjects.length === 0 && <div className="text-xs opacity-50 p-2 text-center">No projects found</div>}
            </div>
          </div>
        </div>

        {/* Settings Panel */}`;
  content = content.replace(jsxTarget, newJsx);
}

// Also adjust settings-panel style to be right: 74px so it aligns with theme-toggle-btn
// The settings panel is normally `right: 20px;`.
const settingsPanelRegex = /\.settings-panel \{[\s\S]*?right: 20px;/;
if (content.match(settingsPanelRegex)) {
  content = content.replace(settingsPanelRegex, `.settings-panel {\n          position: absolute;\n          top: 60px;\n          right: 74px;`);
}


fs.writeFileSync(targetFile, content);
console.log("Updated frontend nav.");
