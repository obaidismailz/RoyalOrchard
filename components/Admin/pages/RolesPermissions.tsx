import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Key, Plus, Save, Lock, Unlock, ShieldAlert,
  CheckSquare, Square, Check, X, AlertCircle, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { rolesPermissionsService } from '../utils/services/rolesPermissionsService';

interface Role {
  id: number;
  name: string;
  guard_name: string;
  scope?: string;
  project_id?: number | null;
  permissions: string[];
}

interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

export const RolesPermissions: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selected role for the Permissions Manager checkbox list
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<string[]>([]);
  const [savingPermissions, setSavingPermissions] = useState(false);

  // Modal triggers
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Form states
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [newPermissionName, setNewPermissionName] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await rolesPermissionsService.getRolesAndPermissions();
      if (res.success && res.data) {
        const fetchedRoles = res.data.roles || [];
        const fetchedPermissions = res.data.permissions || [];
        setRoles(fetchedRoles);
        setPermissions(fetchedPermissions);
        
        // Default select first role if available
        if (fetchedRoles.length > 0) {
          // Keep current selection if valid, otherwise select first
          const currentSelect = selectedRole 
            ? fetchedRoles.find((r: Role) => r.id === selectedRole.id) 
            : null;
          const targetRole = currentSelect || fetchedRoles[0];
          setSelectedRole(targetRole);
          setSelectedRolePermissions(targetRole.permissions || []);
        }
      } else {
        throw new Error(res.message || 'Failed to fetch roles and permissions');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch configurations.');
      toast.error('Failed to load roles and permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setSelectedRolePermissions(role.permissions || []);
  };

  const handleTogglePermissionForSelectedRole = (permName: string) => {
    if (selectedRolePermissions.includes(permName)) {
      setSelectedRolePermissions(prev => prev.filter(p => p !== permName));
    } else {
      setSelectedRolePermissions(prev => [...prev, permName]);
    }
  };

  const handleUpdateRolePermissions = async () => {
    if (!selectedRole) return;
    setSavingPermissions(true);
    try {
      const res = await rolesPermissionsService.updateRolePermissions(selectedRole.id, selectedRolePermissions);
      if (res.success) {
        toast.success(res.message || 'Role permissions updated successfully.');
        // Update local roles state
        setRoles(prev => prev.map(r => r.id === selectedRole.id ? { ...r, permissions: selectedRolePermissions } : r));
        if (selectedRole) {
          setSelectedRole({ ...selectedRole, permissions: selectedRolePermissions });
        }
      } else {
        throw new Error(res.message || 'Failed to update permissions.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save changes.');
    } finally {
      setSavingPermissions(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setActionLoading(true);
    try {
      const res = await rolesPermissionsService.createRole(newRoleName.trim(), newRolePermissions);
      if (res.success) {
        toast.success(res.message || 'Role created successfully.');
        setNewRoleName('');
        setNewRolePermissions([]);
        setShowRoleModal(false);
        await loadData();
      } else {
        throw new Error(res.message || 'Failed to create role.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to create role.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermissionName.trim()) return;
    setActionLoading(true);
    try {
      const res = await rolesPermissionsService.createPermission(newPermissionName.trim());
      if (res.success) {
        toast.success(res.message || 'Permission created successfully.');
        setNewPermissionName('');
        setShowPermissionModal(false);
        await loadData();
      } else {
        throw new Error(res.message || 'Failed to create permission.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to create permission.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleNewRolePermission = (permName: string) => {
    if (newRolePermissions.includes(permName)) {
      setNewRolePermissions(prev => prev.filter(p => p !== permName));
    } else {
      setNewRolePermissions(prev => [...prev, permName]);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header and Top Action Buttons */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl text-[#0f281e]">Roles & Permissions</h2>
          <p className="text-[#0f281e]/60 text-sm mt-1">Manage organizational roles, register security scopes, and align system permissions.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setShowPermissionModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#0f281e]/15 bg-white/50 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0f281e] hover:bg-[#0f281e]/5 transition-all shadow-sm"
          >
            <Key className="h-4 w-4 text-[#c4864b]" />
            New Permission
          </button>
          <button
            onClick={() => setShowRoleModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#c4864b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#b57a44] transition-all shadow-md"
          >
            <Plus className="h-4 w-4" />
            Create Role
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-[#dec099]/10 rounded-2xl">
          <div className="h-8 w-8 rounded-full border-4 border-[#dec099] border-t-transparent animate-spin" />
          <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-[#dec099]/60">Loading permissions...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <p className="text-sm font-bold text-red-300">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-6 py-2.5 rounded-xl bg-[#c4864b] hover:bg-[#b57a44] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Roles List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-[#0f281e]/5 shadow-sm">
              <h3 className="font-serif text-xl text-[#0f281e] mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#c4864b]" />
                Roles Directory
              </h3>
              <div className="space-y-3">
                {roles.map(role => {
                  const isSelected = selectedRole?.id === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleSelectRole(role)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected 
                          ? 'border-[#c4864b] bg-[#c4864b]/5 shadow-sm' 
                          : 'border-[#0f281e]/5 hover:border-[#c4864b]/40 hover:bg-[#fbf7f0]/50'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className={`font-semibold text-sm ${isSelected ? 'text-[#c4864b]' : 'text-[#0f281e]'}`}>
                          {role.name}
                        </p>
                        <p className="text-[10px] text-[#0f281e]/40 font-mono mt-0.5">
                          Guard: {role.guard_name}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                        isSelected ? 'bg-[#c4864b] text-white' : 'bg-[#0f281e]/5 text-[#0f281e]/60'
                      }`}>
                        {role.permissions?.length || 0} Scope{role.permissions?.length === 1 ? '' : 's'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel: Permissions Manager for Selected Role */}
          <div className="lg:col-span-8">
            {selectedRole ? (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#0f281e]/5 shadow-sm space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0f281e]/5 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#c4864b]/10 text-[#c4864b] flex items-center justify-center">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl text-[#0f281e]">{selectedRole.name} Permissions</h3>
                      <p className="text-[10px] text-[#0f281e]/40 uppercase tracking-widest font-black mt-0.5">
                        Guard: {selectedRole.guard_name} • Scope: {selectedRole.scope || 'global'}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleUpdateRolePermissions}
                    disabled={savingPermissions}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#0f281e] hover:bg-[#c4864b] text-[#dec099] hover:text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
                  >
                    {savingPermissions ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Saving
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>

                {/* Checked/Unchecked counter info & Quick Toggles */}
                <div className="bg-[#fbf7f0] rounded-xl p-4 border border-[#c4864b]/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#0f281e]/75 font-semibold">
                      {selectedRolePermissions.length} of {permissions.length} total permissions enabled
                    </span>
                    {selectedRolePermissions.length === permissions.length && (
                      <span className="text-[9px] uppercase tracking-wider font-bold bg-[#c4864b] text-white px-2 py-0.5 rounded">
                        Super Admin Status
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedRolePermissions(permissions.map(p => p.name))}
                      className="text-[10px] uppercase tracking-wider font-black text-[#c4864b] hover:text-[#0f281e] transition-colors cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-[#0f281e]/20 text-xs font-light">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedRolePermissions([])}
                      className="text-[10px] uppercase tracking-wider font-black text-[#0f281e]/40 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      Uncheck All
                    </button>
                  </div>
                </div>

                {/* Permissions Checkbox Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {permissions.map(perm => {
                    const isGranted = selectedRolePermissions.includes(perm.name);
                    return (
                      <button
                        key={perm.id}
                        type="button"
                        onClick={() => handleTogglePermissionForSelectedRole(perm.name)}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                          isGranted 
                            ? 'border-[#c4864b]/30 bg-[#c4864b]/[0.02] hover:bg-[#c4864b]/[0.05]' 
                            : 'border-[#0f281e]/5 hover:border-[#0f281e]/20 hover:bg-[#fbf7f0]/30'
                        }`}
                      >
                        <div className={`mt-0.5 shrink-0 transition-colors ${isGranted ? 'text-[#c4864b]' : 'text-[#0f281e]/30'}`}>
                          {isGranted ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#0f281e] break-all">
                            {perm.name.replace(/_/g, ' ')}
                          </p>
                          <p className="text-[9px] text-[#0f281e]/40 font-mono mt-0.5">
                            {perm.name}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-[#0f281e]/5 shadow-sm text-center">
                <ShieldAlert className="h-12 w-12 text-[#c4864b] mx-auto mb-4" />
                <h3 className="font-serif text-xl text-[#0f281e]">No Role Selected</h3>
                <p className="text-xs text-[#0f281e]/40 mt-1">Choose a role from the directory to configure its system access levels.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* CREATE ROLE MODAL */}
      {showRoleModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowRoleModal(false)}
            className="absolute inset-0 h-full w-full cursor-default"
          />
          <motion.form
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onSubmit={handleCreateRole}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl"
          >
            <div className="relative overflow-hidden bg-[#0f281e] px-6 py-7 text-white sm:px-8">
              <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full bg-[#c4864b]/25 blur-3xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#dec099]">Create Role</p>
                  <h3 className="mt-2 font-serif text-3xl">New Security Role</h3>
                  <p className="mt-1 text-xs text-white/45">Register a new access tier and assign initial scopes.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <label htmlFor="role-name" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Role Name</label>
                <input
                  id="role-name"
                  type="text"
                  required
                  autoFocus
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  placeholder="e.g. Finance Auditor"
                  className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors placeholder:text-[#0f281e]/25 focus:border-[#c4864b]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Assign Initial Permissions</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewRolePermissions(permissions.map(p => p.name))}
                      className="text-[9px] uppercase tracking-wider font-bold text-[#c4864b] hover:text-[#0f281e] transition-colors cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-[#0f281e]/20 text-[9px]">|</span>
                    <button
                      type="button"
                      onClick={() => setNewRolePermissions([])}
                      className="text-[9px] uppercase tracking-wider font-bold text-[#0f281e]/40 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      Uncheck All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto border border-[#0f281e]/5 rounded-xl p-3 bg-[#fbf7f0]/50">
                  {permissions.map(perm => {
                    const isChecked = newRolePermissions.includes(perm.name);
                    return (
                      <button
                        key={perm.id}
                        type="button"
                        onClick={() => handleToggleNewRolePermission(perm.name)}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all bg-white text-xs ${
                          isChecked 
                            ? 'border-[#c4864b] text-[#c4864b]' 
                            : 'border-[#0f281e]/5 text-[#0f281e]/70 hover:border-[#0f281e]/20'
                        }`}
                      >
                        <Check className={`h-4 w-4 shrink-0 transition-opacity ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
                        <span className="truncate font-semibold">{perm.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#0f281e]/5 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 rounded-xl border border-[#0f281e]/10 py-3 text-[10px] font-black uppercase tracking-widest text-[#0f281e]/50 transition-colors hover:bg-[#0f281e]/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-[1.35] rounded-xl bg-[#c4864b] py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[#b5773f] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </div>
          </motion.form>
        </div>
      )}

      {/* CREATE PERMISSION MODAL */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowPermissionModal(false)}
            className="absolute inset-0 h-full w-full cursor-default"
          />
          <motion.form
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onSubmit={handleCreatePermission}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl"
          >
            <div className="relative overflow-hidden bg-[#0f281e] px-6 py-7 text-white sm:px-8">
              <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full bg-[#c4864b]/25 blur-3xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#dec099]">Create Scope</p>
                  <h3 className="mt-2 font-serif text-2xl">New Permission Code</h3>
                  <p className="mt-1 text-xs text-white/45">Add a new action code to the system permissions log.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPermissionModal(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <label htmlFor="perm-name" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Permission Key Name</label>
                <input
                  id="perm-name"
                  type="text"
                  required
                  autoFocus
                  value={newPermissionName}
                  onChange={e => setNewPermissionName(e.target.value)}
                  placeholder="e.g. view_financial_audits"
                  className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors placeholder:text-[#0f281e]/25 focus:border-[#c4864b]"
                />
                <p className="text-[10px] text-[#0f281e]/40 mt-1.5 leading-relaxed">
                  Use snake_case for permission names. For example, <code className="bg-[#fbf7f0] border border-[#0f281e]/5 px-1 py-0.5 rounded font-mono text-[9px]">manage_invoices</code>.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#0f281e]/5 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowPermissionModal(false)}
                  className="flex-1 rounded-xl border border-[#0f281e]/10 py-3 text-[10px] font-black uppercase tracking-widest text-[#0f281e]/50 transition-colors hover:bg-[#0f281e]/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-[1.35] rounded-xl bg-[#c4864b] py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[#b5773f] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Creating...' : 'Create Permission'}
                </button>
              </div>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
};
