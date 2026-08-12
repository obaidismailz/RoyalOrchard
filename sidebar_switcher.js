const fs = require('fs');
const path = require('path');

const targetFile = '/Users/obaidismail/Desktop/Next Projects/RoyalOrchard/royalorchard/components/Admin/Sidebar.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

// Insert the states and fetchProjects logic
const stateInsertPoint = "const [isClientsSubmenuExpanded, setIsClientsSubmenuExpanded] = React.useState(false);";
const stateAdditions = `
  const [isProjectsPaneOpen, setIsProjectsPaneOpen] = React.useState(false);
  const [projectsList, setProjectsList] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (Array.isArray(data)) {
          setProjectsList(data);
        }
      } catch (error) {
        console.error('Failed to fetch projects', error);
      }
    };
    fetchProjects();
  }, []);
`;
if (!content.includes('isProjectsPaneOpen')) {
    content = content.replace(stateInsertPoint, stateInsertPoint + '\n' + stateAdditions);
}

// Insert the Projects Pane markup after the settings submenu
const markupInsertPoint = `                )}
              </div>
            )}
          </>
        )}
      </nav>`;

const projectPaneMarkup = `
        {/* Project Switcher */}
        <div className="mt-8 mb-4 flex justify-center relative">
          <button
            onClick={() => setIsProjectsPaneOpen(!isProjectsPaneOpen)}
            className={\`h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border-2 \${
              isProjectsPaneOpen 
                ? isPonosWhite ? 'bg-[#947630] border-[#947630] text-white scale-110' : 'bg-[#c4864b] border-[#c4864b] text-white scale-110'
                : isPonosWhite ? 'bg-white border-[#947630]/30 text-[#947630] hover:scale-105 hover:border-[#947630]' : 'bg-[#0f281e] border-[#c4864b]/40 text-[#dec099] hover:scale-105 hover:border-[#c4864b]'
            }\`}
            title="Switch Project"
          >
            <Globe className="w-6 h-6 animate-pulse-slow" />
          </button>

          {isProjectsPaneOpen && (
            <div className={\`absolute bottom-0 left-full ml-4 w-72 rounded-2xl shadow-2xl p-4 z-[100] transition-all \${
              isPonosWhite ? 'bg-white border border-[#947630]/20' : 'bg-[#0f281e] border border-white/10'
            }\`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={\`font-serif text-lg \${isPonosWhite ? 'text-[#17110a]' : 'text-white'}\`}>All Projects</h3>
                <button onClick={() => setIsProjectsPaneOpen(false)} className={\`p-1 rounded-full \${isPonosWhite ? 'hover:bg-black/5 text-[#17110a]/50' : 'hover:bg-white/10 text-white/50'}\`}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {projectsList.map(p => (
                  <button
                    key={p.slug}
                    onClick={() => {
                      useAdmin().setActiveProjectSlug?.(p.slug);
                      setActiveTab('multan-website');
                      setIsProjectsPaneOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                    className={\`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 \${
                      activeProjectSlug === p.slug
                        ? isPonosWhite ? 'bg-[#947630]/10 border border-[#947630]/30' : 'bg-[#c4864b]/20 border border-[#c4864b]/40'
                        : isPonosWhite ? 'hover:bg-black/5 border border-transparent' : 'hover:bg-white/5 border border-transparent'
                    }\`}
                  >
                    <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs \${
                      activeProjectSlug === p.slug 
                        ? isPonosWhite ? 'bg-[#947630] text-white' : 'bg-[#c4864b] text-white'
                        : isPonosWhite ? 'bg-black/5 text-[#17110a]' : 'bg-white/10 text-white'
                    }\`}>
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className={\`font-bold text-sm \${isPonosWhite ? 'text-[#17110a]' : 'text-white'}\`}>{p.name}</div>
                      {activeProjectSlug === p.slug && <div className={\`text-[9px] uppercase tracking-wider font-black \${isPonosWhite ? 'text-[#947630]' : 'text-[#c4864b]'}\`}>Selected</div>}
                    </div>
                  </button>
                ))}
                {projectsList.length === 0 && (
                  <div className="text-center p-4 text-xs opacity-50">No projects found</div>
                )}
              </div>
            </div>
          )}
        </div>
`;

if (!content.includes('isProjectsPaneOpen &&')) {
  content = content.replace(markupInsertPoint, markupInsertPoint + projectPaneMarkup);
  fs.writeFileSync(targetFile, content);
  console.log("Updated Sidebar.tsx");
} else {
  console.log("Already updated");
}
