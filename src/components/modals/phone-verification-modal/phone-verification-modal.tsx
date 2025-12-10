"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPhone, FaTimes, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import styles from './phone-verification-modal.module.css';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  admissionNumber: string;
  lastFourDigits: string;
  onVerificationSuccess: () => void;
  onClose: () => void;
}

export default function PhoneVerificationModal({
  isOpen,
  admissionNumber,
  lastFourDigits,
  onVerificationSuccess,
  onClose,
}: PhoneVerificationModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    
    // Format as user types
    if (value.length <= 3) {
      setPhoneNumber(value);
    } else if (value.length <= 6) {
      setPhoneNumber(`${value.slice(0, 3)}-${value.slice(3)}`);
    } else {
      setPhoneNumber(`${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6)}`);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      toast.error('Phone number must be 10 digits');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/admission/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admission_number: admissionNumber,
          phone_number: cleanPhone,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Verification failed');
        return;
      }

      setVerified(true);
      toast.success('Phone verified successfully!');
      
      // Call the success callback after a short delay
      setTimeout(() => {
        onVerificationSuccess();
      }, 1000);
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!verified) {
      setPhoneNumber('');
      setVerified(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className={styles.overlay}
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close Button */}
            <button
              className={styles.closeBtn}
              onClick={handleClose}
              disabled={loading}
              aria-label="Close modal"
            >
              <FaTimes />
            </button>

            {!verified ? (
              <>
                {/* Header */}
                <div className={styles.header}>
                  <div className={styles.iconBox}>
                    <FaPhone />
                  </div>
                  <h2>Verify Your Phone Number</h2>
                  <p>Please verify the phone number on file to continue</p>
                </div>

                {/* Content */}
                <div className={styles.content}>
                  <div className={styles.infoBox}>
                    <p className={styles.infoText}>
                      We have the phone number ending in <strong>{lastFourDigits}</strong>
                    </p>
                    <p className={styles.infoSubtext}>
                      Enter your 10-digit phone number to verify
                    </p>
                  </div>

                  <form onSubmit={handleVerify} className={styles.form}>
                    <div className={styles.formGroup}>
                      <label htmlFor="phone">Phone Number</label>
                      <div className={styles.inputWrapper}>
                        <FaPhone className={styles.inputIcon} />
                        <input
                          id="phone"
                          type="tel"
                          placeholder="XXX-XXX-XXXX"
                          value={phoneNumber}
                          onChange={handlePhoneChange}
                          disabled={loading}
                          className={styles.input}
                          maxLength={12}
                        />
                      </div>
                      <p className={styles.helperText}>
                        Format: XXX-XXX-XXXX (10 digits)
                      </p>
                    </div>

                    <motion.button
                      type="submit"
                      className={styles.verifyBtn}
                      disabled={loading || phoneNumber.length < 12}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? (
                        <>
                          <FaSpinner className={styles.spinner} />
                          Verifying...
                        </>
                      ) : (
                        'Verify Phone Number'
                      )}
                    </motion.button>
                  </form>

                  <p className={styles.disclaimer}>
                    ⚠️ This verification ensures secure access to your admission data
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className={styles.successContent}>
                  <motion.div
                    className={styles.successIcon}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <FaCheckCircle />
                  </motion.div>
                  <h2>Verification Successful!</h2>
                  <p>Your phone number has been verified. You can now edit your admission details.</p>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
