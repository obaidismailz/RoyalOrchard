import React from 'react';
import { useAdmin } from './AdminContext';
import { PKRIcon } from './types';
import {
  Calendar, Trash2, LogOut, Search, TrendingUp, Users,
  Clock, BarChart3, List, Settings, Briefcase, Download,
  Cloud, Wind, Droplets, Thermometer, CheckCircle2, XCircle,
  AlertCircle, PlayCircle, Clock4, ChevronLeft, X, Menu, Printer, Eye, Shield, UserPlus,
  Building2, ClipboardList, Coins, FolderKanban, Smartphone, Globe, Link, Mic
} from 'lucide-react';

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, label, active, collapsed, onClick }) => {
  const { activeColor } = useAdmin();
  const isPonosWhite = activeColor?.toLowerCase() === '#ffffff';

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 transition-all rounded-lg text-sm text-left ${
        active
          ? isPonosWhite
            ? 'bg-[#947630] text-white font-semibold shadow-sm'
            : 'bg-[#c4864b] text-white font-semibold'
          : isPonosWhite
            ? 'text-[#17110a]/65 hover:text-[#947630] hover:bg-[#947630]/5'
            : 'text-white/60 hover:text-white hover:bg-white/5'
      } ${collapsed ? 'justify-center' : ''}`}
      title={collapsed ? label : ''}
    >
      <span className="flex-shrink-0 flex items-center justify-center">{icon}</span>
      {!collapsed && <span className="font-medium text-left leading-snug">{label}</span>}
    </button>
  );
};

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const {
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isDynamicHeader,
    currentUser: actualUser,
    activeColor,
    activeProjectSlug
  } = useAdmin();

  const currentUser = { ...(actualUser || {}), role: 'Admin' };

  const isPonosWhite = activeColor?.toLowerCase() === '#ffffff';

  const [isSettingsExpanded, setIsSettingsExpanded] = React.useState(false);
  const [isUsersSubmenuExpanded, setIsUsersSubmenuExpanded] = React.useState(false);
  const [isProjectsSubmenuExpanded, setIsProjectsSubmenuExpanded] = React.useState(false);
  const [isMilestonesSubmenuExpanded, setIsMilestonesSubmenuExpanded] = React.useState(false);
  const [isClientsSubmenuExpanded, setIsClientsSubmenuExpanded] = React.useState(false);

  React.useEffect(() => {
    if (activeTab.startsWith('settings-')) {
      setIsSettingsExpanded(true);
      if (activeTab === 'settings-genders' || activeTab === 'settings-statuses') {
        setIsUsersSubmenuExpanded(true);
      }
      if (activeTab === 'settings-projects' || activeTab === 'settings-project-types') {
        setIsProjectsSubmenuExpanded(true);
      }
      if (activeTab === 'settings-milestones' || activeTab === 'settings-milestone-phases') {
        setIsMilestonesSubmenuExpanded(true);
      }
      if (activeTab === 'settings-clients') {
        setIsClientsSubmenuExpanded(true);
      }
    }
  }, [activeTab]);

  if (isDynamicHeader) return null;

  return (
    <aside 
      className={`
      ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} 
      w-64 flex flex-col fixed transition-all duration-300 z-[60] 
      ${isPonosWhite 
        ? 'top-4 bottom-4 left-4 rounded-[2rem] shadow-none bg-white text-[#17110a] border border-[#947630]' 
        : 'inset-y-0 shadow-2xl text-white border-none'
      }
      ${isMobileMenuOpen ? 'translate-x-0' : (isPonosWhite ? '-translate-x-[120%]' : '-translate-x-full')} lg:translate-x-0
    `}
      style={{ backgroundColor: isPonosWhite ? undefined : 'var(--brand-green, #0f281e)' }}
    >
      <div className={`p-4 border-b flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'items-center gap-4' : 'gap-3.5'} ${isPonosWhite ? 'border-[#947630]/25 rounded-t-[2rem]' : 'border-white/10'}`}>
        <div className={`relative flex items-center w-full ${isSidebarCollapsed ? 'flex-col gap-4 justify-center' : 'justify-center'}`}>
          <div className="relative group flex items-center justify-center">
            {/* Glowing gold effect behind the logo on hover */}
            <div className="absolute inset-0 bg-[#c4864b]/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className={`relative overflow-hidden rounded-xl p-1.5 border transition-all duration-500 ${
              isPonosWhite 
                ? 'bg-black/[0.03] border-[#947630]/25 group-hover:border-[#947630]/60' 
                : 'bg-white/[0.03] border-white/10 group-hover:border-[#c4864b]/45'
            }`}>
              <img 
                src="/log.png" 
                alt="Logo" 
                className={`${isSidebarCollapsed ? 'w-10 h-10' : 'w-14 h-14'} object-contain transition-transform duration-500 group-hover:scale-105`} 
              />
            </div>
          </div>
          
          <div className={`${isSidebarCollapsed ? 'relative' : 'absolute right-0'} flex items-center gap-2`}>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-2 rounded-full transition-all border shadow-lg group ${isSidebarCollapsed ? 'rotate-180' : ''} ${
                isPonosWhite
                  ? 'bg-black/[0.03] hover:bg-[#947630] border-[#947630]/30 hover:border-[#947630]'
                  : 'bg-white/5 hover:bg-[#c4864b] border-white/10'
              }`}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <ChevronLeft className={`w-4 h-4 transition-colors ${
                isPonosWhite
                  ? 'text-[#947630] group-hover:text-white'
                  : 'text-[#dec099] group-hover:text-white'
              }`} />
            </button>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className={`lg:hidden p-2 ${isPonosWhite ? 'text-[#17110a]/40 hover:text-[#947630]' : 'text-white/40 hover:text-white'}`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Animated Admin Status Card */}
        {!isSidebarCollapsed && (
          <div className={`relative overflow-hidden rounded-xl p-3 flex items-center justify-between group transition-all duration-500 animate-gold-pulse ${
            isPonosWhite
              ? 'bg-[#947630]/5 border border-[#947630]/20 hover:border-[#947630]/40'
              : 'bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-[#c4864b]/30'
          }`}>
            {/* Subtle sliding reflection effect */}
            <div className={`absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-[#c4864b]/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none`} />
            
            <div className="flex items-center gap-2.5 z-10">
              {/* Shield Icon inside rotating golden border */}
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-300 ${
                isPonosWhite
                  ? 'bg-gradient-to-br from-[#947630]/15 to-[#c4864b]/5 border-[#947630]/30 group-hover:border-[#947630]/60'
                  : 'bg-gradient-to-br from-[#c4864b]/20 to-[#dec099]/5 border-[#c4864b]/30 group-hover:border-[#c4864b]/60'
              }`}>
                <Shield className={`w-4 h-4 ${isPonosWhite ? 'text-[#947630]' : 'text-[#dec099]'}`} />
                {/* Pulsing indicator dot */}
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className={`text-[11px] font-serif font-black tracking-[0.2em] uppercase ${isPonosWhite ? 'text-[#947630]' : 'text-[#dec099]'}`}>
                  Admin Portal
                </span>
                <span className={`text-[9px] font-mono tracking-wider ${isPonosWhite ? 'text-[#17110a]/50' : 'text-white/40'}`}>
                  {currentUser?.username ? `@${currentUser.username}` : 'SECURE SESSION'}
                </span>
              </div>
            </div>

            <div className="z-10 flex items-center">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 tracking-wide uppercase">
                Active
              </span>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto sidebar-scrollbar">
        {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('ponos-dashboard')) && (
          <SidebarLink
            icon={<Building2 className="w-5 h-5" />}
            label="Dashboard"
            active={activeTab === 'ponos-dashboard'}
            collapsed={isSidebarCollapsed}
            onClick={() => { setActiveTab('ponos-dashboard'); setIsMobileMenuOpen(false); }}
          />
        )}
        {false && (
          <>
            {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('ponos-purchasing')) && (
              <SidebarLink
                icon={<ClipboardList className="w-5 h-5" />}
                label="Ponos Purchasing"
                active={activeTab === 'ponos-purchasing'}
                collapsed={isSidebarCollapsed}
                onClick={() => { setActiveTab('ponos-purchasing'); setIsMobileMenuOpen(false); }}
              />
            )}
            {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('ponos-estimating')) && (
              <SidebarLink
                icon={<Coins className="w-5 h-5" />}
                label="Ponos Estimating"
                active={activeTab === 'ponos-estimating'}
                collapsed={isSidebarCollapsed}
                onClick={() => { setActiveTab('ponos-estimating'); setIsMobileMenuOpen(false); }}
              />
            )}
            {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('ponos-pm')) && (
              <SidebarLink
                icon={<FolderKanban className="w-5 h-5" />}
                label="Project Management"
                active={activeTab === 'ponos-pm'}
                collapsed={isSidebarCollapsed}
                onClick={() => { setActiveTab('ponos-pm'); setIsMobileMenuOpen(false); }}
              />
            )}

            {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('ponos-client')) && (
              <SidebarLink
                icon={<Users className="w-5 h-5" />}
                label="Ponos Client Portal"
                active={activeTab === 'ponos-client'}
                collapsed={isSidebarCollapsed}
                onClick={() => { setActiveTab('ponos-client'); setIsMobileMenuOpen(false); }}
              />
            )}
            {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('ponos-website')) && (
              <SidebarLink
                icon={<Globe className="w-5 h-5" />}
                label="Ponos Website"
                active={activeTab === 'ponos-website'}
                collapsed={isSidebarCollapsed}
                onClick={() => { setActiveTab('ponos-website'); setIsMobileMenuOpen(false); }}
              />
            )}
          </>
        )}
        {activeProjectSlug && activeTab === 'multan-website' && (
          <SidebarLink
            icon={<Globe className="w-5 h-5" />}
            label={`${activeProjectSlug.charAt(0).toUpperCase() + activeProjectSlug.slice(1)} Manager`}
            active={true}
            collapsed={isSidebarCollapsed}
            onClick={() => { setIsMobileMenuOpen(false); }}
          />
        )}
        {false && (
          <>
            {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('ponos-integrations')) && (
              <SidebarLink
                icon={<Link className="w-5 h-5" />}
                label="Ponos Integrations"
                active={activeTab === 'ponos-integrations'}
                collapsed={isSidebarCollapsed}
                onClick={() => { setActiveTab('ponos-integrations'); setIsMobileMenuOpen(false); }}
              />
            )}
            {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('ponos-voice')) && (
              <SidebarLink
                icon={<Mic className="w-5 h-5" />}
                label="Ponos Voice Assistant"
                active={activeTab === 'ponos-voice'}
                collapsed={isSidebarCollapsed}
                onClick={() => { setActiveTab('ponos-voice'); setIsMobileMenuOpen(false); }}
              />
            )}
            {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('analytics')) && (
              <SidebarLink
                icon={<BarChart3 className="w-5 h-5" />}
                label="Performance Analytics"
                active={activeTab === 'analytics'}
                collapsed={isSidebarCollapsed}
                onClick={() => { setActiveTab('analytics'); setIsMobileMenuOpen(false); }}
              />
            )}
            {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('stats')) && (
              <SidebarLink
                icon={<TrendingUp className="w-5 h-5" />}
                label="Project Statistics"
                active={activeTab === 'stats'}
                collapsed={isSidebarCollapsed}
                onClick={() => { setActiveTab('stats'); setIsMobileMenuOpen(false); }}
              />
            )}
            {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('tee-sheet')) && (
              <SidebarLink
                icon={<List className="w-5 h-5" />}
                label="Project Scheduling"
                active={activeTab === 'tee-sheet'}
                collapsed={isSidebarCollapsed}
                onClick={() => { setActiveTab('tee-sheet'); setIsMobileMenuOpen(false); }}
              />
            )}
            {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('manual-booking')) && (
              <SidebarLink
                icon={<UserPlus className="w-5 h-5" />}
                label="New Project Booking"
                active={activeTab === 'manual-booking'}
                collapsed={isSidebarCollapsed}
                onClick={() => { setActiveTab('manual-booking'); setIsMobileMenuOpen(false); }}
              />
            )}
            {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('pricing')) && (
              <SidebarLink
                icon={<PKRIcon />}
                label="Material & Labor Rates"
                active={activeTab === 'pricing'}
                collapsed={isSidebarCollapsed}
                onClick={() => { setActiveTab('pricing'); setIsMobileMenuOpen(false); }}
              />
            )}
            {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('enhancements')) && (
              <SidebarLink
                icon={<Briefcase className="w-5 h-5" />}
                label="Upgrade Options Catalog"
                active={activeTab === 'enhancements'}
                collapsed={isSidebarCollapsed}
                onClick={() => { setActiveTab('enhancements'); setIsMobileMenuOpen(false); }}
              />
            )}
            {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('staff')) && (
              <SidebarLink
                icon={<Users className="w-5 h-5" />}
                label="Crew & Staff Directory"
                active={activeTab === 'staff'}
                collapsed={isSidebarCollapsed}
                onClick={() => { setActiveTab('staff'); setIsMobileMenuOpen(false); }}
              />
            )}
            {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('logs')) && (
              <SidebarLink
                icon={<Clock4 className="w-5 h-5" />}
                label="Audit Logs"
                active={activeTab === 'logs'}
                collapsed={isSidebarCollapsed}
                onClick={() => { setActiveTab('logs'); setIsMobileMenuOpen(false); }}
              />
            )}
            {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('members')) && (
              <SidebarLink
                icon={<Search className="w-5 h-5" />}
                label="Client Records"
                active={activeTab === 'members'}
                collapsed={isSidebarCollapsed}
                onClick={() => { setActiveTab('members'); setIsMobileMenuOpen(false); }}
              />
            )}
            {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('member-management')) && (
              <SidebarLink
                icon={<Users className="w-5 h-5" />}
                label="Client Account Directory"
                active={activeTab === 'member-management'}
                collapsed={isSidebarCollapsed}
                onClick={() => { setActiveTab('member-management'); setIsMobileMenuOpen(false); }}
              />
            )}
            {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('invoices')) && (
              <SidebarLink
                icon={<TrendingUp className="w-5 h-5" />}
                label="Invoices & Draws"
                active={activeTab === 'invoices'}
                collapsed={isSidebarCollapsed}
                onClick={() => { setActiveTab('invoices'); setIsMobileMenuOpen(false); }}
              />
            )}
            {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('website-management')) && (
              <SidebarLink
                icon={<Settings className="w-5 h-5" />}
                label="Marketing Site Manager"
                active={activeTab === 'website-management'}
                collapsed={isSidebarCollapsed}
                onClick={() => { setActiveTab('website-management'); setIsMobileMenuOpen(false); }}
              />
            )}
            {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('roles-permissions')) && (
              <SidebarLink
                icon={<Shield className="w-5 h-5" />}
                label="Roles & Permissions"
                active={activeTab === 'roles-permissions'}
                collapsed={isSidebarCollapsed}
                onClick={() => { setActiveTab('roles-permissions'); setIsMobileMenuOpen(false); }}
              />
            )}
            
            {(currentUser?.role === 'Admin' || 
              (currentUser?.permissions || []).includes('settings-genders') || 
              (currentUser?.permissions || []).includes('settings-statuses') ||
              (currentUser?.permissions || []).includes('settings-projects') ||
              (currentUser?.permissions || []).includes('settings-milestones') ||
              (currentUser?.permissions || []).includes('settings-clients')) && (
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setIsSettingsExpanded(!isSettingsExpanded);
                  }}
                  className={`flex items-center justify-between w-full p-3 transition-all rounded-lg text-sm text-left ${
                    activeTab.startsWith('settings-')
                      ? isPonosWhite
                        ? 'bg-[#947630]/5 text-[#947630] font-semibold border-l-2 border-[#947630]'
                        : 'bg-white/5 text-[#dec099] font-semibold border-l-2 border-[#c4864b]'
                      : isPonosWhite
                        ? 'text-[#17110a]/65 hover:text-[#947630] hover:bg-[#947630]/5'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                  } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                  title={isSidebarCollapsed ? "Settings" : ""}
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    {!isSidebarCollapsed && <span className="font-medium">Settings</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <ChevronLeft 
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isSettingsExpanded 
                          ? isPonosWhite ? '-rotate-90 text-[#947630]' : '-rotate-90 text-[#dec099]' 
                          : isPonosWhite ? 'text-[#17110a]/40' : 'text-white/40'
                      }`} 
                    />
                  )}
                </button>

                {/* Submenu Level 1: Users */}
                {!isSidebarCollapsed && isSettingsExpanded && (
                  <div className="pl-4 space-y-1 mt-1 transition-all duration-300">
                    <button
                      onClick={() => setIsUsersSubmenuExpanded(!isUsersSubmenuExpanded)}
                      className={`flex items-center justify-between w-full p-2.5 transition-all rounded-lg text-xs text-left ${
                        isUsersSubmenuExpanded 
                          ? isPonosWhite ? 'text-[#947630] font-semibold' : 'text-[#dec099] font-semibold' 
                          : isPonosWhite ? 'text-[#17110a]/50 hover:text-[#947630] hover:bg-[#947630]/5' : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className={`w-4 h-4 flex-shrink-0 ${isPonosWhite ? 'text-[#17110a]/30' : 'text-white/30'}`} />
                        <span>Users</span>
                      </div>
                      <ChevronLeft 
                        className={`w-3 h-3 transition-transform duration-200 ${
                          isUsersSubmenuExpanded 
                            ? isPonosWhite ? '-rotate-90 text-[#947630]' : '-rotate-90 text-[#dec099]' 
                            : isPonosWhite ? 'text-[#17110a]/30' : 'text-white/30'
                        }`} 
                      />
                    </button>

                    {/* Submenu Level 2: Gender and User Status */}
                    {isUsersSubmenuExpanded && (
                      <div className={`pl-6 space-y-1.5 mt-1 border-l ml-4.5 ${isPonosWhite ? 'border-[#947630]/20' : 'border-white/10'}`}>
                        <button
                          onClick={() => {
                            setActiveTab('settings-genders');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`block w-full py-1.5 px-3 rounded-md text-[11px] text-left transition-all ${
                            activeTab === 'settings-genders'
                              ? isPonosWhite ? 'text-[#947630] font-bold bg-[#947630]/10' : 'text-[#dec099] font-bold bg-white/[0.04]'
                              : isPonosWhite ? 'text-[#17110a]/50 hover:text-[#947630]' : 'text-white/40 hover:text-white'
                          }`}
                        >
                          • Gender Options
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('settings-statuses');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`block w-full py-1.5 px-3 rounded-md text-[11px] text-left transition-all ${
                            activeTab === 'settings-statuses'
                              ? isPonosWhite ? 'text-[#947630] font-bold bg-[#947630]/10' : 'text-[#dec099] font-bold bg-white/[0.04]'
                              : isPonosWhite ? 'text-[#17110a]/50 hover:text-[#947630]' : 'text-white/40 hover:text-white'
                          }`}
                        >
                          • User Status
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Submenu Level 1: Projects */}
                {!isSidebarCollapsed && isSettingsExpanded && (
                  <div className="pl-4 space-y-1 mt-1 transition-all duration-300">
                    <button
                      onClick={() => setIsProjectsSubmenuExpanded(!isProjectsSubmenuExpanded)}
                      className={`flex items-center justify-between w-full p-2.5 transition-all rounded-lg text-xs text-left ${
                        isProjectsSubmenuExpanded 
                          ? isPonosWhite ? 'text-[#947630] font-semibold' : 'text-[#dec099] font-semibold' 
                          : isPonosWhite ? 'text-[#17110a]/50 hover:text-[#947630] hover:bg-[#947630]/5' : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FolderKanban className={`w-4 h-4 flex-shrink-0 ${isPonosWhite ? 'text-[#17110a]/30' : 'text-white/30'}`} />
                        <span>Projects</span>
                      </div>
                      <ChevronLeft 
                        className={`w-3 h-3 transition-transform duration-200 ${
                          isProjectsSubmenuExpanded 
                            ? isPonosWhite ? '-rotate-90 text-[#947630]' : '-rotate-90 text-[#dec099]' 
                            : isPonosWhite ? 'text-[#17110a]/30' : 'text-white/30'
                        }`} 
                      />
                    </button>

                    {/* Submenu Level 2: Project Status & Project Type */}
                    {isProjectsSubmenuExpanded && (
                      <div className={`pl-6 space-y-1.5 mt-1 border-l ml-4.5 ${isPonosWhite ? 'border-[#947630]/20' : 'border-white/10'}`}>
                        <button
                          onClick={() => {
                            setActiveTab('settings-projects');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`block w-full py-1.5 px-3 rounded-md text-[11px] text-left transition-all ${
                            activeTab === 'settings-projects'
                              ? isPonosWhite ? 'text-[#947630] font-bold bg-[#947630]/10' : 'text-[#dec099] font-bold bg-white/[0.04]'
                              : isPonosWhite ? 'text-[#17110a]/50 hover:text-[#947630]' : 'text-white/40 hover:text-white'
                          }`}
                        >
                          • Project Status
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('settings-project-types');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`block w-full py-1.5 px-3 rounded-md text-[11px] text-left transition-all ${
                            activeTab === 'settings-project-types'
                              ? isPonosWhite ? 'text-[#947630] font-bold bg-[#947630]/10' : 'text-[#dec099] font-bold bg-white/[0.04]'
                              : isPonosWhite ? 'text-[#17110a]/50 hover:text-[#947630]' : 'text-white/40 hover:text-white'
                          }`}
                        >
                          • Project Type
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Submenu Level 1: Milestones */}
                {!isSidebarCollapsed && isSettingsExpanded && (
                  <div className="pl-4 space-y-1 mt-1 transition-all duration-300">
                    <button
                      onClick={() => setIsMilestonesSubmenuExpanded(!isMilestonesSubmenuExpanded)}
                      className={`flex items-center justify-between w-full p-2.5 transition-all rounded-lg text-xs text-left ${
                        isMilestonesSubmenuExpanded 
                          ? isPonosWhite ? 'text-[#947630] font-semibold' : 'text-[#dec099] font-semibold' 
                          : isPonosWhite ? 'text-[#17110a]/50 hover:text-[#947630] hover:bg-[#947630]/5' : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${isPonosWhite ? 'text-[#17110a]/30' : 'text-white/30'}`} />
                        <span>Milestones</span>
                      </div>
                      <ChevronLeft 
                        className={`w-3 h-3 transition-transform duration-200 ${
                          isMilestonesSubmenuExpanded 
                            ? isPonosWhite ? '-rotate-90 text-[#947630]' : '-rotate-90 text-[#dec099]' 
                            : isPonosWhite ? 'text-[#17110a]/30' : 'text-white/30'
                        }`} 
                      />
                    </button>

                    {/* Submenu Level 2: Milestone Status & Milestone Phase */}
                    {isMilestonesSubmenuExpanded && (
                      <div className={`pl-6 space-y-1.5 mt-1 border-l ml-4.5 ${isPonosWhite ? 'border-[#947630]/20' : 'border-white/10'}`}>
                        <button
                          onClick={() => {
                            setActiveTab('settings-milestones');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`block w-full py-1.5 px-3 rounded-md text-[11px] text-left transition-all ${
                            activeTab === 'settings-milestones'
                              ? isPonosWhite ? 'text-[#947630] font-bold bg-[#947630]/10' : 'text-[#dec099] font-bold bg-white/[0.04]'
                              : isPonosWhite ? 'text-[#17110a]/50 hover:text-[#947630]' : 'text-white/40 hover:text-white'
                          }`}
                        >
                          • Milestone Status
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('settings-milestone-phases');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`block w-full py-1.5 px-3 rounded-md text-[11px] text-left transition-all ${
                            activeTab === 'settings-milestone-phases'
                              ? isPonosWhite ? 'text-[#947630] font-bold bg-[#947630]/10' : 'text-[#dec099] font-bold bg-white/[0.04]'
                              : isPonosWhite ? 'text-[#17110a]/50 hover:text-[#947630]' : 'text-white/40 hover:text-white'
                          }`}
                        >
                          • Milestone Phase
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Submenu Level 1: Clients */}
                {!isSidebarCollapsed && isSettingsExpanded && (
                  <div className="pl-4 space-y-1 mt-1 transition-all duration-300">
                    <button
                      onClick={() => setIsClientsSubmenuExpanded(!isClientsSubmenuExpanded)}
                      className={`flex items-center justify-between w-full p-2.5 transition-all rounded-lg text-xs text-left ${
                        isClientsSubmenuExpanded 
                          ? isPonosWhite ? 'text-[#947630] font-semibold' : 'text-[#dec099] font-semibold' 
                          : isPonosWhite ? 'text-[#17110a]/50 hover:text-[#947630] hover:bg-[#947630]/5' : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className={`w-4 h-4 flex-shrink-0 ${isPonosWhite ? 'text-[#17110a]/30' : 'text-white/30'}`} />
                        <span>Clients</span>
                      </div>
                      <ChevronLeft 
                        className={`w-3 h-3 transition-transform duration-200 ${
                          isClientsSubmenuExpanded 
                            ? isPonosWhite ? '-rotate-90 text-[#947630]' : '-rotate-90 text-[#dec099]' 
                            : isPonosWhite ? 'text-[#17110a]/30' : 'text-white/30'
                        }`} 
                      />
                    </button>

                    {/* Submenu Level 2: Client */}
                    {isClientsSubmenuExpanded && (
                      <div className={`pl-6 space-y-1.5 mt-1 border-l ml-4.5 ${isPonosWhite ? 'border-[#947630]/20' : 'border-white/10'}`}>
                        <button
                          onClick={() => {
                            setActiveTab('settings-clients');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`block w-full py-1.5 px-3 rounded-md text-[11px] text-left transition-all ${
                            activeTab === 'settings-clients'
                              ? isPonosWhite ? 'text-[#947630] font-bold bg-[#947630]/10' : 'text-[#dec099] font-bold bg-white/[0.04]'
                              : isPonosWhite ? 'text-[#17110a]/50 hover:text-[#947630]' : 'text-white/40 hover:text-white'
                          }`}
                        >
                          • Client
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </nav>

      <div className={`border-t ${isPonosWhite ? 'border-[#947630]/25' : 'border-white/10'}`}>
        <div className={`flex items-center transition-all ${isSidebarCollapsed ? 'flex-col gap-1.5 justify-center p-3' : 'justify-between gap-3 p-4'}`}>
          {!isSidebarCollapsed ? (
            <>
              <span className={`text-[9px] font-black uppercase tracking-[0.15em] font-sans ${isPonosWhite ? 'text-[#17110a]/30' : 'text-white/30'}`}>All Rights Reserved</span>
              <div className="flex items-center">
                <img 
                  src="/log.png" 
                  alt="Ponos Logo" 
                  className="h-7 w-7 object-contain transition-transform duration-300 hover:scale-110" 
                />
              </div>
            </>
          ) : (
            <>
              <img 
                src="/log.png" 
                alt="Ponos Logo" 
                className="h-6 w-6 object-contain transition-transform duration-300 hover:scale-110" 
              />
              <span className={`text-[8px] font-black uppercase tracking-wider font-sans ${isPonosWhite ? 'text-[#17110a]/30' : 'text-white/30'}`}>Protected</span>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
