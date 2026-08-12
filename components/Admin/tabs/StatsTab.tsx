import React from 'react';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ComposedChart, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';
import { useAdmin } from '../AdminContext';
import { PKRIcon, COLORS } from '../types';
import { StatCard } from '../StatCard';

export const StatsTab: React.FC = () => {
  const { bookings, courses, addons } = useAdmin();

  // Helper date parsing same as in Admin.tsx
  const parseDBDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    if (dateStr.includes(' ') && !dateStr.includes('T')) {
      return parseISO(dateStr.replace(' ', 'T') + 'Z');
    }
    return parseISO(dateStr);
  };

  const getBookingDate = (b: any) => b.createdAt ? format(parseDBDate(b.createdAt), 'yyyy-MM-dd') : b.date;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const currentMonth = today.slice(0, 7);
  const currentYear = today.slice(0, 4);

  const dailyRevenue = bookings
    .filter(b => getBookingDate(b) === today && b.status !== 'cancelled')
    .reduce((acc, b) => acc + (b.totalPrice || 0), 0);

  const yesterdayRevenue = bookings
    .filter(b => getBookingDate(b) === yesterday && b.status !== 'cancelled')
    .reduce((acc, b) => acc + (b.totalPrice || 0), 0);

  const monthlyRevenue = bookings
    .filter(b => getBookingDate(b).startsWith(currentMonth) && b.status !== 'cancelled')
    .reduce((acc, b) => acc + (b.totalPrice || 0), 0);

  const yearlyRevenue = bookings
    .filter(b => getBookingDate(b).startsWith(currentYear) && b.status !== 'cancelled')
    .reduce((acc, b) => acc + (b.totalPrice || 0), 0);

  const bookingsByDayPart = [
    { name: 'Morning Shift', value: bookings.filter(b => b.time < '11:00').length },
    { name: 'Midday Shift', value: bookings.filter(b => b.time >= '11:00' && b.time < '15:00').length },
    { name: 'Afternoon Shift', value: bookings.filter(b => b.time >= '15:00').length },
  ];

  const revenueByProjectType = courses.map(c => ({
    name: c.name,
    value: bookings
      .filter(b => b.courseType === c.name && b.status !== 'cancelled'
        && getBookingDate(b).startsWith(currentYear))
      .reduce((acc, b) => acc + (b.totalPrice || 0), 0)
  }));

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const avgBookingValueTrend = last7Days.map(date => {
    const dayBookings = bookings.filter(b => getBookingDate(b) === date && b.status !== 'cancelled');
    const total = dayBookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
    return {
      day: date.split('-').slice(1).join('/'),
      val: dayBookings.length > 0 ? Math.round(total / dayBookings.length) : 0
    };
  });

  const dynamicRevenueData = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i];
    const rev = bookings
      .filter(b => getBookingDate(b).startsWith(`${currentYear}-${month}`) && b.status !== 'cancelled')
      .reduce((acc, b) => acc + (b.totalPrice || 0), 0);
    return { month: monthName, revenue: rev };
  });

  const enhancementSalesData = addons
    .map(addon => {
      const soldInBookings = bookings.filter(b => {
        if (b.status === 'cancelled') return false;
        try {
          const ids: number[] = JSON.parse(b.selectedAddons || '[]');
          return ids.includes(addon.id);
        } catch { return false; }
      });
      const salesCount = soldInBookings.length;
      const totalRevenue = salesCount * addon.price;
      // Build last-6-month trend
      const trend = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const monthStr = d.toISOString().substring(0, 7);
        const count = soldInBookings.filter(b =>
          getBookingDate(b).startsWith(monthStr)
        ).length;
        return { month: d.toLocaleString('default', { month: 'short' }), count };
      });
      return { addon, salesCount, totalRevenue, trend };
    })
    .filter(d => d.salesCount > 0);

  return (
    <div className="space-y-8">
      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Today's Revenue"
          value={`$${dailyRevenue.toLocaleString()}`}
          trend="+5.4%"
          icon={<PKRIcon />}
        />
        <StatCard
          label="Yesterday's Revenue"
          value={`$${yesterdayRevenue.toLocaleString()}`}
          trend="-2.1%"
          trendDown={yesterdayRevenue < dailyRevenue}
          icon={<PKRIcon />}
        />
        <StatCard
          label="Monthly Revenue"
          value={`$${monthlyRevenue.toLocaleString()}`}
          trend="+15.2%"
          icon={<PKRIcon />}
        />
        <StatCard
          label="Yearly Revenue"
          value={`$${yearlyRevenue.toLocaleString()}`}
          trend="+12.8%"
          icon={<PKRIcon />}
        />
      </div>

      {/* Multi-Graph Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 shadow-sm border border-[#0f281e]/5 rounded-xl">
          <h3 className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-bold mb-4">Projects by Shift</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingsByDayPart}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0f281e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 shadow-sm border border-[#0f281e]/5 rounded-xl">
          <h3 className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-bold mb-4">Revenue by Project Type</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={revenueByProjectType} innerRadius={40} outerRadius={60} dataKey="value" isAnimationActive={true} animationBegin={0} animationDuration={1000}>
                  {revenueByProjectType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 shadow-sm border border-[#0f281e]/5 rounded-xl">
          <h3 className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-bold mb-4">Avg. Booking Value (Last 7 Days)</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={avgBookingValueTrend}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="val" stroke="#c4864b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dynamic Enhancement Sales Graphs */}
      <div className="min-w-0">
        <h3 className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-bold mb-4">Upgrade Option Sales (by booking date)</h3>
        <div className="overflow-x-auto custom-scrollbar">
          <div className="flex gap-4 pb-2 min-w-full">
            {addons.map((addon, idx) => {
              const entry = enhancementSalesData.find(d => d.addon.id === addon.id);
              const salesCount = entry?.salesCount ?? 0;
              const totalRevenue = entry?.totalRevenue ?? 0;
              const trend = entry?.trend ?? Array.from({ length: 6 }, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - (5 - i));
                return { month: d.toLocaleString('default', { month: 'short' }), count: 0 };
              });
              return (
                <div key={addon.id} className="bg-white p-4 shadow-sm border border-[#0f281e]/5 rounded-xl flex-grow flex-shrink-0 min-w-[260px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{addon.icon}</span>
                    <h3 className="text-[8px] uppercase tracking-widest text-[#0f281e]/40 font-bold truncate">{addon.name}</h3>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-[#0f281e]">{salesCount} sold</span>
                    <span className="text-[10px] text-[#c4864b] font-bold">${totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="h-[80px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend}>
                        <defs>
                          <linearGradient id={`enhGrad${idx}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={idx % 2 === 0 ? '#0f281e' : '#c4864b'} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={idx % 2 === 0 ? '#0f281e' : '#c4864b'} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 8 }} />
                        <Tooltip
                          contentStyle={{ fontSize: '10px', borderRadius: '4px', border: '1px solid #0f281e10' }}
                          formatter={(value: any) => [`${value} bookings`, addon.name]}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke={idx % 2 === 0 ? '#0f281e' : '#c4864b'}
                          fill={`url(#enhGrad${idx})`}
                          strokeWidth={2}
                          dot={{ r: 2, fill: idx % 2 === 0 ? '#0f281e' : '#c4864b' }}
                          isAnimationActive={true}
                          animationDuration={1000}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Large Trend Chart */}
      <div className="bg-white p-4 lg:p-8 shadow-sm border border-[#0f281e]/5 rounded-xl">
        <h3 className="font-serif text-xl text-[#0f281e] mb-8">Comprehensive Growth Analysis</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dynamicRevenueData}>
              <CartesianGrid stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#0f281e" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="revenue" stroke="#c4864b" strokeWidth={3} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
