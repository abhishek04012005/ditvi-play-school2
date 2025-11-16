'use client';
import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { FaPrint, FaX, FaDownload } from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';
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

      const clonedElement = element.cloneNode(true) as HTMLElement;

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

            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              background: white;
            }

            @page {
              size: A4;
              margin: 0;
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

            .certificateWrapper {
              width: 210mm;
              height: 297mm;
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background: white;
            }

            .certificate {
              width: 210mm;
              height: 297mm;
              padding: 0;
              margin: 0;
              position: relative;
              background: linear-gradient(135deg, #ffffff 0%, #fafaf8 100%);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
              box-sizing: border-box;
              overflow: hidden;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .certificate::before {
              content: '';
              position: absolute;
              top: 15mm;
              left: 15mm;
              right: 15mm;
              bottom: 15mm;
              border: 3px solid var(--primary-purple);
              border-radius: 8px;
              opacity: 0.25;
              z-index: 1;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .certificate::after {
              content: '';
              position: absolute;
              top: 17mm;
              left: 17mm;
              right: 17mm;
              bottom: 17mm;
              border: 1px solid var(--primary-yellow);
              border-radius: 6px;
              opacity: 0.4;
              z-index: 1;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .content {
              position: relative;
              z-index: 2;
              width: 100%;
              height: 100%;
              padding: 20mm 25mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              box-sizing: border-box;
            }

            .headerSection {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 6mm;
              text-align: center;
              width: 100%;
            }

            .schoolLogoBox {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 28mm;
              height: 28mm;
              background: linear-gradient(135deg, var(--primary-yellow) 0%, rgba(255, 209, 102, 0.8) 100%);
              border-radius: 50%;
              box-shadow: 0 3px 12px rgba(255, 209, 102, 0.3);
              border: 2px solid rgba(255, 209, 102, 0.6);
              flex-shrink: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .logoImg {
              width: 26mm;
              height: 26mm;
              object-fit: contain;
              border-radius: 50%;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .logoPlaceholder {
              font-size: 16mm;
              line-height: 1;
            }

            .schoolDetails {
              display: flex;
              flex-direction: column;
              gap: 1mm;
              align-items: center;
            }

            .schoolTitle {
              color: var(--primary-purple);
              font-size: 20pt;
              font-weight: 900;
              letter-spacing: 0.5px;
              margin: 0;
              line-height: 1.1;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .schoolAddress {
              color: var(--text-gray);
              font-size: 9pt;
              margin: 0;
              font-weight: 600;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .certificateTitleSection {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 5mm;
              width: 100%;
              margin: 5mm 0;
            }

            .decorLine {
              width: 50mm;
              height: 2px;
              background: linear-gradient(90deg, transparent 0%, var(--primary-yellow) 50%, transparent 100%);
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .certificateText {
              color: var(--primary-purple);
              font-size: 36pt;
              font-weight: 900;
              letter-spacing: 1.5px;
              margin: 0;
              text-transform: uppercase;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .awardTypeBox {
              display: inline-block;
              padding: 7mm 14mm;
              border: 2.5px solid;
              border-radius: 30mm;
              background: linear-gradient(135deg, rgba(255, 209, 102, 0.15) 0%, rgba(255, 209, 102, 0.08) 100%);
              margin: 3mm 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .awardTypeText {
              color: var(--primary-purple);
              font-weight: 800;
              font-size: 12pt;
              text-transform: uppercase;
              letter-spacing: 1px;
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
              gap: 4mm;
              padding: 3mm 0;
              margin: 0;
            }

            .presentedToText {
              color: var(--text-gray);
              font-size: 12pt;
              font-weight: 700;
              margin: 0;
              letter-spacing: 0.3px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .studentNameBox {
              display: flex;
              flex-direction: column;
              align-items: center;
              margin: 3mm 0;
            }

            .studentNameText {
              color: var(--primary-purple);
              font-size: 32pt;
              font-weight: 900;
              border-bottom: 3px solid var(--primary-yellow);
              padding: 5mm 10mm;
              margin: 0;
              letter-spacing: -0.5px;
              text-transform: uppercase;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .forAchievingText {
              color: var(--text-gray);
              font-size: 11pt;
              font-weight: 700;
              margin: 3mm 0 2mm 0;
              letter-spacing: 0.3px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .achievementTextBox {
              background: linear-gradient(135deg, rgba(106, 76, 147, 0.08) 0%, rgba(255, 209, 102, 0.06) 100%);
              border: 2px solid rgba(106, 76, 147, 0.15);
              border-radius: 8px;
              padding: 8mm 10mm;
              margin: 3mm 0;
              min-height: 30mm;
              display: flex;
              align-items: center;
              justify-content: center;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .achievementText {
              color: var(--primary-purple);
              font-size: 12pt;
              font-weight: 800;
              line-height: 1.6;
              font-style: italic;
              margin: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .congratsText {
              color: var(--text-gray);
              font-size: 10pt;
              line-height: 1.5;
              font-weight: 600;
              margin: 2mm 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .photoAndDateContainer {
              width: 100%;
              display: flex;
              align-items: flex-end;
              justify-content: space-between;
              gap: 15mm;
              margin-top: 5mm;
              padding-top: 5mm;
              border-top: 1px solid rgba(106, 76, 147, 0.1);
            }

            .photoSection {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 3mm;
            }

            .photoFrame {
              width: 45mm;
              height: 55mm;
              border: 2.5px solid var(--primary-purple);
              border-radius: 8px;
              overflow: hidden;
              background: white;
              box-shadow: 0 4px 12px rgba(106, 76, 147, 0.25);
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
              font-size: 8pt;
              font-weight: 700;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .dateAndSignatureBox {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 10mm;
              flex: 1;
            }

            .dateBox {
              text-align: center;
            }

            .dateLabel {
              color: var(--text-gray);
              font-size: 10pt;
              font-weight: 700;
              margin: 0 0 2mm 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .dateValue {
              color: var(--primary-purple);
              font-size: 11pt;
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
              min-width: 60mm;
            }

            .signatureLine {
              width: 100%;
              min-width: 60mm;
              border-top: 2px solid var(--primary-purple);
              margin-bottom: 3mm;
              height: 20mm;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .signatureLabel {
              color: var(--text-gray);
              font-size: 9pt;
              font-weight: 700;
              margin: 0;
              text-transform: uppercase;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .footerText {
              text-align: center;
              font-size: 8pt;
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
          <div class="certificateWrapper">
            ${clonedElement.innerHTML}
          </div>
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
    try {
      setIsDownloading(true);
      await new Promise(resolve => setTimeout(resolve, 800));

      const element = printRef.current;
      if (!element) {
        alert('Certificate element not found');
        setIsDownloading(false);
        return;
      }

      const clonedElement = element.cloneNode(true) as HTMLElement;

      const options: any = {
        margin: 0,
        filename: `${award.name}-Award-Certificate-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.99 },
        html2canvas: {
          scale: 4,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowHeight: 1500,
          windowWidth: 1000
        },
        jsPDF: {
          format: 'a4',
          orientation: 'portrait',
          compress: false,
          unit: 'mm',
          hotfixes: ['px_scaling']
        },
        pagebreak: { mode: 'avoid' }
      };

      html2pdf()
        .set(options)
        .from(clonedElement)
        .save()
        .then(() => {
          setIsDownloading(false);
        })
        .catch((error: any) => {
          console.error('PDF download error:', error);
          alert('Error downloading PDF. Please try again.');
          setIsDownloading(false);
        });

    } catch (error) {
      console.error('Download error:', error);
      alert('Error preparing certificate for download');
      setIsDownloading(false);
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
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerContent}>
                <h2>🎖️ Certificate Preview</h2>
                <p>Ready to print or download</p>
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

            {/* Preview */}
            <div className={styles.previewContainer}>
              <div className={styles.printableArea} ref={printRef}>
                {/* A4 Certificate */}
                <div className={styles.certificate}>
                  <div className={styles.content}>
                    {/* Header Section */}
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

                    {/* Certificate Title */}
                    <div className={styles.certificateTitleSection}>
                      <div className={styles.decorLine}></div>
                      <h2 className={styles.certificateText}>Certificate</h2>
                      <div className={styles.decorLine}></div>
                    </div>

                    {/* Award Badge */}
                    <div
                      className={styles.awardTypeBox}
                      style={{ borderColor: awardColors[award.award_type] }}
                    >
                      <p className={styles.awardTypeText}>
                        {awardTypeLabels[award.award_type]}
                      </p>
                    </div>
                    {/* Photo Section */}
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
                    {/* Main Content */}
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

                    {/* Photo and Date Section */}
                    <div className={styles.photoAndDateContainer}>


                      {/* Date and Signature Section */}
                      <div className={styles.dateAndSignatureBox}>
                        {/* Date Box */}
                        <div className={styles.dateBox}>
                          <p className={styles.dateLabel}>Date</p>
                          <p className={styles.dateValue}>{getFormattedDate()}</p>
                        </div>

                        {/* Signature Box */}
                        <div className={styles.signatureBox}>
                          <div className={styles.signatureLine}></div>
                          <p className={styles.signatureLabel}>{schoolDetails.contact.email} / {schoolDetails.contact.phone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <p className={styles.footerText}>
                      Keep this certificate as a token of your exceptional achievement
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
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