import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { useAdmin } from '../AdminContext';

export const PricingTab: React.FC = () => {
  const {
    pricing,
    courses,
    fetchPricing,
    currentUser,
    setDeletingId
  } = useAdmin();

  const [editingPrice, setEditingPrice] = useState<{ id?: number, courseId: number, time: string, price: number, discount?: number } | null>(null);

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrice) return;

    const res = await fetch('/api/pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editingPrice, username: currentUser?.username })
    });

    if (res.ok) {
      fetchPricing();
      setEditingPrice(null);
    }
  };

  const handleDeletePrice = (id: number) => {
    setDeletingId({ id, type: 'pricing' });
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-serif text-3xl text-[#0f281e]">Labor & Booking Rates</h2>
        <p className="text-sm text-[#0f281e]/60">Manage base scheduling rates and discounts for project time slots</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {courses.map(course => (
          <div key={course.id} className="bg-white p-8 shadow-sm border border-[#0f281e]/5 rounded-[2rem]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-xl text-[#0f281e]">{course.name}</h3>
              <button
                onClick={() => setEditingPrice({ courseId: course.id, time: '07:00', price: 100 })}
                className="bg-[#0f281e] text-[#dec099] px-6 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] font-black hover:bg-[#c4864b] hover:text-white transition-all duration-300 shadow-lg border border-[#dec099]/10"
              >
                + Add Time Slot
              </button>
            </div>
            <div className="space-y-4">
              {pricing.filter(p => p.courseId === course.id).sort((a, b) => a.time.localeCompare(b.time)).map(p => (
                <div key={p.id} className="flex justify-between items-center p-4 bg-[#fbf7f0]/50 rounded-[2rem] border border-[#0f281e]/5">
                  <div className="flex items-center gap-4">
                    <Clock className="w-4 h-4 text-[#c4864b]" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#0f281e]">
                        {(() => {
                          try {
                            const [h, m] = p.time.split(':');
                            const hour = parseInt(h, 10);
                            const ampm = hour >= 12 ? 'pm' : 'am';
                            const displayHour = hour % 12 || 12;
                            return `${displayHour}:${m} ${ampm}`;
                          } catch {
                            return p.time;
                          }
                        })()}
                      </span>
                      {p.discount && p.discount > 0 ? (
                        <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">💚 {p.discount} OFF</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-serif text-[#0f281e] block">${p.price}</span>
                      {p.discount && p.discount > 0 ? (
                        <span className="text-[10px] text-[#0f281e]/40 line-through block">${p.price + p.discount}</span>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingPrice({ id: p.id, courseId: p.courseId, time: p.time, price: p.price, discount: p.discount || 0 })}
                        className="text-[10px] uppercase tracking-widest text-[#c4864b] font-bold hover:text-[#0f281e] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePrice(p.id)}
                        className="text-[10px] uppercase tracking-widest text-red-500 font-bold hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editingPrice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md border-t-4 border-[#c4864b]">
            <h3 className="font-serif text-2xl text-[#0f281e] mb-6">
              {editingPrice.id ? 'Update' : 'Add'} Time Slot Rate
            </h3>
            <form onSubmit={handleUpdatePrice} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/60 mb-2 font-bold">Time Slot</label>
                <input
                  type="time"
                  value={editingPrice.time}
                  onChange={e => setEditingPrice({ ...editingPrice, time: e.target.value })}
                  className="w-full border-b border-[#0f281e]/10 py-2 focus:border-[#c4864b] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/60 mb-2 font-bold">Price</label>
                <input
                  type="number"
                  value={editingPrice.price}
                  onChange={e => setEditingPrice({ ...editingPrice, price: parseInt(e.target.value) || 0 })}
                  className="w-full border-b border-[#0f281e]/10 focus:border-[#c4864b] outline-none py-2 transition-colors"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/60 mb-2 font-bold">Discount</label>
                <input
                  type="number"
                  value={editingPrice.discount || 0}
                  onChange={e => setEditingPrice({ ...editingPrice, discount: parseInt(e.target.value) || 0 })}
                  className="w-full border-b border-[#0f281e]/10 focus:border-[#c4864b] outline-none py-2 transition-colors"
                />
                <p className="text-[9px] text-[#0f281e]/40 mt-1 italic">Leave 0 if no discount is applied.</p>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingPrice(null)}
                  className="flex-1 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold border border-[#0f281e]/10 text-[#0f281e]/60 hover:bg-[#fbf7f0] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold bg-[#0f281e] text-[#dec099] hover:bg-[#c4864b] hover:text-white transition-all shadow-lg"
                >
                  {editingPrice.id ? 'Update' : 'Save'} Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
