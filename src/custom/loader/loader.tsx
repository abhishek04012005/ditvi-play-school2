'use client';

import { motion } from 'framer-motion';
import styles from './loader.module.css';

interface LoaderProps {
    isVisible?: boolean;
    message?: string;
    fullScreen?: boolean;
}

const Loader = ({
    isVisible = true,
    message = 'Loading...',
    fullScreen = true
}: LoaderProps) => {
    if (!isVisible) return null;

    const loaderVariants = {
        animate: {
            transition: {
                staggerChildren: 0.1,
                repeatDelay: 0.2,
            },
        },
    };

    const ballVariants = {
        animate: (i: number) => ({
            y: [0, -20, 0],
            transition: {
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
            },
        }),
    };

    const ringVariants = {
        animate: {
            rotate: 360,
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: 'linear' as any,
            },
        },
    };

    const pulseVariants = {
        animate: {
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
            transition: {
                duration: 1.5,
                repeat: Infinity,
            },
        },
    };

    return (
        <div className={`${styles.loaderWrapper} ${fullScreen ? styles.fullScreen : ''}`}>
            <motion.div
                className={styles.loaderContainer}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                {/* Main Loader Animation */}
                <div className={styles.loaderContent}>
                    {/* Animated Rings */}
                    <motion.div
                        className={styles.ring}
                        variants={ringVariants}
                        animate="animate"
                    >
                        <span className={styles.ringSpan}></span>
                    </motion.div>

                    {/* Center Circle with Pulse */}
                    <motion.div
                        className={styles.centerCircle}
                        variants={pulseVariants}
                        animate="animate"
                    >
                        <div className={styles.logo}>🎓</div>
                    </motion.div>

                    {/* Floating Balls */}
                    <motion.div
                        className={styles.ballsContainer}
                        variants={loaderVariants}
                        animate="animate"
                    >
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className={styles.ball}
                                custom={i}
                                variants={ballVariants}
                                animate="animate"
                            />
                        ))}
                    </motion.div>
                </div>

                {/* Loading Text */}
                {message && (
                    <motion.p
                        className={styles.loadingText}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {message}
                    </motion.p>
                )}

                {/* Loading Dots Animation */}
                <div className={styles.dotsContainer}>
                    {[0, 1, 2].map((i) => (
                        <motion.span
                            key={i}
                            className={styles.dot}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                                duration: 1.4,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Loader;