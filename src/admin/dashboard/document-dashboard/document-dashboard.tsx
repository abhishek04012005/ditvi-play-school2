'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    FaDownload,
    FaTrash,
    FaEye,
    FaFile,
    FaClock,
    FaTimes,
    FaSearch,
    FaUpload,
} from 'react-icons/fa';
import styles from './document-dashboard.module.css';
import dashboardStyles from '../dashboard.module.css';
import Loader from '@/custom/loader/loader';
import HeadingTitle from '@/components/heading/headingtitle';

interface Document {
    id: string;
    details: string;
    url: string;
    drive_file_id: string;
    uploaded_at: string;
}

interface PreviewState {
    url: string;
    name: string;
}

const DocumentDashboard = () => {
    const [details, setDetails] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [roleId, setRoleId] = useState<number | null>(null);
    const [preview, setPreview] = useState<PreviewState | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const r = localStorage.getItem('adminRoleId');
        if (r) setRoleId(parseInt(r, 10));
        fetchDocuments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const canManage = roleId === 0 || roleId === 1;

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
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return toast.error('Please select a file');
        if (!details.trim()) return toast.error('Please enter document details');

        setLoading(true);
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
            setLoading(false);
        }
    };

    const handleDelete = async (doc: Document) => {
        if (!confirm('Are you sure you want to delete this document?')) return;
        setLoading(true);
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
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        const total = documents.length;
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const recent = documents.filter((d) => new Date(d.uploaded_at).getTime() >= weekAgo).length;
        const lastUploaded = documents[0]?.uploaded_at || null;
        return { total, recent, lastUploaded };
    }, [documents]);

    const filteredDocuments = useMemo(() => {
        return documents.filter((doc) =>
            doc.details.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [documents, searchQuery]);

    if (!canManage) {
        return <Loader isVisible={true} fullScreen={true} message="Checking permissions..." />;
    }

    return (
        <div className={dashboardStyles.dashboard}>
            {/* Header Section */}
            <div className={dashboardStyles.headerSection}>
                <div className={dashboardStyles.headerContent}>
                    <div>
                        <h1 className={dashboardStyles.pageTitle}>Document Management</h1>
                        <p className={dashboardStyles.pageSubtitle}>Upload and manage school documents including brochures, fee structures, and important files</p>
                    </div>
                    <div className={dashboardStyles.headerControls}>
                        <button className={dashboardStyles.rangeBtn} onClick={() => fetchDocuments()}>
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className={dashboardStyles.statsGrid}>
                <motion.div
                    className={dashboardStyles.statCardWrapper}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0 }}
                >
                    <div className={dashboardStyles.statCardInner}>
                        <div className={dashboardStyles.statCardContent}>
                            <div className={dashboardStyles.statCardTop}>
                                <div>
                                    <div className={dashboardStyles.statCardTitle}>Total Documents</div>
                                    <div className={dashboardStyles.statCardValue}>{stats.total}</div>
                                </div>
                                <div className={dashboardStyles.statCardIcon}>📁</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className={dashboardStyles.statCardWrapper}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <div className={dashboardStyles.statCardInner}>
                        <div className={dashboardStyles.statCardContent}>
                            <div className={dashboardStyles.statCardTop}>
                                <div>
                                    <div className={dashboardStyles.statCardTitle}>This Week</div>
                                    <div className={dashboardStyles.statCardValue}>{stats.recent}</div>
                                </div>
                                <div className={dashboardStyles.statCardIcon}>🕒</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className={dashboardStyles.statCardWrapper}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <div className={dashboardStyles.statCardInner}>
                        <div className={dashboardStyles.statCardContent}>
                            <div className={dashboardStyles.statCardTop}>
                                <div>
                                    <div className={dashboardStyles.statCardTitle}>Last Uploaded</div>
                                    <div className={dashboardStyles.statCardValue}>
                                        {stats.lastUploaded ? new Date(stats.lastUploaded).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                                <div className={dashboardStyles.statCardIcon}>📌</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className={dashboardStyles.analyticsGrid}>
                {/* Upload Card */}
                <motion.div
                    className={dashboardStyles.analyticsCard}
                    style={{ gridColumn: '1 / -1' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <div className={dashboardStyles.cardHeader}>
                        <h3>Upload New Document</h3>
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
                            disabled={loading || !file || !details.trim()}
                            className={styles.uploadButton}
                        >
                            {loading ? 'Uploading...' : 'Upload Document'}
                        </button>
                    </form>
                </motion.div>

                {/* Documents List */}
                <motion.div
                    className={dashboardStyles.analyticsCard}
                    style={{ gridColumn: '1 / -1' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                >
                    <div className={dashboardStyles.cardHeader}>
                        <h3>Documents Library</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                                {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className={styles.searchContainer}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    {/* Loading State */}
                    {loading && documents.length === 0 ? (
                        <Loader isVisible={true} message="Loading documents..." fullScreen={false} />
                    ) : filteredDocuments.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>📄</div>
                            <p className={styles.emptyTitle}>No documents found</p>
                            <p className={styles.emptySubtitle}>
                                {documents.length === 0 ? 'Upload your first document to get started' : 'Try adjusting your search terms'}
                            </p>
                        </div>
                    ) : (
                        <div className={styles.documentsList}>
                            <AnimatePresence mode="popLayout">
                                {filteredDocuments.map((doc, index) => (
                                    <motion.div
                                        key={doc.id}
                                        className={styles.documentItem}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                        whileHover={{ backgroundColor: 'rgba(106, 76, 147, 0.02)' }}
                                    >
                                        <div className={styles.documentInfo}>
                                            <div className={styles.documentIcon}>
                                                <FaFile />
                                            </div>
                                            <div className={styles.documentDetails}>
                                                <div className={styles.documentName}>{doc.details}</div>
                                                <div className={styles.documentDate}>
                                                    {new Date(doc.uploaded_at).toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.documentActions}>
                                            <motion.button
                                                className={styles.actionBtn + ' ' + styles.viewBtn}
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
                                                className={styles.actionBtn + ' ' + styles.downloadBtn}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                title="Download document"
                                            >
                                                <FaDownload /> Download
                                            </motion.a>
                                            {canManage && (
                                                <motion.button
                                                    className={styles.actionBtn + ' ' + styles.deleteBtn}
                                                    onClick={() => handleDelete(doc)}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    title="Delete document"
                                                >
                                                    <FaTrash /> Delete
                                                </motion.button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
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

export default DocumentDashboard;
