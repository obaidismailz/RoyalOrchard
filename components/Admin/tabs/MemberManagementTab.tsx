import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { Eye, Settings, Trash2, X } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { getSecureImageUrl } from '../../../utils/imageUrl';

export const MemberManagementTab: React.FC = () => {
  const {
    members,
    fetchMembers,
    currentUser,
    setDeletingId
  } = useAdmin();

  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [selectedMemberForView, setSelectedMemberForView] = useState<any | null>(null);

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editingMember, role: 'Member', logUsername: currentUser?.username })
    });

    const data = await res.json();
    if (res.ok) {
      toast.success(editingMember.id ? 'Member updated successfully' : 'Member added successfully');
      fetchMembers();
      setEditingMember(null);
    } else {
      toast.error(data.message || 'Failed to update member');
    }
  };

  const handleDeleteMember = (id: number) => {
    setDeletingId({ id, type: 'member' });
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-3xl text-[#0f281e]">Client Account Directory</h2>
        <button
          onClick={() => setEditingMember({ role: 'Member', permissions: [] })}
          className="bg-[#0f281e] text-[#dec099] px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] font-black hover:bg-[#c4864b] hover:text-white transition-all duration-300 shadow-lg border border-[#dec099]/10"
        >
          + Add Client Account
        </button>
      </div>

      <div className="bg-white shadow-sm border border-[#0f281e]/5 rounded-[2rem] overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-[#0f281e]/5">
          <thead className="bg-[#fbf7f0]">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest w-20">Profile</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Username</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Email</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Phone</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0f281e]/5">
            {members.map(u => (
              <tr key={u.id} className="hover:bg-[#fbf7f0]/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="w-10 h-10 rounded-2xl overflow-hidden bg-[#0f281e] flex items-center justify-center border border-[#dec099]/10 shadow-lg hover:scale-105 transition-transform">
                    {u.avatar ? (
                      <img
                        src={u.avatar.startsWith('data:') ? u.avatar : getSecureImageUrl(u.avatar)}
                        alt={u.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-[#dec099] font-serif text-lg uppercase leading-none">{u.username.charAt(0)}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-[#0f281e]">{u.username}</td>
                <td className="px-6 py-4 text-sm text-[#0f281e]">{u.email || '-'}</td>
                <td className="px-6 py-4 text-sm text-[#0f281e]">{u.phone || '-'}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedMemberForView(u); }}
                      className="p-2 text-[#0f281e]/40 hover:text-[#c4864b] transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingMember(u)} className="p-2 text-[#0f281e]/40 hover:text-[#c4864b] transition-colors"><Settings className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteMember(u.id)} className="p-2 text-[#0f281e]/40 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-[#0f281e]/40">No members found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editingMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md border-t-4 border-[#c4864b]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-2xl text-[#0f281e]">
                {editingMember.id ? 'Edit Client Account' : 'Add New Client Account'}
              </h3>
              <button onClick={() => setEditingMember(null)} className="text-[#0f281e]/40 hover:text-[#0f281e]">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/60 mb-2 font-bold">Username</label>
                <input
                  type="text"
                  required
                  value={editingMember.username || ''}
                  onChange={e => setEditingMember({ ...editingMember, username: e.target.value })}
                  className="w-full border-b border-[#0f281e]/10 py-2 focus:border-[#c4864b] outline-none transition-colors"
                  placeholder="e.g. Junaid Ahmed"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/60 mb-2 font-bold">Email</label>
                <input
                  type="email"
                  required
                  value={editingMember.email || ''}
                  onChange={e => setEditingMember({ ...editingMember, email: e.target.value })}
                  className="w-full border-b border-[#0f281e]/10 py-2 focus:border-[#c4864b] outline-none transition-colors"
                  placeholder="junaid@example.com"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/60 mb-2 font-bold">Phone</label>
                <input
                  type="tel"
                  value={editingMember.phone || ''}
                  onChange={e => setEditingMember({ ...editingMember, phone: e.target.value })}
                  className="w-full border-b border-[#0f281e]/10 py-2 focus:border-[#c4864b] outline-none transition-colors"
                  placeholder="0312-3456789"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/60 mb-2 font-bold">
                  {editingMember.id ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  required={!editingMember.id}
                  value={editingMember.password || ''}
                  onChange={e => setEditingMember({ ...editingMember, password: e.target.value })}
                  className="w-full border-b border-[#0f281e]/10 py-2 focus:border-[#c4864b] outline-none transition-colors"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="flex-1 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold border border-[#0f281e]/10 text-[#0f281e]/60 hover:bg-[#fbf7f0] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold bg-[#0f281e] text-[#dec099] hover:bg-[#c4864b] hover:text-white transition-all shadow-lg"
                >
                  Save Client Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member View Modal */}
      <AnimatePresence>
        {selectedMemberForView && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
              onClick={() => setSelectedMemberForView(null)}
            />

            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{
                scale: 1, y: 0, opacity: 1,
                transition: { type: "spring", stiffness: 300, damping: 30 }
              }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative z-10 w-full max-w-lg bg-[#0f281e] rounded-[2.5rem] shadow-2xl border border-[#dec099]/10 overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c4864b] to-transparent opacity-30" />

              <div className="p-10 pb-6 relative text-center flex flex-col items-center">
                <button
                  onClick={() => setSelectedMemberForView(null)}
                  className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-all border border-white/5"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#dec099]/5 border border-[#dec099]/10 mb-8">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[#dec099]">Client Portfolio</span>
                </div>

                <div className="relative w-32 h-32 mb-6">
                  <div className="absolute inset-0 bg-[#c4864b]/20 rounded-[2rem] blur-2xl animate-pulse" />
                  <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden border-2 border-[#dec099]/20 bg-gradient-to-br from-[#0f281e] to-black shadow-2xl">
                    {selectedMemberForView.avatar ? (
                      <img
                        src={selectedMemberForView.avatar.startsWith('data:') ? selectedMemberForView.avatar : getSecureImageUrl(selectedMemberForView.avatar)}
                        alt={selectedMemberForView.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#0f281e]">
                        <span className="text-[#dec099] font-serif text-5xl uppercase">{selectedMemberForView.username.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <h2 className="font-serif text-4xl text-white mb-2 leading-tight tracking-tight">
                  {selectedMemberForView.username}
                </h2>
                <div className="inline-block px-3 py-1 rounded-lg bg-white/5 text-[#dec099]/60 text-[10px] font-black uppercase tracking-widest border border-white/5">
                  Client Account ID: #{(selectedMemberForView.id % 1000).toString().padStart(3, '0')}
                </div>
              </div>

              <div className="p-10 pt-4 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl group hover:bg-white/[0.05] transition-colors">
                    <span className="text-[10px] uppercase tracking-widest text-[#dec099]/40 font-bold block mb-1">Email Address</span>
                    <p className="text-md text-white font-sans">{selectedMemberForView.email || 'No email provided'}</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl group hover:bg-white/[0.05] transition-colors">
                    <span className="text-[10px] uppercase tracking-widest text-[#dec099]/40 font-bold block mb-1">Phone Number</span>
                    <p className="text-md text-white font-sans">{selectedMemberForView.phone || 'No phone provided'}</p>
                  </div>
                </div>
              </div>

              <div className="p-10 pt-0 mt-auto">
                <button
                  onClick={() => setSelectedMemberForView(null)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white py-4 rounded-xl uppercase tracking-[0.3em] text-[10px] font-bold transition-all border border-white/5"
                >
                  Exit Portfolio
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
