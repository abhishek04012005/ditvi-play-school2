'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaTimes, FaSpinner, FaCalendar } from 'react-icons/fa';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import styles from './DownloadData.module.css';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';

export interface DownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any[];
    columns: { key: string; label: string }[];
    fileName: string;
    defaultMonths?: '1' | '3' | '6' | '9';
    onDateRangeChange?: (startDate: Date, endDate: Date) => any[];
    title?: string;
    description?: string;
}

export const DownloadModal = ({
    isOpen,
    onClose,
    data,
    columns,
    fileName,
    defaultMonths = '6',
    onDateRangeChange,
    title = '📥 Download Data',
    description = 'Select a date range and format to download your data',
}: DownloadModalProps) => {
    const [dateRange, setDateRange] = useState<'1' | '3' | '6' | '9' | 'custom'>(defaultMonths);
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [downloadFormat, setDownloadFormat] = useState<'csv' | 'excel'>('csv');
    const [isDownloading, setIsDownloading] = useState(false);

    // ✨ Get date range based on selection
    const getDateRange = (): { start: Date; end: Date } => {
        const endDate = new Date();
        const startDate = new Date();

        if (dateRange === 'custom') {
            return {
                start: new Date(customStartDate),
                end: new Date(customEndDate),
            };
        }

        const monthsNum = parseInt(dateRange);
        startDate.setMonth(startDate.getMonth() - monthsNum);

        return { start: startDate, end: endDate };
    };

    // ✨ Filter data by date range
    const filteredData = useMemo(() => {
        if (!onDateRangeChange) return data;

        const { start, end } = getDateRange();
        return onDateRangeChange(start, end) || data;
    }, [dateRange, customStartDate, customEndDate, data, onDateRangeChange]);

    // ✨ Format data for export
    const formatDataForExport = () => {
        return filteredData.map((item) => {
            const formattedItem: any = {};
            columns.forEach((col) => {
                formattedItem[col.label] = item[col.key] || 'N/A';
            });
            return formattedItem;
        });
    };

    // ✨ Validate inputs
    const validateInputs = (): boolean => {
        if (filteredData.length === 0) {
            toast.error('No data available for the selected date range');
            return false;
        }

        if (dateRange === 'custom') {
            if (!customStartDate || !customEndDate) {
                toast.error('Please select both start and end dates');
                return false;
            }

            const start = new Date(customStartDate);
            const end = new Date(customEndDate);
            const today = new Date();

            if (start > end) {
                toast.error('Start date must be before end date');
                return false;
            }

            if (end > today) {
                toast.error('End date cannot be in the future');
                return false;
            }
        }

        return true;
    };

    // ✨ Download as CSV
    const handleDownloadCSV = async () => {
        try {
            if (!validateInputs()) return;

            setIsDownloading(true);

            const dataToExport = formatDataForExport();
            const csv = Papa.unparse(dataToExport);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            const { start, end } = getDateRange();
            const startDateStr = start.toISOString().split('T')[0];
            const endDateStr = end.toISOString().split('T')[0];
            const finalFileName = `${fileName}_${startDateStr}_to_${endDateStr}_${new Date().getTime()}.csv`;

            link.setAttribute('href', url);
            link.setAttribute('download', finalFileName);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`✅ CSV downloaded successfully (${dataToExport.length} records)`);
            onClose();
        } catch (error) {
            console.error('Error downloading CSV:', error);
            toast.error('Failed to download CSV file');
        } finally {
            setIsDownloading(false);
        }
    };

    // ✨ Download as Excel
    const handleDownloadExcel = async () => {
        try {
            if (!validateInputs()) return;

            setIsDownloading(true);

            const dataToExport = formatDataForExport();
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);

            // Set column widths
            const columnWidths = columns.map(() => ({ wch: 18 }));
            worksheet['!cols'] = columnWidths;

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

            const { start, end } = getDateRange();
            const startDateStr = start.toISOString().split('T')[0];
            const endDateStr = end.toISOString().split('T')[0];
            const finalFileName = `${fileName}_${startDateStr}_to_${endDateStr}_${new Date().getTime()}.xlsx`;

            XLSX.writeFile(workbook, finalFileName);

            toast.success(`✅ Excel downloaded successfully (${dataToExport.length} records)`);
            onClose();
        } catch (error) {
            console.error('Error downloading Excel:', error);
            toast.error('Failed to download Excel file');
        } finally {
            setIsDownloading(false);
        }
    };

    // ✨ Get max date for custom date input (today)
    const getMaxDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // ✨ Get suggested start date for custom range
    const getSuggestedStartDate = () => {
        const date = new Date();
        date.setMonth(date.getMonth() - 6);
        return date.toISOString().split('T')[0];
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className={styles.downloadModal}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        {/* Header */}
                        <div className={styles.modalHeader}>
                            <div>
                                <h2>{title}</h2>
                                <p>{description}</p>
                            </div>
                            <button
                                className={styles.closeBtn}
                                onClick={onClose}
                                disabled={isDownloading}
                                aria-label="Close"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Content */}
                        <div className={styles.modalContent}>
                            {/* Date Range Section */}
                            <div className={styles.section}>
                                <label className={styles.sectionLabel}>
                                    <FaCalendar /> Select Date Range
                                </label>

                                <div className={styles.dateRangeButtons}>
                                    {(['1', '3', '6', '9'] as const).map((month) => (
                                        <motion.button
                                            key={month}
                                            className={`${styles.dateBtn} ${dateRange === month ? styles.active : ''
                                                }`}
                                            onClick={() => setDateRange(month)}
                                            disabled={isDownloading}
                                            whileHover={{ scale: isDownloading ? 1 : 1.05 }}
                                            whileTap={{ scale: isDownloading ? 1 : 0.95 }}
                                            title={`Last ${month} month${month !== '1' ? 's' : ''}`}
                                        >
                                            {month === '1' ? '1 Month' : `${month} Months`}
                                        </motion.button>
                                    ))}
                                    <motion.button
                                        className={`${styles.dateBtn} ${dateRange === 'custom' ? styles.active : ''
                                            }`}
                                        onClick={() => setDateRange('custom')}
                                        disabled={isDownloading}
                                        whileHover={{ scale: isDownloading ? 1 : 1.05 }}
                                        whileTap={{ scale: isDownloading ? 1 : 0.95 }}
                                        title="Custom date range"
                                    >
                                        Custom
                                    </motion.button>
                                </div>

                                {/* Custom Date Inputs */}
                                <AnimatePresence>
                                    {dateRange === 'custom' && (
                                        <motion.div
                                            className={styles.customDateInputs}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className={styles.dateInputGroup}>
                                                <label htmlFor="startDate">Start Date</label>
                                                <input
                                                    id="startDate"
                                                    type="date"
                                                    value={customStartDate}
                                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                                    max={getMaxDate()}
                                                    disabled={isDownloading}
                                                    className={styles.dateInput}
                                                />
                                            </div>

                                            <div className={styles.dateInputGroup}>
                                                <label htmlFor="endDate">End Date</label>
                                                <input
                                                    id="endDate"
                                                    type="date"
                                                    value={customEndDate}
                                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                                    max={getMaxDate()}
                                                    disabled={isDownloading}
                                                    className={styles.dateInput}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Date Range Summary */}
                                <div className={styles.dateRangeSummary}>
                                    {dateRange === 'custom' && customStartDate && customEndDate ? (
                                        <p className={styles.selectedRange}>
                                            <BarChartIcon /> {new Date(customStartDate).toLocaleDateString()} to{' '}
                                            {new Date(customEndDate).toLocaleDateString()}
                                        </p>
                                    ) : (
                                        <p className={styles.selectedRange}>
                                            <BarChartIcon />{' '}
                                            {(() => {
                                                const { start, end } = getDateRange();
                                                return `${start.toLocaleDateString()} to ${end.toLocaleDateString()}`;
                                            })()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Format Section */}
                            <div className={styles.section}>
                                <label className={styles.sectionLabel}><FolderOpenIcon /> Download Format</label>

                                <div className={styles.formatButtons}>
                                    <motion.button
                                        className={`${styles.formatBtn} ${downloadFormat === 'csv' ? styles.active : ''
                                            }`}
                                        onClick={() => setDownloadFormat('csv')}
                                        disabled={isDownloading}
                                        whileHover={{ scale: isDownloading ? 1 : 1.05 }}
                                        whileTap={{ scale: isDownloading ? 1 : 0.95 }}
                                        title="Download as CSV"
                                    >
                                        <FaDownload /> CSV
                                    </motion.button>

                                    <motion.button
                                        className={`${styles.formatBtn} ${downloadFormat === 'excel' ? styles.active : ''
                                            }`}
                                        onClick={() => setDownloadFormat('excel')}
                                        disabled={isDownloading}
                                        whileHover={{ scale: isDownloading ? 1 : 1.05 }}
                                        whileTap={{ scale: isDownloading ? 1 : 0.95 }}
                                        title="Download as Excel"
                                    >
                                        <FaDownload /> Excel
                                    </motion.button>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className={styles.infoBox}>
                                <p className={styles.infoText}>
                                    <ShowChartIcon /> <strong>{filteredData.length}</strong> records will be exported
                                </p>
                                <p className={styles.infoText}>
                                    <ContentPasteIcon /> <strong>{columns.length}</strong> columns will be included
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className={styles.modalFooter}>
                            <button
                                className={styles.cancelBtn}
                                onClick={onClose}
                                disabled={isDownloading}
                            >
                                <FaTimes /> Cancel
                            </button>

                            <motion.button
                                className={styles.downloadBtn}
                                onClick={
                                    downloadFormat === 'csv'
                                        ? handleDownloadCSV
                                        : handleDownloadExcel
                                }
                                disabled={isDownloading}
                                whileHover={{
                                    scale: isDownloading ? 1 : 1.05,
                                }}
                                whileTap={{ scale: isDownloading ? 1 : 0.95 }}
                            >
                                {isDownloading ? (
                                    <>
                                        <FaSpinner className={styles.spinner} /> Downloading...
                                    </>
                                ) : (
                                    <>
                                        <FaDownload /> Download {downloadFormat.toUpperCase()}
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default DownloadModal;