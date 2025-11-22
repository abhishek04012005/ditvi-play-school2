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
  award_type: 'weekly' | 'monthly' | 'yearly';
  message: string;
  date: string;
  is_show_on_home_page: boolean;
  like_count: number;
  image_url: string;
  created_date: string;
}

interface PrintCardProps {
  award: Award | null;
  isOpen: boolean;
  onClose: () => void;
}

const PrintCard: React.FC<PrintCardProps> = ({ award, isOpen, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !award) return null;

  const awardTypeLabels = {
    weekly: 'Star of the Week',
    monthly: 'Star of the Month',
    yearly: 'Star of the Year'
  };

  const awardColors = {
    weekly: '#FFD700',
    monthly: '#C0C0C0',
    yearly: '#CD7F32'
  };

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
              --text-gray: #333;
            }

            html {
              margin: 0;
              padding: 0;
            }

            body {
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
              padding: 10mm 15mm !important;
              position: relative;
              background: linear-gradient(135deg, #ffffff 0%, #fafaf8 100%) !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: space-between !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .certificate::before {
              content: '';
              position: absolute;
              top: 12mm;
              left: 12mm;
              right: 12mm;
              bottom: 12mm;
              border: 3px solid var(--primary-purple);
              border-radius: 8px;
              opacity: 0.2;
              z-index: 1;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .certificate::after {
              content: '';
              position: absolute;
              top: 14mm;
              left: 14mm;
              right: 14mm;
              bottom: 14mm;
              border: 1px solid var(--primary-yellow);
              border-radius: 6px;
              opacity: 0.35;
              z-index: 1;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .content {
              position: relative;
              z-index: 2;
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              gap: 0;
            }

            .headerSection {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 3mm;
              text-align: center;
              width: 100%;
              padding: 0;
            }

            .schoolLogoBox {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 22mm;
              height: 22mm;
              background: linear-gradient(135deg, var(--primary-yellow) 0%, rgba(255, 209, 102, 0.8) 100%);
              border-radius: 50%;
              box-shadow: 0 3px 12px rgba(255, 209, 102, 0.3);
              border: 2px solid rgba(255, 209, 102, 0.6);
              flex-shrink: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .logoImg {
              width: 20mm;
              height: 20mm;
              object-fit: contain;
              border-radius: 50%;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .logoPlaceholder {
              font-size: 12mm;
              line-height: 1;
            }

            .schoolDetails {
              display: flex;
              flex-direction: column;
              gap: 0.3mm;
              align-items: center;
            }

            .schoolTitle {
              color: var(--primary-purple);
              font-size: 16pt;
              font-weight: 900;
              letter-spacing: 0.3px;
              margin: 0;
              line-height: 1.1;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .schoolAddress {
              color: var(--text-gray);
              font-size: 7pt;
              margin: 0;
              font-weight: 600;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .certificateTitleSection {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 2mm;
              width: 100%;
              margin: 2mm 0;
            }

            .decorLine {
              width: 40mm;
              height: 2px;
              background: linear-gradient(90deg, transparent 0%, var(--primary-yellow) 50%, transparent 100%);
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .certificateText {
              color: var(--primary-purple);
              font-size: 28pt;
              font-weight: 900;
              letter-spacing: 1.2px;
              margin: 0;
              text-transform: uppercase;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .awardTypeBox {
              display: inline-block;
              padding: 4mm 10mm;
              border: 2px solid;
              border-radius: 20mm;
              background: linear-gradient(135deg, rgba(255, 209, 102, 0.15) 0%, rgba(255, 209, 102, 0.08) 100%);
              margin: 1.5mm 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .awardTypeText {
              color: var(--primary-purple);
              font-weight: 800;
              font-size: 10pt;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              margin: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .mainContent {
              text-align: center;
              width: 100%;
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
              gap: 2.5mm;
              padding: 0;
              margin: 0;
            }

            .presentedToText {
              color: var(--text-gray);
              font-size: 10pt;
              font-weight: 700;
              margin: 0;
              letter-spacing: 0.2px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .studentNameBox {
              display: flex;
              flex-direction: column;
              align-items: center;
              margin: 1mm 0;
            }

            .studentNameText {
              color: var(--primary-purple);
              font-size: 24pt;
              font-weight: 900;
              border-bottom: 3px solid var(--primary-yellow);
              padding: 3mm 6mm;
              margin: 0;
              letter-spacing: -0.3px;
              text-transform: uppercase;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .forAchievingText {
              color: var(--text-gray);
              font-size: 9pt;
              font-weight: 700;
              margin: 1.5mm 0 0.5mm 0;
              letter-spacing: 0.2px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .achievementTextBox {
              background: linear-gradient(135deg, rgba(106, 76, 147, 0.08) 0%, rgba(255, 209, 102, 0.06) 100%);
              border: 1.5px solid rgba(106, 76, 147, 0.15);
              border-radius: 6px;
              padding: 5mm 7mm;
              margin: 1.5mm 0;
              min-height: auto;
              display: flex;
              align-items: center;
              justify-content: center;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .achievementText {
              color: var(--primary-purple);
              font-size: 9.5pt;
              font-weight: 800;
              line-height: 1.4;
              font-style: italic;
              margin: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .congratsText {
              color: var(--text-gray);
              font-size: 8.5pt;
              line-height: 1.3;
              font-weight: 600;
              margin: 0.5mm 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .photoAndDateContainer {
              width: 100%;
              display: flex;
              align-items: flex-end;
              justify-content: space-between;
              gap: 8mm;
              margin-top: 2mm;
              padding-top: 2mm;
              border-top: 1px solid rgba(106, 76, 147, 0.1);
            }

            .photoSection {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 1.5mm;
            }

            .photoFrame {
              width: 35mm;
              height: 45mm;
              border: 2px solid var(--primary-purple);
              border-radius: 6px;
              overflow: hidden;
              background: white;
              box-shadow: 0 3px 10px rgba(106, 76, 147, 0.2);
              position: relative;
              flex-shrink: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .photoFrame::before {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
              pointer-events: none;
              z-index: 1;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .photoImg {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .photoLabel {
              color: var(--text-gray);
              font-size: 6pt;
              font-weight: 700;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 0.4px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .dateAndSignatureBox {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 6mm;
              flex: 1;
            }

            .dateBox {
              text-align: center;
            }

            .dateLabel {
              color: var(--text-gray);
              font-size: 8pt;
              font-weight: 700;
              margin: 0 0 0.5mm 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .dateValue {
              color: var(--primary-purple);
              font-size: 8.5pt;
              font-weight: 800;
              margin: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .signatureBox {
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 100%;
              min-width: 50mm;
            }

            .signatureLine {
              width: 100%;
              min-width: 50mm;
              border-top: 2px solid var(--primary-purple);
              margin-bottom: 1.5mm;
              height: 12mm;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .signatureLabel {
              color: var(--text-gray);
              font-size: 7pt;
              font-weight: 700;
              margin: 0;
              text-transform: uppercase;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .footerText {
              text-align: center;
              font-size: 6.5pt;
              color: var(--text-gray);
              font-style: italic;
              margin: 0;
              font-weight: 600;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            img {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
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

      // ✅ Using html2canvas + jsPDF directly - Works perfectly!
      const canvas = await html2canvas(certificateDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        windowHeight: 1123
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${award.name}-Award-Certificate-${new Date().toISOString().split('T')[0]}.pdf`);

      setIsDownloading(false);
      alert('✅ Certificate downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      setIsDownloading(false);
      alert('❌ Failed to generate PDF');
    }
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
            initial={{ scale: 0.85, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 40 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <div className={styles.headerContent}>
                <h2>🎖️ Certificate Preview</h2>
                <p>A4 Portrait Mode - Full Coverage</p>
              </div>
              <motion.button
                onClick={onClose}
                className={styles.closeBtn}
                type="button"
                aria-label="Close"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaX />
              </motion.button>
            </div>

            <div className={styles.previewContainer}>
              <div className={styles.printableArea} ref={printRef}>
                <div className={styles.certificate}>
                  <div className={styles.content}>
                    <div className={styles.headerSection}>
                      <div className={styles.schoolLogoBox}>
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
                      <div className={styles.schoolDetails}>
                        <h1 className={styles.schoolTitle}>{schoolDetails?.name}</h1>
                        <p className={styles.schoolAddress}>
                          {schoolDetails?.address?.city}, {schoolDetails?.address?.state}
                        </p>
                      </div>
                    </div>

                    <div className={styles.certificateTitleSection}>
                      <div className={styles.decorLine}></div>
                      <h2 className={styles.certificateText}>Certificate</h2>
                      <div className={styles.decorLine}></div>
                    </div>

                    <div
                      className={styles.awardTypeBox}
                      style={{ borderColor: awardColors[award.award_type] }}
                    >
                      <p className={styles.awardTypeText}>
                        {awardTypeLabels[award.award_type]}
                      </p>
                    </div>

                    {award.image_url && (
                      <div className={styles.photoSection}>
                        <div className={styles.photoFrame}>
                          <Image
                            src={award.image_url}
                            alt={award.name}
                            width={200}
                            height={250}
                            className={styles.photoImg}
                            priority
                            unoptimized
                          />
                        </div>
                      </div>
                    )}

                    <div className={styles.mainContent}>
                      <p className={styles.presentedToText}>This certificate is proudly presented to</p>
                      <div className={styles.studentNameBox}>
                        <h3 className={styles.studentNameText}>{award.name}</h3>
                      </div>
                      <p className={styles.forAchievingText}>For exceptionally demonstrating:</p>
                      <div className={styles.achievementTextBox}>
                        <p className={styles.achievementText}>{award.message}</p>
                      </div>
                      <p className={styles.congratsText}>
                        We commend your outstanding achievement and dedication to excellence!
                      </p>
                    </div>

                    <div className={styles.photoAndDateContainer}>
                      <div className={styles.dateAndSignatureBox}>
                        <div className={styles.dateBox}>
                          <p className={styles.dateLabel}>Date</p>
                          <p className={styles.dateValue}>{getFormattedDate()}</p>
                        </div>
                        <div className={styles.signatureBox}>
                          <div className={styles.signatureLine}></div>
                          <p className={styles.signatureLabel}>
                            {schoolDetails.contact.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className={styles.footerText}>
                      Keep this certificate as a token of your achievement
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <motion.button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={isPrinting || isDownloading}
              >
                Close
              </motion.button>
              <motion.button
                type="button"
                className={styles.downloadBtn}
                onClick={handleDownloadPDF}
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
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
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
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