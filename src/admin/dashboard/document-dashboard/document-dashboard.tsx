'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    FaDownload,
    FaTrash,
    FaEye,
    FaFile,
    FaTimes,
    FaSearch,
    FaUpload,
    FaSort,
    FaSortUp,
    FaSortDown,
    FaChevronLeft,
    FaChevronRight,
} from 'react-icons/fa';
import styles from './document-dashboard.module.css';
import dashboardStyles from '../dashboard.module.css';
import Loader from '@/custom/loader/loader';

interface Document {
    id: string;
    details: string;
    url: string;
    drive_file_id: string;
    uploaded_at: string;
}

interface StatusCard {
    label: string;
    count: number;
    icon: string;
    color: string;
    bgColor: string;
    id: string;
}

type SortField = 'created_at' | 'details';
type SortOrder = 'asc' | 'desc';
type ItemsPerPage = 20 | 50 | 100;

const DocumentDashboard = () => {
    const [details, setDetails] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [roleId, setRoleId] = useState<number | null>(null);
    const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(20);
    const [uploadLoading, setUploadLoading] = useState(false);

    useEffect(() => {
        const r = localStorage.getItem('adminRoleId');
        if (r) setRoleId(parseInt(r, 10));
        const initializePage = async () => {
            setLoading(true);
            await fetchDocuments();
            setLoading(false);
        };
        initializePage();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const canManage = roleId === 0 || roleId === 1;

    const fetchDocuments = async () => {
        try {
            const res = await fetch('/api/public/downloads');
            const json = await res.json();
            if (json?.success) setDocuments(json.data || []);
            else setDocuments([]);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load documents');
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return toast.error('Please select a file');
        if (!details.trim()) return toast.error('Please enter document details');

        setUploadLoading(true);
        try {
            const fd = new FormData();
            fd.append('details', details);
            fd.append('file', file);

            const res = await fetch('/api/admin/upload-document', { method: 'POST', body: fd });
            const json = await res.json();
            if (json?.success) {
                toast.success('Document uploaded successfully');
                setDetails('');
                setFile(null);
                await fetchDocuments();
            } else {
                toast.error(json?.error || 'Upload failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Upload failed');
        } finally {
            setUploadLoading(false);
        }
    };

    const handleDelete = async (doc: Document) => {
        if (!confirm('Are you sure you want to delete this document?')) return;
        setUploadLoading(true);
        try {
            const res = await fetch('/api/admin/delete-document', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: doc.id, drive_file_id: doc.drive_file_id }),
            });
            const json = await res.json();
            if (json?.success) {
                toast.success('Document deleted successfully');
                await fetchDocuments();
            } else {
                toast.error(json?.error || 'Delete failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Delete failed');
        } finally {
            setUploadLoading(false);
        }
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <FaSort />;
        return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
    };

    const sortedAndFilteredDocuments = documents
        .filter(doc =>
            doc.details.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortField === 'created_at') {
                return sortOrder === 'asc'
                    ? new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime()
                    : new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
            }
            return sortOrder === 'asc'
                ? a.details.localeCompare(b.details)
                : b.details.localeCompare(a.details);
        });

    const totalPages = Math.ceil(sortedAndFilteredDocuments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDocuments = sortedAndFilteredDocuments.slice(startIndex, endIndex);

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const statusCards: StatusCard[] = [
        {
            label: 'Total Documents',
            count: documents.length,
            icon: '📁',
            color: 'var(--primary-purple)',
            bgColor: '#f3e8ff',
            id: 'total',
        },
        {
            label: 'This Week',
            count: documents.filter(d => new Date(d.uploaded_at).getTime() >= weekAgo).length,
            icon: '🕒',
            color: '#3b82f6',
            bgColor: '#eff6ff',
            id: 'week',
        },
        {
            label: 'Last Uploaded',
            count: documents.length > 0 ? 1 : 0,
            icon: '📌',
            color: '#10b981',
            bgColor: '#ecfdf5',
            id: 'recent',
        },
    ];

    if (!canManage) {
        return <Loader isVisible={true} fullScreen={true} message="Checking permissions..." />;
    }

    if (loading) {
        return <Loader isVisible={true} fullScreen={true} message="Loading dashboard..." />;
    }

    return (
        <div className={dashboardStyles.dashboard}>
            {/* Header */}
            <div className={dashboardStyles.headerSection}>
                <div className={dashboardStyles.headerContent}>
                    <div>
                        <h1 className={dashboardStyles.pageTitle}>Documents</h1>
                        <p className={dashboardStyles.pageSubtitle}>Manage school documents and resources</p>
                    </div>
                    <div className={dashboardStyles.headerControls}>
                        <button className={dashboardStyles.rangeBtn} onClick={() => fetchDocuments()}>
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Cards */}
            <div className={dashboardStyles.statusCardsSection}>
                {statusCards.map((card, index) => (
                    <motion.div
                        key={card.id}
                        className={dashboardStyles.statusCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <div className={dashboardStyles.statusCardContent}>
                            <div className={dashboardStyles.statusCardHeader}>
                                <div className={dashboardStyles.statusCardBody}>
                                    <div className={dashboardStyles.statusCardCount} style={{ color: card.color }}>
                                        {card.count}
                                    </div>
                                    <p className={dashboardStyles.statusCardLabel}>{card.label}</p>
                                </div>
                                <div className={dashboardStyles.statusCardIcon} style={{ background: card.bgColor }}>
                                    {card.icon}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Upload Section */}
            <motion.div
                className={dashboardStyles.analyticsCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                style={{ marginTop: '2rem' }}
            >
                <div className={dashboardStyles.cardHeader}>
                    <h3>Upload Document</h3>
                    <FaUpload className={dashboardStyles.filterIcon} />
                </div>

                <form onSubmit={handleUpload} className={styles.uploadFormContainer}>
                    <div className={styles.uploadFormFields}>
                        <div className={styles.formGroup}>
                            <label htmlFor="details">Document Name *</label>
                            <input
                                id="details"
                                type="text"
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder="e.g., School Brochure 2024"
                                className={styles.formInput}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="file">Select File *</label>
                            <div className={styles.fileInputWrapper}>
                                <input
                                    id="file"
                                    type="file"
                                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                    className={styles.fileInput}
                                />
                                <span className={styles.fileInputLabel}>
                                    {file ? file.name : 'Choose a file...'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={uploadLoading || !file || !details.trim()}
                        className={styles.uploadButton}
                    >
                        {uploadLoading ? 'Uploading...' : 'Upload Document'}
                    </button>
                </form>
            </motion.div>

            {/* Documents Table */}
            <motion.div
                className={dashboardStyles.analyticsCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                style={{ marginTop: '2rem' }}
            >
                <div className={dashboardStyles.cardHeader}>
                    <h3>Documents ({sortedAndFilteredDocuments.length})</h3>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div className={styles.searchContainer}>
                            <FaSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                    </div>
                </div>

                {sortedAndFilteredDocuments.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📄</div>
                        <p className={styles.emptyTitle}>No documents</p>
                        <p className={styles.emptySubtitle}>
                            {documents.length === 0 ? 'Upload your first document to get started' : 'Try adjusting your search'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>
                                            <button
                                                className={styles.sortButton}
                                                onClick={() => handleSort('details')}
                                            >
                                                Document Name {getSortIcon('details')}
                                            </button>
                                        </th>
                                        <th>
                                            <button
                                                className={styles.sortButton}
                                                onClick={() => handleSort('created_at')}
                                            >
                                                Uploaded {getSortIcon('created_at')}
                                            </button>
                                        </th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence mode="popLayout">
                                        {paginatedDocuments.map((doc, index) => (
                                            <motion.tr
                                                key={doc.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                                className={styles.tableRow}
                                            >
                                                <td>
                                                    <div className={styles.documentNameCell}>
                                                        <div className={styles.documentIcon}>
                                                            <FaFile />
                                                        </div>
                                                        <div className={styles.documentInfo}>
                                                            <div className={styles.documentName}>{doc.details}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={styles.dateCell}>
                                                    {new Date(doc.uploaded_at).toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>
                                                <td>
                                                    <div className={styles.actionsCell}>
                                                        <motion.button
                                                            className={styles.actionBtn + ' ' + styles.viewBtn}
                                                            onClick={() => setPreview({ url: doc.url, name: doc.details })}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            title="View document"
                                                        >
                                                            <FaEye />
                                                        </motion.button>
                                                        <motion.a
                                                            href={doc.url}
                                                            download
                                                            className={styles.actionBtn + ' ' + styles.downloadBtn}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            title="Download document"
                                                        >
                                                            <FaDownload />
                                                        </motion.a>
                                                        {canManage && (
                                                            <motion.button
                                                                className={styles.actionBtn + ' ' + styles.deleteBtn}
                                                                onClick={() => handleDelete(doc)}
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                title="Delete document"
                                                            >
                                                                <FaTrash />
                                                            </motion.button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className={styles.paginationContainer}>
                                <div className={styles.paginationInfo}>
                                    <span>Showing {startIndex + 1} to {Math.min(endIndex, sortedAndFilteredDocuments.length)} of {sortedAndFilteredDocuments.length} documents</span>
                                </div>

                                <div className={styles.paginationControls}>
                                    <button
                                        className={styles.paginationBtn}
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <FaChevronLeft /> Previous
                                    </button>

                                    <div className={styles.pageNumbers}>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
                                                onClick={() => setCurrentPage(page)}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        className={styles.paginationBtn}
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next <FaChevronRight />
                                    </button>
                                </div>

                                <select
                                    className={styles.itemsPerPageSelect}
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(parseInt(e.target.value) as ItemsPerPage);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value={20}>20 per page</option>
                                    <option value={50}>50 per page</option>
                                    <option value={100}>100 per page</option>
                                </select>
                            </div>
                        )}
                    </>
                )}
            </motion.div>

            {/* Preview Modal */}
            <AnimatePresence>
                {preview && (
                    <motion.div
                        className={styles.previewOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPreview(null)}
                    >
                        <motion.div
                            className={styles.previewModal}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.previewHeader}>
                                <h3>{preview.name}</h3>
                                <button
                                    className={styles.closeBtn}
                                    onClick={() => setPreview(null)}
                                    aria-label="Close preview"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <iframe
                                src={preview.url}
                                className={styles.previewIframe}
                                title={preview.name}
                            ></iframe>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DocumentDashboard;
