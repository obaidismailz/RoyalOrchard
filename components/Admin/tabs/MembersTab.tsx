import React, { useState } from 'react';
import { Printer, Download } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { handlePrintProfessionalReceipt } from '../utils/receiptPrinter';

export const MembersTab: React.FC = () => {
  const {
    bookings,
    members,
    addons,
    setSelectedBooking
  } = useAdmin();

  const [selectedMemberFilters, setSelectedMemberFilters] = useState<number[]>([]);

  let activeBookings = bookings.filter(b => b.userId !== null)
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

  if (selectedMemberFilters.length > 0) {
    activeBookings = activeBookings.filter(b => b.userId && selectedMemberFilters.includes(b.userId));
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col gap-4">
        <h2 className="font-serif text-3xl text-[#0f281e]">Client Bookings & Projects</h2>

        <div className="bg-white p-4 shadow-sm border border-[#0f281e]/5 rounded-[2rem] overflow-x-auto custom-scrollbar">
          {/* Pill filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-bold mr-2 flex items-center">Filter by Client:</span>
            {members.map(member => {
              const isSelected = selectedMemberFilters.includes(member.id);
              return (
                <button
                  key={member.id}
                  onClick={() => setSelectedMemberFilters(isSelected ? selectedMemberFilters.filter(id => id !== member.id) : [...selectedMemberFilters, member.id])}
                  className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${isSelected ? 'bg-[#c4864b] text-white' : 'bg-[#0f281e]/5 text-[#0f281e]/60 hover:bg-[#0f281e]/10'}`}
                >
                  {member.username}
                </button>
              );
            })}
            {members.length === 0 && <span className="text-xs text-[#0f281e]/40">No clients found.</span>}
          </div>

          <table className="min-w-full divide-y divide-[#0f281e]/5">
            <thead className="bg-[#fbf7f0]">
              <tr>
                <th className="px-4 py-2 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Client</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Date & Time</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Project Type</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Status</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Final Price</th>
                <th className="px-4 py-2 text-right text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#0f281e]/5">
              {activeBookings.map(b => (
                <tr
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className="hover:bg-[#fbf7f0]/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-2 text-sm font-bold text-[#0f281e]">{b.customerName}</td>
                  <td className="px-4 py-2 text-sm text-[#0f281e]">{b.date} {b.time}</td>
                  <td className="px-4 py-2 text-sm text-[#0f281e]">{b.courseType}</td>
                  <td className="px-4 py-2 text-sm text-[#0f281e]">{b.status}</td>
                  <td className="px-4 py-2 text-sm font-bold text-emerald-600">${b.totalPrice}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrintProfessionalReceipt(b, addons, 'print'); }}
                      className="text-[#0f281e]/20 hover:text-[#c4864b] transition-colors p-2"
                      title="Print Receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrintProfessionalReceipt(b, addons, 'download'); }}
                      className="text-[#0f281e]/20 hover:text-[#c4864b] transition-colors p-2"
                      title="Download Receipt"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {bookings.filter(b => b.userId !== null).length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-[#0f281e]/40">No client bookings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
