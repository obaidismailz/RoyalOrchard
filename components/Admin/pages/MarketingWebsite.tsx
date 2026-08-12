import React, { useState } from 'react';
import { 
  Globe, Inbox, Sparkles, PhoneCall, 
  ArrowRight, CheckCircle2, Eye, ShieldAlert, Star, Plus 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface InquiryLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  projectType: string;
  budgetRange: string;
  status: 'New' | 'Qualified' | 'Meeting Scheduled' | 'Archived';
  dateReceived: string;
  veInterests: string[];
}

export const MarketingWebsite: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'leads' | 've' | 'pages'>('leads');

  // Lead lists state
  const [leads, setLeads] = useState<InquiryLead[]>([
    {
      id: "L-901",
      name: "Marcus Aurelius",
      phone: "(555) 301-4902",
      email: "marcus@philosophy.org",
      projectType: "Full Sunroom Addition & Deck",
      budgetRange: "$60,000 - $80,000",
      status: "New",
      dateReceived: "2026-06-24",
      veInterests: ["Composite Decking Upgrade", "Double-Pane Argon Windows"]
    },
    {
      id: "L-902",
      name: "Helen Troi",
      phone: "(555) 789-2311",
      email: "helen@sparta.com",
      projectType: "Clubhouse Lounge Restoration",
      budgetRange: "$150,000+",
      status: "Qualified",
      dateReceived: "2026-06-20",
      veInterests: ["Smart LED Lighting Package"]
    }
  ]);

  // Value Engineering options state
  const [veCatalog, setVeCatalog] = useState([
    { id: "VE-1", option: "Composite Decking vs. Cedar", savingsText: "Lower lifetime maintenance, 25-yr warranty", activeInterestCount: 14 },
    { id: "VE-2", option: "Smart LED Integration Package", savingsText: "Reduces electrical rough-in costs by 15%", activeInterestCount: 22 },
    { id: "VE-3", option: "Double-Pane Argon Windows", savingsText: "Saves average $450/year in heating costs", activeInterestCount: 9 }
  ]);

  const handleUpdateLeadStatus = (id: string, newStatus: any) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    toast.success(`Lead status updated to ${newStatus}`);
  };

  const handleCreateVeOption = () => {
    const optionName = prompt("Enter Value Engineering Option Name:");
    if (!optionName) return;
    const details = prompt("Enter Value Proposition / Savings text:");
    if (!details) return;

    setVeCatalog([
      ...veCatalog,
      {
        id: `VE-${veCatalog.length + 1}`,
        option: optionName,
        savingsText: details,
        activeInterestCount: 0
      }
    ]);
    toast.success("VE item registered in marketing database.");
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl text-[#0f281e]">Public Website & Marketing</h2>
          <p className="text-[#0f281e]/60 text-sm mt-1">Review landing page layouts, compile client inquiries, and manage the Value Engineering portal options.</p>
        </div>

        <div className="flex bg-[#0f281e]/5 p-1 rounded-xl border border-[#0f281e]/10">
          {[
            { id: 'leads', label: 'Inbound Leads', icon: <Inbox className="w-4 h-4" /> },
            { id: 've', label: 'Value Engineering Portal', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'pages', label: 'Page Layouts & Templates', icon: <Globe className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase rounded-lg tracking-wider transition-all ${
                activeSubTab === tab.id 
                  ? 'bg-[#c4864b] text-white shadow-sm' 
                  : 'text-[#0f281e]/60 hover:text-[#0f281e]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'leads' && (
        <div className="bg-white border border-[#0f281e]/5 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#0f281e]/5">
            <div>
              <h3 className="font-serif text-xl text-[#0f281e]">Inbound Leads & Inquiry Forms</h3>
              <p className="text-xs text-[#0f281e]/55 mt-0.5">Contact requests, pre-qualifications, and meeting interests filed from the website.</p>
            </div>
          </div>

          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead.id} className="border border-[#0f281e]/10 rounded-2xl p-5 hover:border-[#c4864b]/30 transition-all flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-[#0f281e]/40">{lead.id}</span>
                    <span className="text-sm font-bold text-[#0f281e]">{lead.name}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded ${
                      lead.status === 'New' ? 'bg-red-500/10 text-red-500' :
                      lead.status === 'Qualified' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-emerald-500/10 text-emerald-600'
                    }`}>
                      {lead.status}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-[#0f281e]/60 space-y-1">
                    <div>Project Request: <span className="font-bold text-[#0f281e]/85">{lead.projectType}</span></div>
                    <div>Budget range: <span className="font-bold text-[#0f281e]/85">{lead.budgetRange}</span></div>
                    <div>Contact: {lead.phone} | {lead.email}</div>
                  </div>

                  {lead.veInterests.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-[#0f281e]/40 block mb-1">VE Options Selected</span>
                      <div className="flex flex-wrap gap-1.5">
                        {lead.veInterests.map((ve, idx) => (
                          <span key={idx} className="bg-[#c4864b]/10 text-[#c4864b] text-[9px] font-bold px-2 py-0.5 rounded-lg border border-[#c4864b]/20">
                            {ve}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between items-end gap-3 min-w-[200px]">
                  <span className="text-[9px] uppercase font-bold text-[#0f281e]/40">Received: {lead.dateReceived}</span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateLeadStatus(lead.id, 'Qualified')}
                      className="px-3 py-1.5 bg-[#0f281e]/5 hover:bg-[#0f281e]/10 rounded-lg text-xs font-bold text-[#0f281e] border border-[#0f281e]/10 transition-colors"
                    >
                      Mark Qualified
                    </button>
                    <button
                      onClick={() => handleUpdateLeadStatus(lead.id, 'Meeting Scheduled')}
                      className="px-3 py-1.5 bg-[#c4864b] hover:bg-[#b57a44] rounded-lg text-xs font-bold text-white transition-colors shadow-sm"
                    >
                      Schedule Walkthrough
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 've' && (
        <div className="bg-white border border-[#0f281e]/5 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#0f281e]/5">
            <div>
              <h3 className="font-serif text-xl text-[#0f281e]">Value Engineering (VE) Showcase Options</h3>
              <p className="text-xs text-[#0f281e]/55 mt-0.5">Configure alternate materials and savings packages that prospective clients browse on the public website.</p>
            </div>
            <button 
              onClick={handleCreateVeOption}
              className="bg-[#c4864b] hover:bg-[#b57a44] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add VE Option</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {veCatalog.map(ve => (
              <div key={ve.id} className="border border-[#0f281e]/10 p-5 rounded-2xl space-y-4 flex flex-col justify-between hover:border-[#c4864b]/30 transition-all">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-[#0f281e]/40">{ve.id}</span>
                    <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                      Active option
                    </span>
                  </div>
                  <h4 className="font-serif text-base text-[#0f281e] font-semibold">{ve.option}</h4>
                  <p className="text-xs text-[#0f281e]/60 font-semibold">{ve.savingsText}</p>
                </div>

                <div className="pt-3 border-t border-[#0f281e]/5 flex justify-between items-center text-xs">
                  <span className="font-bold text-[#0f281e]/45">Client Inquiries Submitted</span>
                  <span className="font-black text-[#c4864b] flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#c4864b]" />
                    {ve.activeInterestCount} leads interested
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'pages' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Homepage Layout", desc: "Showcases hero banner, client login links, and portfolio carousels.", status: "Online" },
            { title: "Value Engineering Portal", desc: "Interactive wizard allowing prospects to select specs and generate estimation inquiries.", status: "Online" },
            { title: "Prequalification Wizard", desc: "Budget and scope questionnaires filtering inbound routing for PM review.", status: "Online" }
          ].map((page, i) => (
            <div key={i} className="bg-white border border-[#0f281e]/5 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-44 hover:border-[#c4864b]/30 transition-all">
              <div>
                <div className="flex justify-between items-start">
                  <h4 className="font-serif text-base text-[#0f281e] font-semibold">{page.title}</h4>
                  <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">{page.status}</span>
                </div>
                <p className="text-xs text-[#0f281e]/60 mt-2 font-medium">{page.desc}</p>
              </div>
              <button 
                onClick={() => toast.success(`Launching template editor for ${page.title}`)}
                className="text-xs font-bold text-[#c4864b] hover:underline flex items-center gap-1 w-fit"
              >
                <span>Edit layouts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
