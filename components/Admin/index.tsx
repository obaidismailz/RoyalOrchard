import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAdmin, AdminProvider } from './AdminContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { authService } from './utils/services/authService';
import { resetPasswordService } from './utils/services/resetPasswordService';
import {
  Shield, Users, KeyRound, ChevronLeft, Sparkles, AlertCircle, Mail,
  BarChart3, TrendingUp, List, UserPlus, Briefcase, Clock4, Settings,
  X, Trash2, Download, Sun, Moon, Search, Sliders, Eye, EyeOff, ArrowDownRight, ArrowUpLeft,
  Building2, ClipboardList, Coins, FolderKanban, Smartphone, Globe, Link, Mic
} from 'lucide-react';
import { PKRIcon, PERMISSION_OPTIONS, getPermissionLabel } from './types';

// Tab imports
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { StatsTab } from './tabs/StatsTab';
import { TeeSheetTab } from './tabs/TeeSheetTab';
import { ManualBookingTab } from './tabs/ManualBookingTab';
import { PricingTab } from './tabs/PricingTab';
import { EnhancementsTab } from './tabs/EnhancementsTab';
import { StaffTab } from './tabs/StaffTab';
import { LogsTab } from './tabs/LogsTab';
import { MembersTab } from './tabs/MembersTab';
import { MemberManagementTab } from './tabs/MemberManagementTab';
import { InvoicesTab } from './tabs/InvoicesTab';
import { WebsiteTab } from './tabs/WebsiteTab';
import { ScorecardModal } from './ScorecardModal';

// Ponos Home Improvement Imports
import { PonosDashboard } from './pages/PonosDashboard';
import { Purchasing as PonosPurchasing } from './pages/Purchasing';
import { Estimating as PonosEstimating } from './pages/Estimating';
import { ProjectManagement as PonosPM } from './pages/ProjectManagement';
import { FieldMobile as PonosField } from './pages/FieldMobile';
import { ClientPortal as PonosClient } from './pages/ClientPortal';
import { MarketingWebsite as PonosWebsite } from './pages/MarketingWebsite';
import { ProjectWebsite } from './pages/ProjectWebsite';
import { Integrations as PonosIntegrations } from './pages/Integrations';
import { VoiceAssistant as PonosVoice } from './pages/VoiceAssistant';
import { RolesPermissions } from './pages/RolesPermissions';
import { GenderManagement } from './setting/GenderManagement';
import { UserStatusManagement } from './setting/UserStatusManagement';
import { ProjectStatusManagement } from './setting/ProjectStatusManagement';
import { ProjectTypeManagement } from './setting/ProjectTypeManagement';
import { MilestoneStatusManagement } from './setting/MilestoneStatusManagement';
import { MilestonePhaseManagement } from './setting/MilestonePhaseManagement';
import { ClientManagement } from './setting/ClientManagement';

// Print utility imports (removed)

function TopNavLink({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] transition-all ${
        active
          ? 'border-[#0f281e] bg-[#0f281e] text-[#dec099] shadow-[0_10px_24px_rgba(15,40,30,0.24),inset_0_1px_0_rgba(255,255,255,0.12)]'
          : 'border-white/70 bg-[#fbf7f0]/75 text-[#0f281e]/62 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] hover:border-[#dec099]/80 hover:bg-white hover:text-[#0f281e] hover:shadow-[0_8px_20px_rgba(196,134,75,0.14),inset_0_1px_0_rgba(255,255,255,0.95)]'
      }`}
      title={label}
    >
      <span className="absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-70" />
      <span className={`relative z-10 [&>svg]:h-3.5 [&>svg]:w-3.5 ${active ? 'text-[#dec099]' : 'text-[#0f281e]/38 group-hover:text-[#c4864b]'}`}>
        {icon}
      </span>
      <span className="relative z-10 whitespace-nowrap">{label}</span>
      {active && (
        <motion.span
          layoutId="admin-top-nav-active"
          className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle_at_30%_0%,rgba(222,192,153,0.2),transparent_42%),linear-gradient(135deg,#0f281e,#081610)]"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        />
      )}
    </button>
  );
}

function AdminGpsCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.7 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/15 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.24em] text-white/35">Project Tracker</p>
          <p className="mt-1 text-xs font-black text-[#dec099]">Clubhouse Fireplace Reno</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-[#c4864b]/15 bg-[#c4864b]/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-[#dec099]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#c4864b] animate-pulse" />
          Active
        </div>
      </div>

      <div className="relative h-28 rounded-xl border border-[#dec099]/10 bg-black/35 overflow-hidden flex items-center justify-center p-3">
        <div className="text-center space-y-1.5 z-10">
          <Building2 className="w-8 h-8 text-[#c4864b] mx-auto animate-bounce" />
          <p className="text-[10px] font-bold text-white">Framing Stage in Progress</p>
          <p className="text-[8px] text-white/40 font-mono">Completion: 55%</p>
        </div>
        <div className="absolute inset-0 opacity-[0.1] bg-[linear-gradient(rgba(222,192,153,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(222,192,153,0.35)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { label: 'Active Crew', value: '8 workers' },
          { label: 'Pending RFIs', value: '1 open' },
          { label: 'Materials', value: 'En Route' }
        ].map(item => (
          <div key={item.label} className="rounded-lg border border-white/8 bg-white/[0.035] px-2.5 py-2">
            <p className="text-[7px] font-black uppercase tracking-[0.18em] text-white/30">{item.label}</p>
            <p className="mt-1 text-[10px] font-black text-white/75">{item.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function AdminPonosBackground({ videoClarity = 60 }: { videoClarity?: number }) {
  const videoOpacity = 0.25 + (videoClarity / 100) * 0.75;
  const overlayOpacity = Math.max(0.05, 0.85 - (videoClarity / 100) * 0.8);

  return (
    <div className="absolute inset-0 z-0 bg-[#0f281e] pointer-events-none overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{ opacity: videoOpacity }}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
      >
        <source src="/ponos.mp4" type="video/mp4" />
      </video>

      {/* Blueprint grid layout & brand gradient overlay */}
      <div 
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_18%,rgba(196,134,75,0.25),transparent_34%),radial-gradient(ellipse_at_82%_72%,rgba(196,134,75,0.18),transparent_36%),var(--brand-gradient)] transition-opacity duration-300" 
      />
      <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(222,192,153,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(222,192,153,0.3)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Decorative architectural grid lines */}
      <div className="absolute left-[20%] top-0 bottom-0 w-px bg-white/5" />
      <div className="absolute left-[60%] top-0 bottom-0 w-px bg-white/5" />
      <div className="absolute top-[30%] left-0 right-0 h-px bg-white/5" />
      <div className="absolute top-[70%] left-0 right-0 h-px bg-white/5" />

      {/* Sweep light */}
      <motion.div
        animate={{ x: ['-120%', '120%'] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
        className="absolute inset-y-0 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-sm"
      />
    </div>
  );
}

const AdminDashboardInner: React.FC = () => {
  const {
    isAuthenticated,
    setIsAuthenticated,
    currentUser: actualUser,
    setCurrentUser,
    activeTab,
    setActiveTab,
    isDarkMode,
    isGlossyMode,
    isDynamicHeader,
    fontScale,
    isSidebarCollapsed,
    deletingId,
    setDeletingId,
    confirmDelete,
    selectedBooking,
    setSelectedBooking,
    addons,
    fetchBookings,
    fetchPricing,
    fetchCourses,
    fetchAddons,
    fetchMembers,
    fetchUsers,
    permissionRequests,
    fetchPermissionRequests,
    fetchAppNotifications,
    scorecardActiveTab,
    setScorecardActiveTab,
    scorecardBooking,
    setScorecardBooking,
    setScorecardData,
    handleOpenScorecard,
    activeColor
  } = useAdmin();

  const currentUser = { ...(actualUser || {}), role: 'Admin' };

  // Local state for Login, Forgot Password & Reset Password forms
  const searchParams = useSearchParams();
  const tokenParam = searchParams?.get('token') || '';
  const emailParam = searchParams?.get('email') || '';

  const [viewMode, setViewMode] = useState<'login' | 'forgot-password' | 'reset-password'>(() => {
    if (tokenParam || (typeof window !== 'undefined' && window.location.pathname.includes('reset-password'))) {
      return 'reset-password';
    }
    return 'login';
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const [resetToken, setResetToken] = useState(tokenParam);
  const [resetEmail, setResetEmail] = useState(emailParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

  const router = useRouter();
  const navigate = (path: string) => router.push(path);

  const handleBackToLogin = () => {
    setViewMode('login');
    setForgotError('');
    setForgotMessage('');
    setResetError('');
    setResetSuccess('');
    navigate('/admin', { replace: true });
  };

  useEffect(() => {
    if (tokenParam) setResetToken(tokenParam);
    if (emailParam) setResetEmail(emailParam);
    if (tokenParam || window.location.pathname.includes('reset-password')) {
      setViewMode('reset-password');
    }
  }, [tokenParam, emailParam]);

  // Local state for Mobile Menu & Settings Popover
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTopSettingsOpen, setIsTopSettingsOpen] = useState(false);
  const [isVaultMini, setIsVaultMini] = useState(false);

  // Local state for Login card glass opacity & background video clarity
  const [cardOpacity, setCardOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('adminCardOpacity');
    return saved !== null ? Number(saved) : 45;
  });
  const [videoClarity, setVideoClarity] = useState<number>(() => {
    const saved = localStorage.getItem('adminVideoClarity');
    return saved !== null ? Number(saved) : 60;
  });

  useEffect(() => {
    localStorage.setItem('adminCardOpacity', String(cardOpacity));
  }, [cardOpacity]);

  useEffect(() => {
    localStorage.setItem('adminVideoClarity', String(videoClarity));
  }, [videoClarity]);

  // Apply Font Scale Effect globally
  useEffect(() => {
    const clampedScale = Math.min(150, Math.max(50, fontScale));
    document.documentElement.style.fontSize = `${clampedScale}%`;
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [fontScale]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoginLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      });
      const data = await response.json();

      if (response.ok) {
        const sessionUser = {
          ...data.user,
          username: data.user.username === 'admin' ? 'Royal Orchard Admin' : data.user.username,
          permissions: [],
          email: email,
          phone: null,
          avatar: null
        };
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(sessionUser));
        setCurrentUser(sessionUser);
        setIsAuthenticated(true);
        toast.success(`Welcome back, Royal Orchard Admin`);
      } else {
        setLoginError(data.message || 'Invalid administrative credentials');
        toast.error(data.message || 'Invalid administrative credentials');
      }
    } catch (err) {
      setLoginError('Network error. Please try again.');
    } finally {
      setIsLoginLoading(false);
    }
  };


  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    setIsForgotLoading(true);

    try {
      const res = await resetPasswordService.requestReset(forgotEmail);
      let resData;
      try {
        resData = await res.json();
      } catch (parseErr) {
        // Fallback for non-JSON response
      }

      if (res.ok && resData?.success !== false) {
        const message = resData?.message || 'If an account exists for that email, a password reset link has been sent.';
        setForgotMessage(message);
        toast.success(message);
      } else {
        const message = resData?.message || 'Failed to request password reset. Please try again.';
        setForgotError(message);
        toast.error(message);
      }
    } catch (err) {
      setForgotError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    const token = resetToken || searchParams.get('token') || '';
    const userEmail = resetEmail || searchParams.get('email') || '';

    if (!token || !userEmail) {
      const msg = 'Missing recovery token or email parameters.';
      setResetError(msg);
      toast.error(msg);
      return;
    }

    // Frontend validation rules
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

    if (!hasUppercase || !hasLowercase) {
      const msg = 'The password field must contain at least one uppercase and one lowercase letter.';
      setResetError(msg);
      toast.error(msg);
      return;
    }

    if (!hasSymbol) {
      const msg = 'The password field must contain at least one symbol.';
      setResetError(msg);
      toast.error(msg);
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = 'Passwords do not match.';
      setResetError(msg);
      toast.error(msg);
      return;
    }

    setIsResetLoading(true);
    try {
      const res = await resetPasswordService.changePassword(token, userEmail, newPassword, confirmPassword);
      let resData;
      try {
        resData = await res.json();
      } catch (parseErr) {
        // Fallback for non-JSON response
      }

      if (res.ok && resData?.success !== false) {
        const msg = resData?.message || 'Password changed successfully.';
        setResetSuccess(msg);
        toast.success(msg);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          handleBackToLogin();
        }, 2200);
      } else {
        let msg = 'Failed to update access key.';
        if (resData?.errors && typeof resData.errors === 'object') {
          const errList: string[] = [];
          Object.values(resData.errors).forEach((val) => {
            if (Array.isArray(val)) errList.push(...val);
            else if (typeof val === 'string') errList.push(val);
          });
          if (errList.length > 0) msg = errList.join(' ');
        } else if (resData?.message) {
          msg = resData.message;
        }
        setResetError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = 'Network error. Please try again.';
      setResetError(msg);
      toast.error(msg);
    } finally {
      setIsResetLoading(false);
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

  const hasAccess = () => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;
    return (currentUser.permissions || []).includes(activeTab);
  };

  // If not authenticated, render the Command Center Vault screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans px-4 py-6" style={{ background: 'var(--brand-gradient, #0f281e)' }}>
        <AdminPonosBackground videoClarity={videoClarity} />

        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 220, damping: 26, mass: 0.8 }}
          className={`relative z-10 w-full flex flex-col items-center ${
            isVaultMini 
              ? 'lg:fixed lg:bottom-6 lg:right-6 lg:z-50 lg:max-w-md lg:m-0' 
              : 'max-w-4xl'
          }`}
        >
          {/* Interactive Cinematic Vision Control Bar above Popup Box */}
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 220, damping: 26, mass: 0.8 }}
            className="relative z-20 mb-4 flex items-center justify-center gap-2.5 rounded-full border border-[#dec099]/30 bg-black/55 px-5 py-2 shadow-2xl backdrop-blur-xl text-white text-xs font-semibold w-fit max-w-full"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#dec099] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#dec099]">Cinematic Vision:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={videoClarity}
              onChange={e => setVideoClarity(Number(e.target.value))}
              className="h-1.5 w-28 sm:w-36 accent-[#c4864b] bg-white/20 rounded-lg cursor-pointer"
              title="Adjust Background Video Visibility & Contrast"
            />
            <span className="text-[10px] font-mono text-[#dec099] font-bold w-8 text-right">{videoClarity}%</span>
          </motion.div>

          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 220, damping: 26, mass: 0.8 }}
            className="relative w-full rounded-[1.5rem] border border-[#c4864b]/25 bg-black/45 shadow-[0_45px_110px_rgba(0,0,0,0.62)] backdrop-blur-2xl overflow-hidden"
          >
            <motion.div
              animate={{ x: ['-35%', '135%'] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
              className="absolute top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-[#dec099] to-transparent opacity-70"
            />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(222,192,153,0.08),transparent_28%,rgba(196,134,75,0.08)_55%,transparent_78%)]" />
            <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-[size:48px_48px]" />

            <div className={`relative grid ${isVaultMini ? 'grid-cols-1' : 'min-h-[520px] lg:grid-cols-[0.9fr_1.1fr]'}`}>
              {!isVaultMini && (
                <div className="hidden lg:flex relative flex-col justify-between border-r border-white/10 p-7 overflow-hidden">
                    <div className="absolute inset-x-8 top-24 h-56 rounded-[50%] border border-[#dec099]/10" />
                    <div className="absolute inset-x-14 top-36 h-36 rounded-[50%] border border-[#c4864b]/10" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                      className="absolute right-10 top-14 h-20 w-20 rounded-full border border-dashed border-[#dec099]/25"
                    />

                    <div className="relative">
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#dec099]/20 bg-[#dec099]/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-[#dec099]">
                        <Shield className="h-3 w-3" />
                        Admin Vault
                      </div>
                      <h1 className="mt-6 font-serif text-5xl leading-[0.95] text-white">
                        Royal Orchard
                        <span className="block text-[#dec099]">Housing</span>
                      </h1>
                      <p className="mt-4 max-w-xs text-xs leading-6 text-white/55">
                        Manage three projects: Royal Orchard Multan, Sargodha, and Sahiwal.
                      </p>
                    </div>

                    <div className="relative mt-8 flex flex-col gap-3">
                      {[
                        { name: 'Royal Orchard Multan', status: 'Active Phase' },
                        { name: 'Royal Orchard Sargodha', status: 'In Development' },
                        { name: 'Royal Orchard Sahiwal', status: 'Planning' }
                      ].map((project, index) => (
                        <motion.div
                          key={project.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.15, type: 'spring', stiffness: 100 }}
                          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:bg-black/40 transition-colors"
                        >
                          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#dec099] to-[#c4864b] opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 rounded-full bg-white/5 group-hover:bg-[#dec099]/10 transition-colors">
                                <Building2 className="w-5 h-5 text-[#dec099]" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Project Tracker</p>
                                <p className="mt-1 text-sm font-black text-white">{project.name}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative flex items-center justify-center p-5 sm:p-7 lg:p-9 min-h-[520px]">
                  <div className="w-full max-w-[380px]">
                    <AnimatePresence mode="wait">
                      {viewMode === 'login' ? (
                        <motion.div
                          key="login"
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 30 }}
                          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="mb-6 text-center">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.78, y: -12 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ delay: 0.1, duration: 0.65, type: 'spring', stiffness: 120 }}
                              className="relative mx-auto mb-5 h-24 w-24"
                            >
                              <div className="absolute inset-0 rounded-full border border-[#dec099]/25 shadow-[0_0_45px_rgba(222,192,153,0.18)]" />
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                                className="absolute -inset-2 rounded-full border border-dashed border-[#c4864b]/35"
                              />
                              <div className="absolute inset-0 flex items-center justify-center p-3">
                                <img src="/log.png" alt="Royal Orchard Logo" className="h-full w-full object-contain drop-shadow-[0_0_22px_rgba(222,192,153,0.45)]" />
                              </div>
                            </motion.div>
                            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-[#c4864b]/15 bg-[#c4864b]/10 px-3 py-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#c4864b] shadow-[0_0_14px_rgba(196,134,75,0.9)] animate-pulse" />
                              <p className="text-[8px] uppercase tracking-[0.22em] text-white/55 font-black">Secure Administrative Access</p>
                            </div>
                            <h2 className="mt-4 font-serif text-4xl text-[#dec099]">Command Center</h2>
                          </div>

                          {loginError && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="mb-6 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-center text-[10px] font-black uppercase tracking-widest text-red-300"
                            >
                              {loginError}
                            </motion.div>
                          )}

                          <form onSubmit={handleLogin} className="space-y-4">
                            <motion.div
                              whileFocus={{ scale: 1.01 }}
                              className="group rounded-xl border border-white/10 bg-black/15 p-3.5 transition-all focus-within:border-[#c4864b]/60 focus-within:bg-[#c4864b]/5"
                            >
                              <label className="mb-2 block text-[9px] uppercase tracking-[0.2em] text-[#dec099]/65 font-black">Username</label>
                              <div className="relative flex items-center gap-3">
                                <Users className="h-4 w-4 text-[#dec099]/45 transition-colors group-focus-within:text-[#dec099]" />
                                <input
                                  type="text"
                                  value={email}
                                  onChange={e => setEmail(e.target.value)}
                                  className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/18"
                                  placeholder="admin"
                                  autoComplete="username"
                                  required
                                />
                              </div>
                            </motion.div>

                            <motion.div
                              whileFocus={{ scale: 1.01 }}
                              className="group rounded-xl border border-white/10 bg-black/15 p-3.5 transition-all focus-within:border-[#c4864b]/60 focus-within:bg-[#c4864b]/5"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <label className="text-[9px] uppercase tracking-[0.2em] text-[#dec099]/65 font-black">Access Key</label>
                                <button
                                  type="button"
                                  onClick={() => setViewMode('forgot-password')}
                                  className="text-[9px] uppercase tracking-[0.2em] text-[#dec099] hover:text-white font-black transition-colors"
                                >
                                  Forgot?
                                </button>
                              </div>
                              <div className="relative flex items-center gap-3">
                                <KeyRound className="h-4 w-4 text-[#dec099]/45 transition-colors group-focus-within:text-[#dec099]" />
                                <input
                                  type="password"
                                  value={password}
                                  onChange={e => setPassword(e.target.value)}
                                  className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/18"
                                  placeholder="admin"
                                />
                              </div>
                            </motion.div>

                            <button
                              type="submit"
                              disabled={isLoginLoading}
                              className="group relative mt-5 w-full overflow-hidden rounded-xl border border-[#c4864b]/40 bg-[#dec099] px-5 py-4 text-[#0f281e] shadow-[0_16px_38px_rgba(196,134,75,0.2)] transition-all hover:-translate-y-0.5 hover:border-[#dec099] hover:shadow-[0_20px_55px_rgba(196,134,75,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              <motion.div
                                animate={{ x: ['-120%', '120%'] }}
                                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.4 }}
                                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                              />
                              <span className="relative z-10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.24em]">
                                {isLoginLoading ? (
                                  <>
                                    <span className="h-4 w-4 rounded-full border-2 border-[#0f281e] border-t-transparent animate-spin" />
                                    Validating
                                  </>
                                ) : (
                                  <>
                                    Authorize Access <ChevronLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" />
                                  </>
                                )}
                              </span>
                            </button>
                          </form>

                          <div className="mt-6 flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-[0.22em] text-white/25">
                            <Sparkles className="h-3 w-3 text-[#c4864b]/60" />
                            Authorized Personnel Only
                          </div>
                        </motion.div>
                      ) : viewMode === 'forgot-password' ? (
                        <motion.div
                          key="forgot"
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -30 }}
                          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="mb-6 text-center">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.78, y: -12 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ delay: 0.1, duration: 0.65, type: 'spring', stiffness: 120 }}
                              className="relative mx-auto mb-5 h-24 w-24"
                            >
                              <div className="absolute inset-0 rounded-full border border-[#dec099]/25 shadow-[0_0_45px_rgba(222,192,153,0.18)]" />
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                                className="absolute -inset-2 rounded-full border border-dashed border-[#c4864b]/35"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <KeyRound className="h-12 w-12 text-[#dec099] drop-shadow-[0_0_22px_rgba(222,192,153,0.35)]" />
                              </div>
                            </motion.div>
                            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-[#c4864b]/15 bg-[#c4864b]/10 px-3 py-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#c4864b] shadow-[0_0_14px_rgba(196,134,75,0.9)] animate-pulse" />
                              <p className="text-[8px] uppercase tracking-[0.22em] text-white/55 font-black">Access Recovery System</p>
                            </div>
                            <h2 className="mt-4 font-serif text-4xl text-[#dec099]">Reset Access</h2>
                          </div>

                          {forgotError && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="mb-6 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-center text-[10px] font-black uppercase tracking-widest text-red-300"
                            >
                              {forgotError}
                            </motion.div>
                          )}

                          {forgotMessage && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="mb-6 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4 text-center text-[10px] font-black uppercase tracking-widest text-emerald-300"
                            >
                              {forgotMessage}
                            </motion.div>
                          )}

                          <form onSubmit={handleForgotPassword} className="space-y-4">
                            <motion.div
                              whileFocus={{ scale: 1.01 }}
                              className="group rounded-xl border border-white/10 bg-black/15 p-3.5 transition-all focus-within:border-[#c4864b]/60 focus-within:bg-[#c4864b]/5"
                            >
                              <label className="mb-2 block text-[9px] uppercase tracking-[0.2em] text-[#dec099]/65 font-black">Email Address</label>
                              <div className="relative flex items-center gap-3">
                                <Mail className="h-4 w-4 text-[#dec099]/45 transition-colors group-focus-within:text-[#dec099]" />
                                <input
                                  type="email"
                                  value={forgotEmail}
                                  onChange={e => setForgotEmail(e.target.value)}
                                  className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/18"
                                  placeholder="admin@royalorchard.test"
                                  autoComplete="email"
                                  required
                                />
                              </div>
                            </motion.div>

                            <button
                              type="submit"
                              disabled={isForgotLoading}
                              className="group relative mt-5 w-full overflow-hidden rounded-xl border border-[#c4864b]/40 bg-[#dec099] px-5 py-4 text-[#0f281e] shadow-[0_16px_38px_rgba(196,134,75,0.2)] transition-all hover:-translate-y-0.5 hover:border-[#dec099] hover:shadow-[0_20px_55px_rgba(196,134,75,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              <motion.div
                                animate={{ x: ['-120%', '120%'] }}
                                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.4 }}
                                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                              />
                              <span className="relative z-10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.24em]">
                                {isForgotLoading ? (
                                  <>
                                    <span className="h-4 w-4 rounded-full border-2 border-[#0f281e] border-t-transparent animate-spin" />
                                    Processing
                                  </>
                                ) : (
                                  <>
                                    Request Reset <ChevronLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" />
                                  </>
                                )}
                              </span>
                            </button>
                          </form>

                          <button
                            type="button"
                            onClick={handleBackToLogin}
                            className="mt-6 w-full text-center text-[9px] font-black uppercase tracking-[0.22em] text-[#dec099] hover:text-white transition-colors block font-black"
                          >
                            Back to Authorization
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="reset"
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -30 }}
                          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="mb-6 text-center">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.78, y: -12 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ delay: 0.1, duration: 0.65, type: 'spring', stiffness: 120 }}
                              className="relative mx-auto mb-5 h-24 w-24"
                            >
                              <div className="absolute inset-0 rounded-full border border-[#dec099]/25 shadow-[0_0_45px_rgba(222,192,153,0.18)]" />
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                                className="absolute -inset-2 rounded-full border border-dashed border-[#c4864b]/35"
                              />
                              <div className="absolute inset-0 flex items-center justify-center p-3">
                                <img src="/log.png" alt="Royal Orchard Logo" className="h-full w-full object-contain drop-shadow-[0_0_22px_rgba(222,192,153,0.45)]" />
                              </div>
                            </motion.div>
                            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-[#c4864b]/15 bg-[#c4864b]/10 px-3 py-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#c4864b] shadow-[0_0_14px_rgba(196,134,75,0.9)] animate-pulse" />
                              <p className="text-[8px] uppercase tracking-[0.22em] text-white/55 font-black">Access Key Update</p>
                            </div>
                            <h2 className="mt-4 font-serif text-4xl text-[#dec099]">Update Key</h2>
                          </div>

                          {resetError && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="mb-6 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-center text-[10px] font-black uppercase tracking-widest text-red-300"
                            >
                              {resetError}
                            </motion.div>
                          )}

                          {resetSuccess && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="mb-6 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4 text-center text-[10px] font-black uppercase tracking-widest text-emerald-300"
                            >
                              {resetSuccess}
                            </motion.div>
                          )}

                          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                            <motion.div
                              whileFocus={{ scale: 1.01 }}
                              className="group rounded-xl border border-white/10 bg-black/15 p-3.5 transition-all focus-within:border-[#c4864b]/60 focus-within:bg-[#c4864b]/5"
                            >
                              <label className="mb-2 block text-[9px] uppercase tracking-[0.2em] text-[#dec099]/65 font-black">New Access Key</label>
                              <div className="relative flex items-center gap-3">
                                <KeyRound className="h-4 w-4 text-[#dec099]/45 transition-colors group-focus-within:text-[#dec099]" />
                                <input
                                  type={showNewPassword ? 'text' : 'password'}
                                  value={newPassword}
                                  onChange={e => setNewPassword(e.target.value)}
                                  className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/18 pr-8"
                                  placeholder="••••••••"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword(prev => !prev)}
                                  className="absolute right-1 text-[#dec099]/50 hover:text-[#dec099] transition-colors p-1"
                                  title={showNewPassword ? "Hide password" : "Show password"}
                                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                                >
                                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>

                              {newPassword && (
                                <div className="mt-2.5 flex flex-wrap gap-1.5 text-[8px] font-bold">
                                  <span className={`px-2 py-0.5 rounded-full border transition-all ${/[A-Z]/.test(newPassword) ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300' : 'border-white/10 bg-white/5 text-white/35'}`}>
                                    {/[A-Z]/.test(newPassword) ? '✓' : '•'} Uppercase
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full border transition-all ${/[a-z]/.test(newPassword) ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300' : 'border-white/10 bg-white/5 text-white/35'}`}>
                                    {/[a-z]/.test(newPassword) ? '✓' : '•'} Lowercase
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full border transition-all ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300' : 'border-white/10 bg-white/5 text-white/35'}`}>
                                    {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? '✓' : '•'} Symbol
                                  </span>
                                </div>
                              )}
                            </motion.div>

                            <motion.div
                              whileFocus={{ scale: 1.01 }}
                              className="group rounded-xl border border-white/10 bg-black/15 p-3.5 transition-all focus-within:border-[#c4864b]/60 focus-within:bg-[#c4864b]/5"
                            >
                              <label className="mb-2 block text-[9px] uppercase tracking-[0.2em] text-[#dec099]/65 font-black">Confirm New Access Key</label>
                              <div className="relative flex items-center gap-3">
                                <KeyRound className="h-4 w-4 text-[#dec099]/45 transition-colors group-focus-within:text-[#dec099]" />
                                <input
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  value={confirmPassword}
                                  onChange={e => setConfirmPassword(e.target.value)}
                                  className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/18 pr-8"
                                  placeholder="••••••••"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(prev => !prev)}
                                  className="absolute right-1 text-[#dec099]/50 hover:text-[#dec099] transition-colors p-1"
                                  title={showConfirmPassword ? "Hide password" : "Show password"}
                                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </motion.div>

                            <button
                              type="submit"
                              disabled={isResetLoading}
                              className="group relative mt-5 w-full overflow-hidden rounded-xl border border-[#c4864b]/40 bg-[#dec099] px-5 py-4 text-[#0f281e] shadow-[0_16px_38px_rgba(196,134,75,0.2)] transition-all hover:-translate-y-0.5 hover:border-[#dec099] hover:shadow-[0_20px_55px_rgba(196,134,75,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              <motion.div
                                animate={{ x: ['-120%', '120%'] }}
                                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.4 }}
                                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                              />
                              <span className="relative z-10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.24em]">
                                {isResetLoading ? (
                                  <>
                                    <span className="h-4 w-4 rounded-full border-2 border-[#0f281e] border-t-transparent animate-spin" />
                                    Updating Credentials
                                  </>
                                ) : (
                                  <>
                                    Update Credentials <ChevronLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" />
                                  </>
                                )}
                              </span>
                            </button>
                          </form>

                          <button
                            type="button"
                            onClick={handleBackToLogin}
                            className="mt-6 w-full text-center text-[9px] font-black uppercase tracking-[0.22em] text-[#dec099] hover:text-white transition-colors block font-black"
                          >
                            Back to Authorization
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Bottom Right Arrow Toggle Button */}
              <button
                type="button"
                onClick={() => setIsVaultMini(!isVaultMini)}
                className="absolute bottom-3 right-3 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-[#dec099]/40 bg-black/60 text-[#dec099] shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all hover:scale-110 hover:border-[#dec099] hover:bg-[#0f281e] cursor-pointer"
                title={isVaultMini ? "Expand Vault to Center" : "Minimize Vault to Bottom Right"}
                aria-label={isVaultMini ? "Expand Vault to Center" : "Minimize Vault to Bottom Right"}
              >
                {isVaultMini ? (
                  <ArrowUpLeft className="h-4 w-4 text-[#dec099] transition-transform duration-300" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-[#dec099] transition-transform duration-300" />
                )}
              </button>
            </motion.div>
          </motion.div>
        </div>
    );
  }

  const isPonosWhite = activeColor?.toLowerCase() === '#ffffff';

  return (
    <div 
      className={`min-h-screen w-full flex relative transition-colors duration-500 ${isDarkMode ? 'admin-dark bg-[#07110d]' : 'bg-[#fbf7f0]'} ${isGlossyMode ? 'admin-glossy' : ''}`}
      style={isPonosWhite && !isDarkMode ? { background: 'linear-gradient(135deg, #ffffff 0%, #fbf7f0 55%, #f2ebd9 100%)' } : undefined}
    >
      {/* Mobile Overlay */}
      {!isDynamicHeader && isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
        />
      )}

      {/* Sidebar */}
      {!isDynamicHeader && (
        <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      )}

      {/* Main Content */}
      <main className={`flex-1 ${isDynamicHeader ? 'w-full' : isPonosWhite ? (isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-72') : (isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64')} transition-all duration-300 p-4 lg:p-8 min-w-0`}>
        {isDynamicHeader && (
          <div className="sticky top-3 z-40 mx-auto mb-6 flex flex-col items-center gap-2 max-w-full">
            <motion.div
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="admin-no-gloss relative w-fit max-w-full rounded-[1.35rem] border border-white/70 bg-white/75 p-1.5 shadow-[0_18px_45px_rgba(15,40,30,0.16),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl"
            >
              <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[#dec099] to-transparent opacity-80" />
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.75),transparent_28%,rgba(222,192,153,0.18)_52%,transparent_78%)] pointer-events-none" />
              <div className="relative flex items-center justify-start gap-1.5 w-full max-w-full">
                <div className="relative flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full border border-[#dec099]/20 bg-[#0f281e] px-2.5 py-1 text-[#dec099] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_22px_rgba(15,40,30,0.2)]">
                  <div className="absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-[#dec099]/70 to-transparent" />
                  <Building2 className="relative h-5 w-5 text-[#dec099] drop-shadow-[0_0_8px_rgba(222,192,153,0.28)]" />
                  <div className="hidden sm:block">
                    <div className="text-[6px] uppercase tracking-[0.16em] text-[#dec099]/70 font-black">Royal Orchard</div>
                    <div className="text-[10px] leading-3 font-black text-white">Admin</div>
                  </div>
                </div>

                <nav className="flex-1 flex min-w-0 items-center justify-start gap-1.5 overflow-x-auto scrollbar-hide">
                  {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('ponos-dashboard')) && (
                    <TopNavLink icon={<Building2 className="w-4 h-4" />} label="Royal Orchard Dashboard" active={activeTab === 'ponos-dashboard'} onClick={() => { setActiveTab('ponos-dashboard'); setIsTopSettingsOpen(false); }} />
                  )}
                  {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('ponos-pm')) && (
                    <TopNavLink icon={<FolderKanban className="w-4 h-4" />} label="Project Management" active={activeTab === 'ponos-pm'} onClick={() => { setActiveTab('ponos-pm'); setIsTopSettingsOpen(false); }} />
                  )}
                  {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('staff')) && (
                    <TopNavLink icon={<Users className="w-4 h-4" />} label="Crew & Staff Directory" active={activeTab === 'staff'} onClick={() => { setActiveTab('staff'); setIsTopSettingsOpen(false); }} />
                  )}
                  {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('logs')) && (
                    <TopNavLink icon={<Clock4 className="w-4 h-4" />} label="Audit Logs" active={activeTab === 'logs'} onClick={() => { setActiveTab('logs'); setIsTopSettingsOpen(false); }} />
                  )}
                  {(currentUser?.role === 'Admin' || (currentUser?.permissions || []).includes('roles-permissions')) && (
                    <TopNavLink icon={<Shield className="w-4 h-4" />} label="Roles & Permissions" active={activeTab === 'roles-permissions'} onClick={() => { setActiveTab('roles-permissions'); setIsTopSettingsOpen(false); }} />
                  )}
                  {(currentUser?.role === 'Admin' || 
                    (currentUser?.permissions || []).includes('settings-genders') || 
                    (currentUser?.permissions || []).includes('settings-statuses') ||
                    (currentUser?.permissions || []).includes('settings-projects') ||
                    (currentUser?.permissions || []).includes('settings-milestones') ||
                    (currentUser?.permissions || []).includes('settings-clients')) && (
                    <TopNavLink 
                      icon={<Settings className="w-4 h-4" />} 
                      label="Settings" 
                      active={activeTab.startsWith('settings-') || isTopSettingsOpen} 
                      onClick={() => setIsTopSettingsOpen(!isTopSettingsOpen)} 
                    />
                  )}
                </nav>
              </div>
            </motion.div>

            {/* Settings Sub-Nav Bar */}
            <AnimatePresence>
              {(isTopSettingsOpen || activeTab.startsWith('settings-')) && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="admin-no-gloss relative z-30 flex items-center justify-center gap-1.5 flex-wrap rounded-full border border-white/70 bg-white/85 px-4 py-2 shadow-lg backdrop-blur-xl max-w-full text-xs font-semibold"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0f281e]/40 mr-1 flex items-center gap-1">
                    <Settings className="w-3.5 h-3.5 text-[#c4864b]" /> Settings:
                  </span>

                  <button
                    type="button"
                    onClick={() => setActiveTab('settings-genders')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'settings-genders'
                        ? 'bg-[#0f281e] text-[#dec099] shadow-sm'
                        : 'text-[#0f281e]/70 hover:bg-[#0f281e]/5 hover:text-[#0f281e]'
                    }`}
                  >
                    Gender Options
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('settings-statuses')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'settings-statuses'
                        ? 'bg-[#0f281e] text-[#dec099] shadow-sm'
                        : 'text-[#0f281e]/70 hover:bg-[#0f281e]/5 hover:text-[#0f281e]'
                    }`}
                  >
                    User Status
                  </button>

                  <span className="h-3 w-px bg-[#0f281e]/10 mx-0.5" />

                  <button
                    type="button"
                    onClick={() => setActiveTab('settings-projects')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'settings-projects'
                        ? 'bg-[#0f281e] text-[#dec099] shadow-sm'
                        : 'text-[#0f281e]/70 hover:bg-[#0f281e]/5 hover:text-[#0f281e]'
                    }`}
                  >
                    Project Status
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('settings-project-types')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'settings-project-types'
                        ? 'bg-[#0f281e] text-[#dec099] shadow-sm'
                        : 'text-[#0f281e]/70 hover:bg-[#0f281e]/5 hover:text-[#0f281e]'
                    }`}
                  >
                    Project Type
                  </button>

                  <span className="h-3 w-px bg-[#0f281e]/10 mx-0.5" />

                  <button
                    type="button"
                    onClick={() => setActiveTab('settings-milestones')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'settings-milestones'
                        ? 'bg-[#0f281e] text-[#dec099] shadow-sm'
                        : 'text-[#0f281e]/70 hover:bg-[#0f281e]/5 hover:text-[#0f281e]'
                    }`}
                  >
                    Milestone Status
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('settings-milestone-phases')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'settings-milestone-phases'
                        ? 'bg-[#0f281e] text-[#dec099] shadow-sm'
                        : 'text-[#0f281e]/70 hover:bg-[#0f281e]/5 hover:text-[#0f281e]'
                    }`}
                  >
                    Milestone Phase
                  </button>

                  <span className="h-3 w-px bg-[#0f281e]/10 mx-0.5" />

                  <button
                    type="button"
                    onClick={() => setActiveTab('settings-clients')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'settings-clients'
                        ? 'bg-[#0f281e] text-[#dec099] shadow-sm'
                        : 'text-[#0f281e]/70 hover:bg-[#0f281e]/5 hover:text-[#0f281e]'
                    }`}
                  >
                    Client Management
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} />

        {/* Tab content gated by permissions */}
        {!hasAccess() ? (
          <div className="flex items-center justify-center h-64 border border-[#0f281e]/5 bg-white shadow-sm mt-8 rounded-[2rem]">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-[#0f281e]/5 text-[#0f281e]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-3xl text-[#0f281e]">Access Denied</h2>
              <p className="text-[#0f281e]/40 mt-2">You don't have permission to view this module.</p>
              {currentUser?.role !== 'Admin' && PERMISSION_OPTIONS.some(option => option.value === activeTab) && (
                <button
                  type="button"
                  disabled={hasPendingPermissionRequest(activeTab)}
                  onClick={() => handlePermissionRequest(activeTab)}
                  className="mt-6 px-6 py-3 rounded-full bg-[#0f281e] text-[#dec099] text-[10px] uppercase tracking-widest font-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#c4864b] hover:text-white transition-colors"
                >
                  {hasPendingPermissionRequest(activeTab) ? 'Request Pending' : `Request ${getPermissionLabel(activeTab)}`}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="admin-tab-content">
            {activeTab === 'ponos-dashboard' && <PonosDashboard />}
            {activeTab === 'ponos-purchasing' && <PonosPurchasing />}
            {activeTab === 'ponos-estimating' && <PonosEstimating />}
            {activeTab === 'ponos-pm' && <PonosPM />}
            {activeTab === 'ponos-field' && <PonosField />}
            {activeTab === 'ponos-client' && <PonosClient />}
            {activeTab === 'ponos-website' && <PonosWebsite />}
            {activeTab === 'multan-website' && <ProjectWebsite />}
            {activeTab === 'ponos-integrations' && <PonosIntegrations />}
             {activeTab === 'ponos-voice' && <PonosVoice />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'stats' && <StatsTab />}
            {activeTab === 'tee-sheet' && <TeeSheetTab />}
            {activeTab === 'manual-booking' && <ManualBookingTab />}
            {activeTab === 'pricing' && <PricingTab />}
            {activeTab === 'enhancements' && <EnhancementsTab />}
            {activeTab === 'staff' && <StaffTab />}
            {activeTab === 'logs' && <LogsTab />}
            {activeTab === 'members' && <MembersTab />}
            {activeTab === 'member-management' && <MemberManagementTab />}
            {activeTab === 'invoices' && <InvoicesTab />}
            {activeTab === 'website-management' && <WebsiteTab />}
            {activeTab === 'roles-permissions' && <RolesPermissions />}
            {activeTab === 'settings-genders' && <GenderManagement />}
            {activeTab === 'settings-statuses' && <UserStatusManagement />}
            {activeTab === 'settings-projects' && <ProjectStatusManagement />}
            {activeTab === 'settings-project-types' && <ProjectTypeManagement />}
            {activeTab === 'settings-milestones' && <MilestoneStatusManagement />}
            {activeTab === 'settings-milestone-phases' && <MilestonePhaseManagement />}
            {activeTab === 'settings-clients' && <ClientManagement />}
          </div>
        )}
      </main>

      {scorecardBooking && <ScorecardModal />}

      {/* Global Deletion Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-sm border-t-4 border-red-600 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl text-[#0f281e] mb-2">Confirm Deletion</h3>
            <p className="text-sm text-[#0f281e]/60 mb-8">
              Are you sure you want to delete this {deletingId.type}? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-3 uppercase tracking-widest text-xs border border-[#0f281e]/10 text-[#0f281e]/60 hover:bg-[#fbf7f0] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-3 uppercase tracking-widest text-xs hover:bg-red-700 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminPage() {
  return (
    <AdminProvider>
      <AdminDashboardInner />
    </AdminProvider>
  );
}
