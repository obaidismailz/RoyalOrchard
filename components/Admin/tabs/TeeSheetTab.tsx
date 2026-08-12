import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Calendar, Trash2, Search, Users, Clock4, Printer, Download, Trophy
} from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { STATUS_OPTIONS, Booking } from '../types';
import { handlePrintProfessionalReceipt, handlePrintPlayerReceipt } from '../utils/receiptPrinter';

export const TeeSheetTab: React.FC = () => {
  const {
    bookings,
    addons,
    courses,
    setSelectedBooking,
    handleStatusChange,
    handleOpenScorecard,
    setDeletingId
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [typewriterPlaceholder, setTypewriterPlaceholder] = useState('Search by name');

  // Typewriter effect for search placeholder
  useEffect(() => {
    const words = ['name', 'email', 'date'];
    let wordIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeoutId: any;

    const type = () => {
      const currentWord = words[wordIdx];
      const prefix = "Search by ";

      if (isDeleting) {
        setTypewriterPlaceholder(prefix + currentWord.substring(0, charIdx - 1));
        charIdx--;
      } else {
        setTypewriterPlaceholder(prefix + currentWord.substring(0, charIdx + 1));
        charIdx++;
      }

      let speed = isDeleting ? 40 : 80;

      if (!isDeleting && charIdx >= currentWord.length) {
        speed = 500;
        isDeleting = true;
      } else if (isDeleting && charIdx <= 0) {
        isDeleting = false;
        wordIdx = (wordIdx + 1) % words.length;
        speed = 500;
      }

      timeoutId = setTimeout(type, speed);
    };

    timeoutId = setTimeout(type, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  const parseDBDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    if (dateStr.includes(' ') && !dateStr.includes('T')) {
      return parseISO(dateStr.replace(' ', 'T') + 'Z');
    }
    return parseISO(dateStr);
  };

  const filteredBookings = bookings
    .filter(b =>
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.email && b.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.date && b.date.includes(searchTerm))
    )
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

  const handleDownloadProjectSchedule = (action: 'print' | 'download' = 'download') => {
    // @ts-ignore
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');

    const goldColor = [196, 134, 75]; // #c4864b
    const darkGreen = [15, 40, 30]; // #0f281e

    const img = new Image();
    img.src = '/log.png';
    try {
      doc.addImage(img, 'PNG', 148.5 - 12.5, 10, 25, 20);
    } catch (e) {
      console.error('Logo failed to load for Project Schedule', e);
    }

    doc.setFontSize(22);
    doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
    doc.text('PONOS HOME IMPROVEMENT, LTD', 148.5, 40, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.text('COMPREHENSIVE PROJECT SCHEDULE', 148.5, 50, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 148.5, 56, { align: 'center' });
    if (searchTerm) {
      doc.text(`Filter: "${searchTerm}"`, 148.5, 61, { align: 'center' });
    }

    const getEnhancementNames = (addonsJson?: string) => {
      if (!addonsJson) return 'None';
      try {
        const ids = JSON.parse(addonsJson) as number[];
        if (ids.length === 0) return 'None';
        const names = ids.map(id => addons.find(a => a.id === id)?.name || `Addon ${id}`);
        const counts: Record<string, number> = {};
        names.forEach(name => {
          counts[name] = (counts[name] || 0) + 1;
        });
        return Object.entries(counts).map(([name, count]) => {
          if (count > 1) {
            return `${count}x ${name}`;
          }
          return name;
        }).join(', ');
      } catch (e) {
        return 'None';
      }
    };

    let totalSum = 0;

    const tableData = filteredBookings.map(b => {
      const price = b.totalPrice || 0;
      if (b.status.toUpperCase() !== 'CANCELLED') {
        totalSum += price;
      }
      return [
        b.customerName,
        b.email || 'N/A',
        b.phone || 'N/A',
        b.courseType,
        b.date,
        b.time,
        b.guests,
        getEnhancementNames(b.selectedAddons),
        `$${price.toLocaleString()}`,
        b.status.toUpperCase()
      ];
    });

    tableData.push([
      '', '', '', '', '', '', '',
      'GRAND TOTAL:',
      `$${totalSum.toLocaleString()}`,
      ''
    ]);

    // @ts-ignore
    doc.autoTable({
      startY: 70,
      head: [['Customer', 'Email', 'Phone', 'Project Type', 'Date', 'Time', 'Crew Size', 'Upgrades', 'Total Price', 'Status']],
      body: tableData,
      headStyles: { fillColor: darkGreen, textColor: [222, 192, 153], fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      theme: 'striped',
      margin: { left: 10, right: 10 }
    });

    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY || 150;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('This is an official project schedule report from the Ponos Home Improvement Admin Panel.', 148.5, finalY + 20, { align: 'center' });

    if (action === 'print') {
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    } else {
      doc.save(`ProjectSchedule_${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

  const handleDelete = (id: number) => {
    setDeletingId({ id, type: 'booking' });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="font-serif text-3xl text-[#0f281e]">Project Schedule</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleDownloadProjectSchedule('print')}
              className="bg-white px-5 py-2.5 border border-[#0f281e]/10 text-[#0f281e]/60 hover:text-[#c4864b] hover:border-[#c4864b]/30 hover:bg-[#fbf7f0] transition-all duration-300 rounded-full flex items-center gap-2 shadow-sm hover:shadow-md"
              title="Print Project Schedule"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-[0.1em] font-black">Print</span>
            </button>
            <button
              onClick={() => handleDownloadProjectSchedule('download')}
              className="bg-white px-5 py-2.5 border border-[#0f281e]/10 text-[#0f281e]/60 hover:text-[#c4864b] hover:border-[#c4864b]/30 hover:bg-[#fbf7f0] transition-all duration-300 rounded-full flex items-center gap-2 shadow-sm hover:shadow-md"
              title="Download Project Schedule PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-[0.1em] font-black">Download</span>
            </button>
          </div>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="pointer-events-none absolute left-5 top-1/2 z-10 -translate-y-1/2 w-4 h-4 text-[#0f281e]/30 group-focus-within:text-[#c4864b] transition-colors" />
          <input
            type="text"
            placeholder={typewriterPlaceholder}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-white border border-[#0f281e]/10 rounded-full focus:ring-2 focus:ring-[#c4864b]/20 focus:border-[#c4864b] outline-none text-sm transition-all shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      <div className="bg-white shadow-sm border border-[#0f281e]/5 rounded-[2rem] overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-[#0f281e]/5">
          <thead className="bg-[#fbf7f0]">
            <tr>
              <th className="px-8 py-4 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Customer</th>
              <th className="px-8 py-4 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Project Type</th>
              <th className="px-8 py-4 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Date & Time</th>
              <th className="px-8 py-4 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Crew Size</th>
              <th className="px-8 py-4 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Status</th>
              <th className="px-8 py-4 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Booked On</th>
              <th className="px-8 py-4 text-right text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#0f281e]/5">
            {filteredBookings.map((booking) => (
              <tr
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                className="hover:bg-[#fbf7f0]/50 transition-colors cursor-pointer"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-sm font-bold text-[#0f281e]">{booking.customerName}</div>
                    {booking.adminCreated === 1 && (
                      <span className="px-2 py-1 rounded-full bg-[#c4864b]/10 text-[#c4864b] border border-[#c4864b]/20 text-[9px] uppercase tracking-widest font-black">
                        Made by Admin
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#0f281e]/50 mt-1">{booking.email}</div>
                  <div className="text-[10px] text-[#0f281e]/50">{booking.phone}</div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-xs text-[#0f281e] font-medium">{booking.courseType}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center text-xs text-[#0f281e] font-bold">
                    <Calendar className="w-3 h-3 mr-2 text-[#c4864b]" />
                    {booking.date}
                  </div>
                  <div className="flex items-center text-[10px] text-[#0f281e]/50 mt-1">
                    <Clock4 className="w-3 h-3 mr-2" />
                    {booking.time}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-[#0f281e]/30" />
                    <span className="text-xs font-bold">{booking.guests}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <select
                    value={booking.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                    className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border-none outline-none cursor-pointer ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'checked-in' ? 'bg-blue-100 text-blue-700' :
                        booking.status === 'on-course' ? 'bg-emerald-100 text-emerald-700' :
                          booking.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-orange-100 text-orange-700'
                      }`}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-8 py-6">
                  {booking.createdAt ? (
                    <>
                      <div className="flex items-center text-xs text-[#0f281e] font-bold">
                        <Calendar className="w-3 h-3 mr-2 text-[#c4864b]" />
                        {format(parseDBDate(booking.createdAt), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center text-[10px] text-[#0f281e]/50 mt-1">
                        <Clock4 className="w-3 h-3 mr-2" />
                        {format(parseDBDate(booking.createdAt), 'HH:mm')}
                      </div>
                    </>
                  ) : (
                    <span className="text-[10px] text-[#0f281e]/30 italic">N/A</span>
                  )}
                </td>
                <td className="px-8 py-6 text-right">
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrintProfessionalReceipt(booking, addons, 'print'); }}
                    className="text-[#0f281e]/20 hover:text-[#c4864b] transition-colors p-2"
                    title="Print Professional Receipt"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrintProfessionalReceipt(booking, addons, 'download'); }}
                    className="text-[#0f281e]/20 hover:text-[#c4864b] transition-colors p-2"
                    title="Download Receipt PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenScorecard(booking); }}
                    className="text-[#0f281e]/20 hover:text-emerald-600 transition-colors p-2"
                    title="Progress Checklist"
                  >
                    <Trophy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(booking.id); }}
                    className="text-[#0f281e]/20 hover:text-red-600 transition-colors p-2"
                    title="Delete Booking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan={7} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Search className="w-12 h-12 text-[#0f281e]/10" />
                    <p className="text-sm text-[#0f281e]/40 font-light italic">No project schedules found matching your criteria</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
