import React from 'react';
import { CheckCircle2, PlayCircle, TrendingUp, XCircle, AlertCircle } from 'lucide-react';

export const PKRIcon = ({ className = "w-5 h-5" }: { className?: string }) =>
  React.createElement('span', {
    className: `${className} flex items-center justify-center font-bold text-[10px] tracking-tight`
  }, '$');

export interface Player {
  name: string;
  handicap: number;
}

export interface Flight {
  id: number;
  players: Player[];
}

export interface Booking {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  courseType: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  totalPrice?: number;
  basePrice?: number;
  enhancementsPrice?: number;
  userId?: number;
  createdAt?: string;
  selectedAddons?: string; // JSON string of addon IDs
  adminCreated?: number;
  playerDetails?: string;
  scorecard?: string;
  isPaid?: number;
}

export interface Pricing {
  id: number;
  courseId: number;
  time: string;
  price: number;
  discount?: number;
}

export interface Course {
  id: number;
  name: string;
  holes?: number;
}

export interface Addon {
  id: number;
  name: string;
  price: number;
  icon: string;
  description: string;
  isAvailable: number;
}

export interface CurrentAdminUser {
  id?: number;
  username: string;
  role: string;
  permissions: string[];
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
}

export interface PermissionRequest {
  id: number;
  userId: number;
  username: string;
  permission: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
}

export interface AppNotification {
  key: string;
  type: 'booking' | 'member' | 'permission';
  title: string;
  message: string;
  detail?: string;
  status?: string;
  createdAt: string;
  read: boolean;
  meta?: any;
}

export interface PlayerReceiptBreakdown {
  playerName: string;
  handicap?: number;
  playerIndex: number;
  playerCount: number;
  greenFee: number;
  cartFee: number;
  cartQuantity: number;
  cartTotal: number;
  total: number;
}

export const COLORS = ['#c4864b', '#0f281e', '#dec099'];
export const SOURCE_COLORS = {
  admin: '#c4864b',
  user: '#0f281e'
};
export const FONT_SCALE_OPTIONS = [50, 70, 90, 100, 110, 120];

export const MODULE_FILTERS = ['All', 'Project Schedule', 'Labor Rates', 'Upgrades Catalog', 'Crew & Staff Directory'];
export type AdminTab = 
  | 'ponos-dashboard' 
  | 'ponos-purchasing' 
  | 'ponos-estimating' 
  | 'ponos-pm' 
  | 'ponos-field' 
  | 'ponos-client' 
  | 'ponos-website' 
  | 'multan-website'
  | 'ponos-integrations' 
  | 'ponos-voice'
  | 'analytics'
  | 'stats'
  | 'tee-sheet'
  | 'manual-booking'
  | 'pricing'
  | 'enhancements'
  | 'staff'
  | 'logs'
  | 'members'
  | 'member-management'
  | 'invoices'
  | 'website-management'
  | 'roles-permissions'
  | 'settings-genders'
  | 'settings-statuses'
  | 'settings-projects'
  | 'settings-project-types'
  | 'settings-milestones'
  | 'settings-milestone-phases'
  | 'settings-clients';

export const PERMISSION_OPTIONS = [
  { value: 'ponos-dashboard', label: 'Ponos Dashboard' },
  { value: 'ponos-purchasing', label: 'Ponos Purchasing' },
  { value: 'ponos-estimating', label: 'Ponos Estimating' },
  { value: 'ponos-pm', label: 'Ponos Project Management' },
  { value: 'ponos-field', label: 'Ponos Field Mobile' },
  { value: 'ponos-client', label: 'Ponos Client Portal' },
  { value: 'ponos-website', label: 'Ponos Marketing Website' },
  { value: 'ponos-integrations', label: 'Ponos Integrations' },
  { value: 'ponos-voice', label: 'Ponos Voice Assistant' },
  { value: 'analytics', label: 'Performance Analytics' },
  { value: 'stats', label: 'Project Statistics' },
  { value: 'tee-sheet', label: 'Project Schedule' },
  { value: 'manual-booking', label: 'New Project Booking' },
  { value: 'pricing', label: 'Labor & Booking Rates' },
  { value: 'enhancements', label: 'Upgrade Options Catalog' },
  { value: 'staff', label: 'Crew & Staff Directory' },
  { value: 'logs', label: 'Audit Logs' },
  { value: 'members', label: 'Client Records' },
  { value: 'member-management', label: 'Client Account Directory' },
  { value: 'invoices', label: 'Invoices & Draws' },
  { value: 'website-management', label: 'Marketing Site Manager' },
  { value: 'roles-permissions', label: 'Roles & Permissions Manager' },
  { value: 'settings-genders', label: 'Settings - Genders' },
  { value: 'settings-statuses', label: 'Settings - User Statuses' },
  { value: 'settings-projects', label: 'Settings - Project Statuses' },
  { value: 'settings-project-types', label: 'Settings - Project Types' },
  { value: 'settings-milestones', label: 'Settings - Milestone Statuses' },
  { value: 'settings-milestone-phases', label: 'Settings - Milestone Phases' },
  { value: 'settings-clients', label: 'Settings - Clients' },
];

export const getPermissionLabel = (permission: string) => PERMISSION_OPTIONS.find(item => item.value === permission)?.label || permission.replace(/[-_]/g, ' ');

export const SUB_FILTERS: Record<string, { label: string, actions: string[] }[]> = {
  'Project Schedule': [
    { label: 'Delete', actions: ['Delete Booking'] },
    { label: 'Status change', actions: ['Status Change'] }
  ],
  'Labor Rates': [
    { label: 'New price change', actions: ['Update Pricing', 'Add Pricing'] },
    { label: 'Discount applied', actions: ['Update Pricing'] },
    { label: 'Deleted', actions: ['Delete Pricing'] }
  ],
  'Upgrades Catalog': [
    { label: 'Deleted', actions: ['Delete Enhancement'] },
    { label: 'New added', actions: ['Add Enhancement'] },
    { label: 'Updated previous', actions: ['Update Enhancement'] }
  ],
  'Crew & Staff Directory': [
    { label: 'Deleted', actions: ['Delete Staff'] },
    { label: 'New added', actions: ['Add Staff'] },
    { label: 'Updated previous', actions: ['Update Staff'] }
  ]
};

export const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Scheduled', icon: React.createElement(CheckCircle2, { className: "w-4 h-4 text-[#c4864b]" }) },
  { value: 'checked-in', label: 'Mobilized', icon: React.createElement(PlayCircle, { className: "w-4 h-4 text-blue-500" }) },
  { value: 'on-course', label: 'In Progress', icon: React.createElement(TrendingUp, { className: "w-4 h-4 text-[#c4864b]" }) },
  { value: 'completed', label: 'Completed', icon: React.createElement(CheckCircle2, { className: "w-4 h-4 text-gray-500" }) },
  { value: 'cancelled', label: 'Cancelled', icon: React.createElement(XCircle, { className: "w-4 h-4 text-red-500" }) },
  { value: 'no-show', label: 'Delayed', icon: React.createElement(AlertCircle, { className: "w-4 h-4 text-orange-500" }) },
];

export const getOverUnder = (scores: number[], pars: number[]) => {
  let scoreSum = 0;
  let parSum = 0;
  scores.forEach((s, idx) => {
    if (s > 0) {
      scoreSum += s;
      parSum += pars[idx];
    }
  });
  if (scoreSum === 0) return '-';
  const diff = scoreSum - parSum;
  if (diff === 0) return 'E';
  return diff > 0 ? `+${diff}` : `${diff}`;
};
