import { Booking, Addon, PlayerReceiptBreakdown } from '../types';
import { toast } from 'react-hot-toast';

export const getBookingPlayers = (booking: Booking): { name: string; handicap?: number }[] => {
  if (booking.playerDetails) {
    try {
      const parsedFlights = JSON.parse(booking.playerDetails);
      const parsedPlayers: { name: string; handicap?: number }[] = [];

      parsedFlights.forEach((flight: any, flightIdx: number) => {
        (flight.players || []).forEach((player: any, playerIdx: number) => {
          const playerNumber = flightIdx * 4 + playerIdx + 1;
          parsedPlayers.push({
            name: player.name || `Player ${playerNumber}`,
            handicap: player.handicap
          });
        });
      });

      if (parsedPlayers.length > 0) {
        return parsedPlayers;
      }
    } catch (e) {
      console.error(e);
    }
  }

  return Array.from({ length: Math.max(booking.guests || 1, 1) }, (_, idx) => ({
    name: idx === 0 ? booking.customerName : `Player ${idx + 1}`
  }));
};

export const getCartSummary = (booking: Booking, addons: Addon[]) => {
  let cartQuantity = 0;
  let cartTotal = 0;

  if (!booking.selectedAddons) {
    return { cartQuantity, cartTotal };
  }

  try {
    const addonIds: number[] = JSON.parse(booking.selectedAddons);
    addonIds.forEach(id => {
      const addon = addons.find(a => a.id === id);
      const addonName = addon?.name?.toLowerCase() || '';
      const isCart = id === 9 || id === 10 || addonName.includes('cart');

      if (isCart) {
        cartQuantity += 1;
        cartTotal += addon?.price || 0;
      }
    });
  } catch (e) {
    console.error(e);
  }

  return { cartQuantity, cartTotal };
};

export const getPlayerReceiptBreakdowns = (booking: Booking, addons: Addon[]): PlayerReceiptBreakdown[] => {
  const players = getBookingPlayers(booking);
  const playerCount = Math.max(players.length, booking.guests || 1, 1);
  const roundTotal = (booking.totalPrice || 0) - (booking.enhancementsPrice || 0);
  const greenFee = roundTotal / playerCount;
  const { cartQuantity, cartTotal } = getCartSummary(booking, addons);
  const cartFee = cartTotal / playerCount;

  return players.map((player, idx) => ({
    playerName: player.name || `Player ${idx + 1}`,
    handicap: player.handicap,
    playerIndex: idx + 1,
    playerCount,
    greenFee,
    cartFee,
    cartQuantity,
    cartTotal,
    total: greenFee + cartFee
  }));
};

export const handlePrintPlayerReceipt = (booking: Booking, addons: Addon[], playerIndex: number) => {
  const playerReceipt = getPlayerReceiptBreakdowns(booking, addons)[playerIndex];
  if (!playerReceipt) {
    toast.error('Player receipt not available');
    return;
  }

  // @ts-ignore
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: [80, 170]
  });

  const width = 80;
  const margin = 5;
  const centerX = width / 2;
  const copies = ['Customer Copy', 'Golf Copy', 'Accounts Copy'];

  const addDashedLine = (currY: number) => {
    doc.setDrawColor(150);
    doc.setLineDashPattern([2, 1], 0);
    doc.line(margin, currY, width - margin, currY);
    doc.setLineDashPattern([], 0);
  };

  copies.forEach((copyLabel, copyIdx) => {
    if (copyIdx > 0) {
      doc.addPage([80, 170]);
    }

    let y = 10;

    const img = new Image();
    img.src = '/log.png';
    try {
      doc.addImage(img, 'PNG', centerX - 10, y, 20, 15);
      y += 18;
    } catch (e) {
      y += 5;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PONOS HOME IMPROVEMENT, LTD', centerX, y, { align: 'center' });
    y += 5;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Capital City Offices, Islamabad, Pakistan', centerX, y, { align: 'center' });
    y += 4;
    doc.text('Tel: 0300-1234567', centerX, y, { align: 'center' });
    y += 6;

    addDashedLine(y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Crew Receipt', centerX, y, { align: 'center' });
    y += 5;
    doc.setFontSize(8);
    doc.text(copyLabel, centerX, y, { align: 'center' });
    y += 4;
    if (booking.isPaid === 1) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(46, 125, 50); // Green color
      doc.text('** PAID **', centerX, y, { align: 'center' });
      doc.setTextColor(0, 0, 0); // Reset color
      y += 5;
    }
    doc.text(playerReceipt.playerName, centerX, y, { align: 'center' });
    y += 6;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Bill No: PHI-PROJ-${booking.id.toString().padStart(6, '0')}-${playerReceipt.playerIndex}`, margin, y);
    y += 4;
    const dateStr = booking.createdAt ? new Date(booking.createdAt).toLocaleString() : new Date().toLocaleString();
    doc.text(`Date: ${dateStr}`, margin, y);
    y += 4;
    doc.text(`Scheduled Time: ${booking.date} ${booking.time}`, margin, y);
    y += 4;
    doc.text(`Project Type: ${booking.courseType}`, margin, y);
    y += 4;
    doc.text(`Crew Member: ${playerReceipt.playerIndex} of ${playerReceipt.playerCount}`, margin, y);
    if (playerReceipt.handicap !== undefined) {
      doc.text(`Skill Offset: ${playerReceipt.handicap}`, width - margin, y, { align: 'right' });
    }
    y += 6;

    addDashedLine(y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Description', margin, y);
    doc.text('Amount', width - margin, y, { align: 'right' });
    y += 4;
    addDashedLine(y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.text('Base Quote / Labor', margin, y);
    doc.text(`${playerReceipt.greenFee.toFixed(2)}`, width - margin, y, { align: 'right' });
    y += 6;

    if (playerReceipt.cartQuantity > 0) {
      doc.text(`Specialized Equipment Fee (${playerReceipt.cartQuantity} item${playerReceipt.cartQuantity > 1 ? 's' : ''})`, margin, y);
      doc.text(`${playerReceipt.cartFee.toFixed(2)}`, width - margin, y, { align: 'right' });
      y += 4;
      doc.setFontSize(6);
      doc.text(`Equipment total $${playerReceipt.cartTotal.toFixed(2)} split by ${playerReceipt.playerCount} workers`, margin, y);
      doc.setFontSize(7);
      y += 6;
    }

    addDashedLine(y);
    y += 7;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Net Total:', margin, y);
    doc.text(`${playerReceipt.total.toFixed(2)}`, width - margin, y, { align: 'right' });
    y += 10;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Individual receipt for crew share only.', centerX, y, { align: 'center' });
    y += 4;
    doc.text('Project schedules are subject to adjustment requests.', centerX, y, { align: 'center' });
    y += 8;
  });

  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
};

export const handlePrintProfessionalReceipt = (booking: Booking, addons: Addon[], action: 'print' | 'download' = 'download') => {
  // @ts-ignore
  const { jsPDF } = window.jspdf;

  let dynamicHeight = 180;
  if (booking.playerDetails) {
    try {
      const parsed = JSON.parse(booking.playerDetails);
      parsed.forEach((t: any) => {
        dynamicHeight += 5;
        dynamicHeight += t.players.length * 4;
      });
    } catch (e) { }
  }
  if (booking.selectedAddons) {
    try {
      const addonIds: number[] = JSON.parse(booking.selectedAddons);
      const uniqueIds = Array.from(new Set(addonIds));
      dynamicHeight += uniqueIds.length * 10;
    } catch (e) { }
  }

  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: [80, Math.max(180, dynamicHeight)]
  });

  const width = 80;
  const margin = 5;
  const centerX = width / 2;

  const copies = ['Customer Copy', 'Golf Copy', 'Accounts Copy'];

  copies.forEach((copyLabel, copyIdx) => {
    if (copyIdx > 0) {
      doc.addPage([80, Math.max(180, dynamicHeight)]);
    }

    let y = 10;

    const addDashedLine = (currY: number) => {
      doc.setDrawColor(150);
      doc.setLineDashPattern([2, 1], 0);
      doc.line(margin, currY, width - margin, currY);
      doc.setLineDashPattern([], 0);
    };

    const img = new Image();
    img.src = '/log.png';
    try {
      doc.addImage(img, 'PNG', centerX - 10, y, 20, 15);
      y += 18;
    } catch (e) {
      y += 5;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PONOS HOME IMPROVEMENT, LTD', centerX, y, { align: 'center' });
    y += 5;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Capital City Offices, Islamabad, Pakistan', centerX, y, { align: 'center' });
    y += 4;
    doc.text('Tel: 0300-1234567', centerX, y, { align: 'center' });
    y += 6;

    addDashedLine(y);
    y += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Project Quote', centerX, y, { align: 'center' });
    y += 4;
    doc.setFontSize(8);
    doc.text(copyLabel, centerX, y, { align: 'center' });
    y += 4;
    if (booking.isPaid === 1) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(46, 125, 50); // Green color
      doc.text('** PAID **', centerX, y, { align: 'center' });
      doc.setTextColor(0, 0, 0); // Reset color
      y += 5;
    }
    y += 2;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Bill No: PHI-PROJ-${booking.id.toString().padStart(6, '0')}`, margin, y);
    y += 4;

    const dateStr = booking.createdAt ? new Date(booking.createdAt).toLocaleString() : new Date().toLocaleString();
    doc.text(`Date: ${dateStr}`, margin, y);
    y += 6;

    addDashedLine(y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Description', margin, y);
    y += 4;
    doc.text('Qty', margin, y);
    doc.text('Price', centerX - 5, y);
    doc.text('Disc', centerX + 15, y);
    doc.text('Total', width - margin, y, { align: 'right' });
    y += 3;
    addDashedLine(y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    const baseP = (booking.basePrice || booking.totalPrice || 0) - (booking.enhancementsPrice || 0);
    const savings = (booking.basePrice || 0) - (booking.totalPrice || 0);

    doc.text(`${booking.courseType} Project`, margin, y);
    y += 4;
    doc.text(`Crew Size: ${booking.guests}`, margin, y);
    doc.text(`${(baseP / booking.guests).toFixed(2)}`, centerX - 5, y);
    doc.text(`${savings > 0 ? (savings).toFixed(2) : '0.00'}`, centerX + 15, y);
    doc.text(`${(booking.totalPrice - (booking.enhancementsPrice || 0)).toFixed(2)}`, width - margin, y, { align: 'right' });
    y += 4;

    if (booking.playerDetails) {
      try {
        const parsedFlights = JSON.parse(booking.playerDetails);
        parsedFlights.forEach((flight: any, tIdx: number) => {
          doc.setFont('helvetica', 'bold');
          doc.text(`Crew Unit ${tIdx + 1}:`, margin + 2, y);
          y += 3.5;
          doc.setFont('helvetica', 'normal');
          flight.players.forEach((p: any, pIdx: number) => {
            doc.text(`- ${p.name || 'Worker'} (Skill Offset: ${p.handicap})`, margin + 4, y);
            y += 3.5;
          });
        });
      } catch (e) {
        console.error(e);
      }
    }
    y += 2;

    if (booking.selectedAddons) {
      try {
        const addonIds: number[] = JSON.parse(booking.selectedAddons);
        const addonQuantities: Record<number, number> = {};
        addonIds.forEach(id => {
          addonQuantities[id] = (addonQuantities[id] || 0) + 1;
        });

        const uniqueAddonIds = Object.keys(addonQuantities).map(Number);
        uniqueAddonIds.forEach(id => {
          const addon = addons.find(a => a.id === id);
          if (addon) {
            const qty = addonQuantities[id];
            const totalPrice = addon.price * qty;
            doc.text(addon.name, margin, y);
            y += 4;
            doc.text(`${qty}`, margin, y);
            doc.text(`${addon.price.toFixed(2)}`, centerX - 5, y);
            doc.text('0.00', centerX + 15, y);
            doc.text(`${totalPrice.toFixed(2)}`, width - margin, y, { align: 'right' });
            y += 6;
          }
        });
      } catch (e) {
        if (booking.enhancementsPrice && booking.enhancementsPrice > 0) {
          doc.text('Materials & Upgrades', margin, y);
          y += 4;
          doc.text('1', margin, y);
          doc.text(`${booking.enhancementsPrice.toFixed(2)}`, centerX - 5, y);
          doc.text('0.00', centerX + 15, y);
          doc.text(`${booking.enhancementsPrice.toFixed(2)}`, width - margin, y, { align: 'right' });
          y += 6;
        }
      }
    } else if (booking.enhancementsPrice && booking.enhancementsPrice > 0) {
      doc.text('Materials & Upgrades', margin, y);
      y += 4;
      doc.text('1', margin, y);
      doc.text(`${booking.enhancementsPrice.toFixed(2)}`, centerX - 5, y);
      doc.text('0.00', centerX + 15, y);
      doc.text(`${booking.enhancementsPrice.toFixed(2)}`, width - margin, y, { align: 'right' });
      y += 6;
    }

    addDashedLine(y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('Gross Total:', margin, y);
    doc.text(`${(booking.basePrice || booking.totalPrice || 0).toFixed(2)}`, width - margin, y, { align: 'right' });
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.text('G.S.T Value (0%):', margin, y);
    doc.text('0.00', width - margin, y, { align: 'right' });
    y += 5;

    if (savings > 0) {
      doc.text(`(-)Total Disc:`, margin, y);
      doc.text(`${savings.toFixed(2)}`, width - margin, y, { align: 'right' });
      y += 5;
    }

    doc.text('POS Service Fee:', margin, y);
    doc.text('0.00', width - margin, y, { align: 'right' });
    y += 7;

    addDashedLine(y);
    y += 7;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Net Total:', margin, y);
    doc.text(`${(booking.totalPrice || 0)}`, width - margin, y, { align: 'right' });
    y += 10;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Project schedules are subject to adjustment requests.', centerX, y, { align: 'center' });
    y += 4;
    doc.text('No refunds for cancellations within 24 hours.', centerX, y, { align: 'center' });
    y += 8;
  });

  if (action === 'print') {
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  } else {
    doc.save(`Project_Quote_${booking.id}.pdf`);
  }
};
