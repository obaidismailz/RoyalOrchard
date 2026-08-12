import React from 'react';
import { motion } from 'motion/react';

interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  trendDown?: boolean;
  icon: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, trend, trendDown, icon }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white p-6 shadow-sm border border-[#0f281e]/5 rounded-[2rem] group hover:shadow-xl hover:border-[#c4864b]/20 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-[#fbf7f0] text-[#c4864b] rounded-xl group-hover:bg-[#c4864b] group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${trendDown ? 'bg-red-50 text-red-600' : 'bg-[#fbf7f0] text-[#c4864b]'}`}>
          {trend}
        </span>
      </div>
      <div className="text-2xl font-serif text-[#0f281e] mb-1">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-bold">{label}</div>
    </motion.div>
  );
};
