import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Printer, Download } from 'lucide-react';
import { useAdmin } from '../AdminContext';

export const InvoicesTab: React.FC = () => {
  const { bookings } = useAdmin();
  const [invoiceFilter, setInvoiceFilter] = useState<'daily' | 'monthly' | 'yearly'>('daily');

  const handleDownloadInvoice = (period: string, action: 'print' | 'download' = 'download') => {
    // @ts-ignore
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const goldColor = [196, 134, 75]; // #c4864b
    const darkGreen = [15, 40, 30]; // #0f281e

    const img = new Image();
    img.src = '/log.png';
    try {
      doc.addImage(img, 'PNG', 105 - 12.5, 10, 25, 20);
    } catch (e) {
      console.error('Logo failed to load for Invoice', e);
    }

    doc.setFontSize(22);
    doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
    doc.text('PONOS HOME IMPROVEMENT, LTD', 105, 40, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.text(`FINANCIAL INVOICE: ${period}`, 105, 50, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Report Type: ${invoiceFilter.toUpperCase()}`, 105, 56, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 61, { align: 'center' });

    const filteredPeriodBookings = bookings.filter(b => {
      if (b.status === 'cancelled') return false;
      const createdDateStr = b.createdAt ? b.createdAt.substring(0, 10) : b.date;
      if (invoiceFilter === 'daily') return createdDateStr === period;
      if (invoiceFilter === 'monthly') return createdDateStr.substring(0, 7) === period;
      if (invoiceFilter === 'yearly') return createdDateStr.substring(0, 4) === period;
      return false;
    });

    const tableData = filteredPeriodBookings.map(b => [
      b.customerName,
      b.email || 'N/A',
      `${(b.basePrice || b.totalPrice || 0) - (b.enhancementsPrice || 0)}`,
      `${b.enhancementsPrice || 0}`,
      `${Math.max(0, (b.basePrice || b.totalPrice || 0) - (b.totalPrice || 0))}`,
      `${b.totalPrice || 0}`
    ]);

    const totals = filteredPeriodBookings.reduce((acc, b) => {
      acc.base += ((b.basePrice || b.totalPrice || 0) - (b.enhancementsPrice || 0));
      acc.enhancements += (b.enhancementsPrice || 0);
      acc.discount += Math.max(0, (b.basePrice || b.totalPrice || 0) - (b.totalPrice || 0));
      acc.total += (b.totalPrice || 0);
      return acc;
    }, { base: 0, enhancements: 0, discount: 0, total: 0 });

    // @ts-ignore
    doc.autoTable({
      startY: 70,
      head: [['Client Name', 'Email', 'Base Contract', 'Upgrades Catalog', 'Discount', 'Final Total']],
      body: [
        ...tableData,
        [
          { content: 'CUMULATIVE TOTALS', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [251, 247, 240] } },
          { content: `${totals.base}`, styles: { fontStyle: 'bold', fillColor: [251, 247, 240] } },
          { content: `${totals.enhancements}`, styles: { fontStyle: 'bold', fillColor: [251, 247, 240] } },
          { content: `${totals.discount}`, styles: { fontStyle: 'bold', fillColor: [251, 247, 240] } },
          { content: `${totals.total}`, styles: { fontStyle: 'bold', fillColor: [251, 247, 240], textColor: [16, 128, 80] } }
        ]
      ],
      headStyles: { fillColor: darkGreen, textColor: [222, 192, 153], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      theme: 'striped'
    });

    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY || 150;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('This is an automatically generated financial report from the Ponos Home Improvement Admin Panel.', 105, finalY + 20, { align: 'center' });

    if (action === 'print') {
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    } else {
      doc.save(`Ponos_Invoice_${period}.pdf`);
    }
  };

  const invoiceGroups: Record<string, { bookings: number, basePrice: number, enhancements: number, finalPrice: number, discount: number }> = {};
  bookings.forEach(b => {
    if (b.status === 'cancelled') return;
    let key = '';
    const createdDateStr = b.createdAt ? b.createdAt.substring(0, 10) : b.date;
    if (invoiceFilter === 'daily') key = createdDateStr;
    if (invoiceFilter === 'monthly') key = createdDateStr.substring(0, 7);
    if (invoiceFilter === 'yearly') key = createdDateStr.substring(0, 4);

    if (!invoiceGroups[key]) invoiceGroups[key] = { bookings: 0, basePrice: 0, finalPrice: 0, discount: 0, enhancements: 0 };
    const bTotal = b.totalPrice || 0;
    const bBase = b.basePrice || bTotal;
    const bEnhancements = b.enhancementsPrice || 0;

    invoiceGroups[key].bookings += 1;
    invoiceGroups[key].finalPrice += bTotal;
    invoiceGroups[key].enhancements += bEnhancements;
    invoiceGroups[key].basePrice += (bBase - bEnhancements);
    invoiceGroups[key].discount += Math.max(0, bBase - bTotal);
  });

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="font-serif text-3xl text-[#0f281e]">Financial Invoices</h2>
          <div className="bg-[#0f281e]/5 p-1 rounded-full flex gap-1 relative border border-[#0f281e]/5">
            {(['daily', 'monthly', 'yearly'] as const).map(f => {
              const isActive = invoiceFilter === f;
              return (
                <button
                  key={f}
                  onClick={() => setInvoiceFilter(f)}
                  className={`relative px-6 py-2.5 uppercase tracking-[0.2em] text-[10px] font-black transition-colors duration-300 z-10 rounded-full ${isActive ? 'text-[#dec099]' : 'text-[#0f281e]/40 hover:text-[#0f281e]'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="invoiceFilterSlider"
                      className="absolute inset-0 bg-[#0f281e] rounded-full z-[-1] shadow-lg shadow-[#0f281e]/20"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.6 }}
                    />
                  )}
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-4 shadow-sm border border-[#0f281e]/5 rounded-xl overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-[#0f281e]/5">
            <thead className="bg-[#fbf7f0]">
              <tr>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Period</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Total Projects</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Base Contract</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Upgrades Catalog</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Discount Offered</th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Final Revenue</th>
                <th className="px-8 py-4 text-right text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#0f281e]/5">
              {Object.entries(invoiceGroups)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([period, data]) => (
                  <tr key={period} className="hover:bg-[#fbf7f0]/50 transition-colors">
                    <td className="px-8 py-4 font-bold text-sm text-[#0f281e]">{period}</td>
                    <td className="px-8 py-4 text-sm text-[#0f281e]">{data.bookings}</td>
                    <td className="px-8 py-4 text-sm text-[#0f281e]">{data.basePrice}</td>
                    <td className="px-8 py-4 text-sm text-[#0f281e]">{data.enhancements}</td>
                    <td className="px-8 py-4 text-sm text-[#c4864b]">{data.discount}</td>
                    <td className="px-8 py-4 text-sm text-emerald-600 font-bold">{data.finalPrice}</td>
                    <td className="px-8 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleDownloadInvoice(period, 'print')}
                        className="p-2 text-[#0f281e]/40 hover:text-[#c4864b] transition-colors"
                        title="Print Invoice"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(period, 'download')}
                        className="p-2 text-[#0f281e]/40 hover:text-[#c4864b] transition-colors"
                        title="Download PDF Invoice"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
