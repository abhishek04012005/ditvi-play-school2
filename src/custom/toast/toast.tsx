'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimes, FaExclamationCircle } from 'react-icons/fa';
import Confetti from '@/components/confetti/confetti';
import styles from './toast.module.css';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
    showConfetti?: boolean;
}

const Toast = ({
    message,
    type,
    isVisible,
    onClose,
    duration = 4000,
    showConfetti = false
}: ToastProps) => {
    useEffect(() => {
        if (!isVisible) return;

        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [isVisible, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FaCheckCircle className={styles.icon} />;
            case 'error':
                return <FaExclamationCircle className={styles.icon} />;
            default:
                return null;
        }
    };

    return (
        <>
            {/* Confetti for success only */}
            {showConfetti && isVisible && type === 'success' && (
                <Confetti
                    trigger={isVisible}
                    duration={3000}
                    particleCount={1200}
                    spread={160}
                    intensity="high"
                    colors={['#6a4c93', '#ffd166', '#4ecdc4', '#ffe66d']}
                />
            )}

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        className={`${styles.toastContainer} ${styles[type]}`}
                        initial={{ opacity: 0, y: -20, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: -20, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className={styles.toastContent}>
                            {getIcon()}
                            <div className={styles.messageWrapper}>
                                <h3 className={styles.title}>
                                    {type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : 'Info'}
                                </h3>
                                <p className={styles.message}>{message}</p>
                            </div>
                        </div>
                        <motion.button
                            className={styles.closeBtn}
                            onClick={onClose}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Close notification"
                        >
                            <FaTimes />
                        </motion.button>

                        {/* Progress bar */}
                        <motion.div
                            className={styles.progressBar}
                            initial={{ scaleX: 1 }}
                            animate={{ scaleX: 0 }}
                            transition={{ duration: duration / 1000, ease: 'linear' }}
                            style={{ originX: 0 }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Toast;