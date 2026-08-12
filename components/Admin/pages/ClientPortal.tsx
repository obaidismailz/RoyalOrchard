import React, { useState } from 'react';
import { 
  Briefcase, Calendar, DollarSign, FileText, 
  Image as ImageIcon, ArrowDownToLine, Clock, HelpCircle, AlertCircle, CreditCard, CheckCircle2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProgressPost {
  id: string;
  date: string;
  author: string;
  content: string;
  image?: string;
  tags?: string[];
}

export const ClientPortal: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState('102 Oak Ridge Court (Backyard Reno)');

  // Daily log updates
  const progressLogs: Record<string, ProgressPost[]> = {
    '102 Oak Ridge Court (Backyard Reno)': [
      {
        id: "P-1",
        date: "2026-06-24",
        author: "Foreman John",
        content: "Framing layout complete. Wall studs successfully erected for outer boundary. Awaiting mechanical routing next.",
        image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
        tags: ["Framing", "Milestone"]
      },
      {
        id: "P-2",
        date: "2026-06-22",
        author: "Hassan Mahmood",
        content: "Demolition phase finalized. Old deck structures hauled off and site grade leveled for concrete pad foundation pouring.",
        image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80",
        tags: ["Demolition", "Excavation"]
      }
    ],
    'Main Clubhouse Ballroom Remodel': [
      {
        id: "P-3",
        date: "2026-06-23",
        author: "Lead Tech Sarah",
        content: "Plumbing rough-in plumbing inspection passed. Fire sprinkler pipe expansion installed successfully.",
        tags: ["Plumbing", "Inspections"]
      }
    ]
  };

  const projectDetails: Record<string, {
    client: string;
    budget: number;
    paid: number;
    balance: number;
    alert?: string;
    completion: number;
  }> = {
    '102 Oak Ridge Court (Backyard Reno)': {
      client: "Capital Hills Board",
      budget: 85200.00,
      paid: 45000.00,
      balance: 40200.00,
      completion: 55
    },
    'Main Clubhouse Ballroom Remodel': {
      client: "Resort Infrastructure Committee",
      budget: 245000.00,
      paid: 120000.00,
      balance: 125000.00,
      alert: "Change Order #2 is awaiting client signature & payment approval",
      completion: 40
    }
  };

  const documents = [
    { name: "Ponos_Contract_signed_final.pdf", size: "2.4 MB", type: "Contract" },
    { name: "Approved_Change_Order_01.pdf", size: "840 KB", type: "Change Order" },
    { name: "Lumber_Takeoff_SpecSheet.pdf", size: "1.2 MB", type: "Submittal" }
  ];

  const currentDetails = projectDetails[selectedProject] || projectDetails['102 Oak Ridge Court (Backyard Reno)'];
  const logs = progressLogs[selectedProject] || [];

  const handleSimulatePayment = () => {
    toast.success(`Simulating Stripe online payment of $10,000 for ${selectedProject}`);
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header and selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl text-[#0f281e]">Client Portal Preview</h2>
          <p className="text-[#0f281e]/60 text-sm mt-1">Preview the portal dashboard where clients track project budgets, contracts, and daily photo feeds.</p>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#0f281e]/40 mb-1.5">View Client Account</label>
          <select 
            value={selectedProject} 
            onChange={e => setSelectedProject(e.target.value)} 
            className="bg-[#0f281e]/5 rounded-xl px-4 py-3 text-xs text-[#0f281e] font-black uppercase outline-none border border-transparent focus:border-[#c4864b]/30"
          >
            {Object.keys(projectDetails).map((name, i) => <option key={i} value={name}>{name}</option>)}
          </select>
        </div>
      </div>

      {/* Alert Banner if present */}
      {currentDetails.alert && (
        <div className="bg-[#c4864b]/10 border border-[#c4864b]/30 text-[#0f281e] p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#c4864b] shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wide">{currentDetails.alert}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#0f281e]/5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0f281e]/40">Approved Budget</span>
            <div className="p-2 rounded-lg bg-[#0f281e]/5"><DollarSign className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-[#0f281e] font-serif">${currentDetails.budget.toLocaleString()}</div>
          <span className="text-[10px] text-[#0f281e]/50 font-bold block mt-1">Contract value signed</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#0f281e]/5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0f281e]/40">Payments Cleared</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600"><CheckCircle2 className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-serif">${currentDetails.paid.toLocaleString()}</div>
          <span className="text-[10px] text-[#0f281e]/50 font-bold block mt-1">Processed draws</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#0f281e]/5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0f281e]/40">Remaining Balance</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-600"><Clock className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-red-600 font-serif">${currentDetails.balance.toLocaleString()}</div>
          <span className="text-[10px] text-[#0f281e]/50 font-bold block mt-1">Next draw due post-milestone</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#0f281e]/5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0f281e]/40">Progress Complete</span>
              <span className="text-xs font-bold text-[#c4864b]">{currentDetails.completion}%</span>
            </div>
            <div className="w-full bg-[#0f281e]/5 rounded-full h-2.5 mt-2">
              <div className="bg-[#c4864b] h-2.5 rounded-full" style={{ width: `${currentDetails.completion}%` }}></div>
            </div>
          </div>
          <button
            onClick={handleSimulatePayment}
            className="w-full bg-[#0f281e] text-white hover:bg-[#0f281e]/90 text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 mt-4"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Make Stripe Payment</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Progress Stream */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-serif text-2xl text-[#0f281e]">Daily Logs & Site Photos</h3>
          
          <div className="space-y-6">
            {logs.map((post) => (
              <div key={post.id} className="bg-white border border-[#0f281e]/5 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#0f281e]/5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-[#0f281e] rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {post.author[0]}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0f281e]">{post.author}</div>
                      <div className="text-[10px] text-[#0f281e]/40 font-semibold">{post.date}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {post.tags?.map((t, idx) => (
                      <span key={idx} className="bg-[#c4864b]/10 text-[#c4864b] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-[#0f281e]/80 leading-relaxed font-semibold">{post.content}</p>

                {post.image && (
                  <div className="rounded-2xl overflow-hidden aspect-video border border-[#0f281e]/10 shadow-inner">
                    <img src={post.image} alt="Progress report" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))}

            {logs.length === 0 && (
              <div className="bg-white text-[#0f281e]/40 border-2 border-dashed border-[#0f281e]/10 rounded-2xl py-12 text-center">
                No logs recorded yet for this project.
              </div>
            )}
          </div>
        </div>

        {/* Document Hub */}
        <div className="space-y-6">
          <h3 className="font-serif text-2xl text-[#0f281e]">Document Hub</h3>
          <div className="bg-white border border-[#0f281e]/5 rounded-3xl p-6 shadow-sm space-y-4">
            <p className="text-xs text-[#0f281e]/60">Download the official documentation, submittal approvals, drawings, and change order contracts.</p>
            
            <div className="space-y-3">
              {documents.map((doc, idx) => (
                <div key={idx} className="bg-[#0f281e]/5 p-4 rounded-xl flex items-center justify-between gap-3 group hover:bg-[#c4864b]/10 border border-transparent transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#0f281e]/5 rounded-lg text-[#c4864b]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#0f281e] block truncate max-w-[150px]">{doc.name}</span>
                      <span className="text-[9px] uppercase tracking-wider text-[#0f281e]/50 font-black">{doc.type} • {doc.size}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toast.success(`Downloading ${doc.name}`)}
                    className="p-2 text-[#0f281e]/60 group-hover:text-[#0f281e] hover:bg-white rounded-lg transition-colors"
                  >
                    <ArrowDownToLine className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
