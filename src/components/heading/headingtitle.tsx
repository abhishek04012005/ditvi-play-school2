'use client';
import { motion } from 'framer-motion';
import styles from './headingtitle.module.css';

interface AnimatedTitleProps {
    text: string;
    className?: string;
}

const HeadingTitle = ({ text, className = '' }: AnimatedTitleProps) => {
    return (
        <motion.h2
            className={`${styles.title} ${className}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{
                opacity: 1,
                y: 0,
                scale: [1, 1.02, 1],
                transition: {
                    duration: 0.8,
                    times: [0, 0.5, 1],
                    ease: "easeOut"
                }
            }}
            viewport={{ once: true }}
        >
            <div className={styles.titleText}>
                <span className={styles.titleAnimation}>✨</span>
                {text}
                <span className={styles.titleAnimation}>✨</span>
            </div>
        </motion.h2>
    );
};

export default HeadingTitle;