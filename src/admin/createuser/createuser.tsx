'use client';
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/passwordEncryption';
import styles from './createuser.module.css';
import Loader from '@/custom/loader/loader';

interface Role {
  role_id: number;
  role: string;
}

export default function CreateUser() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    roleId: '',
    password: ''
  });

  // Check admin role and fetch available roles
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
        
        // Check if admin has role_id = 0 (super admin)
        if (roleId === 0) {
          setIsAdminRole(true);
          // Fetch available roles
          await fetchRoles();
        } else {
          toast.error('Only super admins can create users');
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
        toast.error('Failed to load roles');
        return;
      }

      setRoles(data || []);
    } catch (err) {
      console.error('Error in fetchRoles:', err);
    }
  };

  // Validate form
  const isFormValid = formData.username && formData.roleId && formData.password && formData.password.length >= 6;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error('Please fill in all fields correctly');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Get salt from environment
      const salt = process.env.NEXT_PUBLIC_PASSWORD_SALT || process.env.PASSWORD_SALT;
      if (!salt) {
        toast.error('Security configuration error. Please contact administrator.');
        console.error('PASSWORD_SALT not configured');
        return;
      }

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

      // Hash password before storing
      const hashedPassword = hashPassword(formData.password, salt);

      // Create new user
      const { error: createError } = await supabase
        .from('users')
        .insert([{
          username: formData.username,
          password: hashedPassword,
          role_id: parseInt(formData.roleId),
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
      
      // Redirect back to dashboard after success
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1500);
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

  if (!isAdminRole) {
    return <Loader isVisible={true} message="Verifying permissions..." fullScreen={true} />;
  }

  if (loading) {
    return <Loader isVisible={true} message="Creating user..." fullScreen={true} />;
  }

  return (
    <div className={styles.createUserPage}>
      <motion.div 
        className={styles.createUserContainer}
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
          <h1 className={styles.title}>Create New User</h1>
          <p className={styles.subtitle}>Add a new admin user to the system</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.createUserForm}>
          {/* Username */}
          <motion.div 
            className={styles.inputGroup}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <div className={styles.inputWrapper}>
              <FaUser className={styles.inputIcon} />
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
          </motion.div>

          {/* Role Type */}
          <motion.div 
            className={styles.inputGroup}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="roleSelect" className={styles.label}>
              Role Type
            </label>
            <div className={styles.inputWrapper}>
              <select
                id="roleSelect"
                value={formData.roleId}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  roleId: e.target.value
                }))}
                className={styles.selectInput}
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
          </motion.div>

          {/* Password */}
          <motion.div 
            className={styles.inputGroup}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <FaLock className={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password (min. 6 characters)"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  password: e.target.value
                }))}
                required
              />
              <button 
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formData.password && formData.password.length < 6 && (
              <p className={styles.errorMessage}>
                Password must be at least 6 characters
              </p>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading || !isFormValid}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: isFormValid ? 1.02 : 1 }}
            whileTap={{ scale: isFormValid ? 0.98 : 1 }}
          >
            {loading ? 'Creating...' : 'Create User'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
