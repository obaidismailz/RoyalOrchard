import React, { useState } from 'react';
import { Clock4 } from 'lucide-react';
import { MODULE_FILTERS, SUB_FILTERS } from '../types';
import { mock } from '../../../mock/data';

export const LogsTab: React.FC = () => {
  const [logs] = useState<any[]>(mock.activity_logs || []);
  const [selectedLogUsers, setSelectedLogUsers] = useState<string[]>([]);
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('All');
  const [selectedActionFilters, setSelectedActionFilters] = useState<string[]>([]);

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col gap-4">
        <h2 className="font-serif text-3xl text-[#0f281e]">Activity Logs</h2>

        <div className="bg-white p-4 rounded-xl border border-[#0f281e]/5 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-bold mr-2 w-32">Filter by User:</span>
            {Array.from(new Set(logs.map(l => l.username as string))).slice(0, 6).map(uname => {
              const isSelected = selectedLogUsers.includes(uname);
              return (
                <button
                  key={uname}
                  onClick={() => setSelectedLogUsers(isSelected ? selectedLogUsers.filter(u => u !== uname) : [...selectedLogUsers, uname])}
                  className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${isSelected ? 'bg-[#c4864b] text-white' : 'bg-[#0f281e]/5 text-[#0f281e]/60 hover:bg-[#0f281e]/10'}`}
                >
                  {uname}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-bold mr-2 w-32">Filter by Module:</span>
            {MODULE_FILTERS.map(mod => (
              <button
                key={mod}
                onClick={() => { setSelectedModuleFilter(mod); setSelectedActionFilters([]); }}
                className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${selectedModuleFilter === mod ? 'bg-[#0f281e] text-white' : 'bg-[#0f281e]/5 text-[#0f281e]/60 hover:bg-[#0f281e]/10'}`}
              >
                {mod}
              </button>
            ))}
          </div>

          {selectedModuleFilter !== 'All' && SUB_FILTERS[selectedModuleFilter] && (
            <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-[#0f281e]/5">
              <span className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-bold mr-2 w-32">Action Filter:</span>
              {SUB_FILTERS[selectedModuleFilter].map(sub => {
                const isSelected = selectedActionFilters.includes(sub.label);
                return (
                  <button
                    key={sub.label}
                    onClick={() => setSelectedActionFilters(isSelected ? selectedActionFilters.filter(a => a !== sub.label) : [...selectedActionFilters, sub.label])}
                    className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${isSelected ? 'bg-[#c4864b] text-white' : 'bg-white border border-[#0f281e]/10 text-[#0f281e]/60 hover:border-[#c4864b]/30 hover:text-[#c4864b]'}`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm border border-[#0f281e]/5 rounded-xl overflow-hidden p-6">
        <div className="space-y-6">
          {logs.filter(l => {
            let keep = true;
            if (selectedLogUsers.length > 0 && !selectedLogUsers.includes(l.username)) keep = false;

            if (selectedModuleFilter !== 'All') {
              let moduleActions: string[] = [];
              SUB_FILTERS[selectedModuleFilter]?.forEach(s => moduleActions.push(...s.actions));
              if (!moduleActions.includes(l.action)) keep = false;

              if (selectedActionFilters.length > 0) {
                let activeActionStrings: string[] = [];
                selectedActionFilters.forEach(label => {
                  const found = SUB_FILTERS[selectedModuleFilter].find(s => s.label === label);
                  if (found) activeActionStrings.push(...found.actions);
                });
                if (!activeActionStrings.includes(l.action)) keep = false;
              }
            }
            return keep;
          }).map(log => (
            <div key={log.id} className="flex gap-4 items-start pb-6 border-b border-[#0f281e]/5 last:border-0 last:pb-0">
              <div className="w-8 h-8 rounded-full bg-[#0f281e]/5 flex items-center justify-center flex-shrink-0 mt-1">
                <Clock4 className="w-4 h-4 text-[#c4864b]" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-bold text-[#0f281e]">{log.username}</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#0f281e]/40">{log.action}</span>
                  <span className="text-xs text-[#0f281e]/40 ml-auto">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-sm text-[#0f281e]/80 bg-[#fbf7f0] p-3 rounded-[2rem] border border-[#c4864b]/10">{log.details}</p>
              </div>
            </div>
          ))}
          {logs.length === 0 && <p className="text-center text-[#0f281e]/40 py-8">No activity recorded yet.</p>}
        </div>
      </div>
    </div>
  );
};
