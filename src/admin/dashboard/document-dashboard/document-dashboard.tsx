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
import Loader from '@/custom/loader/loader';
import HeadingTitle from '@/components/heading/headingtitle';

interface Document {
    id: string;
    details: string;
    url: string;
    drive_file_id: string;
    uploaded_at: string;
    file_size?: number;
}

interface StatusCard {
    label: string;
    count: number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    id: string;
}

type SortField = 'created_at' | 'details';
type SortOrder = 'asc' | 'desc';
type ItemsPerPage = 20 | 50 | 100;

const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

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
    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    useEffect(() => {
        const r = localStorage.getItem('adminRoleId');
        if (r) setRoleId(parseInt(r, 10));
        fetchDocuments();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const canManage = roleId === 0 || roleId === 1;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/public/downloads');
            const json = await res.json();
            if (json?.success) setDocuments(json.data || []);
            else setDocuments([]);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load documents');
            setDocuments([]);
        } finally {
            setLoading(false);
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
                setUploadModalOpen(false);
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

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <FaSort />;
        return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
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
            icon: <FaFile />,
            color: '#6a4c93',
            bgColor: '#f3e8ff',
            id: 'total',
        },
        {
            label: 'This Week',
            count: documents.filter(d => new Date(d.uploaded_at).getTime() >= weekAgo).length,
            icon: <FaDownload />,
            color: '#3b82f6',
            bgColor: '#eff6ff',
            id: 'week',
        },
        {
            label: 'Recent',
            count: documents.length > 0 ? 1 : 0,
            icon: <FaEye />,
            color: '#10b981',
            bgColor: '#ecfdf5',
            id: 'recent',
        },
    ];

    const handleItemsPerPageChange = (value: ItemsPerPage) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            const tableElement = document.querySelector(`.${styles.tableWrapper}`);
            if (tableElement) {
                tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    if (loading) {
        return <Loader isVisible={true} message="Loading Document Dashboard..." fullScreen={true} />;
    }

    if (!canManage) {
        return <Loader isVisible={true} fullScreen={true} message="Checking permissions..." />;
    }

    return (
        <div className={styles.dashboardWrapper}>
            <HeadingTitle text='Document Dashboard' />

            {/* Upload Modal */}
            <AnimatePresence>
                {uploadModalOpen && (
                    <>
                        <motion.div
                            className={styles.modalOverlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setUploadModalOpen(false)}
                        />
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.95, opacity: 0, y: -20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <h2>Upload New Document</h2>
                                <button
                                    className={styles.modalCloseBtn}
                                    onClick={() => setUploadModalOpen(false)}
                                    aria-label="Close modal"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <form onSubmit={handleUpload} className={styles.modalForm}>
                                <div className={styles.modalContent}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="details">Document Name *</label>
                                        <input
                                            id="details"
                                            type="text"
                                            value={details}
                                            onChange={(e) => setDetails(e.target.value)}
                                            placeholder="e.g., School Prospectus 2024"
                                            className={styles.formInput}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="file">Select File *</label>
                                        <label className={styles.fileInputWrapper}>
                                            <input
                                                id="file"
                                                type="file"
                                                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                                className={styles.fileInput}
                                            />
                                            <span className={styles.fileInputLabel}>
                                                {file ? file.name : 'Choose a file...'}
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className={styles.modalFooter}>
                                    <motion.button
                                        type="button"
                                        className={styles.modalCancelBtn}
                                        onClick={() => setUploadModalOpen(false)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        disabled={uploadLoading || !file || !details.trim()}
                                        className={styles.modalSubmitBtn}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {uploadLoading ? 'Uploading...' : 'Upload Document'}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <motion.div
                className={styles.statusCardsSection}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {statusCards.map((card) => (
                    <motion.div key={card.id} variants={itemVariants}>
                        <StatusCardComponent card={card} />
                    </motion.div>
                ))}
            </motion.div>

            <div className={styles.dashboard}>
                <div className={styles.header}>
                    <div className={styles.controls}>
                        <div className={styles.searchBar}>
                            <FaSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search by document name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <motion.button
                            className={styles.uploadBtn}
                            onClick={() => setUploadModalOpen(true)}
                            title="Upload new document"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaUpload /> Upload Document
                        </motion.button>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('created_at')}>
                                    Date {getSortIcon('created_at')}
                                </th>
                                <th onClick={() => handleSort('details')}>
                                    Document Name {getSortIcon('details')}
                                </th>
                                <th>Size</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAndFilteredDocuments.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className={styles.noResults}>
                                        No documents found
                                    </td>
                                </tr>
                            ) : (
                                paginatedDocuments.map((doc) => (
                                    <motion.tr
                                        key={doc.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <td>
                                            {new Date(doc.uploaded_at).toLocaleDateString('en-US', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td>
                                            <div className={styles.documentCell}>
                                                <div className={styles.documentIcon}>
                                                    <FaFile />
                                                </div>
                                                <span className={styles.documentName}>{doc.details}</span>
                                            </div>
                                        </td>
                                        <td className={styles.documentCell}>{formatFileSize(doc.file_size)}</td>
                                        <td className={styles.actionCell}>
                                            <div className={styles.actionButtons}>
                                                <motion.button
                                                    className={`${styles.actionBtn} ${styles.viewBtn}`}
                                                    onClick={() => setPreview({ url: doc.url, name: doc.details })}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    title="View document"
                                                >
                                                    <FaEye /> View
                                                </motion.button>
                                                <motion.a
                                                    href={doc.url}
                                                    download
                                                    className={`${styles.actionBtn} ${styles.downloadBtn}`}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    title="Download document"
                                                >
                                                    <FaDownload /> Download
                                                </motion.a>
                                                {canManage && (
                                                    <motion.button
                                                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                        onClick={() => handleDelete(doc)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        title="Delete document"
                                                    >
                                                        <FaTrash /> Delete
                                                    </motion.button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Section */}
                {sortedAndFilteredDocuments.length > 0 && (
                    <div className={styles.paginationSection}>
                        <div className={styles.paginationInfo}>
                            <p className={styles.paginationText}>
                                Showing <strong>{startIndex + 1}</strong> to{' '}
                                <strong>{Math.min(endIndex, sortedAndFilteredDocuments.length)}</strong> of{' '}
                                <strong>{sortedAndFilteredDocuments.length}</strong> documents
                            </p>
                        </div>

                        <div className={styles.paginationControls}>
                            <div className={styles.itemsPerPageSelector}>
                                <label htmlFor="itemsPerPage">Items per page:</label>
                                <select
                                    id="itemsPerPage"
                                    value={itemsPerPage}
                                    onChange={(e) =>
                                        handleItemsPerPageChange(Number(e.target.value) as ItemsPerPage)
                                    }
                                    className={styles.itemsPerPageSelect}
                                >
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>

                            <div className={styles.paginationButtons}>
                                <motion.button
                                    className={styles.paginationBtn}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                                    whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                                    title="Previous page"
                                >
                                    <FaChevronLeft /> Previous
                                </motion.button>

                                <div className={styles.pageNumbers}>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                        const showPage =
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1);

                                        if (!showPage) {
                                            if (page === currentPage - 2 || page === currentPage + 2) {
                                                return (
                                                    <span key={`ellipsis-${page}`} className={styles.ellipsis}>
                                                        ...
                                                    </span>
                                                );
                                            }
                                            return null;
                                        }

                                        return (
                                            <motion.button
                                                key={page}
                                                className={`${styles.pageBtn} ${page === currentPage ? styles.active : ''
                                                    }`}
                                                onClick={() => handlePageChange(page)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {page}
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                <motion.button
                                    className={styles.paginationBtn}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                                    whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                                    title="Next page"
                                >
                                    Next <FaChevronRight />
                                </motion.button>
                            </div>

                            <div className={styles.pageInfo}>
                                <p>
                                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

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

const StatusCardComponent = ({
    card,
}: {
    card: StatusCard;
}) => {
    return (
        <motion.div
            className={styles.statusCard}
            whileHover={{ translateY: -6, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
        >
            <div className={styles.statusCardContent}>
                <div className={styles.statusCardHeader}>
                    <div className={styles.statusCardBody}>
                        <div className={styles.statusCardCount} style={{ color: card.color }}>
                            {card.count}
                        </div>
                        <p className={styles.statusCardLabel}>{card.label}</p>
                    </div>
                    <div className={styles.statusCardIcon} style={{ background: card.bgColor, color: card.color }}>
                        {card.icon}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DocumentDashboard;
