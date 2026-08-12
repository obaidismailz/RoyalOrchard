import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, CheckCircle, Package, Truck, 
  Clock, AlertTriangle, FileText, Camera, Upload, Trash2, ShieldAlert, Check, X, Edit2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MaterialRequest {
  id: string;
  project: string;
  trade: string;
  material: string;
  quantity: number;
  urgency: 'Standard' | 'Urgent' | 'Critical';
  deliveryDate: string;
  status: 'Pending PM Approval' | 'Requested' | 'Ordered' | 'Scheduled' | 'Delivered' | 'Emergency: Post-Approval Pending';
  notes?: string;
  bolFile?: string;
  photoFile?: string;
  verificationNotes?: string;
  isEmergency?: boolean;
}

interface InventoryItem {
  item: string;
  qtyOnHand: number;
  unit: string;
}

export const Purchasing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'procurement' | 'pm-queue' | 'inventory'>('procurement');

  // Materials requests state
  const [requests, setRequests] = useState<MaterialRequest[]>([
    {
      id: "REQ-001",
      project: "102 Oak Ridge Court (Backyard Reno)",
      trade: "Framing",
      material: "2x4 Lumber Studs (16ft)",
      quantity: 120,
      urgency: "Standard",
      deliveryDate: "2026-06-28",
      status: "Scheduled",
      notes: "Deliver near back entrance of clubhouse"
    },
    {
      id: "REQ-002",
      project: "Fairway Townhomes Unit B",
      trade: "Tiling",
      material: "Porcelain Hexagonal Floor Tiles",
      quantity: 450,
      urgency: "Urgent",
      deliveryDate: "2026-06-26",
      status: "Ordered"
    },
    {
      id: "REQ-003",
      project: "Main Clubhouse Ballroom Remodel",
      trade: "Drywall",
      material: "5/8 Sheetrock Fire-Shield (4x8)",
      quantity: 80,
      urgency: "Critical",
      deliveryDate: "2026-06-25",
      status: "Delivered",
      bolFile: "BOL_8932_Clubhouse.pdf",
      photoFile: "clubhouse_sheetrock.png",
      verificationNotes: "All 80 sheets delivered undamaged. Verified by foreman."
    },
    {
      id: "REQ-004",
      project: "Main Clubhouse Ballroom Remodel",
      trade: "Plumbing",
      material: "Emergency PVC Pipes Repair kit",
      quantity: 2,
      urgency: "Critical",
      deliveryDate: "2026-06-24",
      status: "Emergency: Post-Approval Pending",
      isEmergency: true,
      notes: "Urgent replacement to seal active pipe leakage"
    }
  ]);

  // Inventory Stock Counts
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { item: "2x4 Lumber Studs (16ft)", qtyOnHand: 250, unit: "pcs" },
    { item: "5/8 Sheetrock Fire-Shield (4x8)", qtyOnHand: 140, unit: "sheets" },
    { item: "Porcelain Hexagonal Floor Tiles", qtyOnHand: 0, unit: "sqft" },
    { item: "Premium Latex Primer/Satin Paint", qtyOnHand: 35, unit: "gallons" }
  ]);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [project, setProject] = useState('102 Oak Ridge Court (Backyard Reno)');
  const [trade, setTrade] = useState('Framing');
  const [material, setMaterial] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [urgency, setUrgency] = useState<'Standard' | 'Urgent' | 'Critical'>('Standard');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);

  // Edit item state
  const [editingRequest, setEditingRequest] = useState<MaterialRequest | null>(null);
  const [editQty, setEditQty] = useState(0);

  // Verification state
  const [selectedVerifyRequest, setSelectedVerifyRequest] = useState<MaterialRequest | null>(null);
  const [bolUploadName, setBolUploadName] = useState('');
  const [photoUploadName, setPhotoUploadName] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verifyQtyMatch, setVerifyQtyMatch] = useState(true);

  const activeProjects = [
    "102 Oak Ridge Court (Backyard Reno)",
    "Fairway Townhomes Unit B",
    "Main Clubhouse Ballroom Remodel",
    "Clubhouse Office Expansion"
  ];

  const trades = [
    "Demolition",
    "Framing",
    "Drywall",
    "Painting",
    "Millwork",
    "Tiling",
    "Electrical",
    "Plumbing"
  ];

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!material) {
      toast.error("Please specify a material description");
      return;
    }

    const isEmergencyItem = isEmergency;
    const initialStatus = isEmergencyItem 
      ? 'Emergency: Post-Approval Pending' 
      : 'Pending PM Approval';

    const newRequest: MaterialRequest = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      project,
      trade,
      material,
      quantity,
      urgency,
      deliveryDate: deliveryDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      status: initialStatus,
      isEmergency: isEmergencyItem,
      notes
    };

    setRequests([newRequest, ...requests]);
    
    if (isEmergencyItem) {
      toast.success(`Emergency request ${newRequest.id} created and bypasses initial approval! Site work proceeds.`);
    } else {
      toast.success(`Request ${newRequest.id} submitted for PM review.`);
    }
    
    // Reset Form
    setMaterial('');
    setQuantity(1);
    setNotes('');
    setIsEmergency(false);
    setShowAddForm(false);
  };

  const handleStatusChange = (id: string, nextStatus: any) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { ...req, status: nextStatus };
      }
      return req;
    }));
    toast.success(`Request status updated to ${nextStatus}`);
  };

  const handlePmAction = (id: string, action: 'Approve' | 'Reject') => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { 
          ...req, 
          status: action === 'Approve' ? 'Requested' : ('Pending PM Approval' as any), 
          notes: action === 'Reject' ? "Rejected by PM review" : req.notes
        };
      }
      return req;
    }));
    
    if (action === 'Approve') {
      toast.success("Request approved and forwarded to Purchasing office.");
    } else {
      toast.error("Request rejected.");
    }
  };

  const handleEditQuantity = (req: MaterialRequest) => {
    setEditingRequest(req);
    setEditQty(req.quantity);
  };

  const saveEditedRequest = () => {
    if (!editingRequest) return;
    setRequests(prev => prev.map(req => {
      if (req.id === editingRequest.id) {
        return { ...req, quantity: editQty };
      }
      return req;
    }));
    toast.success(`Quantity updated to ${editQty}`);
    setEditingRequest(null);
  };

  const handleVerifyDelivery = (req: MaterialRequest) => {
    setSelectedVerifyRequest(req);
    setBolUploadName(req.bolFile || '');
    setPhotoUploadName(req.photoFile || '');
    setVerificationNotes(req.verificationNotes || '');
    setVerifyQtyMatch(true);
  };

  const submitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVerifyRequest) return;

    setRequests(prev => prev.map(req => {
      if (req.id === selectedVerifyRequest.id) {
        return {
          ...req,
          status: 'Delivered',
          bolFile: bolUploadName || 'BOL_Uploaded_Manual.pdf',
          photoFile: photoUploadName || 'delivery_photo.jpg',
          verificationNotes: verificationNotes || "Verified successfully.",
        };
      }
      return req;
    }));

    // Update site inventory counts (Workflow 2 step 9)
    setInventory(prev => prev.map(inv => {
      if (selectedVerifyRequest.material.toLowerCase().includes(inv.item.split(' ')[0].toLowerCase())) {
        return { ...inv, qtyOnHand: inv.qtyOnHand + selectedVerifyRequest.quantity };
      }
      return inv;
    }));

    toast.success(`Delivery verified! Site inventory counts updated.`);
    setSelectedVerifyRequest(null);
    setBolUploadName('');
    setPhotoUploadName('');
    setVerificationNotes('');
  };

  const handleDeleteRequest = (id: string) => {
    setRequests(prev => prev.filter(req => req.id !== id));
    toast.success(`Request ${id} deleted.`);
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl text-[#0f281e]">Material Ordering & Purchasing</h2>
          <p className="text-[#0f281e]/60 text-sm mt-1">Submit purchase requests, update order workflow, and verify job site deliveries.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#c4864b] hover:bg-[#b57a44] text-white px-5 py-2.5 rounded-xl transition-colors shadow-md flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </button>

          <div className="flex bg-[#0f281e]/5 p-1 rounded-xl border border-[#0f281e]/10 relative">
            {[
              { id: 'procurement', label: 'Procurement Feed' },
              { id: 'pm-queue', label: 'PM Approval Queue' },
              { id: 'inventory', label: 'Site Inventory' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-4 py-2 text-xs font-bold uppercase rounded-lg tracking-wider transition-colors duration-300 z-10 ${
                    isActive ? 'text-white' : 'text-[#0f281e]/60 hover:text-[#0f281e]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="purchasingTabSlider"
                      className="absolute inset-0 bg-[#c4864b] rounded-lg z-[-1] shadow-sm shadow-[#c4864b]/20"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Request Form */}
      {showAddForm && (
        <form onSubmit={handleCreateRequest} className="bg-white border border-[#0f281e]/5 rounded-2xl p-6 shadow-md grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3 pb-2 border-b border-[#0f281e]/5 flex justify-between items-center">
            <h3 className="font-serif text-xl text-[#0f281e]">Create Purchase Request</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-[#0f281e]/40 hover:text-[#0f281e] text-xs">Cancel</button>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">Project Association</label>
            <select 
              value={project} 
              onChange={e => setProject(e.target.value)} 
              className="w-full bg-[#0f281e]/5 rounded-xl px-4 py-3 text-sm text-[#0f281e] font-medium outline-none border border-transparent focus:border-[#c4864b]/30"
            >
              {activeProjects.map((p, i) => <option key={i} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">Trade Category</label>
            <select 
              value={trade} 
              onChange={e => setTrade(e.target.value)} 
              className="w-full bg-[#0f281e]/5 rounded-xl px-4 py-3 text-sm text-[#0f281e] font-medium outline-none border border-transparent focus:border-[#c4864b]/30"
            >
              {trades.map((t, i) => <option key={i} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">Urgency level</label>
            <div className="flex gap-2">
              {(['Standard', 'Urgent', 'Critical'] as const).map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setUrgency(level)}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all ${
                    urgency === level 
                      ? 'bg-[#c4864b] border-[#c4864b] text-white shadow-sm' 
                      : 'bg-white border-[#0f281e]/10 text-[#0f281e]/60 hover:bg-[#0f281e]/5'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">Material & Specification</label>
            <input 
              type="text" 
              value={material} 
              onChange={e => setMaterial(e.target.value)}
              placeholder="e.g., 2-inch PVC Sch 40 conduit pipes, 10ft sections"
              className="w-full bg-[#0f281e]/5 rounded-xl px-4 py-3 text-sm text-[#0f281e] outline-none border border-transparent focus:border-[#c4864b]/30"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">Quantity</label>
            <input 
              type="number" 
              value={quantity} 
              onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-full bg-[#0f281e]/5 rounded-xl px-4 py-3 text-sm text-[#0f281e] outline-none border border-transparent focus:border-[#c4864b]/30"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">Target Delivery Date</label>
            <input 
              type="date" 
              value={deliveryDate} 
              onChange={e => setDeliveryDate(e.target.value)}
              className="w-full bg-[#0f281e]/5 rounded-xl px-4 py-3 text-sm text-[#0f281e] outline-none border border-transparent focus:border-[#c4864b]/30"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">Purchasing Notes / Delivery details</label>
            <input 
              type="text" 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              placeholder="Specify delivery locations, backorder limits, or preferred supplier"
              className="w-full bg-[#0f281e]/5 rounded-xl px-4 py-3 text-sm text-[#0f281e] outline-none border border-transparent focus:border-[#c4864b]/30"
            />
          </div>

          {/* Workflow 5 Emergency Repair Switch */}
          <div className="flex items-center gap-3 bg-red-500/5 p-4 rounded-xl border border-red-500/10 md:col-span-3">
            <input 
              type="checkbox" 
              id="emergencyCheck"
              checked={isEmergency}
              onChange={e => setIsEmergency(e.target.checked)}
              className="rounded border-[#0f281e]/20 text-red-600 focus:ring-red-500"
            />
            <div className="text-xs">
              <label htmlFor="emergencyCheck" className="font-bold text-red-700 block">Flag as Emergency Repair Work</label>
              <span className="text-red-600/70 font-semibold block mt-0.5">Bypasses immediate PM approval queues under predefined emergency policy rules.</span>
            </div>
          </div>

          <div className="md:col-span-3 flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="bg-[#0f281e] text-white hover:bg-[#0f281e]/90 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
            >
              Submit Request
            </button>
          </div>
        </form>
      )}

      {/* Tab views */}
      {activeTab === 'procurement' && (
        <div className="bg-white border border-[#0f281e]/5 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#0f281e]/5 flex justify-between items-center">
            <h3 className="font-serif text-xl text-[#0f281e]">Material Orders & Procurement Feed</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0f281e]/5 text-[10px] uppercase tracking-wider text-[#0f281e]/60 font-bold border-b border-[#0f281e]/10">
                  <th className="px-6 py-4">ID / Urgency</th>
                  <th className="px-6 py-4">Project & Trade</th>
                  <th className="px-6 py-4">Material description</th>
                  <th className="px-6 py-4 text-center">Qty</th>
                  <th className="px-6 py-4">Est. Date</th>
                  <th className="px-6 py-4">Status Workflow</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0f281e]/5 text-sm text-[#0f281e]/80 font-medium">
                {requests
                  .filter(req => req.status !== 'Pending PM Approval')
                  .map((req) => (
                    <tr key={req.id} className="hover:bg-[#0f281e]/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold block text-xs text-[#0f281e]">{req.id}</span>
                        <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 ${
                          req.urgency === 'Critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                          req.urgency === 'Urgent' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                          'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}>
                          {req.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="block truncate max-w-[200px] text-xs font-bold">{req.project}</span>
                        <span className="text-[10px] text-[#0f281e]/55 tracking-wider block uppercase">{req.trade}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="block text-xs font-semibold">{req.material}</span>
                        {req.notes && <span className="text-[10px] text-[#0f281e]/50 italic block mt-0.5">{req.notes}</span>}
                      </td>
                      <td className="px-6 py-4 text-center font-bold">{req.quantity}</td>
                      <td className="px-6 py-4 text-xs font-semibold">{req.deliveryDate}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          req.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                          req.status === 'Scheduled' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' :
                          req.status === 'Ordered' ? 'bg-blue-500/10 text-blue-600 border-blue-200' :
                          req.status.includes('Emergency') ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleVerifyDelivery(req)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                              req.status === 'Delivered' 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/20' 
                                : 'bg-[#c4864b]/10 border-[#c4864b]/20 text-[#c4864b] hover:bg-[#c4864b]/20'
                            }`}
                          >
                            {req.status === 'Delivered' ? 'Verification details' : 'Verify delivery'}
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(req.id)}
                            className="p-1.5 text-red-500/60 hover:text-red-500 rounded hover:bg-red-500/5 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PM Approval Queue tab */}
      {activeTab === 'pm-queue' && (
        <div className="bg-white border border-[#0f281e]/5 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#0f281e]/5">
            <h3 className="font-serif text-xl text-[#0f281e]">PM Review & Approval Queue</h3>
            <p className="text-xs text-[#0f281e]/55 mt-0.5">Workflow 2: Project Managers review field requests, adjust items/quantities, and authorize procurement orders.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0f281e]/5 text-[10px] uppercase tracking-wider text-[#0f281e]/60 font-bold border-b border-[#0f281e]/10">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Site Details</th>
                  <th className="px-6 py-4">Material description</th>
                  <th className="px-6 py-4 text-center">Quantity</th>
                  <th className="px-6 py-4">Required Date</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0f281e]/5 text-sm text-[#0f281e]/80 font-medium">
                {requests
                  .filter(req => req.status === 'Pending PM Approval')
                  .map((req) => (
                    <tr key={req.id} className="hover:bg-[#0f281e]/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-xs">{req.id}</td>
                      <td className="px-6 py-4">
                        <span className="block text-xs font-bold">{req.project}</span>
                        <span className="text-[10px] text-[#0f281e]/55 tracking-wider block uppercase">{req.trade}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="block text-xs font-semibold">{req.material}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold">
                        {editingRequest?.id === req.id ? (
                          <input 
                            type="number" value={editQty}
                            onChange={e => setEditQty(Number(e.target.value))}
                            className="w-16 border rounded px-1 text-center py-0.5 text-xs outline-none"
                          />
                        ) : (
                          <span>{req.quantity}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold">{req.deliveryDate}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-2">
                          {editingRequest?.id === req.id ? (
                            <button
                              onClick={saveEditedRequest}
                              className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded hover:bg-emerald-500/20"
                              title="Save Changes"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEditQuantity(req)}
                              className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                              title="Edit quantities"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handlePmAction(req.id, 'Approve')}
                            className="px-3 py-1.5 bg-[#0f281e] text-white rounded-lg text-xs font-bold hover:bg-[#0f281e]/90"
                          >
                            Approve Order
                          </button>
                          <button
                            onClick={() => handlePmAction(req.id, 'Reject')}
                            className="p-1.5 text-red-500 hover:bg-red-500/5 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {requests.filter(req => req.status === 'Pending PM Approval').length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#0f281e]/40 font-bold">
                      No material requests currently awaiting PM review.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Site Inventory tab */}
      {activeTab === 'inventory' && (
        <div className="bg-white border border-[#0f281e]/5 rounded-2xl shadow-sm p-6 space-y-6">
          <div>
            <h3 className="font-serif text-xl text-[#0f281e]">Job Site Materials Inventory</h3>
            <p className="text-xs text-[#0f281e]/55 mt-0.5">Workflow 2 step 9: Material counts automatically increment when foreman registers delivery arrival logs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {inventory.map((inv, idx) => (
              <div key={idx} className="border border-[#0f281e]/10 p-5 rounded-2xl space-y-2 hover:border-[#c4864b]/30 transition-all">
                <span className="text-[9px] uppercase font-black tracking-widest text-[#0f281e]/40 block">Warehouse Stock</span>
                <h4 className="text-sm font-bold text-[#0f281e]">{inv.item}</h4>
                <div className="pt-2 border-t border-[#0f281e]/5 flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-[#0f281e]/50">On Hand:</span>
                  <span className="text-xl font-bold font-serif text-[#0f281e]">{inv.qtyOnHand} {inv.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification Dialog Modal */}
      {selectedVerifyRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <form onSubmit={submitVerification} className="bg-white rounded-[2rem] border border-[#0f281e]/10 shadow-2xl w-full max-w-xl p-8 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c4864b]/10 border border-[#c4864b]/20 mb-4 text-[#c4864b] text-[10px] font-bold uppercase tracking-widest">
                <Truck className="w-3.5 h-3.5" />
                Delivery Sign-Off System
              </div>
              <h3 className="font-serif text-2xl text-[#0f281e]">Verify Material Arrival</h3>
              <p className="text-xs text-[#0f281e]/60 mt-1">Submit visual and document proofs for order ID: <span className="font-bold text-[#0f281e]">{selectedVerifyRequest.id}</span></p>
            </div>

            <div className="space-y-4">
              <div className="bg-[#0f281e]/5 p-4 rounded-xl space-y-1">
                <div className="text-xs text-[#0f281e]/55">Order item:</div>
                <div className="text-sm font-bold text-[#0f281e]">{selectedVerifyRequest.quantity}x {selectedVerifyRequest.material}</div>
                <div className="text-xs font-semibold text-[#0f281e]/70">Site: {selectedVerifyRequest.project}</div>
              </div>

              {/* BOL file upload mock */}
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">Upload Bill of Lading (BOL)</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-[#0f281e]/5 border border-dashed border-[#0f281e]/20 rounded-xl px-4 py-3 text-xs font-medium text-[#0f281e]/60 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#c4864b]" />
                    <span>{bolUploadName || "BOL_8932_delivery.pdf"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBolUploadName("BOL_invoice_" + selectedVerifyRequest.id + ".pdf")}
                    className="px-4 py-3 bg-[#0f281e]/5 border border-[#0f281e]/10 rounded-xl hover:bg-[#0f281e]/10 text-xs font-bold uppercase text-[#0f281e]"
                  >
                    Simulate Upload
                  </button>
                </div>
              </div>

              {/* Delivery Photo capture mock */}
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">Upload Delivery Snapshot (Photo proof)</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-[#0f281e]/5 border border-dashed border-[#0f281e]/20 rounded-xl px-4 py-3 text-xs font-medium text-[#0f281e]/60 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#c4864b]" />
                    <span>{photoUploadName || "delivery_photo_at_gate.jpg"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhotoUploadName("arrival_proof_" + selectedVerifyRequest.id + ".jpg")}
                    className="px-4 py-3 bg-[#0f281e]/5 border border-[#0f281e]/10 rounded-xl hover:bg-[#0f281e]/10 text-xs font-bold uppercase text-[#0f281e]"
                  >
                    Snap Photo
                  </button>
                </div>
              </div>

              {/* Quantity match validation */}
              <div className="flex items-center gap-3 bg-[#0f281e]/5 p-3.5 rounded-xl border border-[#0f281e]/10">
                <input 
                  type="checkbox" 
                  id="qtyMatch" 
                  checked={verifyQtyMatch} 
                  onChange={e => setVerifyQtyMatch(e.target.checked)}
                  className="rounded border-[#0f281e]/20 text-[#c4864b] focus:ring-[#c4864b]"
                />
                <label htmlFor="qtyMatch" className="text-xs font-bold text-[#0f281e]/85">
                  Confirm count matches requested quantity ({selectedVerifyRequest.quantity})
                </label>
              </div>

              {/* Discrepancy details */}
              {!verifyQtyMatch && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Logging a quantity discrepancy will notify purchasing and alert accounting.</span>
                </div>
              )}

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">Verification Notes (e.g. damages, backorders)</label>
                <textarea
                  value={verificationNotes}
                  onChange={e => setVerificationNotes(e.target.value)}
                  placeholder="Note down any damaged pallets, backordered studs, or supplier notes."
                  className="w-full bg-[#0f281e]/5 rounded-xl px-4 py-3 text-xs text-[#0f281e] outline-none border border-transparent focus:border-[#c4864b]/30 h-20"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setSelectedVerifyRequest(null)}
                className="flex-1 py-3 rounded-xl uppercase tracking-widest text-[10px] font-black border border-[#0f281e]/10 text-[#0f281e]/60 hover:bg-[#fbf7f0] transition-all"
              >
                Close
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl uppercase tracking-widest text-[10px] font-black bg-[#0f281e] text-white hover:bg-[#0f281e]/90 transition-all shadow-lg"
              >
                Save Verification
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
