'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaPrint, FaDownload, FaArrowLeft } from 'react-icons/fa';
import ARBookPrintTemplate from '@/components/ar/arBookPrintTemplate';
import { ARBook } from '@/ar/types';
import { arBooks } from '@/ar/data';
import styles from './arBookPrintPreview.module.css';

interface ARBookPrintPreviewProps {
    bookId?: string;
}

const ARBookPrintPreview: React.FC<ARBookPrintPreviewProps> = ({ bookId }) => {
    const [book, setBook] = useState<ARBook | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const printTemplateRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        // Simulate finding the book
        const foundBook = arBooks.find(b => b.id === (bookId || 'book-001'));
        if (foundBook) {
            setBook(foundBook);
        }
        setLoading(false);
    }, [bookId]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingMessage}>Loading preview...</div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className={styles.container}>
                <div className={styles.errorMessage}>
                    <h2>Book not found</h2>
                    <Link href="/ar-books">
                        <button className={styles.backButton}>
                            <FaArrowLeft /> Back to AR Books
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        if (!printTemplateRef.current || !book) return;

        setIsGeneratingPDF(true);
        try {
            // Dynamically import html2pdf only on client side
            const html2pdf = (await import('html2pdf.js')).default;
            const element = printTemplateRef.current;
            
            // Wait longer for all images to load
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const opt: any = {
                margin: 0,
                filename: `${book.title.replace(/\s+/g, '_')}_complete_book.pdf`,
                image: { type: 'jpeg', quality: 0.99 },
                html2canvas: { 
                    scale: 1.3,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    windowWidth: 794,
                    windowHeight: window.innerHeight,
                    letterRendering: true,
                    imageTimeout: 15000,
                    foreignObjectRendering: true
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait',
                    compress: true
                },
                pagebreak: { 
                    mode: ['css', 'legacy', 'avoid-all'],
                    after: '.page',
                    before: undefined,
                    avoid: ['img', 'tr', 'td'],
                    margin: 0
                }
            };

            // Use html2pdf with the element directly
            const worker = html2pdf().set(opt);
            
            // Get all page elements
            const pages = element.querySelectorAll('[class*="page"]');
            console.log(`Found ${pages.length} pages to render`);
            
            // Process entire container - html2pdf will handle page breaks
            await worker.from(element).save();
            
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Failed to generate PDF. Please check browser console and try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <motion.div
                className={styles.header}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className={styles.headerContent}>
                    <Link href="/ar-books">
                        <motion.button
                            className={styles.backBtn}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaArrowLeft /> Back
                        </motion.button>
                    </Link>

                    <div className={styles.titleSection}>
                        <h1>Print Template: {book.title}</h1>
                        <p>Ready to print or download as PDF</p>
                    </div>

                    <div className={styles.actions}>
                        <motion.button
                            className={styles.printBtn}
                            onClick={handlePrint}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaPrint /> Print
                        </motion.button>
                        <motion.button
                            className={styles.downloadBtn}
                            onClick={handleDownloadPDF}
                            disabled={isGeneratingPDF}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaDownload /> {isGeneratingPDF ? 'Generating...' : 'PDF'}
                        </motion.button>
                    </div>
                </div>

                {/* Instructions */}
                <div className={styles.instructions}>
                    <div className={styles.instruction}>
                        <span className={styles.icon}>📄</span>
                        <p>Choose portrait orientation for best results</p>
                    </div>
                    <div className={styles.instruction}>
                        <span className={styles.icon}>🖨️</span>
                        <p>Use high-quality paper (glossy recommended for book covers)</p>
                    </div>
                    <div className={styles.instruction}>
                        <span className={styles.icon}>📐</span>
                        <p>Print with full color for best visual experience</p>
                    </div>
                    <div className={styles.instruction}>
                        <span className={styles.icon}>✂️</span>
                        <p>Cut and bind pages together if desired</p>
                    </div>
                </div>
            </motion.div>

            {/* Print Preview */}
            <motion.div
                className={styles.previewContainer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
            >
                <div ref={printTemplateRef}>
                    <ARBookPrintTemplate
                        book={book}
                        qrCodeUrl="/assets/qr-placeholder.png"
                        arScanImageUrl="/assets/ar-scan-placeholder.png"
                    />
                </div>
            </motion.div>

            {/* Footer Info */}
            <motion.div
                className={styles.footerInfo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
            >
                <div className={styles.infoBox}>
                    <h3>📋 Page Information</h3>
                    <ul>
                        <li><strong>Front Cover:</strong> Branded design with book details</li>
                        <li><strong>AR Scan Page:</strong> Marker image and instructions</li>
                        <li><strong>Content Pages:</strong> {book.pages.length} pages with interactive elements</li>
                        <li><strong>Total Pages:</strong> {book.pages.length + 2} pages</li>
                    </ul>
                </div>

                <div className={styles.infoBox}>
                    <h3>💡 Printing Tips</h3>
                    <ul>
                        <li>Print each page on separate A4/Letter paper</li>
                        <li>Use glossy or matte finish paper</li>
                        <li>Ensure color settings are enabled</li>
                        <li>For best results, trim pages to size</li>
                        <li>Consider laminating AR scan page for durability</li>
                    </ul>
                </div>

                <div className={styles.infoBox}>
                    <h3>🔗 QR Code & AR</h3>
                    <ul>
                        <li>Front cover includes QR code for digital access</li>
                        <li>AR scan image is provided on page 2</li>
                        <li>Both can be scanned using the web app</li>
                        <li>Higher quality paper ensures better scanning</li>
                    </ul>
                </div>
            </motion.div>
        </div>
    );
};

export default ARBookPrintPreview;
