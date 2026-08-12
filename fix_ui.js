const fs = require('fs');
const path = require('path');

const targetFile = '/Users/obaidismail/Desktop/Next Projects/RoyalOrchard/royalorchard/app/[project]/page.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

// The user wants the project symbol "at end after setting sysmbol".
// In my previous change, I set theme-toggle-btn to right: 74px and project-toggle-btn to right: 20px. 
// That means Project is to the right of Settings. This is correct.
// But the settings-panel for projects is at right: 20px, and settings-panel for settings is at right: 74px.
// Wait, both use the class "settings-panel". The project one overrides it via inline style `style={{ right: '20px' }}` but the original CSS `.settings-panel { right: 74px; top: 60px; }`.

// Let's refactor the floating buttons to be a flex container pinned to the right.
// This is much cleaner than absolute right positioning for each button.

const cssTarget = /\.theme-toggle-btn \{[\s\S]*?\.project-toggle-btn:hover \{[\s\S]*?\}/;
if (content.match(cssTarget)) {
  const replacement = `.floating-controls {
          position: absolute;
          right: 20px;
          top: 0;
          display: flex;
          gap: 12px;
          align-items: center;
          height: 100%;
          pointer-events: none;
        }

        .theme-toggle-btn, .project-toggle-btn {
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .theme-toggle-btn {
          background: var(--theme-nav-bg);
          border: 1px solid var(--theme-nav-border);
          color: var(--theme-nav-text);
        }

        .project-toggle-btn {
          background: var(--theme-pill-bg);
          border: 1px solid var(--theme-btn-border);
          color: var(--theme-pill-text);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .theme-toggle-btn:hover {
          transform: scale(1.05);
          color: var(--theme-pill-bg);
        }

        .project-toggle-btn:hover {
          transform: scale(1.05);
          box-shadow: var(--theme-glow);
        }`;
  content = content.replace(cssTarget, replacement);
}

// Fix settings panel CSS
const panelCssRegex = /\.settings-panel \{[\s\S]*?right: 74px;/;
if (content.match(panelCssRegex)) {
  content = content.replace(panelCssRegex, `.settings-panel {\n          position: absolute;\n          top: 60px;\n          right: 20px;`);
}

// Fix JSX for buttons and panels
const jsxTarget = /<button className="theme-toggle-btn"[\s\S]*?\{\/\* Settings Panel \*\/\}/;
if (content.match(jsxTarget)) {
  const newJsx = `<div className="floating-controls">
          <button className="theme-toggle-btn" onClick={() => { setIsSettingsOpen(!isSettingsOpen); setIsProjectsDropdownOpen(false); }} aria-label="Toggle Settings">
            <Settings2 size={20} />
          </button>

          <button className="project-toggle-btn" onClick={() => { setIsProjectsDropdownOpen(!isProjectsDropdownOpen); setIsSettingsOpen(false); }} aria-label="Switch Project">
            <Building2 size={20} />
          </button>
        </div>

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

fs.writeFileSync(targetFile, content);
console.log("Fixed UI layout.");
