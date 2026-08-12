import React, { useState } from 'react';
import { useAdmin } from '../AdminContext';
import { Addon } from '../types';

export const EnhancementsTab: React.FC = () => {
  const {
    addons,
    fetchAddons,
    currentUser,
    setDeletingId
  } = useAdmin();

  const [editingAddon, setEditingAddon] = useState<Partial<Addon> | null>(null);

  const handleUpdateAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddon) return;

    const res = await fetch('/api/addons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editingAddon, username: currentUser?.username })
    });

    if (res.ok) {
      fetchAddons();
      setEditingAddon(null);
    }
  };

  const handleDeleteAddon = (id: number) => {
    setDeletingId({ id, type: 'addon' });
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-serif text-3xl text-[#0f281e]">Materials & Upgrades Catalog</h2>
        <button
          onClick={() => setEditingAddon({ name: '', price: 0, icon: '✨', description: '', isAvailable: 1 })}
          className="bg-[#0f281e] text-[#dec099] px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] font-black hover:bg-[#c4864b] hover:text-white transition-all duration-300 shadow-lg border border-[#dec099]/10"
        >
          + Add Upgrade Option
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addons.map(addon => (
          <div key={addon.id} className="bg-white p-6 shadow-sm border border-[#0f281e]/5 rounded-[2rem] flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{addon.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif text-lg text-[#0f281e]">{addon.name}</h4>
                  {(addon.isAvailable === 0 || addon.isAvailable === false) && (
                    <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Unavailable</span>
                  )}
                </div>
                <p className="text-[10px] uppercase tracking-widest text-[#0f281e]/40">{addon.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className="font-serif text-xl text-[#c4864b]">{addon.price}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingAddon(addon)}
                  className="text-[10px] uppercase tracking-widest text-[#c4864b] font-bold hover:text-[#0f281e]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAddon(addon.id)}
                  className="text-[10px] uppercase tracking-widest text-red-500 font-bold hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingAddon && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md border-t-4 border-[#c4864b]">
            <h3 className="font-serif text-2xl text-[#0f281e] mb-6">
              {editingAddon.id ? 'Update' : 'Add'} Upgrade Option
            </h3>
            <form onSubmit={handleUpdateAddon} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/60 mb-2 font-bold">Name</label>
                  <input
                    type="text"
                    value={editingAddon.name || ''}
                    onChange={e => setEditingAddon({ ...editingAddon, name: e.target.value })}
                    className="w-full border-b border-[#0f281e]/10 py-2 focus:border-[#c4864b] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/60 mb-2 font-bold">Icon (Emoji)</label>
                  <input
                    type="text"
                    value={editingAddon.icon || ''}
                    onChange={e => setEditingAddon({ ...editingAddon, icon: e.target.value })}
                    className="w-full border-b border-[#0f281e]/10 py-2 focus:border-[#c4864b] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/60 mb-2 font-bold">Price</label>
                <input
                  type="number"
                  value={editingAddon.price || 0}
                  onChange={e => setEditingAddon({ ...editingAddon, price: parseInt(e.target.value) || 0 })}
                  className="w-full border-b border-[#0f281e]/10 py-2 focus:border-[#c4864b] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/60 mb-2 font-bold">Description</label>
                <input
                  type="text"
                  value={editingAddon.description || ''}
                  onChange={e => setEditingAddon({ ...editingAddon, description: e.target.value })}
                  className="w-full border-b border-[#0f281e]/10 py-2 focus:border-[#c4864b] outline-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={editingAddon.isAvailable !== 0 && editingAddon.isAvailable !== false}
                  onChange={e => setEditingAddon({ ...editingAddon, isAvailable: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 text-[#c4864b] border-[#0f281e]/10 rounded focus:ring-[#c4864b]"
                />
                <label htmlFor="isAvailable" className="text-sm text-[#0f281e]/80">Available for catalog selection</label>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingAddon(null)}
                  className="flex-1 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold border border-[#0f281e]/10 text-[#0f281e]/60 hover:bg-[#fbf7f0] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0f281e] text-[#dec099] py-3 rounded-full uppercase tracking-widest text-[10px] font-bold hover:bg-[#c4864b] hover:text-white transition-all shadow-lg"
                >
                  Save Upgrade Option
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
