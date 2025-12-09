'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    FaArrowLeft,
    FaChevronLeft,
    FaChevronRight,
    FaStar,
    FaEye,
    FaVolumeUp,
    FaVolumeMute,
    FaCube,
    FaMobileAlt,
    FaExpand,
    FaCompress,
} from 'react-icons/fa';
import styles from './arbookreader.module.css';
import { ARBook } from '@/ar/types';
import { arBooks } from '@/ar/data';

interface ARBookReaderProps {
    bookId: string;
}

const ARBookReader: React.FC<ARBookReaderProps> = ({ bookId }) => {
    const book = arBooks.find(b => b.id === bookId);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [viewMode, setViewMode] = useState<'2d' | '3d' | 'ar'>('2d');
    const [isFullscreen, setIsFullscreen] = useState(false);

    if (!book || book.pages.length === 0) {
        return (
            <div className={styles.emptyBook}>
                <h2>📚 Book Not Available</h2>
                <p>This book is currently being prepared. Check back soon!</p>
                <Link href="/ar-books">
                    <button className={styles.backBtn}>← Back to Library</button>
                </Link>
            </div>
        );
    }

    const currentPage = book.pages[currentPageIndex];

    const handleNextPage = () => {
        if (currentPageIndex < book.pages.length - 1) {
            setCurrentPageIndex(currentPageIndex + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(currentPageIndex - 1);
        }
    };

    const handlePlayAudio = () => {
        if (currentPage.audioUrl) {
            const audio = new Audio(currentPage.audioUrl);
            audio.play();
        }
    };

    return (
        <div className={`${styles.arBookReader} ${isFullscreen ? styles.fullscreen : ''}`}>
            {/* Header */}
            <motion.div
                className={styles.readerHeader}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Link href="/ar-books">
                    <motion.button
                        className={styles.backBtn}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaArrowLeft /> Back
                    </motion.button>
                </Link>

                <div className={styles.bookTitle}>
                    <h1>{book.title}</h1>
                    <p>{book.description}</p>
                </div>

                <div className={styles.headerActions}>
                    <motion.button
                        className={styles.iconBtn}
                        onClick={() => setIsMuted(!isMuted)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                    </motion.button>

                    <motion.button
                        className={styles.iconBtn}
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? <FaCompress /> : <FaExpand />}
                    </motion.button>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className={styles.readerContent}>
                {/* Sidebar - Book Info */}
                <motion.div
                    className={styles.sidebar}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <div className={styles.bookCard}>
                        <img src={book.coverImage} alt={book.title} className={styles.bookCoverImage} />
                        <div className={styles.bookMeta}>
                            <div className={styles.metaItem}>
                                <FaStar style={{ color: '#FFD700' }} />
                                <span>{book.rating.toFixed(1)}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <FaEye />
                                <span>{book.views.toLocaleString()}</span>
                            </div>
                        </div>
                        <p className={styles.ageGroup}>👶 {book.ageGroup}</p>
                        <p className={styles.author}>By {book.authorName}</p>
                    </div>

                    {/* View Mode Selector */}
                    <div className={styles.viewModeSelector}>
                        <h3>View Mode</h3>
                        <div className={styles.modeButtons}>
                            <motion.button
                                className={`${styles.modeBtn} ${viewMode === '2d' ? styles.active : ''}`}
                                onClick={() => setViewMode('2d')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                📱 2D View
                            </motion.button>
                            <motion.button
                                className={`${styles.modeBtn} ${viewMode === '3d' ? styles.active : ''}`}
                                onClick={() => setViewMode('3d')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaCube /> 3D
                            </motion.button>
                            <motion.button
                                className={`${styles.modeBtn} ${viewMode === 'ar' ? styles.active : ''}`}
                                onClick={() => setViewMode('ar')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaMobileAlt /> AR
                            </motion.button>
                        </div>
                    </div>

                    {/* Pages Navigator */}
                    <div className={styles.pageNavigator}>
                        <h3>Pages ({book.pages.length})</h3>
                        <div className={styles.pagesList}>
                            {book.pages.map((page, index) => (
                                <motion.button
                                    key={page.id}
                                    className={`${styles.pageThumb} ${currentPageIndex === index ? styles.active : ''}`}
                                    onClick={() => setCurrentPageIndex(index)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    title={`Page ${page.pageNumber}: ${page.title}`}
                                >
                                    <span className={styles.pageNum}>{page.pageNumber}</span>
                                    <span className={styles.pageTitle}>{page.title}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Main Reader */}
                <motion.div
                    className={styles.mainReader}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    key={currentPageIndex}
                >
                    {/* Page Content */}
                    <div className={styles.pageContent}>
                        <motion.img
                            src={currentPage.imageUrl}
                            alt={`Page ${currentPage.pageNumber}`}
                            className={styles.pageImage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        />

                        {/* View Mode Specific Content */}
                        {viewMode === '3d' && currentPage.arModelUrl && (
                            <motion.div
                                className={styles.modelViewer}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className={styles.modelPlaceholder}>
                                    <FaCube style={{ fontSize: '3rem', color: '#6a4c93' }} />
                                    <p>3D Model Viewer</p>
                                    <small>{currentPage.arModelUrl}</small>
                                </div>
                            </motion.div>
                        )}

                        {viewMode === 'ar' && (
                            <motion.div
                                className={styles.arViewer}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className={styles.arPlaceholder}>
                                    <FaMobileAlt style={{ fontSize: '3rem', color: '#6a4c93' }} />
                                    <p>AR Experience</p>
                                    <small>Point your camera at the page to see AR content</small>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Page Info */}
                    <motion.div
                        className={styles.pageInfo}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className={styles.pageHeader}>
                            <h2>{currentPage.title}</h2>
                            <p>{currentPage.description}</p>
                        </div>

                        {/* Interactive Elements */}
                        {currentPage.interactiveElements && currentPage.interactiveElements.length > 0 && (
                            <div className={styles.interactiveButtons}>
                                {currentPage.interactiveElements.map((element) => (
                                    <motion.button
                                        key={element.id}
                                        className={styles.interactiveBtn}
                                        onClick={() => {
                                            if (element.action === 'play_sound') {
                                                handlePlayAudio();
                                            }
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {element.type === 'button' && <FaVolumeUp />}
                                        {element.type === 'sound' && <FaVolumeUp />}
                                        {element.type === 'animation' && <FaCube />}
                                        {element.name}
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {/* Audio Button */}
                        {currentPage.audioUrl && (
                            <motion.button
                                className={styles.audioBtn}
                                onClick={handlePlayAudio}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={isMuted}
                            >
                                <FaVolumeUp /> Listen to Pronunciation
                            </motion.button>
                        )}
                    </motion.div>

                    {/* Navigation Controls */}
                    <div className={styles.navigationControls}>
                        <motion.button
                            className={`${styles.navBtn} ${currentPageIndex === 0 ? styles.disabled : ''}`}
                            onClick={handlePrevPage}
                            disabled={currentPageIndex === 0}
                            whileHover={currentPageIndex > 0 ? { scale: 1.1 } : {}}
                            whileTap={currentPageIndex > 0 ? { scale: 0.95 } : {}}
                        >
                            <FaChevronLeft /> Prev
                        </motion.button>

                        <div className={styles.pageIndicator}>
                            {currentPageIndex + 1} / {book.pages.length}
                        </div>

                        <motion.button
                            className={`${styles.navBtn} ${currentPageIndex === book.pages.length - 1 ? styles.disabled : ''}`}
                            onClick={handleNextPage}
                            disabled={currentPageIndex === book.pages.length - 1}
                            whileHover={currentPageIndex < book.pages.length - 1 ? { scale: 1.1 } : {}}
                            whileTap={currentPageIndex < book.pages.length - 1 ? { scale: 0.95 } : {}}
                        >
                            Next <FaChevronRight />
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ARBookReader;
