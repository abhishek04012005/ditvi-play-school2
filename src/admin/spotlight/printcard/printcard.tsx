'use client';
import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { FaPrint, FaX, FaDownload } from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import styles from './printcard.module.css';
import schoolDetails from '@/json/schooldetails';

interface Award {
  id: string;
  name: string;
  award_type: string;
  message: string;
  date: string;
  is_show_on_home_page: boolean;
  like_count: number;
  image_url: string;
  created_date: string;
}

interface CustomSpotlightType {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  created_date: string;
  isDefault?: boolean;
}

interface PrintCardProps {
  award: Award | null;
  isOpen: boolean;
  onClose: () => void;
  customTypes?: CustomSpotlightType[];
}

const PrintCard: React.FC<PrintCardProps> = ({ award, isOpen, onClose, customTypes = [] }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'details'>('preview');
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  if (!isOpen || !award) return null;

  // Get the selected award type details with dynamic colors
  const getAwardTypeDetails = () => {
    if (!award) return null;
    // Match by name since award_type stores the name, not the id
    const typeDetails = customTypes.find(t => t.name === award.award_type);
    if (typeDetails) {
      return {
        name: typeDetails.name,
        emoji: typeDetails.emoji,
        color: typeDetails.color,
        gradient: `linear-gradient(135deg, ${typeDetails.color} 0%, ${shadeColor(typeDetails.color, -30)} 100%)`
      };
    }
    // Fallback for old hardcoded types (by id for backward compatibility)
    const defaults: { [key: string]: any } = {
      weekly: { name: 'Star of the Week', emoji: '⭐', color: '#FFD700', gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' },
      monthly: { name: 'Star of the Month', emoji: '🌟', color: '#C0C0C0', gradient: 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)' },
      yearly: { name: 'Star of the Year', emoji: '✨', color: '#CD7F32', gradient: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)' }
    };
    return defaults[award.award_type] || defaults.weekly;
  };

  // Helper function to shade a color for gradients
  const shadeColor = (color: string, percent: number) => {
    let R = parseInt(color.substring(1,3), 16);
    let G = parseInt(color.substring(3,5), 16);
    let B = parseInt(color.substring(5,7), 16);
    
    R = parseInt(String(R * (100 + percent) / 100));
    G = parseInt(String(G * (100 + percent) / 100));
    B = parseInt(String(B * (100 + percent) / 100));
    
    R = (R<255)?R:255;
    G = (G<255)?G:255;
    B = (B<255)?B:255;
    
    const RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    const GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    const BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));
    
    return "#"+RR+GG+BB;
  };

  const awardTypeLabel = getAwardTypeDetails()?.name || 'Award';
  const awardEmoji = getAwardTypeDetails()?.emoji || '⭐';
  const awardColor = getAwardTypeDetails()?.color || '#FFD700';

  const getFormattedDate = () => {
    return new Date(award.date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const printWindow = window.open('', '', 'width=1000,height=1400');
      if (!printWindow) {
        alert('Please allow popups to print. Check your browser settings.');
        setIsPrinting(false);
        return;
      }

      const element = printRef.current;
      if (!element) {
        alert('Certificate element not found');
        setIsPrinting(false);
        return;
      }

      const certificateDiv = element.querySelector('[class*="certificate"]') as HTMLElement;
      if (!certificateDiv) {
        alert('Certificate element not found');
        setIsPrinting(false);
        return;
      }

      const clonedElement = certificateDiv.cloneNode(true) as HTMLElement;

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${award.name}-Award-Certificate</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            :root {
              --primary-purple: #6a4c93;
              --primary-yellow: #ffd166;
              --text-gray: #2b2b2b;
            }

            html, body {
              margin: 0;
              padding: 0;
              width: 210mm;
              height: 297mm;
              background: white;
            }

            @page {
              size: A4 portrait;
              margin: 0;
              padding: 0;
            }

            @media print {
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 210mm !important;
                height: 297mm !important;
                background: white !important;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }

            .certificate {
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              padding: 0 !important;
              position: relative;
              background: linear-gradient(135deg, #ffffff 0%, #f5f1fa 50%, #fff9e6 100%) !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .certificate::before {
              content: '';
              position: absolute;
              inset: 20mm;
              border: 4px solid;
              border-image: linear-gradient(135deg, #6a4c93 0%, #ffd166 100%) 1;
              border-radius: 12px;
              z-index: 1;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .certificate::after {
              content: '';
              position: absolute;
              inset: 22mm;
              border: 1px dashed rgba(106, 76, 147, 0.3);
              border-radius: 10px;
              z-index: 1;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .content {
              position: relative;
              z-index: 2;
              width: 100%;
              height: 100%;
              padding: 30mm 25mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-around;
              box-sizing: border-box;
              text-align: center;
            }

            .headerSection {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 6mm;
            }

            .schoolLogoBox {
              width: 30mm;
              height: 30mm;
              background: radial-gradient(circle, #ffd166 0%, #ffb84d 100%);
              border-radius: 50%;
              box-shadow: 0 8px 20px rgba(255, 209, 102, 0.4);
              border: 3px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .logoImg {
              width: 28mm;
              height: 28mm;
              object-fit: contain;
              border-radius: 50%;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .logoPlaceholder {
              font-size: 16mm;
            }

            .schoolTitle {
              color: #6a4c93;
              font-size: 20pt;
              font-weight: 900;
              letter-spacing: 1px;
              margin: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .schoolAddress {
              color: #666;
              font-size: 9pt;
              margin: 0;
              font-weight: 600;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .certificateTitle {
              font-size: 48pt;
              font-weight: 900;
              color: #6a4c93;
              letter-spacing: 3px;
              margin: 10mm 0;
              text-transform: uppercase;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.05);
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .awardBadge {
              display: inline-block;
              background: linear-gradient(135deg, #ffd166 0%, #ffb84d 100%);
              color: #6a4c93;
              padding: 5mm 12mm;
              border-radius: 25mm;
              font-weight: 900;
              font-size: 13pt;
              margin: 5mm 0;
              box-shadow: 0 6px 20px rgba(255, 209, 102, 0.4);
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .mainText {
              margin: 8mm 0;
              font-size: 11pt;
              color: #2b2b2b;
              
              line-height: 1.8;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .studentName {
              font-size: 32pt;
              color: #6a4c93;
              font-weight: 900;
              text-transform: uppercase;
              border-bottom: 4px solid;
              padding: 4mm 0;
              margin: 6mm 0;
              letter-spacing: 2px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .achievement {
              background: rgba(106, 76, 147, 0.08);
              border-left: 5px solid #6a4c93;
              padding: 6mm 8mm;
              margin: 8mm 0;
              font-size: 11pt;
              
              font-style: italic;
              color: #6a4c93;
              line-height: 1.6;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .footerSection {
              display: flex;
              justify-content: space-between;
              width: 100%;
              margin-top: 15mm;
              padding-top: 10mm;
              border-top: 2px solid rgba(106, 76, 147, 0.2);
              gap: 20mm;
            }

            .dateSection {
              text-align: center;
              flex: 1;
            }

            .signatureSection {
              text-align: center;
              flex: 1;
            }

            .label {
              font-size: 8pt;
              
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 2mm;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .date {
              font-size: 11pt;
              color: #6a4c93;
              
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .signatureLine {
              width: 100%;
              height: 15mm;
              border-top: 2px solid #6a4c93;
              margin-bottom: 3mm;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .sealIcon {
              font-size: 24pt;
              margin-top: 3mm;
            }

            .footerText {
              font-size: 8pt;
              color: #999;
              font-style: italic;
              margin-top: 10mm;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .stars {
              position: absolute;
              font-size: 24pt;
              opacity: 0.1;
              z-index: 0;
            }

            .star-1 { top: 10mm; left: 15mm; }
            .star-2 { top: 20mm; right: 20mm; }
            .star-3 { bottom: 30mm; left: 25mm; }
            .star-4 { bottom: 25mm; right: 15mm; }
          </style>
        </head>
        <body>
          ${clonedElement.outerHTML}
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
          setIsPrinting(false);
          showSuccessMessage('Print initiated');
        }, 500);
      }, 1200);

    } catch (error) {
      console.error('Print error:', error);
      alert('Error printing certificate. Please try again.');
      setIsPrinting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;

    try {
      setIsDownloading(true);

      const certificateDiv = printRef.current.querySelector('[class*="certificate"]') as HTMLElement;
      if (!certificateDiv) {
        alert('Certificate element not found');
        setIsDownloading(false);
        return;
      }

      const canvas = await html2canvas(certificateDiv, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        windowHeight: 1123
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${award.name}-Award-Certificate-${new Date().toISOString().split('T')[0]}.pdf`);

      setIsDownloading(false);
      showSuccessMessage('PDF downloaded');
    } catch (error) {
      console.error('PDF generation error:', error);
      setIsDownloading(false);
      alert('❌ Failed to generate PDF');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${award.name} - Award Certificate`,
          text: `${award.name} received ${awardTypeLabel}!`,
          url: window.location.href
        });
        showSuccessMessage('Shared successfully');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showSuccessMessage('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const showSuccessMessage = (message: string) => {
    setShowSuccess(message);
    setTimeout(() => setShowSuccess(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.container}
            initial={{ scale: 0.8, y: 60, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.header}>
              <motion.div 
                className={styles.headerContent}
                initial={{ x: -30 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className={styles.awardBadgeHeader}>
                  <motion.span 
                    className={styles.iconLarge}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity }}
                  >
                    {awardEmoji}
                  </motion.span>
                  <div>
                    <h2 className={styles.titleHeader}>🏆 Certificate of Excellence</h2>
                    <p className={styles.subtitleHeader}>{awardTypeLabel}</p>
                  </div>
                </div>
              </motion.div>
              <motion.button
                onClick={onClose}
                className={styles.closeBtn}
                type="button"
                aria-label="Close"
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.85 }}
              >
                <FaX />
              </motion.button>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              <motion.button
                className={`${styles.tab} ${activeTab === 'preview' ? styles.active : ''}`}
                onClick={() => setActiveTab('preview')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                👁️ Preview
              </motion.button>
              <motion.button
                className={`${styles.tab} ${activeTab === 'details' ? styles.active : ''}`}
                onClick={() => setActiveTab('details')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📋 Details
              </motion.button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'preview' ? (
                <motion.div
                  key="preview"
                  className={styles.previewContainer}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.printableArea} ref={printRef}>
                    <div className={styles.certificate}>
                      <div className={styles.starsDecoration}>
                        <span className={styles.star1}>⭐</span>
                        <span className={styles.star2}>✨</span>
                        <span className={styles.star3}>🌟</span>
                        <span className={styles.star4}>⭐</span>
                      </div>

                      <div className={styles.content}>
                        {/* Header Section */}
                        <div className={styles.headerSection}>
                          <div className={styles.schoolLogoBoxNew}>
                            {schoolDetails?.logo ? (
                              <Image
                                src={schoolDetails.logo}
                                alt={schoolDetails.name}
                                width={100}
                                height={100}
                                className={styles.logoImg}
                                priority
                                unoptimized
                              />
                            ) : (
                              <div className={styles.logoPlaceholder}>🎓</div>
                            )}
                          </div>
                          <h1 className={styles.schoolTitle}>{schoolDetails?.name}</h1>
                          <p className={styles.schoolAddress}>
                            {schoolDetails?.address?.city}, {schoolDetails?.address?.state}
                          </p>
                        </div>

                        {/* Main Certificate Title */}
                        <div className={styles.certificateTitle}>Certificate</div>

                        {/* Award Type Badge */}
                        <div
                          className={styles.awardTypeBoxNew}
                          style={{ background: getAwardTypeDetails()?.gradient || 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' }}
                        >
                          <span>{awardTypeLabel}</span>
                        </div>

                        {/* Main Content */}
                        <p className={styles.mainTextNew}>This Certificate is proudly presented to</p>

                        <h3
                          className={styles.studentNameNew}
                          style={{ borderBottomColor: awardColor }}
                        >
                          {award.name}
                        </h3>

                        <p className={styles.mainTextNew}>For Exceptional Achievement in</p>

                        <div className={styles.achievementBoxNew}>
                          <p className={styles.achievementTextNew}>{award.message}</p>
                        </div>

                        {/* Photo Section */}
                        {award.image_url && (
                          <div className={styles.photoSectionNew}>
                            <div className={styles.photoFrameNew}>
                              <Image
                                src={award.image_url}
                                alt={award.name}
                                width={150}
                                height={180}
                                className={styles.photoImgNew}
                                priority
                                unoptimized
                              />
                            </div>
                          </div>
                        )}

                        {/* Footer with Date and Signature */}
                        <div className={styles.footerSectionNew}>
                          <div className={styles.dateSectionNew}>
                            <p className={styles.labelNew}>Date</p>
                            <p className={styles.dateNew}>{getFormattedDate()}</p>
                          </div>
                          <div className={styles.signatureSectionNew}>
                            <div className={styles.signatureLineNew}></div>
                            <p className={styles.labelNew}>Principal Signature</p>
                          </div>
                        </div>

                        <div className={styles.sealNew}>🎖️</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="details"
                  className={styles.detailsContainer}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.detailsGrid}>
                    <motion.div 
                      className={styles.detailsCard}
                      whileHover={{ y: -8 }}
                    >
                      <div className={styles.detailIcon}>👤</div>
                      <p className={styles.detailLabel}>Recipient Name</p>
                      <p className={styles.detailValue}>{award.name}</p>
                    </motion.div>
                    <motion.div 
                      className={styles.detailsCard}
                      whileHover={{ y: -8 }}
                    >
                      <div className={styles.detailIcon}>🎖️</div>
                      <p className={styles.detailLabel}>Award Type</p>
                      <p className={styles.detailValue}>{awardTypeLabel}</p>
                    </motion.div>
                    <motion.div 
                      className={styles.detailsCard}
                      whileHover={{ y: -8 }}
                    >
                      <div className={styles.detailIcon}>✍️</div>
                      <p className={styles.detailLabel}>Achievement</p>
                      <p className={styles.detailValue}>{award.message}</p>
                    </motion.div>
                    <motion.div 
                      className={styles.detailsCard}
                      whileHover={{ y: -8 }}
                    >
                      <div className={styles.detailIcon}>📅</div>
                      <p className={styles.detailLabel}>Date Awarded</p>
                      <p className={styles.detailValue}>{getFormattedDate()}</p>
                    </motion.div>
                    <motion.div 
                      className={styles.detailsCard}
                      whileHover={{ y: -8 }}
                    >
                      <div className={styles.detailIcon}>❤️</div>
                      <p className={styles.detailLabel}>Recognition</p>
                      <p className={styles.detailValue}>{award.like_count} Likes</p>
                    </motion.div>
                    <motion.div 
                      className={styles.detailsCard}
                      whileHover={{ y: -8 }}
                    >
                      <div className={styles.detailIcon}>🏫</div>
                      <p className={styles.detailLabel}>School</p>
                      <p className={styles.detailValue}>{schoolDetails?.name}</p>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Toast */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  className={styles.toast}
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >
                  ✅ {showSuccess}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className={styles.actions}>
              <motion.button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                disabled={isPrinting || isDownloading}
              >
                Close
              </motion.button>
              <motion.button
                type="button"
                className={styles.shareBtn}
                onClick={handleShare}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                 Share
              </motion.button>
              <motion.button
                type="button"
                className={styles.downloadBtn}
                onClick={handleDownloadPDF}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                disabled={isPrinting || isDownloading}
              >
                {isDownloading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Downloading...
                  </>
                ) : (
                  <>
                    <FaDownload /> Download PDF
                  </>
                )}
              </motion.button>
              <motion.button
                type="button"
                className={styles.printBtn}
                onClick={handlePrint}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                disabled={isPrinting || isDownloading}
              >
                {isPrinting ? (
                  <>
                    <span className={styles.spinner}></span>
                    Printing...
                  </>
                ) : (
                  <>
                    <FaPrint /> Print
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PrintCard;