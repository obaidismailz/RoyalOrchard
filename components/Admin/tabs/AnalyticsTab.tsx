import React from 'react';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import {
  Calendar, TrendingUp, XCircle, Users, BarChart3, Shield
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ComposedChart, Line, Legend
} from 'recharts';
import { useAdmin } from '../AdminContext';
import { PKRIcon, COLORS, SOURCE_COLORS, STATUS_OPTIONS } from '../types';
import { StatCard } from '../StatCard';

export const AnalyticsTab: React.FC = () => {
  const { bookings, courses } = useAdmin();

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
  const currentYear = today.slice(0, 4);

  // Calculations
  const totalRevenue = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((acc, b) => acc + (b.totalPrice || 0), 0);

  const totalBookings = bookings.filter(b => b.status !== 'cancelled').length;
  const avgProjectValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
  const cancellationRate = bookings.length > 0
    ? Math.round((bookings.filter(b => b.status === 'cancelled').length / bookings.length) * 100)
    : 0;

  const statusDistribution = STATUS_OPTIONS.map(opt => ({
    name: opt.label,
    value: bookings.filter(b => b.status === opt.value).length
  }));

  const dynamicRevenueData = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i];
    const rev = bookings
      .filter(b => getBookingDate(b).startsWith(`${currentYear}-${month}`) && b.status !== 'cancelled')
      .reduce((acc, b) => acc + (b.totalPrice || 0), 0);
    return { month: monthName, revenue: rev };
  });

  const projectRadarData = courses.map(c => ({
    subject: c.name.replace(' Remodeling', '').replace(' Reno', ''),
    bookings: bookings.filter(b => b.courseType === c.name
      && getBookingDate(b).startsWith(currentYear)).length * 10,
    revenue: bookings
      .filter(b => b.courseType === c.name && b.status !== 'cancelled'
        && getBookingDate(b).startsWith(currentYear))
      .reduce((acc, b) => acc + (b.totalPrice || 0), 0) / 100
  }));

  const crewLoadData = [
    { name: 'Crew of 1', count: bookings.filter(b => b.guests === 1).length },
    { name: 'Crew of 2', count: bookings.filter(b => b.guests === 2).length },
    { name: 'Crew of 3', count: bookings.filter(b => b.guests === 3).length },
    { name: 'Crew of 4+', count: bookings.filter(b => b.guests >= 4).length },
  ];

  const hourlyLoadData = Array.from({ length: 12 }, (_, i) => {
    const hour = (i + 7).toString().padStart(2, '0') + ':00';
    const hourBookings = bookings.filter(b => b.time.startsWith(hour.split(':')[0]));
    return {
      time: hour,
      bookings: hourBookings.length,
      revenue: hourBookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0)
    };
  });

  const completedBookings = bookings.filter(b => b.status !== 'cancelled');
  const adminMadeBookings = completedBookings.filter(b => b.adminCreated === 1);
  const userMadeBookings = completedBookings.filter(b => b.adminCreated !== 1);
  const adminBookingRevenue = adminMadeBookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
  const userBookingRevenue = userMadeBookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
  const totalSourceBookings = adminMadeBookings.length + userMadeBookings.length;
  const adminBookingShare = totalSourceBookings > 0 ? Math.round((adminMadeBookings.length / totalSourceBookings) * 100) : 0;
  const userBookingShare = totalSourceBookings > 0 ? Math.round((userMadeBookings.length / totalSourceBookings) * 100) : 0;

  const bookingSourceSplit = [
    { name: 'Admin Made', value: adminMadeBookings.length, revenue: adminBookingRevenue },
    { name: 'User Made', value: userMadeBookings.length, revenue: userBookingRevenue },
  ];

  const bookingSourceRevenue = [
    {
      name: 'Admin',
      revenue: adminBookingRevenue,
      avgValue: adminMadeBookings.length > 0 ? Math.round(adminBookingRevenue / adminMadeBookings.length) : 0
    },
    {
      name: 'User',
      revenue: userBookingRevenue,
      avgValue: userMadeBookings.length > 0 ? Math.round(userBookingRevenue / userMadeBookings.length) : 0
    },
  ];

  const bookingSourceTrend = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i];
    const monthBookings = completedBookings.filter(b => getBookingDate(b).startsWith(`${currentYear}-${month}`));
    const adminMonthly = monthBookings.filter(b => b.adminCreated === 1);
    const userMonthly = monthBookings.filter(b => b.adminCreated !== 1);

    return {
      month: monthName,
      adminBookings: adminMonthly.length,
      userBookings: userMonthly.length,
      adminRevenue: adminMonthly.reduce((acc, b) => acc + (b.totalPrice || 0), 0),
      userRevenue: userMonthly.reduce((acc, b) => acc + (b.totalPrice || 0), 0),
    };
  });

  const bookingSourceByProjectType = courses.map(course => ({
    name: course.name.replace(' Remodeling', '').replace(' Reno', ''),
    admin: completedBookings.filter(b => b.courseType === course.name && b.adminCreated === 1).length,
    user: completedBookings.filter(b => b.courseType === course.name && b.adminCreated !== 1).length,
  }));

  const bookingSourceByStatus = STATUS_OPTIONS.map(status => ({
    name: status.label,
    admin: bookings.filter(b => b.status === status.value && b.adminCreated === 1).length,
    user: bookings.filter(b => b.status === status.value && b.adminCreated !== 1).length,
  })).filter(item => item.admin > 0 || item.user > 0);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <StatCard
          label="Annual Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          trend="+12% YoY"
          icon={<PKRIcon />}
        />
        <StatCard
          label="Total Bookings"
          value={totalBookings.toLocaleString()}
          trend="+8% YoY"
          icon={<Calendar className="w-5 h-5" />}
        />
        <StatCard
          label="Avg. Project Value"
          value={`$${avgProjectValue}`}
          trend="+4% YoY"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Cancellation Rate"
          value={`${cancellationRate}%`}
          trend="-0.5% YoY"
          trendDown
          icon={<XCircle className="w-5 h-5" />}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#c4864b] font-black mb-2">Booking source intelligence</p>
            <h2 className="font-serif text-3xl text-[#0f281e]">Admin vs User Bookings</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white border border-[#0f281e]/5 shadow-sm rounded-xl px-4 py-3">
              <p className="text-[9px] uppercase tracking-widest text-[#0f281e]/40 font-black">Admin Share</p>
              <p className="text-xl font-black text-[#c4864b]">{adminBookingShare}%</p>
            </div>
            <div className="bg-white border border-[#0f281e]/5 shadow-sm rounded-xl px-4 py-3">
              <p className="text-[9px] uppercase tracking-widest text-[#0f281e]/40 font-black">User Share</p>
              <p className="text-xl font-black text-[#0f281e]">{userBookingShare}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            label="Admin Bookings"
            value={adminMadeBookings.length.toLocaleString()}
            trend={`${adminBookingShare}% of bookings`}
            icon={<Shield className="w-5 h-5" />}
          />
          <StatCard
            label="User Bookings"
            value={userMadeBookings.length.toLocaleString()}
            trend={`${userBookingShare}% of bookings`}
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            label="Admin Revenue"
            value={`$${adminBookingRevenue.toLocaleString()}`}
            trend={`${adminMadeBookings.length} bookings`}
            icon={<PKRIcon />}
          />
          <StatCard
            label="User Revenue"
            value={`$${userBookingRevenue.toLocaleString()}`}
            trend={`${userMadeBookings.length} bookings`}
            icon={<PKRIcon />}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.8fr] gap-6 lg:gap-8">
          <div className="bg-white p-4 lg:p-8 shadow-sm border border-[#0f281e]/5 rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h3 className="font-serif text-xl text-[#0f281e]">Monthly Booking Source Trend</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SOURCE_COLORS.admin }} />
                  <span className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-bold">Admin</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SOURCE_COLORS.user }} />
                  <span className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-bold">User</span>
                </div>
              </div>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingSourceTrend}>
                  <defs>
                    <linearGradient id="adminSourceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={SOURCE_COLORS.admin} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={SOURCE_COLORS.admin} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="userSourceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={SOURCE_COLORS.user} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={SOURCE_COLORS.user} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#0f281e', opacity: 0.55 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#0f281e', opacity: 0.55 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #0f281e10', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="adminBookings" name="Admin bookings" stroke={SOURCE_COLORS.admin} fill="url(#adminSourceGrad)" strokeWidth={3} />
                  <Area type="monotone" dataKey="userBookings" name="User bookings" stroke={SOURCE_COLORS.user} fill="url(#userSourceGrad)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 lg:p-8 shadow-sm border border-[#0f281e]/5 rounded-xl">
            <h3 className="font-serif text-xl text-[#0f281e] mb-8">Booking Source Split</h3>
            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={bookingSourceSplit} cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={8} dataKey="value">
                    <Cell fill={SOURCE_COLORS.admin} />
                    <Cell fill={SOURCE_COLORS.user} />
                  </Pie>
                  <Tooltip formatter={(value: any, name: any, item: any) => [`${value} bookings | $${item.payload.revenue.toLocaleString()}`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
              {bookingSourceSplit.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: idx === 0 ? SOURCE_COLORS.admin : SOURCE_COLORS.user }} />
                  <span className="text-[10px] uppercase tracking-widest text-[#0f281e]/60 font-bold">{item.name}</span>
                  <span className="ml-auto text-xs font-black text-[#0f281e]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="bg-white p-4 lg:p-6 shadow-sm border border-[#0f281e]/5 rounded-xl">
            <h3 className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-bold mb-5">Revenue by Source</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingSourceRevenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip formatter={(value: any) => `$${Number(value).toLocaleString()}`} />
                  <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
                    {bookingSourceRevenue.map((entry) => (
                      <Cell key={entry.name} fill={entry.name === 'Admin' ? SOURCE_COLORS.admin : SOURCE_COLORS.user} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 lg:p-6 shadow-sm border border-[#0f281e]/5 rounded-xl">
            <h3 className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-bold mb-5">Project Type Source Mix</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingSourceByProjectType}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10, textTransform: 'uppercase' }} />
                  <Bar dataKey="admin" name="Admin" stackId="source" fill={SOURCE_COLORS.admin} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="user" name="User" stackId="source" fill={SOURCE_COLORS.user} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 lg:p-6 shadow-sm border border-[#0f281e]/5 rounded-xl">
            <h3 className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-bold mb-5">Status by Source</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingSourceByStatus} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} width={78} />
                  <Tooltip />
                  <Bar dataKey="admin" name="Admin" fill={SOURCE_COLORS.admin} radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="user" name="User" fill={SOURCE_COLORS.user} radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts Grid - Row 1 */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Area Chart: Revenue Trend */}
        <div className="bg-white p-4 lg:p-8 shadow-sm border border-[#0f281e]/5 rounded-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-serif text-xl text-[#0f281e]">Revenue Generation vs Demand</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#0f281e] rounded-full" />
                <span className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-bold">Revenue</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicRevenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f281e" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0f281e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#0f281e', opacity: 0.5 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#0f281e', opacity: 0.5 }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '0px', border: '1px solid #0f281e10', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0f281e"
                  fillOpacity={1}
                  fill="url(#colorRev)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Status Distribution */}
        <div className="bg-white p-4 lg:p-8 shadow-sm border border-[#0f281e]/5 rounded-xl">
          <h3 className="font-serif text-xl text-[#0f281e] mb-8">Project Status Breakdown</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {statusDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {statusDistribution.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-[10px] uppercase tracking-widest text-[#0f281e]/60 font-bold">{item.name}</span>
                <span className="text-[10px] font-bold text-[#0f281e] ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Charts Grid - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Radar Chart: Project Performance */}
        <div className="bg-white p-4 lg:p-8 shadow-sm border border-[#0f281e]/5 rounded-xl">
          <h3 className="font-serif text-xl text-[#0f281e] mb-8">Project Performance Index</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={projectRadarData}>
                <PolarGrid stroke="#f0f0f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#0f281e', opacity: 0.6 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar
                  name="Performance"
                  dataKey="bookings"
                  stroke="#c4864b"
                  fill="#c4864b"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Revenue"
                  dataKey="revenue"
                  stroke="#0f281e"
                  fill="#0f281e"
                  fillOpacity={0.4}
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Horizontal Bar: Crew Load */}
        <div className="bg-white p-4 lg:p-8 shadow-sm border border-[#0f281e]/5 rounded-xl">
          <h3 className="font-serif text-xl text-[#0f281e] mb-8">Crew Size Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={crewLoadData}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#0f281e', opacity: 0.6 }}
                  width={80}
                />
                <Tooltip cursor={{ fill: '#fbf7f0' }} />
                <Bar dataKey="count" fill="#0f281e" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid - Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Composed Chart: Hourly Traffic */}
        <div className="bg-white p-4 lg:p-8 shadow-sm border border-[#0f281e]/5 rounded-xl">
          <h3 className="font-serif text-xl text-[#0f281e] mb-8">Hourly Traffic & Yield</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={hourlyLoadData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#0f281e', opacity: 0.5 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#0f281e', opacity: 0.5 }}
                />
                <Tooltip />
                <Bar dataKey="bookings" fill="#c4864b" radius={[2, 2, 0, 0]} barSize={15} />
                <Line type="monotone" dataKey="revenue" stroke="#0f281e" strokeWidth={2} dot={{ r: 3, fill: '#0f281e' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
