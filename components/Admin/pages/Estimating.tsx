import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, Database, Users2, FileSpreadsheet, 
  Settings, Save, Plus, ArrowUpRight, CheckCircle2, ChevronRight, Download, History
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CostItem {
  id: string;
  category: string;
  item: string;
  materialCost: number;
  laborCost: number;
  unit: string;
}

interface Vendor {
  name: string;
  trade: string;
  rating: string;
  phone: string;
  email: string;
  quoteIndex: number; 
}

interface PriceHistoryLog {
  id: string;
  item: string;
  vendor: string;
  rate: number;
  date: string;
  effectivePeriod: string;
  remarks: string;
  isArchived: boolean;
}

export const Estimating: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'takeoff' | 'database' | 'vendors' | 'history'>('takeoff');

  // Costs database state
  const [costDb, setCostDb] = useState<CostItem[]>([
    { id: "C-1", category: "Framing", item: "2x4 Lumber Studs (16ft)", materialCost: 8.50, laborCost: 5.00, unit: "pcs" },
    { id: "C-2", category: "Drywall", item: "5/8 Sheetrock Fire-Shield", materialCost: 19.50, laborCost: 15.00, unit: "sheets" },
    { id: "C-3", category: "Painting", item: "Premium Latex Primer/Satin Paint", materialCost: 45.00, laborCost: 28.00, unit: "gallons" },
    { id: "C-4", category: "Tiling", item: "Porcelain Hexagonal Floor Tiles", materialCost: 6.20, laborCost: 8.50, unit: "sqft" },
    { id: "C-5", category: "Demolition", item: "Demolition debris & haul off", materialCost: 0.00, laborCost: 24.00, unit: "hours" }
  ]);

  // Price history log state (Workflow 1)
  const [priceLogs, setPriceLogs] = useState<PriceHistoryLog[]>([
    { id: "PH-101", item: "2x4 Lumber Studs (16ft)", vendor: "Ridge Wood Products", rate: 8.50, date: "2026-06-01", effectivePeriod: "Q2 2026", remarks: "Base rate for Q2 bulk delivery", isArchived: false },
    { id: "PH-100", item: "2x4 Lumber Studs (16ft)", vendor: "Ridge Wood Products", rate: 7.90, date: "2026-03-01", effectivePeriod: "Q1 2026", remarks: "Winter discount promo rate", isArchived: true },
    { id: "PH-099", item: "5/8 Sheetrock Fire-Shield", vendor: "Apex Supply Co", rate: 19.50, date: "2026-05-15", effectivePeriod: "Summer 2026", remarks: "Standard wholesale price", isArchived: false },
    { id: "PH-098", item: "5/8 Sheetrock Fire-Shield", vendor: "Apex Supply Co", rate: 18.00, date: "2026-01-10", effectivePeriod: "Q1 2026", remarks: "Manufacturer direct pricing", isArchived: true }
  ]);

  // Pricing update form states
  const [showLogForm, setShowLogForm] = useState(false);
  const [logItemName, setLogItemName] = useState("2x4 Lumber Studs (16ft)");
  const [logVendor, setLogVendor] = useState("Ridge Wood Products");
  const [logRate, setLogRate] = useState(8.50);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logPeriod, setLogPeriod] = useState("Q3 2026");
  const [logRemarks, setLogRemarks] = useState("");

  // Takeoff quantities
  const [takeoffs, setTakeoffs] = useState<Record<string, number>>({
    "C-1": 150, 
    "C-2": 60,  
    "C-3": 12,  
    "C-4": 300, 
    "C-5": 16   
  });

  // Calculators State
  const [overhead, setOverhead] = useState(10); 
  const [profit, setProfit] = useState(15); 
  const [tax, setTax] = useState(8); 
  const [contingency, setContingency] = useState(5); 

  // Selected item filter for comparing vendor price history
  const [selectedHistoryItem, setSelectedHistoryItem] = useState("2x4 Lumber Studs (16ft)");

  // Vendors list
  const vendors: Vendor[] = [
    { name: "Ridge Wood Products", trade: "Framing", rating: "4.8/5", phone: "(555) 120-4389", email: "sales@ridgewood.com", quoteIndex: 0.98 },
    { name: "Apex Supply Co", trade: "Drywall", rating: "4.5/5", phone: "(555) 438-2900", email: "quote@apexsupply.com", quoteIndex: 1.02 },
    { name: "Sherwin-Williams Commercial", trade: "Painting", rating: "4.9/5", phone: "(555) 901-2384", email: "sw_hills@sherwin.com", quoteIndex: 1.00 },
    { name: "Atlas Flooring & Ceramic", trade: "Tiling", rating: "4.7/5", phone: "(555) 890-3482", email: "tiling@atlas.com", quoteIndex: 0.95 }
  ];

  // Database edits
  const handleDbChange = (id: string, field: 'materialCost' | 'laborCost', val: number) => {
    setCostDb(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: Math.max(0, val) };
      }
      return item;
    }));
  };

  const handleTakeoffChange = (id: string, qty: number) => {
    setTakeoffs(prev => ({
      ...prev,
      [id]: Math.max(0, qty)
    }));
  };

  const handleLogNewRate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Archive previous rates for the matching item and vendor
    setPriceLogs(prev => prev.map(log => {
      if (log.item === logItemName && log.vendor === logVendor) {
        return { ...log, isArchived: true };
      }
      return log;
    }));

    const newLog: PriceHistoryLog = {
      id: `PH-${Math.floor(100 + Math.random() * 900)}`,
      item: logItemName,
      vendor: logVendor,
      rate: logRate,
      date: logDate,
      effectivePeriod: logPeriod,
      remarks: logRemarks || "Updated vendor pricing submission",
      isArchived: false
    };

    setPriceLogs(prev => [newLog, ...prev]);

    // Also update current Cost DB rate if item matches
    setCostDb(prev => prev.map(c => {
      if (c.item === logItemName) {
        return { ...c, materialCost: logRate };
      }
      return c;
    }));

    toast.success(`Pricing rate logged! Current item rate updated to $${logRate.toFixed(2)}.`);
    setShowLogForm(false);
    setLogRemarks("");
  };

  // Calculations
  const calculations = costDb.map(dbItem => {
    const qty = takeoffs[dbItem.id] || 0;
    const materialTotal = dbItem.materialCost * qty;
    const laborTotal = dbItem.laborCost * qty;
    const baseTotal = materialTotal + laborTotal;
    return {
      ...dbItem,
      qty,
      materialTotal,
      laborTotal,
      baseTotal
    };
  });

  const sumBaseMaterials = calculations.reduce((sum, item) => sum + item.materialTotal, 0);
  const sumBaseLabor = calculations.reduce((sum, item) => sum + item.laborTotal, 0);
  const totalBaseCost = sumBaseMaterials + sumBaseLabor;

  const overheadVal = (totalBaseCost * overhead) / 100;
  const contingencyVal = (totalBaseCost * contingency) / 100;
  const profitVal = ((totalBaseCost + overheadVal + contingencyVal) * profit) / 100;
  const subtotalBeforeTax = totalBaseCost + overheadVal + contingencyVal + profitVal;
  const taxVal = (subtotalBeforeTax * tax) / 100;
  const finalProjectCost = subtotalBeforeTax + taxVal;

  const handleSaveCosts = () => {
    toast.success("Pricing database settings saved!");
  };

  const handleExportProposal = () => {
    toast.success("Auto-generated Proposal PDF downloaded!");
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl text-[#0f281e]">Estimating & Pricing Engine</h2>
          <p className="text-[#0f281e]/60 text-sm mt-1">Configure item pricing, compute raw takeoff estimates, calculate overhead/profits, and export client bids.</p>
        </div>
        <div className="flex flex-wrap bg-[#0f281e]/5 p-1 rounded-xl border border-[#0f281e]/10 relative select-none">
          {[
            { id: 'takeoff', label: 'Estimator & Takeoff', icon: <Calculator className="w-4 h-4 shrink-0" /> },
            { id: 'database', label: 'Item Database', icon: <Database className="w-4 h-4 shrink-0" /> },
            { id: 'vendors', label: 'Vendor Directory', icon: <Users2 className="w-4 h-4 shrink-0" /> },
            { id: 'history', label: 'Price History Logs', icon: <History className="w-4 h-4 shrink-0" /> }
          ].map(tab => {
            const isActive = activeSubTab === tab.id;
            return (
              <motion.button
                layout
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`relative flex items-center justify-center px-4 py-2.5 text-xs font-bold uppercase rounded-lg tracking-wider transition-colors duration-300 z-10 shrink-0 ${
                  isActive ? 'text-white' : 'text-[#0f281e]/60 hover:text-[#0f281e]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="estimatingSubTabSlider"
                    className="absolute inset-0 bg-[#c4864b] rounded-lg z-[-1] shadow-sm shadow-[#c4864b]/20"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                  />
                )}
                {tab.icon}
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                    animate={{ opacity: 1, width: 'auto', marginLeft: 6 }}
                    exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="whitespace-nowrap overflow-hidden font-bold"
                  >
                    {tab.label}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {activeSubTab === 'takeoff' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Takeoff Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#0f281e]/5 rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="font-serif text-2xl text-[#0f281e] pb-2 border-b border-[#0f281e]/5">Active Project Takeoff</h3>
              
              <div className="space-y-4">
                {calculations.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[#0f281e]/5 rounded-xl gap-4">
                    <div className="flex-1">
                      <span className="text-[10px] uppercase font-black tracking-widest text-[#c4864b] block">{item.category}</span>
                      <span className="text-sm font-bold text-[#0f281e]">{item.item}</span>
                      <div className="text-xs text-[#0f281e]/60 mt-1">
                        Mat: ${item.materialCost.toFixed(2)}/{item.unit} | Lab: ${item.laborCost.toFixed(2)}/{item.unit}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <label className="text-xs font-bold text-[#0f281e]/60">Qty ({item.unit}):</label>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={e => handleTakeoffChange(item.id, Number(e.target.value))}
                        className="w-24 bg-white rounded-lg px-3 py-1.5 text-sm font-bold border border-[#0f281e]/10 outline-none text-right"
                      />
                      <div className="w-24 text-right text-sm font-bold text-[#0f281e]">
                        ${item.baseTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations and Summary */}
            <div className="bg-white border border-[#0f281e]/5 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl text-[#0f281e]">Takeoff Cost Breakdown</h3>
                <button
                  onClick={handleExportProposal}
                  className="bg-[#0f281e] text-white hover:bg-[#0f281e]/90 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Generate Proposal PDF</span>
                </button>
              </div>

              {/* Schedule of Values */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0f281e]/5 font-bold uppercase text-[#0f281e]/60 border-b border-[#0f281e]/10">
                      <th className="px-4 py-3">Line item</th>
                      <th className="px-4 py-3 text-right">Quantity</th>
                      <th className="px-4 py-3 text-right">Material total</th>
                      <th className="px-4 py-3 text-right">Labor total</th>
                      <th className="px-4 py-3 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0f281e]/5 font-medium text-[#0f281e]/80">
                    {calculations.map(item => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 font-semibold">{item.item}</td>
                        <td className="px-4 py-3 text-right">{item.qty} {item.unit}</td>
                        <td className="px-4 py-3 text-right">${item.materialTotal.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">${item.laborTotal.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-bold">${item.baseTotal.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-[#0f281e]/5 text-sm text-[#0f281e]">
                      <td className="px-4 py-3" colSpan={2}>Raw Takeoff Totals</td>
                      <td className="px-4 py-3 text-right">${sumBaseMaterials.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">${sumBaseLabor.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">${totalBaseCost.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Calculator Settings Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-[#0f281e]/5 rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="font-serif text-xl text-[#0f281e] flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#c4864b]" />
                <span>Markup Multipliers</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[#0f281e]/50 mb-2">
                    <span>Overhead Markup</span>
                    <span>{overhead}%</span>
                  </div>
                  <input
                    type="range" min="0" max="30" value={overhead}
                    onChange={e => setOverhead(Number(e.target.value))}
                    className="w-full accent-[#c4864b]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[#0f281e]/50 mb-2">
                    <span>Contingency Reserve</span>
                    <span>{contingency}%</span>
                  </div>
                  <input
                    type="range" min="0" max="20" value={contingency}
                    onChange={e => setContingency(Number(e.target.value))}
                    className="w-full accent-[#c4864b]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[#0f281e]/50 mb-2">
                    <span>Profit Margin target</span>
                    <span>{profit}%</span>
                  </div>
                  <input
                    type="range" min="5" max="40" value={profit}
                    onChange={e => setProfit(Number(e.target.value))}
                    className="w-full accent-[#c4864b]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[#0f281e]/50 mb-2">
                    <span>State/Local Sales Tax</span>
                    <span>{tax}%</span>
                  </div>
                  <input
                    type="range" min="0" max="15" value={tax}
                    onChange={e => setTax(Number(e.target.value))}
                    className="w-full accent-[#c4864b]"
                  />
                </div>
              </div>
            </div>

            {/* Proposal Invoice Widget */}
            <div className="bg-[#0f281e] text-white rounded-2xl p-6 shadow-md space-y-4 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Calculator className="w-16 h-16" />
              </div>
              
              <h4 className="font-serif text-lg text-[#dec099] border-b border-white/10 pb-2">Estimated Client Bid</h4>
              
              <div className="space-y-2 text-xs font-medium text-white/70">
                <div className="flex justify-between">
                  <span>Raw Material + Labor Cost</span>
                  <span>${totalBaseCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overhead Markup ({overhead}%)</span>
                  <span>${overheadVal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contingency ({contingency}%)</span>
                  <span>${contingencyVal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Target Profit ({profit}%)</span>
                  <span className="text-[#dec099]">${profitVal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes ({tax}%)</span>
                  <span>${taxVal.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <div>
                  <span className="text-[10px] uppercase font-bold text-white/40 block">Final Proposal Total</span>
                  <span className="font-serif text-3xl font-bold text-white">${finalProjectCost.toFixed(2)}</span>
                </div>
                <div className="inline-flex items-center gap-1 bg-[#c4864b] text-white text-[9px] uppercase tracking-wider font-black px-2.5 py-1 rounded-full">
                  SOV Ready
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'database' && (
        <div className="bg-white border border-[#0f281e]/5 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#0f281e]/5">
            <div>
              <h3 className="font-serif text-xl text-[#0f281e]">Material & Labor Pricing Database</h3>
              <p className="text-xs text-[#0f281e]/55 mt-0.5">Edit baseline costs per unit, which populates the active takeoff estimation forms.</p>
            </div>
            <button 
              onClick={handleSaveCosts}
              className="bg-[#c4864b] hover:bg-[#b57a44] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Database Changes</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#0f281e]/5 font-bold uppercase text-[10px] tracking-wider text-[#0f281e]/60 border-b border-[#0f281e]/10">
                  <th className="px-6 py-4">Item ID</th>
                  <th className="px-6 py-4">Trade Category</th>
                  <th className="px-6 py-4">Item description</th>
                  <th className="px-6 py-4">Unit type</th>
                  <th className="px-6 py-4 text-right">Base Material Cost / Unit</th>
                  <th className="px-6 py-4 text-right">Base Labor Cost / Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0f281e]/5 text-[#0f281e]/80">
                {costDb.map((item) => (
                  <tr key={item.id} className="hover:bg-[#0f281e]/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-xs">{item.id}</td>
                    <td className="px-6 py-4">
                      <span className="bg-[#0f281e]/5 px-2.5 py-1 rounded-lg text-xs font-bold text-[#0f281e]/80">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-xs">{item.item}</td>
                    <td className="px-6 py-4 text-xs font-semibold">{item.unit}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-xs text-[#0f281e]/40">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={item.materialCost}
                          onChange={e => handleDbChange(item.id, 'materialCost', Number(e.target.value))}
                          className="w-20 bg-[#0f281e]/5 border border-transparent focus:border-[#c4864b]/30 rounded px-2 py-1 text-right text-xs font-bold"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-xs text-[#0f281e]/40">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={item.laborCost}
                          onChange={e => handleDbChange(item.id, 'laborCost', Number(e.target.value))}
                          className="w-20 bg-[#0f281e]/5 border border-transparent focus:border-[#c4864b]/30 rounded px-2 py-1 text-right text-xs font-bold"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'vendors' && (
        <div className="bg-white border border-[#0f281e]/5 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-serif text-xl text-[#0f281e]">Shared Vendor Directory & Cost Multipliers</h3>
            <p className="text-xs text-[#0f281e]/55 mt-0.5">Centralized contact book. View ratings and compare vendor contract coefficients.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vendors.map((vendor, i) => (
              <div key={i} className="border border-[#0f281e]/10 p-5 rounded-2xl space-y-3 relative hover:border-[#c4864b]/30 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#c4864b] block">{vendor.trade}</span>
                    <h4 className="text-sm font-bold text-[#0f281e] mt-1">{vendor.name}</h4>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-black">
                    {vendor.rating}
                  </span>
                </div>
                
                <div className="text-xs font-semibold text-[#0f281e]/60 space-y-1 pt-2">
                  <div>Phone: {vendor.phone}</div>
                  <div>Email: {vendor.email}</div>
                </div>

                <div className="pt-3 border-t border-[#0f281e]/5 flex justify-between items-center text-xs">
                  <span className="font-bold text-[#0f281e]/50">Cost Multiplier</span>
                  <span className={`font-black ${vendor.quoteIndex < 1 ? 'text-emerald-500' : vendor.quoteIndex === 1 ? 'text-gray-500' : 'text-red-500'}`}>
                    {(vendor.quoteIndex * 100).toFixed(0)}% (Quote idx: {vendor.quoteIndex})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel: Log rate update form */}
          <div className="bg-white border border-[#0f281e]/5 p-6 rounded-2xl shadow-sm space-y-6">
            <div>
              <h3 className="font-serif text-xl text-[#0f281e] flex items-center gap-2">
                <History className="w-5 h-5 text-[#c4864b]" />
                <span>Log Vendor Price Update</span>
              </h3>
              <p className="text-xs text-[#0f281e]/55 mt-0.5">Workflow 1: Input updated rate, automatically archives previous rate.</p>
            </div>

            <form onSubmit={handleLogNewRate} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">Item Select</label>
                <select
                  value={logItemName}
                  onChange={e => setLogItemName(e.target.value)}
                  className="w-full bg-[#0f281e]/5 rounded-xl px-4 py-3 text-xs font-semibold text-[#0f281e] outline-none"
                >
                  {costDb.map(item => <option key={item.id} value={item.item}>{item.item}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">Vendor Name</label>
                <select
                  value={logVendor}
                  onChange={e => setLogVendor(e.target.value)}
                  className="w-full bg-[#0f281e]/5 rounded-xl px-4 py-3 text-xs font-semibold text-[#0f281e] outline-none"
                >
                  {vendors.map((v, i) => <option key={i} value={v.name}>{v.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">New Rate ($)</label>
                  <input
                    type="number" step="0.01" value={logRate}
                    onChange={e => setLogRate(Number(e.target.value))}
                    className="w-full bg-[#0f281e]/5 rounded-xl px-4 py-3 text-xs outline-none border border-transparent focus:border-[#c4864b]/30 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">Effective Period</label>
                  <input
                    type="text" value={logPeriod}
                    onChange={e => setLogPeriod(e.target.value)}
                    placeholder="Q3 2026"
                    className="w-full bg-[#0f281e]/5 rounded-xl px-4 py-3 text-xs outline-none border border-transparent focus:border-[#c4864b]/30 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">Effective Date</label>
                <input
                  type="date" value={logDate}
                  onChange={e => setLogDate(e.target.value)}
                  className="w-full bg-[#0f281e]/5 rounded-xl px-4 py-3 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">Remarks</label>
                <textarea
                  value={logRemarks}
                  onChange={e => setLogRemarks(e.target.value)}
                  placeholder="Reasons for change, tariff/supply issues..."
                  className="w-full h-20 bg-[#0f281e]/5 rounded-xl p-3 text-xs outline-none focus:border-[#c4864b] font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0f281e] text-white hover:bg-[#0f281e]/90 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
              >
                Log Update & Update Database
              </button>
            </form>
          </div>

          {/* Right panel: Price update logs table and vendor comparison */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#0f281e]/5 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#0f281e]/5">
                <h3 className="font-serif text-xl text-[#0f281e]">Archived Pricing History</h3>
                <div>
                  <select
                    value={selectedHistoryItem}
                    onChange={e => setSelectedHistoryItem(e.target.value)}
                    className="bg-[#0f281e]/5 rounded-lg px-3 py-1.5 text-xs font-bold text-[#0f281e]"
                  >
                    {costDb.map(c => <option key={c.id} value={c.item}>{c.item}</option>)}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0f281e]/5 font-bold uppercase text-[#0f281e]/60 border-b border-[#0f281e]/10">
                      <th className="px-4 py-3">Vendor</th>
                      <th className="px-4 py-3">Rate</th>
                      <th className="px-4 py-3">Effective Date</th>
                      <th className="px-4 py-3">Period</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0f281e]/5 text-[#0f281e]/80 font-medium">
                    {priceLogs
                      .filter(log => log.item === selectedHistoryItem)
                      .map((log) => (
                        <tr key={log.id} className={log.isArchived ? 'opacity-50' : 'bg-emerald-500/5'}>
                          <td className="px-4 py-3 font-semibold">{log.vendor}</td>
                          <td className="px-4 py-3 font-bold">${log.rate.toFixed(2)}</td>
                          <td className="px-4 py-3">{log.date}</td>
                          <td className="px-4 py-3">{log.effectivePeriod}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                              log.isArchived 
                                ? 'bg-gray-100 text-gray-500 border border-gray-200' 
                                : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            }`}>
                              {log.isArchived ? 'Archived' : 'Active'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[10px] italic text-[#0f281e]/60">{log.remarks}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
