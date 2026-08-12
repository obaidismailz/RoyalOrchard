import React, { useState } from 'react';
import { useAdmin } from './AdminContext';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { authService } from './utils/services/authService';
import { getSecureImageUrl } from '../../utils/imageUrl';
import {
  Menu, Bell, UserCircle, LogOut, LayoutPanelTop, List,
  Type, Sun, Moon, X, KeyRound, Shield, Palette
} from 'lucide-react';
import {
  FONT_SCALE_OPTIONS,
  PERMISSION_OPTIONS,
  getPermissionLabel
} from './types';

interface HeaderProps {
  setIsMobileMenuOpen: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setIsMobileMenuOpen }) => {
  const {
    currentUser,
    setCurrentUser,
    setIsAuthenticated,
    appNotifications,
    setAppNotifications,
    permissionRequests,
    setPermissionRequests,
    fetchPermissionRequests,
    fetchAppNotifications,
    handleReadAllNotifications,
    handlePermissionDecision,
    getNotificationUserKey,
    isDynamicHeader,
    setIsDynamicHeader,
    isDarkMode,
    setIsDarkMode,
    fontScale,
    setFontScale,
    activeColor,
    setActiveColor
  } = useAdmin();

  // Local UI states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isControlPaneOpen, setIsControlPaneOpen] = useState(false);
  const [isFontPaneOpen, setIsFontPaneOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isColorPaneOpen, setIsColorPaneOpen] = useState(false);

  const COLOR_PRESETS = [
    { name: 'Emerald', value: '#0f281e' },
    { name: 'Royal Blue', value: '#0f1f45' },
  ];

  const GRADIENT_PRESETS = [
    {
      name: 'Emerald Aurora',
      color: '#071710',
      gradient: 'linear-gradient(135deg, #071710 0%, #153c2b 50%, #071710 100%)'
    },
    {
      name: 'Royal Orchard',
      color: '#0f1f45',
      gradient: 'linear-gradient(135deg, #0b1736 0%, #1c3674 30%, #ce9f51 50%, #1c3674 70%, #0b1736 100%)'
    }
  ];

  const handleColorChange = (color: string) => {
    setActiveColor(color);
    const isWhite = color.toLowerCase() === '#ffffff';
    const gradVal = isWhite 
      ? 'linear-gradient(135deg, #ffffff 0%, #fbf7f0 55%, #f2ebd9 100%)' 
      : `linear-gradient(to bottom, ${color}, ${color})`;
    const textColor = isWhite ? '#17110a' : color;
    const borderColor = isWhite ? '#947630' : color;

    localStorage.setItem('brandColor', color);
    localStorage.setItem('brandGradient', gradVal);
    document.documentElement.style.setProperty('--brand-green', color);
    document.documentElement.style.setProperty('--brand-gradient', gradVal);
    document.documentElement.style.setProperty('--brand-text-color', textColor);
    document.documentElement.style.setProperty('--brand-border-color', borderColor);
  };

  const handleGradientChange = (color: string, gradient: string) => {
    setActiveColor(color);
    const isWhite = color.toLowerCase() === '#ffffff';
    const finalGrad = isWhite 
      ? 'linear-gradient(135deg, #ffffff 0%, #fbf7f0 55%, #f2ebd9 100%)' 
      : gradient;
    const textColor = isWhite ? '#17110a' : color;
    const borderColor = isWhite ? '#947630' : color;

    localStorage.setItem('brandColor', color);
    localStorage.setItem('brandGradient', finalGrad);
    document.documentElement.style.setProperty('--brand-green', color);
    document.documentElement.style.setProperty('--brand-gradient', finalGrad);
    document.documentElement.style.setProperty('--brand-text-color', textColor);
    document.documentElement.style.setProperty('--brand-border-color', borderColor);
  };

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const unreadNotifications = appNotifications.filter(n => !n.read);

  const handleLogout = async () => {
    const token = localStorage.getItem('adminToken');

    try {
      await authService.logout(token);
    } catch (err) {
      console.error('Logout API call failed:', err);
    }

    localStorage.removeItem('adminToken');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully.');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) {
      toast.error('Please login again before changing password');
      return;
    }
    if (passwordForm.newPassword.length < 4) {
      toast.error('New password must be at least 4 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    const res = await fetch('/api/user/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: currentUser.id,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
    });
    const data = await res.json();
    if (res.ok) {
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast.error(data.message || 'Failed to change password');
    }
  };

  const handlePermissionRequest = async (permission: string) => {
    if (!currentUser?.id) {
      toast.error('Please login again before requesting permission');
      return;
    }

    const res = await fetch('/api/permission-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        username: currentUser.username,
        permission
      })
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(`Requested ${getPermissionLabel(permission)} access`);
      fetchPermissionRequests();
      fetchAppNotifications();
    } else {
      toast.error(data.message || 'Permission request failed');
    }
  };

  const hasPendingPermissionRequest = (permission: string) =>
    permissionRequests.some(request => request.permission === permission && request.status === 'pending');

  const requestablePermissions = PERMISSION_OPTIONS.filter(option => {
    if (currentUser?.role === 'Admin') return false;
    const permissions = currentUser?.permissions || [];
    return !permissions.includes(option.value);
  });

  return (
    <>
      <header className="relative z-30 flex flex-col md:flex-row justify-between items-start md:items-end mb-8 lg:mb-12 gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`${isDynamicHeader ? 'hidden' : 'lg:hidden'} p-3 bg-white border border-[#0f281e]/10 text-[#0f281e] hover:bg-[#fbf7f0] transition-colors shadow-sm`}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div>
            <div className="flex items-center gap-2 mb-1 lg:mb-2">
              <div className="w-2 h-2 bg-[#c4864b] rounded-full animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-bold">Live Command Center</span>
            </div>
            <h1 className="font-serif text-4xl text-[#0f281e]">Admin Command Center</h1>
          </div>
        </div>

        <div className="admin-header-actions flex items-center gap-4">
          {currentUser && (
            <>
              {/* Color Customizer Option */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsColorPaneOpen(prev => !prev);
                    setIsNotificationsOpen(false);
                    setIsAccountMenuOpen(false);
                    setIsControlPaneOpen(false);
                    setIsFontPaneOpen(false);
                  }}
                  className={`relative h-12 w-12 rounded-full border shadow-sm flex items-center justify-center transition-all ${
                    isColorPaneOpen
                      ? 'bg-[#0f281e] border-[#0f281e] text-[#dec099]'
                      : 'bg-white border-[#0f281e]/10 text-[#0f281e]/50 hover:text-[#c4864b] hover:border-[#c4864b]/40'
                  }`}
                  aria-label="Customize theme color"
                  title="Customize Theme Color"
                >
                  <Palette className="w-4.5 h-4.5" />
                </button>

                <AnimatePresence>
                  {isColorPaneOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="admin-no-gloss absolute right-0 top-14 z-50 w-72 rounded-2xl border border-[#0f281e]/10 bg-white p-5 shadow-xl"
                    >
                      <div className="mb-4">
                        <div className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-bold">Theme Style</div>
                        <div className="text-sm font-bold text-[#0f281e] mt-1">Change website green color</div>
                      </div>

                      <div className="mb-3">
                        <div className="text-[9px] uppercase tracking-widest text-[#0f281e]/50 font-bold mb-2">Solid Colors</div>
                        <div className="grid grid-cols-5 gap-2">
                          {COLOR_PRESETS.map(preset => {
                            const savedGrad = localStorage.getItem('brandGradient') || '';
                            const isSelected = activeColor === preset.value && (!savedGrad || savedGrad.includes('linear-gradient(to bottom'));
                            return (
                              <button
                                key={preset.value}
                                type="button"
                                onClick={() => handleColorChange(preset.value)}
                                className={`h-8 w-8 rounded-full border transition-all relative cursor-pointer ${
                                  isSelected ? 'ring-2 ring-offset-2 ring-[#c4864b] scale-105' : 'hover:scale-105'
                                }`}
                                style={{ backgroundColor: preset.value, borderColor: 'rgba(0,0,0,0.1)' }}
                                title={preset.name}
                              />
                            );
                          })}
                        </div>
                      </div>

                      <div className="mb-4 pt-2 border-t border-[#0f281e]/5">
                        <div className="text-[9px] uppercase tracking-widest text-[#0f281e]/50 font-bold mb-2">Glossy Gradients</div>
                        <div className="grid grid-cols-2 gap-2">
                          {GRADIENT_PRESETS.map(preset => {
                            const savedGrad = localStorage.getItem('brandGradient');
                            const isSelected = savedGrad === preset.gradient;
                            const isPonosWhite = preset.name === 'Ponos White';
                            return (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => handleGradientChange(preset.color, preset.gradient)}
                                className={`h-9 px-3 rounded-xl border transition-all flex items-center justify-center text-[9px] font-black uppercase tracking-wider shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                                  isPonosWhite ? 'col-span-2' : ''
                                } ${
                                  isPonosWhite
                                    ? isSelected ? 'ring-2 ring-offset-2 ring-[#c4864b] border-transparent text-[#17110a]' : 'border-[#947630]/30 text-[#17110a]'
                                    : isSelected ? 'ring-2 ring-offset-2 ring-[#c4864b] border-transparent text-white' : 'border-white/10 text-white'
                                }`}
                                style={{ background: preset.gradient }}
                                title={preset.name}
                              >
                                {preset.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-[#0f281e]/5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-bold text-[#0f281e]/60">Custom Hex</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={activeColor}
                              onChange={(e) => handleColorChange(e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer border border-[#0f281e]/10 bg-transparent"
                            />
                            <input
                              type="text"
                              value={activeColor.toUpperCase()}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val.startsWith('#') && val.length <= 7) {
                                  handleColorChange(val);
                                }
                              }}
                              className="w-20 px-2 py-1 text-xs font-bold rounded border border-[#0f281e]/10 text-center outline-none focus:border-[#c4864b]"
                              placeholder="#0F281E"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleGradientChange('#17110a', 'linear-gradient(135deg, #17110a 0%, #c4864b 50%, #17110a 100%)')}
                          className="w-full rounded-full border border-[#0f281e]/10 py-2 text-[10px] font-black uppercase tracking-widest text-[#0f281e]/60 hover:bg-[#fbf7f0] hover:text-[#0f281e] transition-colors cursor-pointer"
                        >
                          Reset to Ponos Gold
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>


            </>
          )}

          <div
            className="relative hidden sm:block"
            onMouseEnter={() => {
              setIsAccountMenuOpen(true);
              setIsColorPaneOpen(false);
              setIsNotificationsOpen(false);
              setIsControlPaneOpen(false);
              setIsFontPaneOpen(false);
            }}
            onMouseLeave={() => setIsAccountMenuOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen(prev => !prev)}
              className={`flex h-12 items-center gap-3 rounded-full border bg-white py-1.5 pl-1.5 pr-4 shadow-sm transition-colors ${
                isAccountMenuOpen
                  ? 'border-[#c4864b]/40'
                  : 'border-[#0f281e]/10 hover:border-[#c4864b]/40'
              }`}
              aria-haspopup="menu"
              aria-expanded={isAccountMenuOpen}
              title="Account menu"
            >
              <span className="h-9 w-9 rounded-full bg-[var(--brand-green,#0f281e)] text-[#dec099] flex items-center justify-center text-base font-black uppercase shadow-sm">
                {(currentUser?.username || 'A').charAt(0)}
              </span>
              <span className="text-left">
                <span className="block text-[9px] uppercase tracking-widest text-[#0f281e]/40 font-black">Logged in as</span>
                <span className="block text-xs font-black text-[#0f281e]">{currentUser?.username}</span>
              </span>
            </button>

            <AnimatePresence>
              {isAccountMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="admin-no-gloss absolute right-0 top-14 z-50 w-52 rounded-2xl border border-[#0f281e]/10 bg-white p-2 shadow-xl"
                  role="menu"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(true);
                      setIsAccountMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-[#0f281e] transition-colors hover:bg-[#fbf7f0]"
                    role="menuitem"
                  >
                    <UserCircle className="h-4 w-4 text-[#c4864b]" />
                    My Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsControlPaneOpen(prev => !prev);
                setIsColorPaneOpen(false);
                setIsNotificationsOpen(false);
                setIsAccountMenuOpen(false);
                setIsFontPaneOpen(false);
              }}
              className={`h-12 w-12 rounded-full border shadow-sm flex items-center justify-center transition-all duration-300 admin-control-toggle ${
                isControlPaneOpen
                  ? 'bg-[#0f281e] border-[#0f281e] text-[#dec099] shadow-[0_12px_30px_rgba(15,40,30,0.22)]'
                  : 'bg-white border-[#0f281e]/10 text-[#0f281e]/35 hover:text-[#c4864b] hover:border-[#c4864b]/40'
              }`}
              aria-label="Choose admin navigation layout"
              title="Navigation layout"
            >
              <LayoutPanelTop className="w-4.5 h-4.5" />
            </button>

            <AnimatePresence>
              {isControlPaneOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="admin-no-gloss absolute right-0 top-14 z-50 w-72 rounded-2xl border border-[#0f281e]/10 bg-white p-4 shadow-xl"
                >
                  <div className="mb-3">
                    <div className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-bold">Header Layout</div>
                    <div className="mt-1 text-sm font-bold text-[#0f281e]">Choose navigation style</div>
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setIsDynamicHeader(true)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                        isDynamicHeader
                          ? 'border-[#0f281e] bg-[#0f281e] text-[#dec099]'
                          : 'border-[#0f281e]/10 bg-[#fbf7f0] text-[#0f281e]/65 hover:border-[#c4864b]/40 hover:text-[#c4864b]'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Menu className="w-4 h-4" />
                        <span>
                          <span className="block text-xs font-black">Dynamic Header</span>
                          <span className="block text-[9px] uppercase tracking-widest opacity-55">Top menu</span>
                        </span>
                      </span>
                      <span className={`h-2.5 w-2.5 rounded-full ${isDynamicHeader ? 'bg-[#dec099]' : 'bg-[#0f281e]/20'}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDynamicHeader(false)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                        !isDynamicHeader
                          ? 'border-[#0f281e] bg-[#0f281e] text-[#dec099]'
                          : 'border-[#0f281e]/10 bg-[#fbf7f0] text-[#0f281e]/60 hover:border-[#c4864b]/40 hover:text-[#c4864b]'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <List className="w-4 h-4" />
                        <span>
                          <span className="block text-xs font-black">Classic Sidebar</span>
                          <span className="block text-[9px] uppercase tracking-widest opacity-55">Left menu</span>
                        </span>
                      </span>
                      <span className={`h-2.5 w-2.5 rounded-full ${!isDynamicHeader ? 'bg-[#dec099]' : 'bg-[#0f281e]/20'}`} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsFontPaneOpen(prev => !prev);
                setIsColorPaneOpen(false);
                setIsNotificationsOpen(false);
                setIsAccountMenuOpen(false);
                setIsControlPaneOpen(false);
              }}
              className={`h-12 w-12 rounded-full border shadow-sm flex items-center justify-center transition-all duration-300 admin-font-toggle ${
                isFontPaneOpen
                  ? 'bg-[#0f281e] border-[#0f281e] text-[#dec099] shadow-[0_12px_30px_rgba(15,40,30,0.22)]'
                  : 'bg-white border-[#0f281e]/10 text-[#0f281e]/35 hover:text-[#c4864b] hover:border-[#c4864b]/40'
              }`}
              aria-label="Adjust admin font size"
              title="Font size"
            >
              <Type className="w-4.5 h-4.5" />
            </button>

            <AnimatePresence>
              {isFontPaneOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="admin-no-gloss admin-font-panel absolute right-0 top-14 z-50 w-52 rounded-2xl border border-[#0f281e]/10 bg-white p-5 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-bold">Font Size</span>
                    <span className="text-xs font-black text-[#0f281e]">{fontScale}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {FONT_SCALE_OPTIONS.map(scale => {
                      const isSelected = fontScale === scale;
                      return (
                        <button
                          key={scale}
                          type="button"
                          onClick={() => setFontScale(scale)}
                          className={`h-10 rounded-full border text-xs font-black transition-all ${
                            isSelected
                              ? 'border-[#0f281e] bg-[#0f281e] text-[#dec099] shadow-sm'
                              : 'border-[#0f281e]/10 bg-[#fbf7f0] text-[#0f281e]/55 hover:border-[#c4864b]/40 hover:text-[#c4864b]'
                          }`}
                        >
                          {scale}%
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>



          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-bold">System Status</span>
            <span className="text-xs font-bold text-[#c4864b] uppercase">All Systems Operational</span>
          </div>
        </div>
      </header>

      {/* User Profile Modal */}
      <AnimatePresence>
        {isProfileOpen && currentUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="brand-banner bg-[#0f281e] p-8 text-white relative">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="absolute right-6 top-6 h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                  aria-label="Close profile"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-5 pr-12">
                  <div className="h-20 w-20 rounded-2xl bg-[#dec099] text-[#0f281e] flex items-center justify-center overflow-hidden shadow-xl border-2 border-white/10">
                    {currentUser.avatar ? (
                      <img
                        src={getSecureImageUrl(currentUser.avatar)}
                        alt={currentUser.username}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <UserCircle className="w-10 h-10 text-[#0f281e]" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#dec099]/80 font-black">My Profile</p>
                    <h2 className="font-serif text-3xl sm:text-4xl text-white mt-1">{currentUser.username}</h2>
                    <p className="text-xs sm:text-sm text-white/60 mt-1 capitalize font-medium">{currentUser.role} account</p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto custom-scrollbar bg-[#fbf7f0]/40">
                {/* Account Details & Current Permissions */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-2xl text-[#0f281e]">Account Details</h3>
                    <span className="text-[10px] uppercase tracking-widest text-[#c4864b] font-black bg-[#c4864b]/10 px-3 py-1 rounded-full">
                      Active User
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-white border border-[#0f281e]/5 p-4 shadow-sm">
                      <p className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-black">Logged in name</p>
                      <p className="text-sm font-black text-[#0f281e] mt-1">{currentUser.username}</p>
                    </div>
                    <div className="rounded-xl bg-white border border-[#0f281e]/5 p-4 shadow-sm">
                      <p className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-black">Email</p>
                      <p className="text-sm font-black text-[#0f281e] mt-1">{currentUser.email || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white border border-[#0f281e]/5 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] uppercase tracking-widest text-[#0f281e]/40 font-black">Current Permissions</p>
                      {currentUser.role !== 'Admin' && (
                        <span className="text-[10px] font-bold text-[#0f281e]/40">
                          {currentUser.permissions?.length || 0} granted
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.role === 'Admin' ? (
                        <span className="text-[10px] bg-[#c4864b]/15 text-[#c4864b] px-3.5 py-1.5 rounded-full font-black uppercase tracking-widest border border-[#c4864b]/30">
                          All Tabs & Administrative Rights
                        </span>
                      ) : currentUser.permissions && currentUser.permissions.length > 0 ? (
                        currentUser.permissions.map(permission => (
                          <span key={permission} className="text-[11px] bg-[#0f281e]/5 text-[#0f281e] px-3 py-1.5 rounded-full font-bold border border-[#0f281e]/10 shadow-sm">
                            {getPermissionLabel(permission)}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-[#0f281e]/40 italic">No tab permissions assigned.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#0f281e]/10 my-6" />

                {/* Change Password */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-[#c4864b]/10 flex items-center justify-center text-[#c4864b]">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-[#0f281e]">Change Password</h3>
                      <p className="text-xs text-[#0f281e]/50">Update your login security credentials</p>
                    </div>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-3.5 pt-1">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/50 font-black mb-1">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                        className="w-full rounded-xl border border-[#0f281e]/10 bg-white px-4 py-3 text-sm text-[#0f281e] outline-none focus:border-[#c4864b] focus:ring-1 focus:ring-[#c4864b] transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/50 font-black mb-1">New Password</label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          placeholder="New password"
                          className="w-full rounded-xl border border-[#0f281e]/10 bg-white px-4 py-3 text-sm text-[#0f281e] outline-none focus:border-[#c4864b] focus:ring-1 focus:ring-[#c4864b] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-[#0f281e]/50 font-black mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          placeholder="Confirm new password"
                          className="w-full rounded-xl border border-[#0f281e]/10 bg-white px-4 py-3 text-sm text-[#0f281e] outline-none focus:border-[#c4864b] focus:ring-1 focus:ring-[#c4864b] transition-all"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full mt-2 rounded-full bg-[#0f281e] px-4 py-3.5 text-xs font-black uppercase tracking-widest text-[#dec099] hover:bg-[#c4864b] hover:text-white transition-all shadow-md active:scale-[0.99] cursor-pointer"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
