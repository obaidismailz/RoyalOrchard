import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { 
  Eye, Trash2, Settings, X, Shield, CheckCircle2, XCircle, 
  UserPlus, KeyRound, UserRound, AlertCircle, RefreshCw, UserMinus, Plus
} from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { userService } from '../utils/services/userService';
import { getSecureImageUrl } from '../../../utils/imageUrl';

const ROLE_OPTIONS = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Project Manager' },
  { id: 3, name: 'Assistant Project Manager' },
  { id: 4, name: 'Project Coordinator' },
  { id: 5, name: 'Site Engineer' },
  { id: 6, name: 'Foreman' },
  { id: 7, name: 'Procurement' },
  { id: 8, name: 'Sales Manager' }
];

const GENDER_OPTIONS = [
  { id: 1, name: 'Male' },
  { id: 2, name: 'Female' }
];

const STATUS_OPTIONS = [
  { id: 1, name: 'Active' },
  { id: 2, name: 'Inactive' }
];

export const StaffTab: React.FC = () => {
  const {
    users,
    fetchUsers,
    currentUser
  } = useAdmin();

  // Selected user details popup state
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Form states
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Quick role assignment dropdown state
  const [roleToAssign, setRoleToAssign] = useState<string>('2');
  const [isAssigningRole, setIsAssigningRole] = useState(false);

  const getRoleIdFromName = (name: string): number => {
    const lower = name.toLowerCase();
    if (lower.includes('admin')) return 1;
    if (lower.includes('assistant') || lower === 'apm') return 3;
    if (lower.includes('project manager') || lower === 'pm') return 2;
    if (lower.includes('coordinator')) return 4;
    if (lower.includes('site engineer')) return 5;
    if (lower.includes('foreman')) return 6;
    if (lower.includes('procurement')) return 7;
    if (lower.includes('sales')) return 8;
    return 0;
  };

  const formatDateToDMY = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${parseInt(day, 10)}-${parseInt(month, 10)}-${year}`;
  };

  const handleOpenDetailModal = async (userId: number | string) => {
    setShowDetailModal(true);
    setLoadingDetail(true);
    setSelectedUserDetail(null);
    try {
      const res = await userService.getUserDetails(userId);
      if (res.success && res.data) {
        setSelectedUserDetail(res.data);
      } else {
        throw new Error(res.message || 'Failed to fetch details');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to load user details.');
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreateOrUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitLoading(true);
    setValidationErrors({});

    try {
      if (editingUser.id) {
        // Update user (POST with _method: PATCH)
        const payload = {
          first_name: editingUser.first_name || '',
          last_name: editingUser.last_name || '',
          email: editingUser.email || '',
          gender_id: Number(editingUser.gender_id) || 1,
          date_of_birth: formatDateToDMY(editingUser.date_of_birth || ''),
          user_status_id: Number(editingUser.user_status_id) || 1,
          picture: editingUser.picture instanceof File ? editingUser.picture : null
        };
        const res = await userService.updateUser(editingUser.id, payload);
        if (res.success) {
          toast.success(res.message || 'User updated successfully.');
          fetchUsers();
          setEditingUser(null);
        } else {
          if (res.errors) {
            setValidationErrors(res.errors);
            if (res.errors.email && res.errors.email.length > 0) {
              throw new Error(res.errors.email[0]);
            }
            const firstErrKey = Object.keys(res.errors)[0];
            if (firstErrKey && res.errors[firstErrKey].length > 0) {
              throw new Error(res.errors[firstErrKey][0]);
            }
          }
          throw new Error(res.message || 'Failed to update user.');
        }
      } else {
        // Create user
        const payload = {
          first_name: editingUser.first_name || '',
          last_name: editingUser.last_name || '',
          email: editingUser.email || '',
          gender_id: Number(editingUser.gender_id) || 1,
          date_of_birth: formatDateToDMY(editingUser.date_of_birth || ''),
          user_status_id: Number(editingUser.user_status_id) || 1,
          role_ids: [Number(editingUser.role_id || 6)],
          picture: editingUser.picture instanceof File ? editingUser.picture : null
        };
        const res = await userService.createUser(payload);
        if (res.success) {
          toast.success(res.message || 'User created successfully.');
          fetchUsers();
          setEditingUser(null);
        } else {
          if (res.errors) {
            setValidationErrors(res.errors);
            if (res.errors.email && res.errors.email.length > 0) {
              throw new Error(res.errors.email[0]);
            }
            const firstErrKey = Object.keys(res.errors)[0];
            if (firstErrKey && res.errors[firstErrKey].length > 0) {
              throw new Error(res.errors[firstErrKey][0]);
            }
          }
          throw new Error(res.message || 'Failed to create user.');
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDeleteUser = (id: number | string, name: string) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex flex-col border border-[#0f281e]/10 overflow-hidden font-sans text-left`}
      >
        <div className="p-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Trash2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#0f281e]">Delete User Profile?</p>
            <p className="text-xs text-[#0f281e]/60 mt-0.5">Are you sure you want to delete {name}? This user will lose dashboard access immediately.</p>
          </div>
        </div>
        <div className="bg-[#fbf7f0] px-4 py-3 flex justify-end gap-2 border-t border-[#0f281e]/5">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#0f281e]/50 hover:bg-[#0f281e]/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await userService.deleteUser(id);
                if (res.success) {
                  toast.success(res.message || 'User deleted successfully.');
                  fetchUsers();
                } else {
                  toast.error(res.message || 'Failed to delete user.');
                }
              } catch (err: any) {
                console.error(err);
                toast.error(err.message || 'Failed to delete user.');
              }
            }}
            className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    ), {
      position: 'top-right',
      duration: 8000
    });
  };

  const handleAssignRole = async () => {
    if (!selectedUserDetail) return;
    setIsAssigningRole(true);
    try {
      const res = await userService.assignRole(selectedUserDetail.id, Number(roleToAssign));
      if (res.success) {
        toast.success(res.message || 'Role assigned successfully.');
        // Re-fetch details to update UI
        const detailsRes = await userService.getUserDetails(selectedUserDetail.id);
        if (detailsRes.success && detailsRes.data) {
          setSelectedUserDetail(detailsRes.data);
        }
        fetchUsers();
      } else {
        toast.error(res.message || 'Failed to assign role.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to assign role.');
    } finally {
      setIsAssigningRole(false);
    }
  };

  const handleRevokeRole = (roleName: string) => {
    if (!selectedUserDetail) return;
    const roleId = getRoleIdFromName(roleName);
    if (!roleId) {
      toast.error('Unable to map role ID for revocation.');
      return;
    }

    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex flex-col border border-[#0f281e]/10 overflow-hidden font-sans text-left`}
      >
        <div className="p-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
            <UserMinus className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#0f281e]">Revoke Role Assignment?</p>
            <p className="text-xs text-[#0f281e]/60 mt-0.5">Are you sure you want to revoke the "{roleName}" role from {selectedUserDetail.first_name}?</p>
          </div>
        </div>
        <div className="bg-[#fbf7f0] px-4 py-3 flex justify-end gap-2 border-t border-[#0f281e]/5">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#0f281e]/50 hover:bg-[#0f281e]/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await userService.revokeRole(selectedUserDetail.id, roleId);
                if (res.success) {
                  toast.success(res.message || 'Role revoked successfully.');
                  const detailsRes = await userService.getUserDetails(selectedUserDetail.id);
                  if (detailsRes.success && detailsRes.data) {
                    setSelectedUserDetail(detailsRes.data);
                  }
                  fetchUsers();
                } else {
                  toast.error(res.message || 'Failed to revoke role.');
                }
              } catch (err: any) {
                console.error(err);
                toast.error(err.message || 'Failed to revoke role.');
              }
            }}
            className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    ), {
      position: 'top-right',
      duration: 8000
    });
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl text-[#0f281e]">Staff Registry</h2>
          <p className="text-[#0f281e]/60 text-sm mt-1">Manage user profiles, assign operational roles, and audit authorization settings.</p>
        </div>
        <button
          onClick={() => {
            setValidationErrors({});
            setEditingUser({
              first_name: '',
              last_name: '',
              gender_id: '1',
              date_of_birth: '',
              email: '',
              user_status_id: '1',
              role_id: '6',
              picture: null
            });
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#c4864b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#b57a44] transition-all shadow-md cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          Add Staff Member
        </button>
      </div>

      {/* Directory Table */}
      <div className="bg-white shadow-sm border border-[#0f281e]/5 rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#0f281e]/5">
            <thead className="bg-[#fbf7f0]">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Name / Email</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Roles</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Gender / DOB</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0f281e]/5">
              {users.map(u => {
                const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unnamed User';
                const userRoles = u.roles || [];
                const statusLabel = u.status?.label || 'Active';
                const genderLabel = u.gender?.label || 'N/A';
                return (
                  <tr key={u.id} className="hover:bg-[#fbf7f0]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#0f281e]/10 bg-[#0f281e]/5 flex items-center justify-center">
                          {u.picture_url ? (
                            <img
                              src={getSecureImageUrl(u.picture_url)}
                              alt={fullName}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#c4864b]/10 text-[10px] font-black text-[#c4864b]">
                              {fullName.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#0f281e]">{fullName}</p>
                          <p className="text-[10px] text-[#0f281e]/40 font-mono mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {userRoles.map((role: string) => (
                          <span key={role} className="rounded-full bg-[#c4864b]/10 px-2.5 py-0.5 text-[9px] font-bold text-[#c4864b]">
                            {role}
                          </span>
                        ))}
                        {userRoles.length === 0 && (
                          <span className="text-[10px] text-gray-400 font-medium">No Roles</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-[#0f281e]/75">
                      <p>{genderLabel}</p>
                      <p className="text-[10px] text-[#0f281e]/40 font-mono mt-0.5">{u.date_of_birth || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                        statusLabel.toLowerCase() === 'active' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetailModal(u.id)}
                          className="p-2 text-[#0f281e]/40 hover:text-[#c4864b] transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setValidationErrors({});
                            setEditingUser({
                              id: u.id,
                              first_name: u.first_name || '',
                              last_name: u.last_name || '',
                              gender_id: String(u.gender?.id || '1'),
                              date_of_birth: u.date_of_birth || '',
                              email: u.email || '',
                              user_status_id: String(u.status?.id || '1'),
                              picture: u.picture_url || null
                            });
                          }} 
                          className="p-2 text-[#0f281e]/40 hover:text-[#c4864b] transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, fullName)}
                          disabled={u.email === currentUser?.email}
                          className={`p-2 transition-colors ${u.email === currentUser?.email ? 'text-gray-300 cursor-not-allowed' : 'text-[#0f281e]/40 hover:text-red-500 cursor-pointer'}`}
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD/EDIT USER MODAL */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 backdrop-blur-sm bg-black/55">
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 h-full w-full cursor-default bg-transparent border-0"
              aria-label="Close"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl text-left"
            >
              <div className="relative overflow-hidden bg-[#0f281e] px-6 py-7 text-white sm:px-8">
                <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full bg-[#c4864b]/25 blur-3xl" />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#dec099]">
                      {editingUser.id ? 'Modify Record' : 'New User Setup'}
                    </p>
                    <h3 className="mt-2 font-serif text-3xl">
                      {editingUser.id ? 'Edit Staff Member' : 'Add Staff Member'}
                    </h3>
                    <p className="mt-1 text-xs text-white/45">
                      Configure user profiles, contact credentials, and security clearance logs.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateOrUpdateUser} className="space-y-5 p-6 sm:p-8 max-h-[70vh] overflow-y-auto">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="first-name" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">First Name</label>
                    <input
                      id="first-name"
                      type="text"
                      required
                      value={editingUser.first_name}
                      onChange={e => setEditingUser({ ...editingUser, first_name: e.target.value })}
                      placeholder="e.g. Fahad"
                      className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                    />
                  </div>
                  <div>
                    <label htmlFor="last-name" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Last Name</label>
                    <input
                      id="last-name"
                      type="text"
                      required
                      value={editingUser.last_name}
                      onChange={e => setEditingUser({ ...editingUser, last_name: e.target.value })}
                      placeholder="e.g. Anwar"
                      className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={editingUser.email}
                      onChange={e => {
                        setEditingUser({ ...editingUser, email: e.target.value });
                        if (validationErrors.email) {
                          setValidationErrors({ ...validationErrors, email: null });
                        }
                      }}
                      placeholder="e.g. worker@domain.com"
                      className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors ${
                        validationErrors.email 
                          ? 'border-red-500 bg-red-50/50 focus:border-red-500' 
                          : 'border-[#0f281e]/10 bg-[#0f281e]/[0.035] focus:border-[#c4864b]'
                      }`}
                    />
                    {validationErrors.email && (
                      <p className="mt-1.5 text-[10px] font-bold text-red-500">{validationErrors.email[0]}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="dob" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Date of Birth</label>
                    <input
                      id="dob"
                      type="date"
                      required
                      value={editingUser.date_of_birth}
                      onChange={e => setEditingUser({ ...editingUser, date_of_birth: e.target.value })}
                      className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="gender" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Gender</label>
                    <select
                      id="gender"
                      value={editingUser.gender_id}
                      onChange={e => setEditingUser({ ...editingUser, gender_id: e.target.value })}
                      className="w-full rounded-xl border border-[#0f281e]/10 bg-[#fbf7f0] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none focus:border-[#c4864b]"
                    >
                      {GENDER_OPTIONS.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="status" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Status</label>
                    <select
                      id="status"
                      value={editingUser.user_status_id}
                      onChange={e => setEditingUser({ ...editingUser, user_status_id: e.target.value })}
                      className="w-full rounded-xl border border-[#0f281e]/10 bg-[#fbf7f0] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none focus:border-[#c4864b]"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {!editingUser.id && (
                  <div>
                    <label htmlFor="role" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Starting Role Clearance</label>
                    <select
                      id="role"
                      value={editingUser.role_id}
                      onChange={e => setEditingUser({ ...editingUser, role_id: e.target.value })}
                      className="w-full rounded-xl border border-[#0f281e]/10 bg-[#fbf7f0] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none focus:border-[#c4864b]"
                    >
                      {ROLE_OPTIONS.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="picture" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Profile Image / Picture</label>
                  <input
                    id="picture"
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setEditingUser({ ...editingUser, picture: e.target.files[0] });
                      }
                    }}
                    className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-2.5 text-xs font-semibold text-[#0f281e] outline-none file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-[#c4864b] file:text-white file:hover:bg-[#b5773f] file:cursor-pointer"
                  />
                  {editingUser.picture && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="relative h-16 w-16 shrink-0">
                        <div className="h-full w-full overflow-hidden rounded-xl border border-[#0f281e]/15 bg-[#0f281e]/5 flex items-center justify-center shadow-sm">
                          <img
                            src={editingUser.picture instanceof File ? URL.createObjectURL(editingUser.picture) : getSecureImageUrl(editingUser.picture)}
                            alt="Preview"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingUser({ ...editingUser, picture: null })}
                          className="absolute -top-1.5 -right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Profile Preview</p>
                        <p className="text-[10px] font-bold text-emerald-600 truncate max-w-[250px]">
                          {editingUser.picture instanceof File ? editingUser.picture.name : 'Current Profile Image'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-[#0f281e]/5 pt-5 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 rounded-xl border border-[#0f281e]/10 py-3 text-[10px] font-black uppercase tracking-widest text-[#0f281e]/50 transition-colors hover:bg-[#0f281e]/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitLoading}
                    className="flex-[1.35] rounded-xl bg-[#c4864b] py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[#b5773f] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitLoading ? 'Submitting...' : editingUser.id ? 'Save changes' : 'Create Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* USER DETAILS & ROLE MANAGEMENT MODAL */}
      <AnimatePresence>
        {showDetailModal && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 backdrop-blur-sm bg-black/55">
            <button
              type="button"
              onClick={() => setShowDetailModal(false)}
              className="absolute inset-0 h-full w-full cursor-default bg-transparent border-0"
              aria-label="Close"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl text-left"
            >
              {loadingDetail ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white">
                  <div className="h-8 w-8 rounded-full border-4 border-[#c4864b] border-t-transparent animate-spin" />
                  <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-[#0f281e]/60">Loading profile details...</p>
                </div>
              ) : selectedUserDetail ? (
                <div>
                  {/* Header */}
                  <div className="relative overflow-hidden bg-[#0f281e] px-6 py-7 text-white sm:px-8">
                    <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full bg-[#c4864b]/25 blur-3xl" />
                    <div className="relative flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/15 bg-white/5 flex items-center justify-center shrink-0">
                          {selectedUserDetail.picture_url ? (
                            <img
                              src={getSecureImageUrl(selectedUserDetail.picture_url)}
                              alt={selectedUserDetail.first_name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-white/10 text-xl font-bold text-white">
                              {selectedUserDetail.first_name?.substring(0, 1)}{selectedUserDetail.last_name?.substring(0, 1)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#dec099]">
                            Staff Member ID: #{selectedUserDetail.id}
                          </p>
                          <h3 className="mt-1 font-serif text-3xl">
                            {selectedUserDetail.first_name} {selectedUserDetail.last_name}
                          </h3>
                          <p className="mt-0.5 text-xs text-white/45 font-mono">
                            {selectedUserDetail.email}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowDetailModal(false)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="Close"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto">
                    
                    {/* Metadata grids */}
                    <div className="grid gap-4 sm:grid-cols-3 border-b border-[#0f281e]/5 pb-4">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#0f281e]/40">Gender</span>
                        <p className="mt-1 text-sm font-semibold text-[#0f281e]">
                          {selectedUserDetail.gender?.label || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#0f281e]/40">Date of Birth</span>
                        <p className="mt-1 text-sm font-semibold text-[#0f281e] font-mono">
                          {selectedUserDetail.date_of_birth || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#0f281e]/40">Account Status</span>
                        <p className="mt-1 text-sm font-bold text-emerald-600">
                          {selectedUserDetail.status?.label || 'Active'}
                        </p>
                      </div>
                    </div>

                    {/* Roles assign & list */}
                    <div className="space-y-4">
                      <h4 className="font-serif text-lg text-[#0f281e] flex items-center gap-2">
                        <Shield className="h-4.5 w-4.5 text-[#c4864b]" />
                        Access Roles & Authorizations
                      </h4>

                      {/* Quick Assign Role Dropdown */}
                      <div className="flex flex-col sm:flex-row gap-3 items-end p-4 rounded-xl border border-[#0f281e]/5 bg-[#fbf7f0]/40">
                        <div className="flex-1 w-full text-left">
                          <label htmlFor="assign-role-id" className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-[#0f281e]/40">Assign New Role Clearance</label>
                          <select
                            id="assign-role-id"
                            value={roleToAssign}
                            onChange={e => setRoleToAssign(e.target.value)}
                            className="w-full rounded-lg border border-[#0f281e]/15 bg-white px-3 py-1.5 text-xs font-bold text-[#0f281e] outline-none focus:border-[#c4864b] cursor-pointer"
                          >
                            {ROLE_OPTIONS.map(r => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={handleAssignRole}
                          disabled={isAssigningRole}
                          className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 rounded-lg bg-[#0f281e] hover:bg-[#c4864b] text-[#dec099] hover:text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Assign
                        </button>
                      </div>

                      {/* Assigned Roles List */}
                      <div className="space-y-2">
                        {(selectedUserDetail.roles || []).length === 0 ? (
                          <div className="text-center py-4 text-xs text-[#0f281e]/40 font-medium">
                            No active security roles assigned.
                          </div>
                        ) : (
                          (selectedUserDetail.roles || []).map((role: string) => (
                            <div key={role} className="flex items-center justify-between p-3 border border-[#0f281e]/5 rounded-xl bg-white">
                              <span className="text-xs font-bold text-[#0f281e]">{role}</span>
                              <button
                                type="button"
                                onClick={() => handleRevokeRole(role)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors shrink-0 cursor-pointer"
                                title="Revoke Role"
                              >
                                <UserMinus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Permissions Scopes List */}
                    <div className="space-y-3 border-t border-[#0f281e]/5 pt-4">
                      <h4 className="font-serif text-lg text-[#0f281e] flex items-center gap-2">
                        <KeyRound className="h-4.5 w-4.5 text-[#c4864b]" />
                        Active Security Scopes
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedUserDetail.permissions || []).map((p: string) => (
                          <span key={p} className="rounded bg-gray-100 px-2 py-0.5 text-[9px] font-mono text-gray-600 border border-gray-200">
                            {p}
                          </span>
                        ))}
                        {(selectedUserDetail.permissions || []).length === 0 && (
                          <span className="text-xs text-gray-400">No active scopes.</span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-[#0f281e]/50">
                  Failed to load profile details.
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
