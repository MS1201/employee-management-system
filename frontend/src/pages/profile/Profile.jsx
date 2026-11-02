import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Shield,
  KeyRound,
  CheckCircle,
  Users,
  Power
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user, updateUser, isSuperAdmin } = useAuth();

  // Profile Form
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Admin User List
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    }
  }, [user]);

  const fetchUsers = async () => {
    if (!isSuperAdmin) return;
    setUsersLoading(true);
    try {
      const res = await api.get('/auth/users');
      if (res.data.success) setAllUsers(res.data.data);
    } catch (err) {
      // ignore
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isSuperAdmin]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        updateUser(res.data.data);
        toast.success('Profile details updated');
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.data.success) {
        toast.success('Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      await api.put(`/auth/users/${userId}/toggle`);
      toast.success('User access status updated');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/auth/users/${userId}/role`, { role: newRole });
      toast.success('Role modified');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Account Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal profile, secure credentials, and organization permissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Personal Information</h3>
              <p className="text-[11px] text-slate-400">Update your name and primary identification</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-3">
            <div>
              <label className="label">Registered Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="input-field bg-slate-50 dark:bg-slate-800/60 opacity-70 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First Name *</label>
                <input
                  type="text"
                  required
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input
                  type="text"
                  required
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="label">Access Role</label>
              <span className="badge-purple capitalize text-xs">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileLoading}
                className="btn-primary text-xs"
              >
                {profileLoading ? 'Saving...' : 'Update Details'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Security & Password</h3>
              <p className="text-[11px] text-slate-400">Ensure strong credentials for portal access</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div>
              <label className="label">Current Password *</label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <div>
              <label className="label">New Password (Min 6 chars) *</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Confirm New Password *</label>
              <input
                type="password"
                required
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="btn-primary text-xs"
              >
                {passwordLoading ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Super Admin User Management Table */}
      {isSuperAdmin && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  System User Directory (Super Admin Access)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Manage accounts, deactivate credentials, and adjust role authorities.
                </p>
              </div>
            </div>
            <span className="badge-blue text-xs">{allUsers.length} Users</span>
          </div>

          <div className="table-wrapper border-none">
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  <th className="table-th">User Name</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Role</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u._id} className="table-tr">
                    <td className="table-td font-semibold text-slate-800 dark:text-slate-100">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="table-td text-xs font-mono text-slate-500">{u.email}</td>
                    <td className="table-td">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={u._id === user._id}
                        className="input-field py-1 text-xs w-36"
                      >
                        <option value="employee">Employee</option>
                        <option value="hr_manager">HR Manager</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                    <td className="table-td">
                      <Badge variant={u.isActive ? 'green' : 'red'}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>
                    <td className="table-td text-right">
                      {u._id !== user._id && (
                        <button
                          onClick={() => handleToggleUser(u._id)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                            u.isActive
                              ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

