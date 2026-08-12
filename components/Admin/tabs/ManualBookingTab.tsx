import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { List } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdmin } from '../AdminContext';
import { Flight, Player } from '../types';

export const ManualBookingTab: React.FC = () => {
  const {
    courses,
    addons,
    members,
    currentUser,
    fetchBookings,
    fetchMembers,
    setActiveTab
  } = useAdmin();

  const [manualBookingMode, setManualBookingMode] = useState<'member' | 'guest'>('guest');
  const [manualBookedTimes, setManualBookedTimes] = useState<string[]>([]);
  const [isManualBookingSubmitting, setIsManualBookingSubmitting] = useState(false);
  const [manualBookingForm, setManualBookingForm] = useState({
    existingUserId: '',
    courseType: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    guests: 1,
    customerName: '',
    email: '',
    phone: '',
    password: '',
    sendEmail: true,
    addons: [] as number[]
  });
  const [manualFlights, setManualFlights] = useState<Flight[]>([
    { id: 1, players: [{ name: '', handicap: 18 }] }
  ]);

  const selectedManualCourse = courses.find(course => course.name === manualBookingForm.courseType);
  const manualAvailableTimes = useAdmin().pricing
    .filter(slot => slot.courseId === selectedManualCourse?.id)
    .sort((a, b) => a.time.localeCompare(b.time));
  const manualSelectedSlot = manualAvailableTimes.find(slot => slot.time === manualBookingForm.time);
  const manualAddonsTotal = manualBookingForm.addons.reduce((sum, addonId) => {
    const addon = addons.find(item => item.id === addonId);
    return sum + (addon?.price || 0);
  }, 0);
  const manualTotalPrice = ((manualSelectedSlot?.price || 0) * manualBookingForm.guests) + manualAddonsTotal;
  const manualBasePrice = (((manualSelectedSlot?.price || 0) + (manualSelectedSlot?.discount || 0)) * manualBookingForm.guests) + manualAddonsTotal;

  useEffect(() => {
    if (!manualBookingForm.date || !manualBookingForm.courseType) {
      setManualBookedTimes([]);
      return;
    }

    fetch(`/api/bookings/check?date=${manualBookingForm.date}&courseType=${encodeURIComponent(manualBookingForm.courseType)}`)
      .then(res => res.json())
      .then(data => setManualBookedTimes(Array.isArray(data) ? data : []))
      .catch(() => setManualBookedTimes([]));
  }, [manualBookingForm.date, manualBookingForm.courseType]);

  useEffect(() => {
    const totalGuests = manualFlights.reduce((sum, t) => sum + t.players.length, 0);
    setManualBookingForm(prev => ({ ...prev, guests: totalGuests }));
  }, [manualFlights]);



  const resetManualBookingForm = () => {
    setManualBookingForm({
      existingUserId: '',
      courseType: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      guests: 1,
      customerName: '',
      email: '',
      phone: '',
      password: '',
      sendEmail: true,
      addons: []
    });
    setManualBookingMode('guest');
    setManualFlights([{ id: 1, players: [{ name: '', handicap: 18 }] }]);
  };

  const handleManualFlightPlayersChange = (tIdx: number, n: number) => {
    setManualFlights(prev => prev.map((t, idx) => {
      if (idx !== tIdx) return t;
      const currentLen = t.players.length;
      let newPlayers = [...t.players];
      if (n > currentLen) {
        for (let i = currentLen; i < n; i++) {
          newPlayers.push({ name: '', handicap: 18 });
        }
      } else {
        newPlayers = newPlayers.slice(0, n);
      }
      return { ...t, players: newPlayers };
    }));
  };

  const handleManualPlayerFieldChange = (tIdx: number, pIdx: number, field: keyof Player, value: any) => {
    setManualFlights(prev => prev.map((t, idx) => {
      if (idx !== tIdx) return t;
      const newPlayers = t.players.map((p, playerIdx) => {
        if (playerIdx !== pIdx) return p;
        return { ...p, [field]: value };
      });
      return { ...t, players: newPlayers };
    }));
  };

  const handleManualAddFlight = () => {
    setManualFlights(prev => [...prev, { id: Date.now(), players: [{ name: '', handicap: 18 }] }]);
  };

  const handleManualRemoveFlight = (tIdx: number) => {
    setManualFlights(prev => prev.filter((_, idx) => idx !== tIdx));
  };

  const handleManualMemberSelect = (memberId: string) => {
    const member = members.find(item => item.id.toString() === memberId);
    setManualBookingForm(prev => ({
      ...prev,
      existingUserId: memberId,
      customerName: member?.username || '',
      email: member?.email || '',
      phone: member?.phone || '',
      password: ''
    }));
  };

  const sendBookingEmail = async (booking: typeof manualBookingForm, totalPrice: number) => {
    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: 'service_1s8i0xo',
        template_id: 'template_5g0pt3h',
        user_id: 'zIxfAhFrfltWq1Wqh',
        template_params: {
          customer_name: booking.customerName,
          email: booking.email,
          to_email: booking.email,
          course_type: booking.courseType,
          date: booking.date,
          time: booking.time,
          guests: booking.guests,
          total_price: totalPrice,
          phone: booking.phone
        }
      })
    });
  };

  const handleManualBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsManualBookingSubmitting(true);

    const payload = {
      ...manualBookingForm,
      existingUserId: manualBookingMode === 'member' ? Number(manualBookingForm.existingUserId) : null,
      password: manualBookingMode === 'guest' ? manualBookingForm.password.trim() : '',
      totalPrice: manualTotalPrice,
      basePrice: manualBasePrice,
      enhancementsPrice: manualAddonsTotal,
      selectedAddons: manualBookingForm.addons,
      logUsername: currentUser?.username,
      playerDetails: manualFlights
    };

    try {
      const res = await fetch('/api/admin/bookings/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Failed to create manual booking');
        return;
      }

      if (manualBookingForm.sendEmail && manualBookingForm.email) {
        try {
          await sendBookingEmail(manualBookingForm, manualTotalPrice);
        } catch (emailError) {
          console.error('Failed to send manual booking email', emailError);
          toast.error('Booking saved, but confirmation email failed');
        }
      }

      toast.success('Manual booking created');
      resetManualBookingForm();
      fetchBookings();
      fetchMembers();
      setActiveTab('tee-sheet');
    } catch (err) {
      toast.error('An error occurred while creating the booking');
    } finally {
      setIsManualBookingSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-[#0f281e]">New Project Booking</h2>
          <p className="text-sm text-[#0f281e]/60 mt-1">Create a booking for an existing client or a new project from the admin panel.</p>
        </div>
        <button
          onClick={() => setActiveTab('tee-sheet')}
          className="bg-white px-5 py-2.5 border border-[#0f281e]/10 text-[#0f281e]/60 hover:text-[#c4864b] hover:border-[#c4864b]/30 transition-all rounded-full flex items-center gap-2 shadow-sm w-fit"
        >
          <List className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase tracking-[0.1em] font-black">Back to Schedule</span>
        </button>
      </div>

      <form onSubmit={handleManualBookingSubmit} className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
        <div className="bg-white shadow-sm border border-[#0f281e]/5 rounded-[2rem] p-6 lg:p-8 space-y-8">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/40 mb-3 font-bold">Booking Type</label>
            <div className="admin-no-gloss relative inline-grid grid-cols-2 rounded-full border border-[#0f281e]/10 bg-[#fbf7f0] p-1 shadow-inner overflow-hidden">
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-[#0f281e] shadow-lg ${manualBookingMode === 'member' ? 'left-[calc(50%+0px)]' : 'left-1'}`}
              />
              {(['guest', 'member'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setManualBookingMode(mode);
                    setManualBookingForm(prev => ({ ...prev, existingUserId: '', customerName: '', email: '', phone: '', password: '' }));
                  }}
                  className={`relative z-10 rounded-full px-5 py-2 text-[10px] uppercase tracking-widest font-bold transition-colors duration-300 ${manualBookingMode === mode ? 'text-[#dec099]' : 'text-[#0f281e]/45 hover:text-[#0f281e]/70'}`}
                >
                  {mode === 'guest' ? 'Guest Booking' : 'Existing Account'}
                </button>
              ))}
            </div>
          </div>

          {manualBookingMode === 'member' && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/40 mb-2 font-bold">Select Client</label>
              <select
                required
                value={manualBookingForm.existingUserId}
                onChange={e => handleManualMemberSelect(e.target.value)}
                className="w-full px-4 py-3 bg-[#fbf7f0] border border-[#0f281e]/10 rounded-xl outline-none focus:border-[#c4864b] text-sm"
              >
                <option value="">Choose an existing client account</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.username} {member.email ? `- ${member.email}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/40 mb-2 font-bold">Customer Name</label>
              <input
                required
                type="text"
                disabled={manualBookingMode === 'member'}
                value={manualBookingForm.customerName}
                onChange={e => setManualBookingForm({ ...manualBookingForm, customerName: e.target.value })}
                className="w-full px-4 py-3 bg-[#fbf7f0] border border-[#0f281e]/10 rounded-xl outline-none focus:border-[#c4864b] text-sm disabled:cursor-not-allowed disabled:bg-[#0f281e]/5 disabled:text-[#0f281e]/45"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/40 mb-2 font-bold">Email (Optional)</label>
              <input
                type="email"
                disabled={manualBookingMode === 'member'}
                value={manualBookingForm.email}
                onChange={e => setManualBookingForm({ ...manualBookingForm, email: e.target.value })}
                className="w-full px-4 py-3 bg-[#fbf7f0] border border-[#0f281e]/10 rounded-xl outline-none focus:border-[#c4864b] text-sm disabled:cursor-not-allowed disabled:bg-[#0f281e]/5 disabled:text-[#0f281e]/45"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/40 mb-2 font-bold">Phone (Optional)</label>
              <input
                type="tel"
                disabled={manualBookingMode === 'member'}
                value={manualBookingForm.phone}
                onChange={e => setManualBookingForm({ ...manualBookingForm, phone: e.target.value })}
                className="w-full px-4 py-3 bg-[#fbf7f0] border border-[#0f281e]/10 rounded-xl outline-none focus:border-[#c4864b] text-sm disabled:cursor-not-allowed disabled:bg-[#0f281e]/5 disabled:text-[#0f281e]/45"
              />
            </div>
            {manualBookingMode === 'guest' && (
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/40 mb-2 font-bold">Password Optional</label>
                <input
                  type="password"
                  value={manualBookingForm.password}
                  onChange={e => setManualBookingForm({ ...manualBookingForm, password: e.target.value })}
                  placeholder="Add password to create account"
                  className="w-full px-4 py-3 bg-[#fbf7f0] border border-[#0f281e]/10 rounded-xl outline-none focus:border-[#c4864b] text-sm placeholder:text-[#0f281e]/30"
                />
              </div>
            )}
            <label className="md:col-span-2 flex items-center gap-3 rounded-xl border border-[#0f281e]/10 bg-[#fbf7f0] px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={manualBookingForm.sendEmail}
                onChange={e => setManualBookingForm({ ...manualBookingForm, sendEmail: e.target.checked })}
                className="w-4 h-4 accent-[#c4864b]"
              />
              <span className="text-sm font-bold text-[#0f281e]">Send confirmation email with booking details</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/40 mb-2 font-bold">Project Type</label>
              <select
                required
                value={manualBookingForm.courseType}
                onChange={e => setManualBookingForm({ ...manualBookingForm, courseType: e.target.value, time: '' })}
                className="w-full px-4 py-3 bg-[#fbf7f0] border border-[#0f281e]/10 rounded-xl outline-none focus:border-[#c4864b] text-sm"
              >
                <option value="">Select project type</option>
                {courses.map(course => (
                  <option key={course.id} value={course.name}>{course.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/40 mb-2 font-bold">Date</label>
              <input
                required
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={manualBookingForm.date}
                onChange={e => setManualBookingForm({ ...manualBookingForm, date: e.target.value, time: '' })}
                className="w-full px-4 py-3 bg-[#fbf7f0] border border-[#0f281e]/10 rounded-xl outline-none focus:border-[#c4864b] text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/40 mb-2 font-bold">Total Crew Size</label>
              <div className="w-full px-4 py-3 bg-[#0f281e]/5 border border-[#0f281e]/10 rounded-xl text-sm font-bold text-[#0f281e]/70">
                {manualBookingForm.guests} Crew Member{manualBookingForm.guests > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-t border-[#0f281e]/10 pt-6"></div>

            {manualFlights.map((flight, tIdx) => (
              <div key={flight.id} className="bg-[#fbf7f0] border border-[#0f281e]/10 p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-serif text-lg text-[#0f281e]">
                    {tIdx === 0 ? "Crew Unit 1 (Primary)" : `Crew Unit ${tIdx + 1}`}
                  </h4>
                  {tIdx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleManualRemoveFlight(tIdx)}
                      className="text-xs text-red-600 hover:text-red-500 uppercase tracking-widest font-bold"
                    >
                      Remove Crew Unit
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/40 mb-3 font-bold">Number of Crew Members</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handleManualFlightPlayersChange(tIdx, n)}
                        className={`flex-1 py-2 border transition-all rounded-xl ${flight.players.length === n
                          ? 'bg-[#0f281e] border-[#0f281e] text-[#dec099] font-bold'
                          : 'bg-white border-[#0f281e]/10 text-[#0f281e] hover:border-[#c4864b]'
                          }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-serif">{n}</span>
                          <span className="text-[7px] uppercase tracking-widest font-bold">Worker{n > 1 ? 's' : ''}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {flight.players.map((player, pIdx) => (
                    <div key={pIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white border border-[#0f281e]/5 rounded-xl">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#0f281e]/50 mb-1">Worker {pIdx + 1} Name</label>
                        <input
                          type="text"
                          required
                          placeholder={`Worker ${pIdx + 1} Name`}
                          value={player.name}
                          onChange={(e) => handleManualPlayerFieldChange(tIdx, pIdx, 'name', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-[#0f281e]/10 focus:border-[#c4864b] outline-none bg-[#fbf7f0] text-[#0f281e] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#0f281e]/50 mb-1">Specialist Skill Level (Offset)</label>
                        <input
                          type="number"
                          min="0"
                          max="54"
                          required
                          value={player.handicap}
                          onChange={(e) => handleManualPlayerFieldChange(tIdx, pIdx, 'handicap', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm border border-[#0f281e]/10 focus:border-[#c4864b] outline-none bg-[#fbf7f0] text-[#0f281e] rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-start">
              <button
                type="button"
                onClick={handleManualAddFlight}
                className="border border-[#c4864b] text-[#c4864b] hover:bg-[#c4864b] hover:text-white px-4 py-2 uppercase tracking-widest text-[10px] font-bold transition-all rounded-xl"
              >
                + Add Crew Unit
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/40 mb-3 font-bold">Scheduled Time Slot</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {manualAvailableTimes.map(slot => {
                const isBusy = manualBookedTimes.includes(slot.time);
                const isSelected = manualBookingForm.time === slot.time;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isBusy}
                    onClick={() => setManualBookingForm({ ...manualBookingForm, time: slot.time })}
                    className={`px-3 py-3 rounded-xl border text-xs font-bold transition-all ${isSelected
                      ? 'bg-[#0f281e] text-[#dec099] border-[#0f281e]'
                      : isBusy
                        ? 'bg-[#0f281e]/5 text-[#0f281e]/20 border-[#0f281e]/5 line-through cursor-not-allowed'
                        : 'bg-white text-[#0f281e] border-[#0f281e]/10 hover:border-[#c4864b] hover:text-[#c4864b]'
                      }`}
                  >
                    {slot.time}
                  </button>
                );
              })}
              {manualBookingForm.courseType && manualAvailableTimes.length === 0 && (
                <div className="col-span-full py-8 text-center text-sm text-[#0f281e]/40 border border-dashed border-[#0f281e]/10 rounded-xl">
                  No pricing slots are configured for this project type.
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/40 mb-3 font-bold">Enhancements</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(() => {
                const availableAddons = addons.filter(addon => addon.isAvailable !== 0);
                if (availableAddons.length === 0) {
                  return <div className="col-span-full py-8 text-center text-sm text-[#0f281e]/40 border border-dashed border-[#0f281e]/10 rounded-xl">No enhancements available.</div>;
                }

                return availableAddons.map(addon => {
                  const isSelected = manualBookingForm.addons.includes(addon.id);

                  return (
                    <div
                      key={addon.id}
                      onClick={() => {
                        const nextAddons = isSelected
                          ? manualBookingForm.addons.filter(id => id !== addon.id)
                          : [...manualBookingForm.addons, addon.id];
                        setManualBookingForm({ ...manualBookingForm, addons: nextAddons });
                      }}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${isSelected
                        ? 'bg-[#0f281e] text-white border-[#0f281e]'
                        : 'bg-[#fbf7f0] border-[#0f281e]/10 text-[#0f281e] hover:border-[#c4864b]'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-bold">
                            {addon.name}
                          </div>
                          <div className={`text-xs mt-1 ${isSelected ? 'text-white/50' : 'text-[#0f281e]/45'}`}>{addon.description}</div>
                        </div>
                        <div className="text-xs font-bold whitespace-nowrap">${addon.price}</div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        <aside className="bg-[#0f281e] text-white rounded-[2rem] p-6 h-fit sticky top-6 shadow-xl font-sans">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#dec099]/60 font-bold mb-5">Booking Summary</div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between gap-4"><span className="text-white/45">Client</span><span className="font-bold text-right">{manualBookingForm.customerName || '-'}</span></div>
            <div className="flex justify-between gap-4"><span className="text-white/45">Project Type</span><span className="font-bold text-right">{manualBookingForm.courseType || '-'}</span></div>
            <div className="flex justify-between gap-4"><span className="text-white/45">Date</span><span className="font-bold">{manualBookingForm.date}</span></div>
            <div className="flex justify-between gap-4"><span className="text-white/45">Time Slot</span><span className="font-bold">{manualBookingForm.time || '-'}</span></div>
            <div className="flex justify-between gap-4"><span className="text-white/45">Crew Members</span><span className="font-bold">{manualBookingForm.guests}</span></div>
            <div className="border-t border-white/10 pt-4 flex justify-between gap-4"><span className="text-white/45">Base Labor</span><span className="font-bold">${(manualSelectedSlot?.price || 0) * manualBookingForm.guests}</span></div>
            <div className="flex justify-between gap-4"><span className="text-white/45">Upgrades</span><span className="font-bold">${manualAddonsTotal}</span></div>

            {manualBookingForm.courseType && (
              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#dec099]/60 font-bold">Crew Units & Workers</div>
                {manualFlights.map((flight, tIdx) => (
                  <div key={flight.id} className="space-y-1">
                    <div className="text-[#dec099] font-bold text-[10px] uppercase tracking-wider">Crew Unit {tIdx + 1}</div>
                    <div className="space-y-1 pl-2">
                      {flight.players.map((p, pIdx) => (
                        <div key={pIdx} className="flex justify-between text-xs text-white/60">
                          <span>{p.name || `Worker ${pIdx + 1}`}</span>
                          <span>Skill Offset: {p.handicap}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-white/10 pt-4 flex justify-between gap-4 items-end">
            <span className="text-[#dec099] font-bold">Total Quote</span>
            <span className="font-serif text-3xl text-[#dec099]">${manualTotalPrice}</span>
          </div>
        </div>
        <button
          type="submit"
          disabled={isManualBookingSubmitting || !manualBookingForm.time}
          className="mt-8 w-full bg-[#c4864b] text-white py-4 rounded-xl uppercase tracking-widest text-[10px] font-bold hover:bg-[#dec099] hover:text-[#0f281e] disabled:opacity-50 transition-colors"
        >
          {isManualBookingSubmitting ? 'Creating Project...' : 'Create Project Booking'}
        </button>
      </aside>
    </form>
  </div>
  );
};
