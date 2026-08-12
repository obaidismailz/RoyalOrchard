import React, { useState } from 'react';
import { 
  Cloud, RefreshCw, Layers, ShieldCheck, 
  Settings, KeyRound, Plus, Link, Trash2, CheckCircle2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Webhook {
  id: string;
  name: string;
  url: string;
  event: string;
  status: 'Active' | 'Inactive';
}

export const Integrations: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'qb' | 'takeoffs' | 'webhooks'>('qb');

  // Webhooks state
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    { id: "W-1", name: "Slack Alerts", url: "https://hooks.slack.com/services/T00/B00/X00", event: "Material Request Created", status: "Active" },
    { id: "W-2", name: "Client Invoice Notification", url: "https://api.ponos.com/v1/invoice-hook", event: "Change Order Approved", status: "Active" }
  ]);

  // Webhook form state
  const [showAddWebhook, setShowAddWebhook] = useState(false);
  const [webhookName, setWebhookName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvent, setWebhookEvent] = useState('Material Request Created');

  // QuickBooks sync status
  const [qbSynced, setQbSynced] = useState(true);
  const [companyCamSynced, setCompanyCamSynced] = useState(true);

  const handleSyncService = (service: string) => {
    toast.loading(`Syncing data with ${service}...`, { duration: 1500 });
    setTimeout(() => {
      toast.success(`${service} synchronization complete!`);
    }, 1500);
  };

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookName || !webhookUrl) {
      toast.error("Please fill in webhook name and destination URL.");
      return;
    }
    const newHook: Webhook = {
      id: `W-${webhooks.length + 1}`,
      name: webhookName,
      url: webhookUrl,
      event: webhookEvent,
      status: 'Active'
    };
    setWebhooks([...webhooks, newHook]);
    toast.success("Webhook configured!");
    setShowAddWebhook(false);
    setWebhookName('');
    setWebhookUrl('');
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== id));
    toast.success("Webhook deleted");
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl text-[#0f281e]">Third-Party Integrations</h2>
          <p className="text-[#0f281e]/60 text-sm mt-1">Connect corporate billing tools, download blueprints takeoff files, and set up webhook triggers.</p>
        </div>

        <div className="flex bg-[#0f281e]/5 p-1 rounded-xl border border-[#0f281e]/10">
          {[
            { id: 'qb', label: 'Billing & Photos', icon: <Cloud className="w-4 h-4" /> },
            { id: 'takeoffs', label: 'Blueprints (PlanSwift)', icon: <Layers className="w-4 h-4" /> },
            { id: 'webhooks', label: 'Webhooks Framework', icon: <Link className="w-4 h-4" /> }
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

      {activeSubTab === 'qb' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QuickBooks integration Card */}
          <div className="bg-white border border-[#0f281e]/5 p-6 rounded-3xl shadow-sm space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-[#0f281e]/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/10 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#0f281e]">QuickBooks Online API</h3>
                  <span className="text-[10px] text-green-600 font-bold uppercase">Connected & Authorized</span>
                </div>
              </div>
              <button 
                onClick={() => handleSyncService('QuickBooks')}
                className="bg-[#0f281e] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-[#0f281e]/90 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Sync Now</span>
              </button>
            </div>

            <p className="text-xs text-[#0f281e]/60 leading-relaxed font-semibold">
              Automatically syncs materials purchasing receipts with Accounts Payable ledger. Matches orders, field delivery receipts, and invoices. Sets up payroll timesheet exports for field laborers.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {['Vendor Invoices', 'Labor Timesheets', 'Bill Payment sync'].map((label, idx) => (
                <div key={idx} className="bg-[#0f281e]/5 p-3.5 rounded-xl text-center border border-[#0f281e]/10">
                  <span className="text-[10px] text-[#0f281e]/40 font-bold uppercase block">{label}</span>
                  <span className="text-xs text-emerald-600 font-black uppercase mt-1.5 block">Synced</span>
                </div>
              ))}
            </div>
          </div>

          {/* CompanyCam Integration Card */}
          <div className="bg-white border border-[#0f281e]/5 p-6 rounded-3xl shadow-sm space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-[#0f281e]/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#0f281e]">CompanyCam Stream</h3>
                  <span className="text-[10px] text-blue-600 font-bold uppercase">Connected</span>
                </div>
              </div>
              <button 
                onClick={() => handleSyncService('CompanyCam')}
                className="bg-[#0f281e] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-[#0f281e]/90 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Sync Photos</span>
              </button>
            </div>

            <p className="text-xs text-[#0f281e]/60 leading-relaxed font-semibold">
              Synchronize field snapshots to local directories automatically. Allows GCs and client portal view users to review high-res progress reports linked directly to the site's geo-coordinates.
            </p>

            <div className="bg-[#0f281e]/5 p-4 rounded-xl border border-[#0f281e]/10 flex justify-between items-center text-xs">
              <span className="font-bold text-[#0f281e]/50">Last Snapshot Synced</span>
              <span className="font-black text-[#c4864b]">12 minutes ago</span>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'takeoffs' && (
        <div className="bg-white border border-[#0f281e]/5 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="pb-4 border-b border-[#0f281e]/5">
            <h3 className="font-serif text-xl text-[#0f281e]">PlanSwift & Bluebeam Takeoff Imports</h3>
            <p className="text-xs text-[#0f281e]/55 mt-0.5">Upload XML files or CSV spreadsheets exported from desktop estimating suites to auto-populate construction estimates.</p>
          </div>

          <div className="border-2 border-dashed border-[#0f281e]/20 rounded-2xl p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-[#0f281e]/5 text-[#c4864b] rounded-full flex items-center justify-center mx-auto">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#0f281e] block">Drag and drop estimating files here</span>
              <span className="text-[10px] text-[#0f281e]/40 block mt-1">Supports PlanSwift CSV exports or Bluebeam markup summaries (.csv, .xml)</span>
            </div>
            <button 
              onClick={() => toast.success("Sample Blueprint Takeoff CSV Parsed: 120 Studs, 450 Floor Tiles loaded.")}
              className="bg-[#c4864b] hover:bg-[#b57a44] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors inline-block shadow-sm"
            >
              Browse Local Files
            </button>
          </div>
        </div>
      )}

      {activeSubTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-[#0f281e]/5 shadow-sm">
            <div>
              <h3 className="font-serif text-xl text-[#0f281e]">Webhooks Integration Framework</h3>
              <p className="text-xs text-[#0f281e]/55 mt-0.5">Send HTTP POST payloads to external destinations upon key operational events.</p>
            </div>
            <button 
              onClick={() => setShowAddWebhook(!showAddWebhook)}
              className="bg-[#c4864b] hover:bg-[#b57a44] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Configure Webhook</span>
            </button>
          </div>

          {showAddWebhook && (
            <form onSubmit={handleCreateWebhook} className="bg-white border border-[#0f281e]/5 p-6 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3 pb-2 border-b border-[#0f281e]/5">
                <h4 className="font-serif text-lg text-[#0f281e]">Register Webhook</h4>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">Service Name</label>
                <input 
                  type="text" value={webhookName} onChange={e => setWebhookName(e.target.value)}
                  placeholder="e.g. Discord Notifications"
                  className="w-full bg-[#0f281e]/5 rounded-xl px-4 py-3 text-xs outline-none border border-transparent focus:border-[#c4864b]/30"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">Destination Endpoint URL</label>
                <input 
                  type="url" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)}
                  placeholder="https://api.yourservice.com/webhooks"
                  className="w-full bg-[#0f281e]/5 rounded-xl px-4 py-3 text-xs outline-none border border-transparent focus:border-[#c4864b]/30"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">Event Trigger</label>
                <select 
                  value={webhookEvent} onChange={e => setWebhookEvent(e.target.value)}
                  className="w-full bg-[#0f281e]/5 rounded-xl px-4 py-3 text-xs outline-none font-semibold text-[#0f281e]"
                >
                  <option value="Material Request Created">Material Request Created</option>
                  <option value="Change Order Approved">Change Order Approved</option>
                  <option value="Field Notice Logged">Field Notice Logged</option>
                </select>
              </div>

              <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                <button 
                  type="submit"
                  className="bg-[#0f281e] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm"
                >
                  Register Hook
                </button>
              </div>
            </form>
          )}

          <div className="bg-white border border-[#0f281e]/5 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="font-serif text-lg text-[#0f281e]">Active Webhook Handlers</h4>
            
            <div className="space-y-3">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="border border-[#0f281e]/10 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#0f281e]">{webhook.name}</span>
                      <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">{webhook.status}</span>
                    </div>
                    <div className="text-[10px] text-[#0f281e]/50 font-semibold truncate max-w-[300px]">URL: {webhook.url}</div>
                    <div className="text-[9px] text-[#c4864b] font-bold uppercase">Trigger Event: {webhook.event}</div>
                  </div>

                  <button 
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
