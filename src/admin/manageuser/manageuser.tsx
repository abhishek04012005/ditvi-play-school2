'use client';
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaTrash, FaKey, FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import styles from './manageuser.module.css';
import Loader from '@/custom/loader/loader';

interface User {
  id: string;
  username: string;
  email?: string;
  role_id: number;
  is_active: boolean;
  created_at: string;
}

interface Role {
  role_id: number;
  role: string;
}

export default function ManageUser() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    roleId: '',
    password: ''
  });

  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Check admin role on mount
  useEffect(() => {
    const checkAdminRole = async () => {
      const adminRoleId = localStorage.getItem('adminRoleId');
      
      if (!adminRoleId) {
        toast.error('Session expired. Please login again.');
        router.push('/admin/login');
        return;
      }

      try {
        const roleId = parseInt(adminRoleId);
        
        if (roleId === 0) {
          setIsAdminRole(true);
          await fetchRoles();
          await fetchUsers();
        } else {
          toast.error('Only super admins can manage users');
          router.push('/admin/dashboard');
        }
      } catch (err) {
        console.error('Error checking admin role:', err);
        toast.error('Something went wrong');
        router.push('/admin/dashboard');
      }
    };

    checkAdminRole();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('role_id, role')
        .order('role_id', { ascending: true });

      if (error) {
        console.error('Error fetching roles:', error);
        return;
      }

      setRoles(data || []);
    } catch (err) {
      console.error('Error in fetchRoles:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, role_id, is_active, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        return;
      }

      setUsers(data || []);
    } catch (err) {
      console.error('Error in fetchUsers:', err);
    }
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.roleId || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('username', formData.username)
        .single();

      if (!checkError && existingUser) {
        toast.error('Username already exists');
        return;
      }

      // Create new user
      const { error: createError } = await supabase
        .from('users')
        .insert([{
          username: formData.username,
          password: formData.password,
          role_id: parseInt(formData.roleId),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (createError) {
        toast.error('Failed to create user');
        console.error(createError);
        return;
      }

      toast.success('User created successfully!');
      setFormData({ username: '', roleId: '', password: '' });
      setShowCreateModal(false);
      await fetchUsers();
    } catch (err) {
      toast.error('Something went wrong');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedUser) {
      toast.error('No user selected');
      return;
    }

    if (!resetPasswordData.newPassword || !resetPasswordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (resetPasswordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: resetPasswordData.newPassword, updated_at: new Date().toISOString() })
        .eq('id', selectedUser.id);

      if (updateError) {
        toast.error('Failed to reset password');
        console.error(updateError);
        return;
      }

      toast.success(`Password reset for ${selectedUser.username}!`);
      setResetPasswordData({ newPassword: '', confirmPassword: '' });
      setShowResetPasswordModal(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      toast.error('Something went wrong');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ is_active: !user.is_active, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) {
        toast.error('Failed to update user status');
        console.error(updateError);
        return;
      }

      const action = user.is_active ? 'deactivated' : 'activated';
      toast.success(`User ${action}!`);
      await fetchUsers();
    } catch (err) {
      toast.error('Something went wrong');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleName = (roleId: number) => {
    return roles.find(r => r.role_id === roleId)?.role || `Role ${roleId}`;
  };

  if (!isAdminRole) {
    return <Loader isVisible={true} message="Verifying permissions..." fullScreen={true} />;
  }

  if (loading && users.length === 0) {
    return <Loader isVisible={true} message="Loading users..." fullScreen={true} />;
  }

  return (
    <div className={styles.manageUserPage}>
      <motion.div 
        className={styles.manageUserContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={handleBack}
            type="button"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
          <h1 className={styles.title}>Manage Users</h1>
          <p className={styles.subtitle}>Create, reset password, and manage admin users</p>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <input
            type="text"
            placeholder="Search by username or email..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <motion.button
            className={styles.createBtn}
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            + Create User
          </motion.button>
        </div>

        {/* Users Table */}
        <div className={styles.tableWrapper}>
          {filteredUsers.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className={styles.usernameCell}>
                      <FaUser className={styles.userIcon} />
                      {user.username}
                    </td>
                    <td>{user.email || '-'}</td>
                    <td>
                      <span className={styles.roleBadge}>
                        {getRoleName(user.role_id)}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${user.is_active ? styles.active : styles.inactive}`}>
                        {user.is_active ? (
                          <>
                            <FaCheckCircle /> Active
                          </>
                        ) : (
                          <>
                            <FaTimesCircle /> Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className={styles.actionsCell}>
                      <motion.button
                        className={styles.actionBtn}
                        onClick={() => {
                          setSelectedUser(user);
                          setShowResetPasswordModal(true);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title="Reset Password"
                      >
                        <FaKey />
                      </motion.button>
                      <motion.button
                        className={`${styles.actionBtn} ${user.is_active ? styles.deactivateBtn : styles.activateBtn}`}
                        onClick={() => handleToggleActive(user)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title={user.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {user.is_active ? <FaTimes /> : <FaCheckCircle />}
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              <FaUser className={styles.emptyIcon} />
              <p>No users found</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>Create New User</h2>
                <button
                  className={styles.closeBtn}
                  onClick={() => setShowCreateModal(false)}
                  type="button"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="username">Username *</label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      username: e.target.value
                    }))}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="roleSelect">Role Type *</label>
                  <select
                    id="roleSelect"
                    value={formData.roleId}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      roleId: e.target.value
                    }))}
                    required
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.role_id} value={role.role_id}>
                        {role.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password">Password *</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter password (min. 6 characters)"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                    required
                  />
                  {formData.password && formData.password.length < 6 && (
                    <p className={styles.errorText}>
                      Password must be at least 6 characters
                    </p>
                  )}
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowCreateModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading || !formData.username || !formData.roleId || !formData.password}
                  >
                    {loading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showResetPasswordModal && selectedUser && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResetPasswordModal(false)}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>Reset Password: {selectedUser.username}</h2>
                <button
                  className={styles.closeBtn}
                  onClick={() => setShowResetPasswordModal(false)}
                  type="button"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleResetPassword} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="newPassword">New Password *</label>
                  <div className={styles.passwordInput}>
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={resetPasswordData.newPassword}
                      onChange={(e) => setResetPasswordData(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      required
                    />
                    <button
                      type="button"
                      className={styles.togglePassword}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {resetPasswordData.newPassword && resetPasswordData.newPassword.length < 6 && (
                    <p className={styles.errorText}>
                      Password must be at least 6 characters
                    </p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={resetPasswordData.confirmPassword}
                    onChange={(e) => setResetPasswordData(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                    required
                  />
                  {resetPasswordData.confirmPassword && resetPasswordData.newPassword !== resetPasswordData.confirmPassword && (
                    <p className={styles.errorText}>
                      Passwords do not match
                    </p>
                  )}
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowResetPasswordModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading || !resetPasswordData.newPassword || !resetPasswordData.confirmPassword || resetPasswordData.newPassword !== resetPasswordData.confirmPassword}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
