import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Booking, Pricing, Course, Addon, CurrentAdminUser, PermissionRequest, AppNotification, AdminTab } from './types';
import { userService } from './utils/services/userService';

interface AdminContextType {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  pricing: Pricing[];
  setPricing: React.Dispatch<React.SetStateAction<Pricing[]>>;
  addons: Addon[];
  setAddons: React.Dispatch<React.SetStateAction<Addon[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  users: any[];
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  members: any[];
  setMembers: React.Dispatch<React.SetStateAction<any[]>>;
  carouselImages: string[];
  setCarouselImages: React.Dispatch<React.SetStateAction<string[]>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  currentUser: CurrentAdminUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<CurrentAdminUser | null>>;
  permissionRequests: PermissionRequest[];
  setPermissionRequests: React.Dispatch<React.SetStateAction<PermissionRequest[]>>;
  appNotifications: AppNotification[];
  setAppNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  activeTab: AdminTab;
  setActiveTab: React.Dispatch<React.SetStateAction<AdminTab>>;
  activeProjectSlug: string | null;
  setActiveProjectSlug: React.Dispatch<React.SetStateAction<string | null>>;
  selectedBooking: Booking | null;
  setSelectedBooking: React.Dispatch<React.SetStateAction<Booking | null>>;
  scorecardBooking: Booking | null;
  setScorecardBooking: React.Dispatch<React.SetStateAction<Booking | null>>;
  scorecardData: any | null;
  setScorecardData: React.Dispatch<React.SetStateAction<any | null>>;
  scorecardActiveTab: 'scorecard' | 'result' | 'analysis';
  setScorecardActiveTab: React.Dispatch<React.SetStateAction<'scorecard' | 'result' | 'analysis'>>;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  isGlossyMode: boolean;
  setIsGlossyMode: React.Dispatch<React.SetStateAction<boolean>>;
  isDynamicHeader: boolean;
  setIsDynamicHeader: React.Dispatch<React.SetStateAction<boolean>>;
  fontScale: number;
  setFontScale: React.Dispatch<React.SetStateAction<number>>;
  activeColor: string;
  setActiveColor: React.Dispatch<React.SetStateAction<string>>;
  deletingId: { id: number; type: 'booking' | 'pricing' | 'addon' | 'user' | 'member' } | null;
  setDeletingId: React.Dispatch<React.SetStateAction<{ id: number; type: 'booking' | 'pricing' | 'addon' | 'user' | 'member' } | null>>;

  fetchBookings: () => void;
  fetchPricing: () => void;
  fetchAddons: () => void;
  fetchCourses: () => void;
  fetchUsers: () => void;
  fetchMembers: () => void;
  fetchCarouselImages: () => void;
  fetchPermissionRequests: (scope?: 'auto' | 'all') => void;
  fetchAppNotifications: () => void;
  handleStatusChange: (id: number, newStatus: string) => Promise<void>;
  handlePermissionDecision: (requestId: number, status: 'approved' | 'rejected') => Promise<void>;
  confirmDelete: () => Promise<void>;
  handleReadAllNotifications: () => Promise<void>;
  handleOpenScorecard: (booking: Booking) => void;
  handleSaveScorecard: () => Promise<void>;
  getNotificationUserKey: () => string;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentAdminUser | null>(null);
  const [permissionRequests, setPermissionRequests] = useState<PermissionRequest[]>([]);
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>('ponos-dashboard');
  const [activeProjectSlug, setActiveProjectSlug] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [scorecardBooking, setScorecardBooking] = useState<Booking | null>(null);
  const [scorecardData, setScorecardData] = useState<any | null>(null);
  const [scorecardActiveTab, setScorecardActiveTab] = useState<'scorecard' | 'result' | 'analysis'>('scorecard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [deletingId, setDeletingId] = useState<{ id: number; type: 'booking' | 'pricing' | 'addon' | 'user' | 'member' } | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('adminDarkMode') === 'true');
  const [isGlossyMode, setIsGlossyMode] = useState(() => localStorage.getItem('adminGlossyMode') === 'true');
  const [isDynamicHeader, setIsDynamicHeader] = useState(() => localStorage.getItem('adminDynamicHeader') === 'true');
  const [fontScale, setFontScale] = useState(() => Math.min(150, Math.max(50, Number(localStorage.getItem('adminFontScale')) || 100)));
  const [activeColor, setActiveColor] = useState(() => localStorage.getItem('brandColor') || '#17110a');

  // Persist settings
  useEffect(() => {
    localStorage.setItem('adminDarkMode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('adminGlossyMode', String(isGlossyMode));
  }, [isGlossyMode]);

  useEffect(() => {
    localStorage.setItem('adminDynamicHeader', String(isDynamicHeader));
  }, [isDynamicHeader]);

  useEffect(() => {
    localStorage.setItem('adminFontScale', String(fontScale));
  }, [fontScale]);

  useEffect(() => {
    const isWhite = activeColor?.toLowerCase() === '#ffffff';
    if (isWhite) {
      document.documentElement.classList.add('theme-ponos-white');
    } else {
      document.documentElement.classList.remove('theme-ponos-white');
    }
  }, [activeColor]);

  // Load auth state
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('currentUser');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAuthenticated(true);
        setCurrentUser(user);
        if (user.role !== 'Admin' && (!user.permissions || !user.permissions.includes(activeTab))) {
          setActiveTab((user.permissions && user.permissions.length > 0) ? user.permissions[0] : 'ponos-dashboard');
        }
      } catch (e) {
        console.error('Failed to parse currentUser', e);
      }
    }
  }, []);

  // Reactive data fetching based on tab navigation
  useEffect(() => {
    if (isAuthenticated) {
      const needsBookings = ['analytics', 'stats', 'tee-sheet', 'manual-booking', 'members', 'invoices', 'member-management'].includes(activeTab);
      if (needsBookings) fetchBookings();

      if (activeTab === 'pricing') {
        fetchPricing();
        fetchCourses();
      }
      if (activeTab === 'tee-sheet' || activeTab === 'manual-booking') {
        fetchPricing();
        fetchCourses();
        fetchAddons();
        fetchMembers();
      }
      if (activeTab === 'enhancements') fetchAddons();
      if (activeTab === 'staff') fetchUsers();
      if (activeTab === 'staff' && currentUser?.role === 'Admin') fetchPermissionRequests('all');
      if (activeTab === 'member-management' || activeTab === 'members') fetchMembers();
      if (activeTab === 'website-management') fetchCarouselImages();
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchPermissionRequests();
      fetchAppNotifications();
    }
  }, [isAuthenticated, currentUser?.id, currentUser?.role]);

  const fetchUsers = () => {
    userService.getUsers(1)
      .then(res => {
        if (res.success && res.data) {
          setUsers(res.data.items || []);
        }
      })
      .catch(err => console.error('Context fetchUsers failed:', err));
  };

  const fetchMembers = () => {
    fetch('/api/members')
      .then(res => res.json())
      .then(data => setMembers(data))
      .catch(err => console.error(err));
  };

  const fetchPermissionRequests = (scope: 'auto' | 'all' = 'auto') => {
    const query = scope === 'all' || currentUser?.role === 'Admin' ? '' : currentUser?.id ? `?userId=${currentUser.id}` : '';
    fetch(`/api/permission-requests${query}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setPermissionRequests(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  const getNotificationUserKey = () => String(currentUser?.id || currentUser?.username || 'anonymous');

  const fetchAppNotifications = () => {
    if (!currentUser) return;
    const params = new URLSearchParams({
      userKey: getNotificationUserKey(),
      username: currentUser.username,
      role: currentUser.role,
      permissions: JSON.stringify(currentUser.permissions || [])
    });
    if (currentUser.id) params.set('userId', String(currentUser.id));
    fetch(`/api/notifications?${params.toString()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setAppNotifications(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  const handleReadAllNotifications = async () => {
    if (!currentUser) return;
    const unreadKeys = appNotifications.filter(item => !item.read).map(item => item.key);
    if (unreadKeys.length === 0) return;
    const res = await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userKey: getNotificationUserKey(),
        notificationKeys: unreadKeys
      })
    });
    if (res.ok) {
      setAppNotifications(prev => prev.map(item => ({ ...item, read: true })));
      toast.success('Notifications marked as read');
    } else {
      toast.error('Failed to mark notifications as read');
    }
  };

  const fetchBookings = () => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => console.error(err));
  };

  const fetchPricing = () => {
    fetch('/api/pricing')
      .then(res => res.json())
      .then(data => setPricing(data))
      .catch(err => console.error(err));
  };

  const fetchAddons = () => {
    fetch('/api/addons')
      .then(res => res.json())
      .then(data => setAddons(data))
      .catch(err => console.error(err));
  };

  const fetchCourses = () => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error(err));
  };

  const fetchCarouselImages = () => {
    fetch('/api/carousel')
      .then(res => res.json())
      .then(data => setCarouselImages(data))
      .catch(err => console.error(err));
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    const res = await fetch(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, username: currentUser?.username })
    });
    if (res.ok) {
      toast.success(`Booking status updated to ${newStatus}`);
      fetchBookings();
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } else {
      toast.error('Failed to update booking status');
    }
  };

  const handlePermissionDecision = async (requestId: number, status: 'approved' | 'rejected') => {
    const res = await fetch(`/api/permission-requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminUsername: currentUser?.username })
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(status === 'approved' ? 'Permission granted' : 'Permission rejected');
      fetchPermissionRequests();
      fetchAppNotifications();
      fetchUsers();
    } else {
      toast.error(data.message || 'Failed to update request');
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    const { id, type } = deletingId;
    const baseEndpoint = type === 'booking' ? `/api/bookings/${id}` : type === 'pricing' ? `/api/pricing/${id}` : (type === 'user' || type === 'member') ? `/api/users/${id}` : `/api/addons/${id}`;
    const endpoint = baseEndpoint + `?username=${currentUser?.username || ''}`;

    try {
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`${type.toUpperCase()} deleted successfully`);
        if (type === 'booking') fetchBookings();
        else if (type === 'pricing') fetchPricing();
        else if (type === 'user') fetchUsers();
        else if (type === 'member') fetchMembers();
        else fetchAddons();
        setDeletingId(null);
      } else {
        const error = await res.json();
        toast.error(`Failed to delete: ${error.message || 'Unknown error'}`);
      }
    } catch (err) {
      toast.error('An error occurred during deletion.');
    }
  };

  const handleOpenScorecard = (booking: Booking) => {
    let numHoles = 18;
    const course = courses.find(c => c.name === booking.courseType);
    if (course && course.holes) {
      numHoles = course.holes;
    } else if (booking.courseType.toLowerCase().includes('9')) {
      numHoles = 9;
    }

    let defaultLabels = Array.from({ length: numHoles }, (_, i) => String(i + 1));
    if (numHoles === 9) {
      defaultLabels = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    }

    let defaultPars = Array(numHoles).fill(4);
    if (numHoles === 9) {
      defaultPars = [4, 4, 5, 3, 4, 4, 4, 3, 5];
    }

    let initialScorecard = {
      groupName: "GROUP I",
      holeLabels: defaultLabels,
      par: defaultPars,
      scores: {} as Record<string, number[]>,
      handicaps: {} as Record<string, number>,
      flights: [] as string[][]
    };

    let playerNames: string[] = [];
    let parsedHandicaps: Record<string, number> = {};
    let parsedFlights: string[][] = [];

    if (booking.playerDetails) {
      try {
        const flights = JSON.parse(booking.playerDetails);
        let count = 1;
        flights.forEach((flight: any) => {
          const names: string[] = [];
          flight.players.forEach((player: any) => {
            const name = player.name || `Player ${count}`;
            playerNames.push(name);
            names.push(name);
            parsedHandicaps[name] = player.handicap !== undefined ? Number(player.handicap) : 18;
            count++;
          });
          if (names.length > 0) {
            parsedFlights.push(names);
          }
        });
      } catch (e) {
        console.error(e);
      }
    }

    if (playerNames.length === 0) {
      const names: string[] = [];
      for (let i = 0; i < (booking.guests || 1); i++) {
        const name = `Player ${i + 1}`;
        playerNames.push(name);
        names.push(name);
        parsedHandicaps[name] = 18;
      }
      parsedFlights.push(names);
    }

    if (booking.scorecard) {
      try {
        const parsed = typeof booking.scorecard === 'string' ? JSON.parse(booking.scorecard) : booking.scorecard;
        if (parsed) {
          initialScorecard.groupName = parsed.groupName || "GROUP I";
          if (Array.isArray(parsed.holeLabels)) {
            initialScorecard.holeLabels = parsed.holeLabels.map(String);
          }
          if (Array.isArray(parsed.par)) {
            initialScorecard.par = parsed.par.map(Number);
          }
          if (parsed.scores) {
            initialScorecard.scores = Object.keys(parsed.scores).reduce((acc, name) => {
              acc[name] = parsed.scores[name].map(Number);
              return acc;
            }, {} as Record<string, number[]>);
          }
          if (parsed.handicaps) {
            initialScorecard.handicaps = Object.keys(parsed.handicaps).reduce((acc, name) => {
              acc[name] = Number(parsed.handicaps[name]);
              return acc;
            }, {} as Record<string, number>);
          }
          if (Array.isArray(parsed.flights)) {
            initialScorecard.flights = parsed.flights;
          }
        }
      } catch (e) {
        console.error('Failed to parse existing scorecard', e);
      }
    }

    if (initialScorecard.flights.length === 0) {
      initialScorecard.flights = parsedFlights;
    }

    playerNames.forEach(name => {
      if (!initialScorecard.scores[name] || initialScorecard.scores[name].length !== numHoles) {
        initialScorecard.scores[name] = Array(numHoles).fill(0);
      }
      if (initialScorecard.handicaps[name] === undefined) {
        initialScorecard.handicaps[name] = parsedHandicaps[name] !== undefined ? parsedHandicaps[name] : 18;
      }
    });

    setScorecardBooking(booking);
    setScorecardData(initialScorecard);
    setScorecardActiveTab('scorecard');
  };

  const handleSaveScorecard = async () => {
    if (!scorecardBooking || !scorecardData) return;

    try {
      const res = await fetch(`/api/bookings/${scorecardBooking.id}/scorecard`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scorecard: scorecardData,
          username: currentUser?.username || 'Admin'
        })
      });

      if (res.ok) {
        toast.success('Scorecard saved successfully!');
        setBookings(prev => prev.map(b => {
          if (b.id === scorecardBooking.id) {
            return { ...b, scorecard: JSON.stringify(scorecardData) };
          }
          return b;
        }));
        if (selectedBooking && selectedBooking.id === scorecardBooking.id) {
          setSelectedBooking(prev => prev ? { ...prev, scorecard: JSON.stringify(scorecardData) } : null);
        }
        setScorecardBooking(null);
        setScorecardData(null);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to save scorecard.');
      }
    } catch (err) {
      console.error('Error saving scorecard:', err);
      toast.error('An error occurred while saving the scorecard.');
    }
  };

  return (
    <AdminContext.Provider value={{
      bookings, setBookings, pricing, setPricing, addons, setAddons, courses, setCourses,
      users, setUsers, members, setMembers, carouselImages, setCarouselImages,
      isAuthenticated, setIsAuthenticated, currentUser, setCurrentUser,
      permissionRequests, setPermissionRequests, appNotifications, setAppNotifications,
      activeTab, setActiveTab, activeProjectSlug, setActiveProjectSlug, selectedBooking, setSelectedBooking,
      scorecardBooking, setScorecardBooking, scorecardData, setScorecardData,
      scorecardActiveTab, setScorecardActiveTab, isSidebarCollapsed, setIsSidebarCollapsed,
      isDarkMode, setIsDarkMode, isGlossyMode, setIsGlossyMode, isDynamicHeader, setIsDynamicHeader,
      fontScale, setFontScale, deletingId, setDeletingId, activeColor, setActiveColor,
      fetchBookings, fetchPricing, fetchAddons, fetchCourses, fetchUsers, fetchMembers, fetchCarouselImages,
      fetchPermissionRequests, fetchAppNotifications, handleStatusChange, handlePermissionDecision,
      confirmDelete, handleReadAllNotifications, handleOpenScorecard, handleSaveScorecard, getNotificationUserKey
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
