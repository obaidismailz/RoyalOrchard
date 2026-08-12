import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { 
  Plus, Settings, Trash2, X, Lock
} from 'lucide-react';
import { clientService, ClientPayload } from '../utils/services/clientService';

export const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any>({});

  const handleEditClick = async (c: any) => {
    setValidationErrors({});
    setEditingClient(c);
    if (!c?.id) return;
    setIsLoadingDetails(true);
    try {
      const res = await clientService.getClientDetails(c.id);
      if (res.success && res.data) {
        setEditingClient(res.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch client details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const res = await clientService.getClients();
      if (res.success && res.data) {
        const rawItems = Array.isArray(res.data) ? res.data : (res.data.items || []);
        // Sort by ID or name since sort_order is not used
        const sorted = [...rawItems].sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
        setClients(sorted);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to fetch clients.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    setIsSubmitLoading(true);
    setValidationErrors({});

    const payload: ClientPayload = {
      name: editingClient.name || '',
      contact_name: editingClient.contact_name || '',
      email: editingClient.email || '',
      phone: editingClient.phone || '',
      address: editingClient.address || ''
    };

    try {
      let res;
      if (editingClient.id) {
        res = await clientService.updateClient(editingClient.id, payload);
      } else {
        res = await clientService.createClient(payload);
      }

      if (res.success) {
        toast.success(res.message || 'Client saved successfully.');
        setEditingClient(null);
        fetchClients();
      } else {
        if (res.errors) {
          setValidationErrors(res.errors);
        }
        throw new Error(res.message || 'Failed to save client.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number | string, label: string) => {
    if (!window.confirm(`Are you sure you want to delete "${label}"?`)) return;

    try {
      const res = await clientService.deleteClient(id);
      if (res.success) {
        toast.success(res.message || 'Client deleted successfully.');
        fetchClients();
      } else {
        toast.error(res.message || 'Failed to delete client.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete client.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-serif text-2xl text-[#0f281e]">Client Directory</h3>
          <p className="text-[#0f281e]/60 text-xs mt-1">Configure client profiles and accounts available for project allocations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setValidationErrors({});
              setEditingClient({
                name: '',
                contact_name: '',
                email: '',
                phone: '',
                address: ''
              });
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#c4864b] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#b57a44] transition-all shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Client
          </button>
        </div>
      </div>

      {isLoading && clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-[#0f281e]/5">
          <div className="h-8 w-8 rounded-full border-4 border-[#c4864b] border-t-transparent animate-spin" />
          <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-[#0f281e]/60">Loading options...</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-[#0f281e]/5 rounded-[2rem] overflow-hidden">
          <div className="p-5 border-b border-[#0f281e]/5 bg-[#fbf7f0] grid grid-cols-12 text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">
            <div className="col-span-3">Client Name</div>
            <div className="col-span-3">Contact Person</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-1">Phone</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-[#0f281e]/5">
            <AnimatePresence initial={false}>
              {clients.map((c) => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="p-5 grid grid-cols-12 items-center hover:bg-[#fbf7f0]/40 transition-colors"
                >
                  <div className="col-span-3 font-bold text-[#0f281e] break-all pr-2">
                    {c.name}
                  </div>

                  <div className="col-span-3 text-sm text-[#0f281e]/85 break-all pr-2">
                    {c.contact_name}
                  </div>

                  <div className="col-span-3 text-xs font-mono text-[#0f281e]/60 break-all pr-2">
                    {c.email}
                  </div>

                  <div className="col-span-1 text-xs font-mono text-[#0f281e]/70 break-all pr-2">
                    {c.phone}
                  </div>

                  <div className="col-span-2 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleEditClick(c)}
                      className="p-2 text-[#0f281e]/40 hover:text-[#c4864b] transition-colors cursor-pointer"
                      title="Edit Profile"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name || '')}
                      disabled={!!c.is_system}
                      className={`p-2 transition-colors ${c.is_system ? 'text-gray-200 cursor-not-allowed' : 'text-[#0f281e]/40 hover:text-red-500 cursor-pointer'}`}
                      title={c.is_system ? "System locked" : "Delete Option"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingClient && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 backdrop-blur-sm bg-black/55">
            <button
              type="button"
              onClick={() => setEditingClient(null)}
              className="absolute inset-0 h-full w-full cursor-default bg-transparent border-0"
              aria-label="Close"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl text-left"
            >
              <div className="relative overflow-hidden bg-[#0f281e] px-6 py-6 text-white">
                {isLoadingDetails && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#c4864b] animate-pulse" />
                )}
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-2xl">
                      {editingClient.id ? 'Edit Client Profile' : 'Create Client Profile'}
                    </h3>
                    <p className="mt-1 text-xs text-white/45">
                      Configure company name, contact details and email address.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingClient(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateOrUpdate} className="space-y-4 p-6 sm:p-8">
                <div>
                  <label htmlFor="name" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Client / Company Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={editingClient.name || ''}
                    onChange={e => setEditingClient({ ...editingClient, name: e.target.value })}
                    placeholder="e.g. FDHL"
                    className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                  />
                  {validationErrors.name && (
                    <p className="mt-1.5 text-[10px] font-bold text-red-500">{validationErrors.name[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact_name" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Contact Person Name</label>
                  <input
                    id="contact_name"
                    type="text"
                    required
                    value={editingClient.contact_name || ''}
                    onChange={e => setEditingClient({ ...editingClient, contact_name: e.target.value })}
                    placeholder="e.g. Zahid Rafique"
                    className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                  />
                  {validationErrors.contact_name && (
                    <p className="mt-1.5 text-[10px] font-bold text-red-500">{validationErrors.contact_name[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={editingClient.email || ''}
                    onChange={e => setEditingClient({ ...editingClient, email: e.target.value })}
                    placeholder="e.g. client@example.org"
                    className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                  />
                  {validationErrors.email && (
                    <p className="mt-1.5 text-[10px] font-bold text-red-500">{validationErrors.email[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Phone Number</label>
                  <input
                    id="phone"
                    type="text"
                    required
                    value={editingClient.phone || ''}
                    onChange={e => setEditingClient({ ...editingClient, phone: e.target.value })}
                    placeholder="e.g. 03030678955"
                    className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                  />
                  {validationErrors.phone && (
                    <p className="mt-1.5 text-[10px] font-bold text-red-500">{validationErrors.phone[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="address" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Address</label>
                  <input
                    id="address"
                    type="text"
                    value={editingClient.address || ''}
                    onChange={e => setEditingClient({ ...editingClient, address: e.target.value })}
                    placeholder="e.g. Capital Smart City Lahore"
                    className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                  />
                  {validationErrors.address && (
                    <p className="mt-1.5 text-[10px] font-bold text-red-500">{validationErrors.address[0]}</p>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-[#0f281e]/5 pt-5 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setEditingClient(null)}
                    className="flex-1 rounded-xl border border-[#0f281e]/10 py-3 text-[10px] font-black uppercase tracking-widest text-[#0f281e]/50 transition-colors hover:bg-[#0f281e]/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitLoading}
                    className="flex-[1.35] rounded-xl bg-[#c4864b] py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[#b5773f] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitLoading ? 'Saving...' : 'Confirm'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
