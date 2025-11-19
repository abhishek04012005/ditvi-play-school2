"use client";
import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaSearch,
    FaSort,
    FaSortUp,
    FaSortDown,
    FaSpinner,
    FaCheckCircle,
    FaUser,
    FaStickyNote,
    FaTimes,
    FaCheck,
    FaClock,
    FaFileAlt,
    FaEye,
    FaDownload,
    FaPhoneAlt,
    FaWhatsapp,
} from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import styles from './admission.module.css';
import HeadingTitle from '@/components/heading/headingtitle';

interface Admission {
    admission_number: ReactNode;
    id: string;
    child_first_name?: string;
    childFirstName?: string;
    child_name?: string;
    child_dob: string;
    dateOfBirth?: string;
    child_gender: string;
    gender?: string;
    child_place_of_birth: string;
    placeOfBirth?: string;
    parent_name?: string;
    parentFirstName?: string;
    parentLastName?: string;
    parent_first_name?: string;
    parent_last_name?: string;
    parent_mobile_number?: string;
    parentMobile?: string;
    parent_email?: string;
    parentEmail?: string;
    program_name?: string;
    program?: string;
    previous_school?: string;
    previousSchool?: string;
    status: 'In Review' | 'Reviewed' | 'Interview Scheduled' | 'Confirmed' | 'Rejected';
    notes?: string;
    created_at: string;
    photo_url?: string | null;
    birth_certificate_url?: string | null;
    aadhar_card_url?: string | null;
    parent_id_proof_url?: string | null;
}

interface StatusCard {
    label: string;
    count: number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    status: 'In Review' | 'Reviewed' | 'Interview Scheduled' | 'Confirmed' | 'Rejected';
    id: string;
}

type SortField = 'created_at' | 'child_name' | 'status' | 'program_name';
type SortOrder = 'asc' | 'desc';

const getGoogleDriveURL = (url: string, type: 'image' | 'pdf' | 'document') => {
    if (!url) return url;

    let fileId = '';

    if (url.includes('id=')) {
        fileId = url.split('id=')[1]?.split('&')[0];
    } else if (url.includes('/d/')) {
        fileId = url.split('/d/')[1]?.split('/')[0];
    } else if (url.includes('drive.google.com')) {
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match) fileId = match[1];
    }

    if (!fileId) return url;

    if (type === 'image') {
        return `/api/proxy-drive-file?id=${fileId}&type=view`;
    } else if (type === 'pdf') {
        return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

const getChildName = (admission: Admission): string => {
    return admission.child_first_name || admission.childFirstName || admission.child_name || 'N/A';
};

const getParentName = (admission: Admission): string => {
    const firstName = admission.parent_first_name || admission.parentFirstName || '';
    const lastName = admission.parent_last_name || admission.parentLastName || '';
    return `${firstName} ${lastName}`.trim() || admission.parent_name || 'N/A';
};

const getParentEmail = (admission: Admission): string => {
    return admission.parent_email || admission.parentEmail || 'N/A';
};

const getParentMobile = (admission: Admission): string => {
    return admission.parent_mobile_number || admission.parentMobile || 'N/A';
};

const getProgram = (admission: Admission): string => {
    return admission.program_name || admission.program || 'N/A';
};

const STATUS_OPTIONS: Array<'In Review' | 'Reviewed' | 'Interview Scheduled' | 'Confirmed' | 'Rejected'> = [
    'In Review',
    'Reviewed',
    'Interview Scheduled',
    'Confirmed',
    'Rejected',
];

const STATUS_COLORS: Record<string, { color: string; bgColor: string }> = {
    'In Review': { color: '#3b82f6', bgColor: '#eff6ff' },
    'Reviewed': { color: '#f59e0b', bgColor: '#fffbf0' },
    'Interview Scheduled': { color: '#8b5cf6', bgColor: '#faf5ff' },
    'Confirmed': { color: '#10b981', bgColor: '#f0fdf4' },
    'Rejected': { color: '#ef4444', bgColor: '#fef2f2' },
};

export default function AdminAdmission() {
    const [admissions, setAdmissions] = useState<Admission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'In Review' | 'Reviewed' | 'Interview Scheduled' | 'Confirmed' | 'Rejected'>('all');
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
    const [noteText, setNoteText] = useState('');
    const [previewModal, setPreviewModal] = useState<{ url: string; type: 'image' | 'pdf' | 'document'; name: string } | null>(null);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [notesUpdating, setNotesUpdating] = useState(false);

    useEffect(() => {
        fetchAdmissions();
    }, []);

    const fetchAdmissions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('admission')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setAdmissions(data || []);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to fetch admissions');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <FaSort />;
        return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
    };

    const sortedAndFilteredAdmissions = admissions
        .filter(admission => {
            const childName = getChildName(admission).toLowerCase();
            const parentName = getParentName(admission).toLowerCase();
            const email = getParentEmail(admission).toLowerCase();
            const mobile = getParentMobile(admission);

            const matchesSearch =
                childName.includes(searchTerm.toLowerCase()) ||
                parentName.includes(searchTerm.toLowerCase()) ||
                email.includes(searchTerm.toLowerCase()) ||
                mobile.includes(searchTerm);

            const matchesFilter = filter === 'all' || admission.status === filter;

            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            if (sortField === 'created_at') {
                return sortOrder === 'asc'
                    ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            const aVal = sortField === 'child_name' ? getChildName(a) : sortField === 'program_name' ? getProgram(a) : a.status;
            const bVal = sortField === 'child_name' ? getChildName(b) : sortField === 'program_name' ? getProgram(b) : b.status;
            return sortOrder === 'asc'
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });

    const statusCounts = {
        total: admissions.length,
        'In Review': admissions.filter((a) => a.status === 'In Review').length,
        'Reviewed': admissions.filter((a) => a.status === 'Reviewed').length,
        'Interview Scheduled': admissions.filter((a) => a.status === 'Interview Scheduled').length,
        'Confirmed': admissions.filter((a) => a.status === 'Confirmed').length,
        'Rejected': admissions.filter((a) => a.status === 'Rejected').length,
    };

    const statusCards: StatusCard[] = [
        {
            label: 'Total Applications',
            count: statusCounts.total,
            icon: <FaUser />,
            color: '#6a4c93',
            bgColor: '#f3e8ff',
            status: 'In Review',
            id: 'total',
        },
        {
            label: 'In Review',
            count: statusCounts['In Review'],
            icon: <FaFileAlt />,
            color: '#3b82f6',
            bgColor: '#eff6ff',
            status: 'In Review',
            id: 'in-review',
        },
        {
            label: 'Reviewed',
            count: statusCounts['Reviewed'],
            icon: <FaCheckCircle />,
            color: '#f59e0b',
            bgColor: '#fffbf0',
            status: 'Reviewed',
            id: 'reviewed',
        },
        {
            label: 'Interview Scheduled',
            count: statusCounts['Interview Scheduled'],
            icon: <FaClock />,
            color: '#8b5cf6',
            bgColor: '#faf5ff',
            status: 'Interview Scheduled',
            id: 'interview-scheduled',
        },
        {
            label: 'Confirmed',
            count: statusCounts['Confirmed'],
            icon: <FaCheck />,
            color: '#10b981',
            bgColor: '#f0fdf4',
            status: 'Confirmed',
            id: 'confirmed',
        },
        {
            label: 'Rejected',
            count: statusCounts['Rejected'],
            icon: <FaTimes />,
            color: '#ef4444',
            bgColor: '#fef2f2',
            status: 'Rejected',
            id: 'rejected',
        },
    ];

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

    const handleStatusChange = async (id: string, newStatus: Admission['status']) => {
        try {
            setStatusUpdating(true);
            const { error } = await supabase
                .from('admission')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setAdmissions((prev) =>
                prev.map((adm) =>
                    adm.id === id ? { ...adm, status: newStatus } : adm
                )
            );
            if (selectedAdmission?.id === id) {
                setSelectedAdmission({ ...selectedAdmission, status: newStatus });
            }
            toast.success('Status updated successfully');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to update status');
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleNotesOpen = (admission: Admission) => {
        setSelectedAdmission(admission);
        setNoteText(admission.notes || '');
    };

    const handleNotesSave = async (id: string) => {
        try {
            setNotesUpdating(true);
            const { error } = await supabase
                .from('admission')
                .update({ notes: noteText })
                .eq('id', id);

            if (error) throw error;

            setAdmissions((prev) =>
                prev.map((adm) =>
                    adm.id === id ? { ...adm, notes: noteText } : adm
                )
            );
            if (selectedAdmission?.id === id) {
                setSelectedAdmission({ ...selectedAdmission, notes: noteText });
            }
            toast.success('Notes saved successfully');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to save notes');
        } finally {
            setNotesUpdating(false);
        }
    };

    const handleCloseModal = () => {
        setSelectedAdmission(null);
        setNoteText('');
    };

    return (
        <div className={styles.dashboardWrapper}>
            <HeadingTitle text="Admission Dashboard" />

            <motion.div
                className={styles.statusCardsSection}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {statusCards.map((card) => (
                    <motion.div key={card.id} variants={itemVariants}>
                        <StatusCardComponent
                            card={card}
                            filter={filter}
                            setFilter={setFilter}
                        />
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
                                placeholder="Search by child name, parent name, email or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className={styles.filterSelect}
                        >
                            <option value="all">All Status</option>
                            <option value="In Review">In Review</option>
                            <option value="Reviewed">Reviewed</option>
                            <option value="Interview Scheduled">Interview Scheduled</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>
                                    Application No.
                                </th>
                                <th onClick={() => handleSort('created_at')}>
                                    Date {getSortIcon('created_at')}
                                </th>

                                <th onClick={() => handleSort('child_name')}>
                                    Child Name {getSortIcon('child_name')}
                                </th>
                                <th>Parent</th>
                                <th>Contact</th>
                                <th onClick={() => handleSort('program_name')}>
                                    Program {getSortIcon('program_name')}
                                </th>
                                <th>Notes</th>
                                <th onClick={() => handleSort('status')}>
                                    Status {getSortIcon('status')}
                                </th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className={styles.loading}>
                                        <FaSpinner className={styles.loadingIcon} /> Loading admissions...
                                    </td>
                                </tr>
                            ) : sortedAndFilteredAdmissions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className={styles.noResults}>
                                        No admissions found
                                    </td>
                                </tr>
                            ) : (
                                sortedAndFilteredAdmissions.map((admission) => (
                                    <motion.tr
                                        key={admission.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <td>
                                            {admission.admission_number}
                                        </td>
                                        <td>
                                            {new Date(admission.created_at).toLocaleDateString('en-US', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td>{getChildName(admission)}</td>
                                        <td>{getParentName(admission)}</td>
                                        <td>
                                            <div className={styles.contactLinks}>
                                                <span>{getParentMobile(admission)}</span>
                                                <a
                                                    href={`tel:${getParentMobile(admission)}`}
                                                    className={styles.phoneLink}
                                                    title="Call"
                                                >
                                                    <FaPhoneAlt />
                                                </a>
                                                <a
                                                    href={`https://wa.me/${getParentMobile(admission).replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.whatsappLink}
                                                    title="WhatsApp"
                                                >
                                                    <FaWhatsapp />
                                                </a>
                                            </div>
                                        </td>
                                        <td>{getProgram(admission)}</td>
                                        <td>
                                            <button
                                                className={`${styles.notesBtn} ${admission.notes ? styles.hasNotes : ''}`}
                                                onClick={() => handleNotesOpen(admission)}
                                                title={admission.notes ? admission.notes : 'Add note'}
                                            >
                                                <FaStickyNote />
                                                {admission.notes && <span className={styles.notesIndicator}></span>}
                                            </button>
                                        </td>
                                        <td>
                                            <span className={`${styles.status}}`}>
                                                {admission.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className={styles.viewBtn}
                                                onClick={() => handleNotesOpen(admission)}
                                                title="View Details"
                                            >
                                                <FaEye /> View
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            <AdmissionDetailsModal
                isOpen={selectedAdmission !== null}
                onClose={handleCloseModal}
                admission={selectedAdmission}
                noteText={noteText}
                setNoteText={setNoteText}
                onSaveNote={() => handleNotesSave(selectedAdmission?.id || '')}
                onStatusChange={handleStatusChange}
                onPreview={setPreviewModal}
                loading={statusUpdating || notesUpdating}
            />

            {/* Document Preview Modal */}
            <DocumentPreviewModal
                isOpen={previewModal !== null}
                onClose={() => setPreviewModal(null)}
                preview={previewModal}
            />
        </div>
    );
}

const StatusCardComponent = ({
    card,
    filter,
    setFilter,
}: {
    card: StatusCard;
    filter: string;
    setFilter: (filter: any) => void;
}) => {
    return (
        <motion.div
            className={`${styles.statusCard} ${filter === card.status ? styles.active : ''}`}
            whileHover={{ translateY: -6, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
            onClick={() => setFilter(card.status === 'In Review' ? 'all' : card.status)}
            style={{ cursor: 'pointer' }}
        >
            <div
                className={styles.statusCardBg}
                style={{ backgroundColor: card.bgColor }}
            ></div>
            <div className={styles.statusCardContent}>
                <div className={styles.statusCardHeader}>
                    <div
                        className={styles.statusCardIcon}
                        style={{ color: card.color, backgroundColor: card.bgColor }}
                    >
                        {card.icon}
                    </div>
                    {card.status !== 'In Review' && (
                        <div
                            className={styles.statusCardDot}
                            style={{ backgroundColor: card.color }}
                        ></div>
                    )}
                </div>
                <div className={styles.statusCardBody}>
                    <motion.div
                        className={styles.statusCardCount}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                        style={{ color: card.color }}
                    >
                        {card.count}
                    </motion.div>
                    <p className={styles.statusCardLabel}>{card.label}</p>
                </div>
            </div>
        </motion.div>
    );
};

const AdmissionDetailsModal = ({
    isOpen,
    onClose,
    admission,
    noteText,
    setNoteText,
    onSaveNote,
    onStatusChange,
    onPreview,
    loading,
}: {
    isOpen: boolean;
    onClose: () => void;
    admission: Admission | null;
    noteText: string;
    setNoteText: (text: string) => void;
    onSaveNote: () => void;
    onStatusChange: (id: string, status: Admission['status']) => void;
    onPreview: (preview: { url: string; type: 'image' | 'pdf' | 'document'; name: string }) => void;
    loading: boolean;
}) => {
    if (!admission) return null;

    const childName = getChildName(admission);
    const parentName = getParentName(admission);
    const parentEmail = getParentEmail(admission);

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
                        className={styles.modal}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <div className={styles.modalHeader}>
                            <div>
                                <h2>Admission Details</h2>
                                <p>{childName} • {parentName}</p>
                                <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.5rem' }}>
                                    {new Date(admission.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                className={styles.closeBtn}
                                onClick={onClose}
                                aria-label="Close"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className={styles.modalContent}>
                            <div className={styles.detailsGrid}>
                                <DetailItem label="Child Name" value={childName} />
                                <DetailItem label="Date of Birth" value={admission.child_dob} />
                                <DetailItem label="Gender" value={admission.child_gender} />
                                <DetailItem label="Place of Birth" value={admission.child_place_of_birth} />
                                <DetailItem label="Parent Name" value={parentName} />
                                <DetailItem label="Email" value={parentEmail} />
                                <DetailItem label="Mobile" value={getParentMobile(admission)} />
                                <DetailItem label="Program" value={getProgram(admission)} />
                                <DetailItem label="Previous School" value={admission.previous_school || 'N/A'} />
                            </div>

                            <div className={styles.statusSection}>
                                <label className={styles.sectionLabel}>Change Status</label>
                                <select
                                    value={admission.status}
                                    onChange={(e) => onStatusChange(admission.id, e.target.value as Admission['status'])}
                                    className={styles.statusSelect}
                                    disabled={loading}
                                >
                                    <option value="In Review">In Review</option>
                                    <option value="Reviewed">Reviewed</option>
                                    <option value="Interview Scheduled">Interview Scheduled</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>

                            <div className={styles.notesSection}>
                                <label className={styles.sectionLabel}>Internal Notes</label>
                                <textarea
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    placeholder="Add internal notes here..."
                                    className={styles.noteTextarea}
                                    rows={5}
                                    disabled={loading}
                                />
                            </div>

                            <div className={styles.documentsSection}>
                                <label className={styles.sectionLabel}>Documents</label>
                                <div className={styles.documentsList}>
                                    {admission.photo_url && (
                                        <DocumentListItem
                                            name="Child Photo"
                                            onPreview={() =>
                                                onPreview({
                                                    url: admission.photo_url!,
                                                    type: 'image',
                                                    name: 'Child Photo',
                                                })
                                            }
                                            onDownload={admission.photo_url}
                                        />
                                    )}
                                    {admission.birth_certificate_url && (
                                        <DocumentListItem
                                            name="Birth Certificate"
                                            onPreview={() =>
                                                onPreview({
                                                    url: admission.birth_certificate_url!,
                                                    type: 'pdf',
                                                    name: 'Birth Certificate',
                                                })
                                            }
                                            onDownload={admission.birth_certificate_url}
                                        />
                                    )}
                                    {admission.aadhar_card_url && (
                                        <DocumentListItem
                                            name="Aadhar Card"
                                            onPreview={() =>
                                                onPreview({
                                                    url: admission.aadhar_card_url!,
                                                    type: 'pdf',
                                                    name: 'Aadhar Card',
                                                })
                                            }
                                            onDownload={admission.aadhar_card_url}
                                        />
                                    )}
                                    {admission.parent_id_proof_url && (
                                        <DocumentListItem
                                            name="Parent ID Proof"
                                            onPreview={() =>
                                                onPreview({
                                                    url: admission.parent_id_proof_url!,
                                                    type: 'pdf',
                                                    name: "Parent's ID Proof",
                                                })
                                            }
                                            onDownload={admission.parent_id_proof_url}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.cancelBtn}
                                onClick={onClose}
                                disabled={loading}
                            >
                                <FaTimes /> Close
                            </button>
                            <button
                                className={styles.saveBtn}
                                onClick={onSaveNote}
                                disabled={loading || noteText === (admission.notes || '')}
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className={styles.spinner} /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <FaCheck /> Save Notes
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
    <div className={styles.detailItem}>
        <span className={styles.detailLabel}>{label}</span>
        <span className={styles.detailValue}>{value}</span>
    </div>
);

const DocumentListItem = ({
    name,
    onPreview,
    onDownload,
}: {
    name: string;
    onPreview: () => void;
    onDownload: string;
}) => (
    <div className={styles.documentItem}>
        <FaFileAlt className={styles.documentIcon} />
        <span className={styles.documentName}>{name}</span>
        <button className={styles.docBtn} onClick={onPreview} title="Preview">
            <FaEye />
        </button>
        <a href={onDownload} download target="_blank" rel="noopener noreferrer" className={styles.docBtn} title="Download">
            <FaDownload />
        </a>
    </div>
);

const DocumentPreviewModal = ({
    isOpen,
    onClose,
    preview,
}: {
    isOpen: boolean;
    onClose: () => void;
    preview: { url: string; type: 'image' | 'pdf' | 'document'; name: string } | null;
}) => {
    if (!preview) return null;

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
                        className={styles.modal}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <div className={styles.modalHeader}>
                            <div>
                                <h2>Document Preview</h2>
                                <p>{preview.name}</p>
                            </div>
                            <button
                                className={styles.closeBtn}
                                onClick={onClose}
                                aria-label="Close"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className={styles.previewContent}>
                            {preview.type === 'image' ? (
                                <img
                                    src={getGoogleDriveURL(preview.url, 'image')}
                                    alt={preview.name}
                                    className={styles.previewImage}
                                    onError={() => toast.error('Failed to load image preview')}
                                />
                            ) : preview.type === 'pdf' ? (
                                <iframe
                                    src={getGoogleDriveURL(preview.url, 'pdf')}
                                    title="PDF Preview"
                                    className={styles.previewIframe}
                                />
                            ) : (
                                <div className={styles.previewPlaceholder}>
                                    <p>Unable to preview this document type.</p>
                                </div>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <a
                                href={getGoogleDriveURL(preview.url, 'document')}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.downloadLink}
                            >
                                <FaDownload /> Download
                            </a>
                            <button className={styles.cancelBtn} onClick={onClose}>
                                <FaTimes /> Close
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};