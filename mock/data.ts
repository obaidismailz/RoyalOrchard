// Central mock data used by the client-side mock server
export const mock = {
  courses: [
    { id: 1, name: 'Premium Home Remodeling', holes: 18, par: 72, description: 'Comprehensive whole-home remodeling and modernization.', image: 'public/Ponos/p1.jpg' },
    { id: 2, name: 'Backyard & Deck Reno', holes: 9, par: 36, description: 'Professional deck, patio, and landscape renovations.', image: 'public/Ponos/p1.jpg' }
  ],

  pricing: [
    { id: 1, courseId: 1, time: '07:00', price: 15000, discount: 0 },
    { id: 2, courseId: 1, time: '08:00', price: 16000, discount: 0 },
    { id: 3, courseId: 2, time: '09:00', price: 7500, discount: 0 }
  ],

  addons: [
    { id: 1, name: 'Premium Trim Materials', price: 5000, icon: '🪵', description: 'Hand-selected oak or walnut custom molding', isAvailable: 1 },
    { id: 2, name: 'Smart Home Automation Integration', price: 2500, icon: '🏠', description: 'Control lights, climate, and sound via unified panel', isAvailable: 1 },
    { id: 3, name: 'Extended 5-Year Craftsmanship Warranty', price: 8000, icon: '🛡️', description: 'Comprehensive warranty covering all structural elements', isAvailable: 1 }
  ],

  carousel: ['/Golf/G1.jpg', '/Golf/G2.jpg', '/Golf/G3.jpg'],

  users: [
    { id: 1, username: 'admin', password: 'admin', role: 'Admin', permissions: JSON.stringify(['analytics', 'stats', 'tee-sheet', 'pricing', 'enhancements', 'manage_users']), email: 'admin@example.com', phone: null, avatar: null },
    { id: 2, username: 'admin2', password: 'admin2', role: 'Staff', permissions: JSON.stringify(['ponos-dashboard', 'ponos-purchasing', 'ponos-pm', 'staff', 'logs', 'manage_users']), email: 'admin2@example.com', phone: null, avatar: null }
  ],

  bookings: [
    { id: 1, customerName: 'Alice Smith', email: 'alice.smith@example.com', phone: '0321-1234567', courseType: 'Premium Home Remodeling', date: '2026-07-01', time: '08:00', guests: 2, totalPrice: 37000, basePrice: 35000, enhancementsPrice: 2000, userId: null, status: 'confirmed', adminCreated: 0, createdAt: new Date().toISOString(), selectedAddons: '[1, 2]' }
  ],

  permission_requests: [],
  activity_logs: [
    { id: 1, username: 'admin', action: 'Update Pricing', details: 'updated the labor rate for framing to $2,500/hr', createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), ipAddress: '192.168.1.10' },
    { id: 2, username: 'Sarah Jenkins', action: 'Status Change', details: 'changed the status of Fairway Townhomes Unit B to Mobilized', createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), ipAddress: '192.168.1.15' },
    { id: 3, username: 'Hassan Mahmood', action: 'Add Staff', details: 'added new crew lead Sarah Jenkins to the staff directory', createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), ipAddress: '192.168.1.20' },
    { id: 4, username: 'admin', action: 'Update Enhancement', details: 'modified the price of Smart Home Automation Integration option to $2,500', createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), ipAddress: '192.168.1.10' },
    { id: 5, username: 'Greg F.', action: 'Status Change', details: 'changed the status of 102 Oak Ridge Backyard Reno to Scheduled', createdAt: new Date(Date.now() - 3600000 * 36).toISOString(), ipAddress: '192.168.1.30' }
  ],
  notification_reads: [],
  genders: [
    { id: 1, code: 'male', label: 'Male', sort_order: 1, is_system: false },
    { id: 2, code: 'female', label: 'Female', sort_order: 2, is_system: false },
    { id: 3, code: 'other', label: 'Other', sort_order: 3, is_system: false },
    { id: 4, code: 'prefer_not_to_say', label: 'Prefer not to say', sort_order: 4, is_system: false }
  ],
  user_statuses: [
    { id: 1, code: 'active', label: 'Active', sort_order: 1, is_system: true },
    { id: 2, code: 'invited', label: 'Invited', sort_order: 2, is_system: true },
    { id: 3, code: 'suspended', label: 'Suspended', sort_order: 3, is_system: true },
    { id: 4, code: 'disabled', label: 'Disabled', sort_order: 4, is_system: true }
  ],
  project_statuses: [
    { id: 1, code: 'active', label: 'Active', sort_order: 1, is_system: true },
    { id: 2, code: 'planning', label: 'Planning', sort_order: 2, is_system: true },
    { id: 3, code: 'completed', label: 'Completed', sort_order: 3, is_system: true },
    { id: 4, code: 'on_hold', label: 'On Hold', sort_order: 4, is_system: false }
  ],
  project_types: [
    { id: 1, code: 'renovation', label: 'Renovation', sort_order: 1, is_system: true },
    { id: 2, code: 'new_construction', label: 'New Construction', sort_order: 2, is_system: true },
    { id: 3, code: 'commercial', label: 'Commercial Build', sort_order: 3, is_system: false }
  ],
  milestone_statuses: [
    { id: 1, code: 'todo', label: 'To Do', sort_order: 1, is_system: true },
    { id: 2, code: 'in_progress', label: 'In Progress', sort_order: 2, is_system: true },
    { id: 3, code: 'completed', label: 'Completed', sort_order: 3, is_system: true },
    { id: 4, code: 'blocked', label: 'Blocked', sort_order: 4, is_system: false }
  ],
  milestone_phases: [
    { id: 1, code: 'planning', label: 'Planning Phase', sort_order: 1, is_system: true },
    { id: 2, code: 'procurement', label: 'Procurement Phase', sort_order: 2, is_system: true },
    { id: 3, code: 'construction', label: 'Construction Phase', sort_order: 3, is_system: true },
    { id: 4, code: 'handover', label: 'Handover & Signoff', sort_order: 4, is_system: false }
  ],
  clients: [
    {
      id: 2,
      name: "FDHL",
      contact_name: "Zahid rafique",
      email: "zahidrafique@example.org",
      phone: "03030678955",
      created_at: "2026-07-11T05:53:14+00:00"
    },
    {
      id: 1,
      name: "HRL",
      contact_name: "Malik Aslam",
      email: "malikaslam@example.org",
      phone: "923030678955",
      created_at: "2026-07-11T05:51:59+00:00"
    }
  ]
};

// Helper to clone data for safe reads
export function getSnapshot() {
  return JSON.parse(JSON.stringify(mock));
}

export default mock;
