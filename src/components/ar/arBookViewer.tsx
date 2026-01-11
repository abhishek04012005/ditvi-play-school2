'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight, FaArrowLeft } from 'react-icons/fa';
import Image from 'next/image';
import { ARBook, ARBookPage } from '@/ar/types';
import { schoolDetails } from '@/json/schooldetails';
import styles from './arBookViewer.module.css';

interface ARBookViewerProps {
    book: ARBook;
    qrCodeUrl?: string;
    arScanImageUrl?: string;
}

type PageType = 
    | { type: 'cover' }
    | { type: 'arScan' }
    | { type: 'content'; data: ARBookPage };

const ARBookViewer: React.FC<ARBookViewerProps> = ({
    book,
    qrCodeUrl = '/assets/scanimage/qrcode.png',
    arScanImageUrl = '/assets/scanimage/ar-scan.png',
}) => {
    const { name: schoolName, logo } = schoolDetails;
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    // Create unified pages array
    const allPages: PageType[] = [
        { type: 'cover' },
        { type: 'arScan' },
        ...book.pages.map(page => ({ type: 'content' as const, data: page }))
    ];

    const handlePrevPage = () => {
        setCurrentPageIndex(prev => (prev > 0 ? prev - 1 : prev));
    };

    const handleNextPage = () => {
        setCurrentPageIndex(prev => (prev < allPages.length - 1 ? prev + 1 : prev));
    };

    const handleDotClick = (index: number) => {
        setCurrentPageIndex(index);
    };

    const currentPage = allPages[currentPageIndex];

    const renderPage = () => {
        switch (currentPage.type) {
            case 'cover':
                return (
                    <div className={styles.frontCover}>
                        <div className={styles.brandingSection}>
                            <div className={styles.brandingTop}>
                                <div className={styles.logoContainer}>
                                    <Image
                                        src={typeof logo === 'string' ? logo : logo.src}
                                        alt={schoolName}
                                        className={styles.schoolLogo}
                                        width={50}
                                        height={50}
                                    />
                                </div>
                                <div className={styles.schoolInfo}>
                                    <h1 className={styles.schoolName}>{schoolName}</h1>
                                    <p className={styles.tagline}>Interactive Learning with AR</p>
                                </div>
                            </div>
                            <div className={styles.decorativeLine}></div>
                        </div>

                        <div className={styles.coverContent}>
                            <div className={styles.categoryBadge}>{book.category.toUpperCase()}</div>

                            <div className={styles.bookCoverSection}>
                                <Image
                                    src={book.coverImage}
                                    alt={book.title}
                                    className={styles.bookCover}
                                    width={200}
                                    height={250}
                                />
                            </div>

                            <div className={styles.bookDetails}>
                                <h2 className={styles.bookTitle}>{book.title}</h2>
                                <p className={styles.bookDescription}>{book.description}</p>

                                <div className={styles.metaInfo}>
                                    <div className={styles.metaItem}>
                                        <span className={styles.metaLabel}>Age Group:</span>
                                        <span className={styles.metaValue}>{book.ageGroup}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <span className={styles.metaLabel}>Author:</span>
                                        <span className={styles.metaValue}>{book.authorName}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <span className={styles.metaLabel}>Pages:</span>
                                        <span className={styles.metaValue}>{allPages.length}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <span className={styles.metaLabel}>Rating:</span>
                                        <span className={styles.metaValue}>⭐ {book.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.bottomSection}>
                            <div className={styles.arSection}>
                                <div className={styles.qrContainer}>
                                    <Image
                                        src={qrCodeUrl}
                                        alt="Scan to view in AR"
                                        className={styles.qrCode}
                                        width={50}
                                        height={50}
                                    />
                                    <p className={styles.qrText}>Scan for AR Experience</p>
                                </div>

                                <div className={styles.arInstructions}>
                                    <h3>How to Experience AR:</h3>
                                    <ol>
                                        <li>Visit our website</li>
                                        <li>Scan this QR code</li>
                                        <li>Point your device at the book pages</li>
                                        <li>Watch the content come alive!</li>
                                    </ol>
                                </div>
                            </div>

                            <div className={styles.footerSection}>
                                <p className={styles.footerText}>
                                    {schoolName} © 2024 | Interactive Learning Platform
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'arScan':
                return (
                    <div className={styles.arScanPage}>
                        <div className={styles.arPageHeader}>
                            <h1>Augmented Reality Scan Image</h1>
                            <p>Use this as AR marker to view interactive content</p>
                        </div>

                        <div className={styles.arImageContainer}>
                            <Image
                                src={arScanImageUrl}
                                alt="AR Scan Image"
                                className={styles.arScanImage}
                                width={150}
                                height={150}
                            />
                            <p className={styles.arImageCaption}>
                                Point your camera at this image to experience the AR content
                            </p>
                        </div>

                        <div className={styles.arPageInstructions}>
                            <div className={styles.instructionColumn}>
                                <h3>📱 Using Your Device</h3>
                                <ul>
                                    <li>Open the AR Books app or website</li>
                                    <li>Select this book</li>
                                    <li>Point camera at this marker</li>
                                    <li>Tap to interact with content</li>
                                </ul>
                            </div>

                            <div className={styles.instructionColumn}>
                                <h3>🎯 Tips for Best Experience</h3>
                                <ul>
                                    <li>Ensure good lighting</li>
                                    <li>Keep marker within frame</li>
                                    <li>Move device slowly</li>
                                    <li>Give app permission to camera</li>
                                </ul>
                            </div>
                        </div>

                        <div className={styles.contactInfo}>
                            <h4>Contact Us</h4>
                            <p>📞 {schoolDetails.contact.phone}</p>
                            <p>📧 {schoolDetails.contact.email}</p>
                            <p>📍 {schoolDetails.address.city}, {schoolDetails.address.state}</p>
                        </div>
                    </div>
                );

            case 'content':
                return (
                    <div className={styles.contentPage}>
                        <div className={styles.pageHeader}>
                            <div className={styles.pageNumberBadge}>Page {currentPage.data.pageNumber}</div>
                            <h2 className={styles.pageTitle}>{currentPage.data.title}</h2>
                        </div>

                        <div className={styles.pageContent}>
                            <div className={styles.pageImageContainer}>
                                <Image
                                    src={currentPage.data.imageUrl}
                                    alt={currentPage.data.title}
                                    className={styles.pageImage}
                                    width={250}
                                    height={200}
                                />
                            </div>

                            <div className={styles.pageDescription}>
                                <p>{currentPage.data.description}</p>
                            </div>

                            {currentPage.data.interactiveElements && currentPage.data.interactiveElements.length > 0 && (
                                <div className={styles.interactiveInfo}>
                                    <h4>🎯 Interactive Elements:</h4>
                                    <ul>
                                        {currentPage.data.interactiveElements.map((element) => (
                                            <li key={element.id}>
                                                <strong>{element.name}:</strong> {element.action}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {currentPage.data.arModelUrl && (
                                <div className={styles.arDetails}>
                                    <p>🔮 <strong>AR Model Available</strong> - Point your device to view in AR</p>
                                </div>
                            )}

                            {currentPage.data.audioUrl && (
                                <div className={styles.audioDetails}>
                                    <p>🔊 <strong>Audio Available</strong> - Tap to listen</p>
                                </div>
                            )}
                        </div>

                        <div className={styles.pageFooter}>
                            <span className={styles.pageNum}>Page {currentPage.data.pageNumber}</span>
                            <span className={styles.bookTitle}>{book.title}</span>
                            <span className={styles.pageNum}>© {schoolDetails.name}</span>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className={styles.viewerContainer}>
            {/* Header */}
            <div className={styles.header}>
                <Link href="/ar-books" className={styles.backLink}>
                    <motion.button
                        className={styles.backBtn}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaArrowLeft /> Back
                    </motion.button>
                </Link>

                <div className={styles.headerInfo}>
                    <h1>{book.title}</h1>
                    <p>Page {currentPageIndex + 1} of {allPages.length}</p>
                </div>

                <div className={styles.spacer}></div>
            </div>

            {/* Main Viewer */}
            <div className={styles.sliderContainer}>
                {/* Left Arrow */}
                <motion.button
                    className={`${styles.navButton} ${styles.leftButton}`}
                    onClick={handlePrevPage}
                    disabled={currentPageIndex === 0}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Previous page"
                >
                    <FaChevronLeft size={24} />
                </motion.button>

                {/* Page Display */}
                <div className={styles.pageDisplayContainer}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPageIndex}
                            className={styles.pageDisplay}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.4 }}
                        >
                            {renderPage()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Right Arrow */}
                <motion.button
                    className={`${styles.navButton} ${styles.rightButton}`}
                    onClick={handleNextPage}
                    disabled={currentPageIndex === allPages.length - 1}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Next page"
                >
                    <FaChevronRight size={24} />
                </motion.button>
            </div>

            {/* Page Indicators */}
            <div className={styles.dotsContainer}>
                {allPages.map((_, index) => (
                    <motion.button
                        key={index}
                        className={`${styles.dot} ${index === currentPageIndex ? styles.activeDot : ''}`}
                        onClick={() => handleDotClick(index)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Go to page ${index + 1}`}
                        title={`Page ${index + 1}`}
                    />
                ))}
            </div>

            {/* Page Counter */}
            <div className={styles.pageCounter}>
                <span className={styles.currentPage}>{currentPageIndex + 1}</span>
                <span className={styles.separator}>/</span>
                <span className={styles.totalPages}>{allPages.length}</span>
            </div>
        </div>
    );
};

export default ARBookViewer;
