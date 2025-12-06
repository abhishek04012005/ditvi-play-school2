'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { hashPassword, verifyPassword } from '@/lib/passwordEncryption';
import styles from './changepassword.module.css';
import Loader from '@/custom/loader/loader';

export default function ChangePassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Validate passwords match
  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.newPassword.length > 0;
  const isFormValid = formData.currentPassword && formData.newPassword && formData.confirmPassword && passwordsMatch;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast.error('Please fill in all fields correctly');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Get admin username from localStorage (set during login)
      const adminUsername = localStorage.getItem('adminUsername');

      if (!adminUsername) {
        toast.error('Session expired. Please login again.');
        router.push('/admin/login');
        return;
      }

      // Get salt from environment
      const salt = process.env.NEXT_PUBLIC_PASSWORD_SALT || process.env.PASSWORD_SALT;
      if (!salt) {
        toast.error('Security configuration error. Please contact administrator.');
        console.error('PASSWORD_SALT not configured');
        return;
      }

      // Fetch current user data
      const { data: adminData, error: fetchError } = await supabase
        .from('users')
        .select()
        .eq('username', adminUsername)
        .single();

      if (fetchError || !adminData) {
        toast.error('User not found');
        return;
      }

      // Verify current password using hash comparison
      const isCurrentPasswordValid = verifyPassword(formData.currentPassword, adminData.password, salt);
      
      if (!isCurrentPasswordValid) {
        toast.error('Current password is incorrect');
        return;
      }

      // Hash new password
      const hashedNewPassword = hashPassword(formData.newPassword, salt);

      // Update password in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: hashedNewPassword })
        .eq('username', adminUsername);

      if (updateError) {
        toast.error('Failed to update password');
        return;
      }

      toast.success('Password changed successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Redirect back to dashboard
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

  if (loading) {
    return <Loader isVisible={true} message="Updating password..." fullScreen={true} />;
  }

  return (
    <div className={styles.changePasswordPage}>
      <motion.div 
        className={styles.changePasswordContainer}
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
          <h1 className={styles.title}>Change Password</h1>
          <p className={styles.subtitle}>Update your admin password</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.changePasswordForm}>
          <motion.div 
            className={styles.inputGroup}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label htmlFor="currentPassword" className={styles.label}>
              Current Password
            </label>
            <div className={styles.inputWrapper}>
              <FaLock className={styles.inputIcon} />
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter your current password"
                value={formData.currentPassword}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  currentPassword: e.target.value
                }))}
                required
              />
              <button 
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                tabIndex={-1}
                aria-label="Toggle current password visibility"
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </motion.div>

          {/* New Password */}
          <motion.div 
            className={styles.inputGroup}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="newPassword" className={styles.label}>
              New Password
            </label>
            <div className={styles.inputWrapper}>
              <FaLock className={styles.inputIcon} />
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter your new password (min. 6 characters)"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  newPassword: e.target.value
                }))}
                required
              />
              <button 
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex={-1}
                aria-label="Toggle new password visibility"
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formData.newPassword && formData.newPassword.length < 6 && (
              <p className={styles.errorMessage}>
                Password must be at least 6 characters
              </p>
            )}
          </motion.div>

          {/* Confirm Password */}
          <motion.div 
            className={styles.inputGroup}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <div className={styles.inputWrapper}>
              <FaLock className={styles.inputIcon} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))}
                required
              />
              <button 
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formData.confirmPassword && !passwordsMatch && (
              <p className={styles.errorMessage}>
                Passwords do not match
              </p>
            )}
            {passwordsMatch && formData.confirmPassword && (
              <p className={styles.successMessage}>
                ✓ Passwords match
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
            {loading ? 'Updating...' : 'Change Password'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
