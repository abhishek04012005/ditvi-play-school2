'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FaArrowLeft, FaPrint, FaDownload, FaBook } from 'react-icons/fa';
import styles from './azBookTemplate.module.css';
import { schoolDetails } from '@/json/schooldetails';

export interface Letter {
    letter: string;
    word: string;
    description: string;
    icon: string;
    color?: string;
    backgroundColor: string;
    image?: string;
}

export interface AZBookData {
    title: string;
    description: string;
    ageGroup: string;
    authorName: string;
    letters: Letter[];
}

interface AZBookTemplateProps {
    bookData: AZBookData;
}

const AZBookTemplate: React.FC<AZBookTemplateProps> = ({ bookData }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = bookData.letters.length + 2; // Cover + letters + back

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const renderPage = () => {
        // Cover Page
        if (currentPage === 0) {
            return (
                <motion.div
                    className={styles.page}
                    key="cover"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className={styles.coverPage}>
                        {/* Top Section */}
                        <div className={styles.coverTop}>
                            <img
                                src={typeof schoolDetails.logo === 'string' ? schoolDetails.logo : schoolDetails.logo.src}
                                alt={schoolDetails.name}
                                className={styles.coverLogo}
                            />
                            <h1 className={styles.schoolNameCover}>{schoolDetails.name}</h1>
                        </div>

                        {/* Decorative Elements */}
                        <div className={styles.decorElements}>
                            <div className={styles.decorCircle1}></div>
                            <div className={styles.decorCircle2}></div>
                            <div className={styles.decorStar1}>⭐</div>
                            <div className={styles.decorStar2}>✨</div>
                        </div>

                        {/* Main Title */}
                        <div className={styles.coverMain}>
                            <motion.h2
                                className={styles.coverTitle}
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                {bookData.title}
                            </motion.h2>
                            <p className={styles.coverDescription}>{bookData.description}</p>

                            {/* Letter Grid Preview */}
                            <div className={styles.letterPreview}>
                                {bookData.letters.slice(0, 6).map((letter, idx) => (
                                    <motion.div
                                        key={idx}
                                        className={styles.previewLetter}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <span className={styles.previewLetterText}>{letter.letter}</span>
                                    </motion.div>
                                ))}
                                <div className={styles.previewDots}>...</div>
                            </div>
                        </div>

                        {/* Bottom Info */}
                        <div className={styles.coverBottom}>
                            <div className={styles.coverMeta}>
                                <span>📖 Age {bookData.ageGroup}</span>
                                <span>✍️ {bookData.authorName}</span>
                            </div>
                            <div className={styles.decorLine}></div>
                            <p className={styles.coverFooter}>
                                🌟 Interactive Learning with Fun! 🌟
                            </p>
                        </div>
                    </div>
                </motion.div>
            );
        }

        // Letter Pages
        if (currentPage >= 1 && currentPage <= bookData.letters.length) {
            const letter = bookData.letters[currentPage - 1];
            return (
                <motion.div
                    className={styles.page}
                    key={`letter-${currentPage}`}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className={styles.letterPage} style={{ backgroundColor: letter.backgroundColor }}>
                        {/* Header */}
                        <div className={styles.letterHeader}>
                            <div className={styles.pageNumberBadge}>
                                {currentPage} / {totalPages - 1}
                            </div>
                            <motion.div
                                className={styles.bigLetter}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                {letter.letter}
                            </motion.div>
                        </div>

                        {/* Main Content */}
                        <div className={styles.letterContent}>
                            {/* Left Side - Icon */}
                            <motion.div
                                className={styles.letterIconSection}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                <div className={styles.iconCircle}>
                                    <span className={styles.letterIcon}>{letter.icon}</span>
                                </div>
                            </motion.div>

                            {/* Right Side - Content */}
                            <motion.div
                                className={styles.letterTextSection}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                <h3 className={styles.letterWord}>{letter.word}</h3>
                                <p className={styles.letterDescription}>
                                    {letter.description}
                                </p>

                                {/* Tracing Area */}
                                <div className={styles.tracingArea}>
                                    <div className={styles.tracingLine}></div>
                                    <div className={styles.tracingLine}></div>
                                    <div className={styles.tracingLabel}>✏️ Trace the letter</div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Decorative Bottom */}
                        <div className={styles.letterFooter}>
                            <div className={styles.footerDots}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className={styles.dot}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            );
        }

        // Back Cover
        return (
            <motion.div
                className={styles.page}
                key="back"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className={styles.backPage}>
                    <div className={styles.backContent}>
                        <h3>🎉 Congratulations! 🎉</h3>
                        <p>You've learned all the letters from A to Z!</p>

                        <div className={styles.achievementBadge}>
                            <span className={styles.badgeIcon}>🏆</span>
                            <span className={styles.badgeText}>ABC Master</span>
                        </div>

                        <div className={styles.backInfo}>
                            <h4>Keep Learning!</h4>
                            <ul>
                                <li>✓ Practice writing each letter</li>
                                <li>✓ Say the words out loud</li>
                                <li>✓ Draw your own pictures</li>
                                <li>✓ Read the words in stories</li>
                            </ul>
                        </div>

                        <div className={styles.schoolInfo}>
                            <p><strong>{schoolDetails.name}</strong></p>
                            <p>📍 {schoolDetails.address.city}, {schoolDetails.address.state}</p>
                            <p>📞 {schoolDetails.contact.phone}</p>
                            <p>📧 {schoolDetails.contact.email}</p>
                        </div>

                        <div className={styles.backFooter}>
                            <p>Learning is Fun! 🌈</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className={styles.templateContainer}>
            {/* Header Controls */}
            <motion.div
                className={styles.headerControls}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Link href="/ar-books">
                    <button className={styles.backBtn}>
                        <FaArrowLeft /> Back
                    </button>
                </Link>

                <div className={styles.titleSection}>
                    <h1>{bookData.title}</h1>
                    <p>Page {currentPage + 1} of {totalPages}</p>
                </div>

                <div className={styles.actionButtons}>
                    <button
                        className={styles.actionBtn}
                        onClick={() => window.print()}
                        title="Print"
                    >
                        <FaPrint /> Print
                    </button>
                    <button
                        className={styles.actionBtn}
                        title="Download"
                    >
                        <FaDownload /> Download
                    </button>
                </div>
            </motion.div>

            {/* Page Display */}
            <div className={styles.pageContainer}>
                <AnimatePresence mode="wait">
                    {renderPage()}
                </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <motion.div
                className={styles.navigationControls}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <button
                    className={styles.navBtn}
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                >
                    ← Previous
                </button>

                <div className={styles.pageIndicator}>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <motion.div
                            key={i}
                            className={`${styles.pageIndicatorDot} ${i === currentPage ? styles.active : ''}`}
                            onClick={() => setCurrentPage(i)}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.95 }}
                        />
                    ))}
                </div>

                <button
                    className={styles.navBtn}
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                >
                    Next →
                </button>
            </motion.div>
        </div>
    );
};

export default AZBookTemplate;
