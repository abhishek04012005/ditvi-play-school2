'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import Confetti from '@/components/confetti/confetti';
import styles from './popup.module.css';

export type ModalType = 'success' | 'error';

interface SubmitModalProps {
    type: ModalType;
    isVisible: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    showConfetti?: boolean;
    autoCloseDuration?: number;
}

const SubmitModal = ({
    type,
    isVisible,
    onClose,
    title,
    message,
    showConfetti = true,
    autoCloseDuration = 4000
}: SubmitModalProps) => {
    useEffect(() => {
        if (!isVisible) return;

        const timer = setTimeout(() => {
            onClose();
        }, autoCloseDuration);

        return () => clearTimeout(timer);
    }, [isVisible, autoCloseDuration, onClose]);

    const isSuccess = type === 'success';

    return (
        <>
            {/* Confetti for success */}
            {showConfetti && isVisible && isSuccess && (
                <Confetti
                    trigger={isVisible}
                    duration={3000}
                    particleCount={1500}
                    spread={170}
                    intensity="high"
                    colors={['#6a4c93', '#ffd166', '#4ecdc4', '#ffe66d', '#ff6b6b']}
                />
            )}

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        className={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    >
                        <motion.div
                            className={`${styles.modal} ${styles[type]}`}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.button
                                className={styles.closeButton}
                                onClick={onClose}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label="Close modal"
                            >
                                <FaTimes />
                            </motion.button>

                            <motion.div
                                className={styles.iconWrapper}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            >
                                {isSuccess ? (
                                    <FaCheckCircle className={styles.successIcon} />
                                ) : (
                                    <FaExclamationCircle className={styles.errorIcon} />
                                )}
                            </motion.div>

                            <motion.div
                                className={styles.content}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h2 className={styles.title}>
                                    {title || (isSuccess ? 'Success!' : 'Oops! Error')}
                                </h2>
                                <p className={styles.message}>{message}</p>
                            </motion.div>

                            <motion.button
                                className={styles.confirmBtn}
                                onClick={onClose}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                {isSuccess ? 'Great!' : 'Try Again'}
                            </motion.button>

                            {/* Decorative elements for success */}
                            {isSuccess && (
                                <>
                                    <motion.div
                                        className={styles.star1}
                                        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        ✨
                                    </motion.div>
                                    <motion.div
                                        className={styles.star2}
                                        animate={{ scale: [1, 1.3, 1], rotate: [0, -180, -360] }}
                                        transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
                                    >
                                        ✨
                                    </motion.div>
                                    <motion.div
                                        className={styles.star3}
                                        animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
                                        transition={{ duration: 2.2, repeat: Infinity, delay: 0.6 }}
                                    >
                                        ✨
                                    </motion.div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SubmitModal;