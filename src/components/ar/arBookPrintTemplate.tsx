'use client';

import React from 'react';
import { ARBook } from '@/ar/types';
import { schoolDetails } from '@/json/schooldetails';
import styles from './arBookPrintTemplate.module.css';

interface ARBookPrintTemplateProps {
    book: ARBook;
    qrCodeUrl?: string;
    arScanImageUrl?: string;
}

const ARBookPrintTemplate: React.FC<ARBookPrintTemplateProps> = ({
    book,
    qrCodeUrl = '/assets/qr-placeholder.png',
    arScanImageUrl = '/assets/ar-scan-placeholder.png',
}) => {
    const { name: schoolName, logo } = schoolDetails;

    return (
        <div className={styles.printTemplate}>
            {/* Front Cover Page */}
            <div className={styles.page}>
                <div className={styles.frontCover}>
                    {/* Top Branding Section */}
                    <div className={styles.brandingSection}>
                        <div className={styles.brandingTop}>
                            <div className={styles.logoContainer}>
                                <img
                                    src={typeof logo === 'string' ? logo : logo.src}
                                    alt={schoolName}
                                    className={styles.schoolLogo}
                                />
                            </div>
                            <div className={styles.schoolInfo}>
                                <h1 className={styles.schoolName}>{schoolName}</h1>
                                <p className={styles.tagline}>Interactive Learning with AR</p>
                            </div>
                        </div>

                        {/* Decorative Line */}
                        <div className={styles.decorativeLine}></div>
                    </div>

                    {/* Main Content - Book Information */}
                    <div className={styles.coverContent}>
                        {/* Book Category Badge */}
                        <div className={styles.categoryBadge}>{book.category.toUpperCase()}</div>

                        {/* Book Cover Image */}
                        <div className={styles.bookCoverSection}>
                            <img
                                src={book.coverImage}
                                alt={book.title}
                                className={styles.bookCover}
                            />
                        </div>

                        {/* Book Details */}
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
                                    <span className={styles.metaValue}>{book.pages.length}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Rating:</span>
                                    <span className={styles.metaValue}>⭐ {book.rating.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section - AR QR Code & Instructions */}
                    <div className={styles.bottomSection}>
                        <div className={styles.arSection}>
                            <div className={styles.qrContainer}>
                                <img
                                    src={qrCodeUrl}
                                    alt="Scan to view in AR"
                                    className={styles.qrCode}
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

                        {/* Footer */}
                        <div className={styles.footerSection}>
                            <p className={styles.footerText}>
                                {schoolName} © 2024 | Interactive Learning Platform
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AR Scan Template Page */}
            <div className={styles.page}>
                <div className={styles.arScanPage}>
                    {/* Header */}
                    <div className={styles.arPageHeader}>
                        <h1>Augmented Reality Scan Image</h1>
                        <p>Print this page and use it as AR marker</p>
                    </div>

                    {/* Main AR Image */}
                    <div className={styles.arImageContainer}>
                        <img
                            src={arScanImageUrl}
                            alt="AR Scan Image"
                            className={styles.arScanImage}
                        />
                        <p className={styles.arImageCaption}>
                            Point your camera at this image to experience the AR content
                        </p>
                    </div>

                    {/* Instructions */}
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

                    {/* School Contact Info */}
                    <div className={styles.contactInfo}>
                        <h4>Contact Us</h4>
                        <p>📞 {schoolDetails.contact.phone}</p>
                        <p>📧 {schoolDetails.contact.email}</p>
                        <p>📍 {schoolDetails.address.city}, {schoolDetails.address.state}</p>
                    </div>
                </div>
            </div>

            {/* Book Pages Template */}
            {book.pages.map((page, index) => (
                <div key={page.id} className={styles.page}>
                    <div className={styles.contentPage}>
                        {/* Page Header */}
                        <div className={styles.pageHeader}>
                            <div className={styles.pageNumberBadge}>Page {page.pageNumber}</div>
                            <h2 className={styles.pageTitle}>{page.title}</h2>
                        </div>

                        {/* Main Content */}
                        <div className={styles.pageContent}>
                            {/* Page Image */}
                            <div className={styles.pageImageContainer}>
                                <img
                                    src={page.imageUrl}
                                    alt={page.title}
                                    className={styles.pageImage}
                                />
                            </div>

                            {/* Page Description */}
                            <div className={styles.pageDescription}>
                                <p>{page.description}</p>
                            </div>

                            {/* Interactive Elements Info */}
                            {page.interactiveElements && page.interactiveElements.length > 0 && (
                                <div className={styles.interactiveInfo}>
                                    <h4>🎯 Interactive Elements:</h4>
                                    <ul>
                                        {page.interactiveElements.map((element) => (
                                            <li key={element.id}>
                                                <strong>{element.name}:</strong> {element.action}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* AR Details */}
                            {page.arModelUrl && (
                                <div className={styles.arDetails}>
                                    <p>🔮 <strong>AR Model Available</strong> - Point your device to view in AR</p>
                                </div>
                            )}

                            {page.audioUrl && (
                                <div className={styles.audioDetails}>
                                    <p>🔊 <strong>Audio Available</strong> - Tap to listen</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className={styles.pageFooter}>
                            <span className={styles.pageNum}>Page {page.pageNumber}</span>
                            <span className={styles.bookTitle}>{book.title}</span>
                            <span className={styles.pageNum}>© {schoolDetails.name}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ARBookPrintTemplate;
