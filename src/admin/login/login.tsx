'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import styles from './login.module.css';
import schoolDetails from '@/json/schooldetails';

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('admins')
        .select()
        .eq('username', formData.username)
        .eq('password', formData.password)
        .single();

      if (error || !data) {
        toast.error('Invalid credentials');
        setFormData({ username: '', password: '' });
        return;
      }

      localStorage.setItem('isAdminLoggedIn', 'true');
      toast.success('Login successful!');
      setFormData({ username: '', password: '' });
      router.push('/admin/dashboard');
    } catch (err) {
      toast.error('Something went wrong');
      console.error(err);
      setFormData({ username: '', password: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      {/* <div className={styles.decorativeElements}>
        <div className={styles.circle}></div>
        <div className={styles.dots}></div>
        <div className={styles.squiggly}></div>
      </div> */}

      <motion.div 
        className={styles.loginContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.logoSection}>
          <motion.img
            src={typeof schoolDetails.logo === 'string' ? schoolDetails.logo : schoolDetails.logo.src}
            alt={schoolDetails.name}
            className={styles.logo}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          />
          <h1 className={styles.title}>Admin Login</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <motion.div 
            className={styles.inputGroup}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className={styles.inputWrapper}>
              <FaUser className={styles.inputIcon} />
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  username: e.target.value
                }))}
                required
              />
            </div>
          </motion.div>

          <motion.div 
            className={styles.inputGroup}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className={styles.inputWrapper}>
              <FaLock className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
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
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </motion.div>

          <motion.button 
            type="submit" 
            className={styles.loginButton}
            disabled={loading}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}