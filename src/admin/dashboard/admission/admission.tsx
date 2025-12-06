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
    FaHistory,
    FaTrash,
    FaChevronLeft,
    FaChevronRight,
} from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import styles from './admission.module.css';
import HeadingTitle from '@/components/heading/headingtitle';
import Loader from '@/custom/loader/loader';
import { DownloadModal } from '../download/DownloadData';



interface NoteEntry {
    text: string;
    timestamp: string;
    id: string;
}

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
    admission_status: 'In Review' | 'Reviewed' | 'Interview Scheduled' | 'Confirmed' | 'Rejected';
    notes?: NoteEntry[] | null;
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

type SortField = 'created_at' | 'child_name' | 'admission_status' | 'program_name';
type SortOrder = 'asc' | 'desc';
type ItemsPerPage = 20 | 50 | 100;



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

const getStatus = (admission: Admission): Admission['admission_status'] => {
    return admission.admission_status || 'In Review';
};

export default function AdminAdmission() {
    const [admissions, setAdmissions] = useState<Admission[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageLoading, setPageLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'In Review' | 'Reviewed' | 'Interview Scheduled' | 'Confirmed' | 'Rejected'>('all');
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // ✨ PAGINATION STATE ✨
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(20);

    // Notes Modal State
    const [notesModalOpen, setNotesModalOpen] = useState(false);
    const [selectedAdmissionIdForNotes, setSelectedAdmissionIdForNotes] = useState<string | null>(null);
    const [newNoteText, setNewNoteText] = useState('');
    const [noteEntries, setNoteEntries] = useState<NoteEntry[]>([]);
    const [savingNote, setSavingNote] = useState(false);
    const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

    // Details Modal State
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedAdmissionIdForDetails, setSelectedAdmissionIdForDetails] = useState<string | null>(null);
    const [previewModal, setPreviewModal] = useState<{ url: string; type: 'image' | 'pdf' | 'document'; name: string } | null>(null);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const [downloadModalOpen, setDownloadModalOpen] = useState(false);


    useEffect(() => {
        const initializePage = async () => {
            setPageLoading(true);
            await fetchAdmissions();
            setPageLoading(false);
        };
        initializePage();
    }, []);

    // ✨ RESET TO PAGE 1 WHEN FILTER/SEARCH CHANGES ✨
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filter]);

    const fetchAdmissions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('admission')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;

            const processedData = (data || []).map((admission: any) => {
                let notes: NoteEntry[] = [];

                if (admission.notes && Array.isArray(admission.notes)) {
                    notes = admission.notes as NoteEntry[];
                } else if (typeof admission.notes === 'string') {
                    try {
                        notes = JSON.parse(admission.notes);
                    } catch (e) {
                        console.error('Error parsing notes:', e);
                        notes = [];
                    }
                }

                return {
                    ...admission,
                    notes: notes.length > 0 ? notes : null,
                };
            });

            setAdmissions(processedData);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to fetch admissions');
        } finally {
            setLoading(false);
        }
    };

    const handleAdmissionDownload = (startDate: Date, endDate: Date) => {
        return admissions.filter((admission) => {
            const admissionDate = new Date(admission.created_at);
            return admissionDate >= startDate && admissionDate <= endDate;
        });
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

    const sortedAndFilteredAdmissions = admissions
        .filter(admission => {
            const childName = getChildName(admission).toLowerCase();
            const parentName = getParentName(admission).toLowerCase();
            const email = getParentEmail(admission).toLowerCase();
            const mobile = getParentMobile(admission);
            const admissionNumber = String(admission.admission_number).toLowerCase();

            const matchesSearch =
                childName.includes(searchTerm.toLowerCase()) ||
                parentName.includes(searchTerm.toLowerCase()) ||
                email.includes(searchTerm.toLowerCase()) ||
                admissionNumber.includes(searchTerm.toLowerCase()) ||
                mobile.includes(searchTerm);

            const matchesFilter = filter === 'all' || getStatus(admission) === filter;

            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            if (sortField === 'created_at') {
                return sortOrder === 'asc'
                    ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            const aVal = sortField === 'child_name' ? getChildName(a) : sortField === 'program_name' ? getProgram(a) : getStatus(a);
            const bVal = sortField === 'child_name' ? getChildName(b) : sortField === 'program_name' ? getProgram(b) : getStatus(b);
            return sortOrder === 'asc'
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });

    // ✨ PAGINATION LOGIC ✨
    const totalPages = Math.ceil(sortedAndFilteredAdmissions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAdmissions = sortedAndFilteredAdmissions.slice(startIndex, endIndex);

    const statusCounts = {
        total: admissions.length,
        'In Review': admissions.filter((a) => getStatus(a) === 'In Review').length,
        'Reviewed': admissions.filter((a) => getStatus(a) === 'Reviewed').length,
        'Interview Scheduled': admissions.filter((a) => getStatus(a) === 'Interview Scheduled').length,
        'Confirmed': admissions.filter((a) => getStatus(a) === 'Confirmed').length,
        'Rejected': admissions.filter((a) => getStatus(a) === 'Rejected').length,
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

    const handleStatusChange = async (id: string, newStatus: Admission['admission_status']) => {
        try {
            setStatusUpdating(true);
            setUpdatingId(id);

            console.log('🔄 Updating status for admission:', id, 'to:', newStatus);

            const { data, error } = await supabase
                .from('admission')
                .update({ admission_status: newStatus })
                .eq('id', id)
                .select();

            if (error) {
                console.error('❌ Supabase error:', error);
                toast.error(`Failed: ${error.message || 'Unknown error'}`);
                return;
            }

            if (!data || data.length === 0) {
                console.warn('⚠️ No rows updated.');
                toast.error('Status not updated. Check permissions.');
                return;
            }

            console.log('✅ Status updated successfully.');

            setAdmissions((prev) =>
                prev.map((adm) =>
                    adm.id === id ? { ...adm, admission_status: newStatus } : adm
                )
            );

            toast.success(`✅ Status changed to ${newStatus}`);
        } catch (error: any) {
            console.error('❌ Error:', error);
            toast.error(`Error: ${error?.message || 'Unknown error'}`);
        } finally {
            setStatusUpdating(false);
            setUpdatingId(null);
        }
    };

    // ✨ NOTES MODAL FUNCTIONS ✨
    const openNotesModal = (admission: Admission) => {
        setSelectedAdmissionIdForNotes(admission.id);
        setNoteEntries(admission.notes || []);
        setNewNoteText('');
        setNotesModalOpen(true);
    };

    const closeNotesModal = () => {
        setNotesModalOpen(false);
        setSelectedAdmissionIdForNotes(null);
        setNoteEntries([]);
        setNewNoteText('');
        setDeletingNoteId(null);
    };

    const saveNewNote = async () => {
        if (!selectedAdmissionIdForNotes) {
            toast.error('Please select an admission first');
            return;
        }

        if (!newNoteText.trim()) {
            toast.error('Please enter a note');
            return;
        }

        try {
            setSavingNote(true);

            const newEntry: NoteEntry = {
                id: Date.now().toString(),
                text: newNoteText.trim(),
                timestamp: new Date().toISOString(),
            };

            const updatedNotes = [...noteEntries, newEntry];

            const { error, data } = await supabase
                .from('admission')
                .update({
                    notes: updatedNotes,
                })
                .eq('id', selectedAdmissionIdForNotes)
                .select('id, notes');

            if (error) {
                throw error;
            }

            setAdmissions((prev) =>
                prev.map((admission) =>
                    admission.id === selectedAdmissionIdForNotes
                        ? {
                            ...admission,
                            notes: updatedNotes,
                        }
                        : admission
                )
            );

            setNoteEntries(updatedNotes);
            setNewNoteText('');
            toast.success('✨ Note saved successfully!');
        } catch (error) {
            console.error('Error saving note:', error);
            toast.error('Failed to save note.');
        } finally {
            setSavingNote(false);
        }
    };

    const deleteNoteEntry = async (noteId: string) => {
        if (!selectedAdmissionIdForNotes) {
            toast.error('Please select an admission first');
            return;
        }

        try {
            setDeletingNoteId(noteId);

            const updatedNotes = noteEntries.filter((entry) => entry.id !== noteId);

            const { error } = await supabase
                .from('admission')
                .update({
                    notes: updatedNotes.length > 0 ? updatedNotes : null,
                })
                .eq('id', selectedAdmissionIdForNotes)
                .select('id, notes');

            if (error) {
                throw error;
            }

            setNoteEntries(updatedNotes);

            setAdmissions((prev) =>
                prev.map((admission) =>
                    admission.id === selectedAdmissionIdForNotes
                        ? {
                            ...admission,
                            notes: updatedNotes.length > 0 ? updatedNotes : null,
                        }
                        : admission
                )
            );

            toast.success('✅ Note deleted successfully');
        } catch (error) {
            console.error('Error deleting note:', error);
            toast.error('Failed to delete note.');
        } finally {
            setDeletingNoteId(null);
        }
    };

    // ✨ DETAILS MODAL FUNCTIONS ✨
    const openDetailsModal = (admission: Admission) => {
        setSelectedAdmissionIdForDetails(admission.id);
        setDetailsModalOpen(true);
    };

    const closeDetailsModal = () => {
        setDetailsModalOpen(false);
        setSelectedAdmissionIdForDetails(null);
    };

    const formatTimestamp = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        } catch (e) {
            console.error('Error formatting timestamp:', e);
            return timestamp;
        }
    };

    // ✨ HANDLE ITEMS PER PAGE CHANGE ✨
    const handleItemsPerPageChange = (value: ItemsPerPage) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    };

    // ✨ HANDLE PAGE CHANGE ✨
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            const tableElement = document.querySelector(`.${styles.tableWrapper}`);
            if (tableElement) {
                tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    if (pageLoading) {
        return <Loader isVisible={true} message="Loading Admissions..." fullScreen={true} />;
    }

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
                                placeholder="Search by child name, admission no., parent name, email or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <motion.button
                            className={styles.downloadBtn}
                            onClick={() => setDownloadModalOpen(true)}
                            title="Download admission data"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaDownload /> Download Data
                        </motion.button>
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
                                <th>Application No.</th>
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
                                <th onClick={() => handleSort('admission_status')}>
                                    Status {getSortIcon('admission_status')}
                                </th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className={styles.loading}>
                                        <FaSpinner className={styles.loadingIcon} /> Loading admissions...
                                    </td>
                                </tr>
                            ) : sortedAndFilteredAdmissions.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className={styles.noResults}>
                                        No admissions found
                                    </td>
                                </tr>
                            ) : (
                                paginatedAdmissions.map((admission) => (
                                    <motion.tr
                                        key={admission.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <td>{admission.admission_number}</td>
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
                                                className={`${styles.notesBtn} ${admission.notes && admission.notes.length > 0 ? styles.hasNotes : ''}`}
                                                onClick={() => openNotesModal(admission)}
                                                title={admission.notes && admission.notes.length > 0 ? `${admission.notes.length} notes` : 'Add note'}
                                            >
                                                <FaStickyNote />
                                                {admission.notes && admission.notes.length > 0 && (
                                                    <span className={styles.notesIndicator}>{admission.notes.length}</span>
                                                )}
                                            </button>
                                        </td>
                                        <td>
                                            <select
                                                value={getStatus(admission)}
                                                onChange={(e) => handleStatusChange(admission.id, e.target.value as Admission['admission_status'])}
                                                disabled={updatingId === admission.id}
                                                className={styles.statusDropdown}
                                            >
                                                <option value="In Review">In Review</option>
                                                <option value="Reviewed">Reviewed</option>
                                                <option value="Interview Scheduled">Interview Scheduled</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                            {updatingId === admission.id && (
                                                <FaSpinner
                                                    className={styles.statusSpinner}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className={styles.viewBtn}
                                                onClick={() => openDetailsModal(admission)}
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

                {/* ✨ PAGINATION SECTION ✨ */}
                {sortedAndFilteredAdmissions.length > 0 && (
                    <div className={styles.paginationSection}>
                        <div className={styles.paginationInfo}>
                            <p className={styles.paginationText}>
                                Showing <strong>{startIndex + 1}</strong> to{' '}
                                <strong>{Math.min(endIndex, sortedAndFilteredAdmissions.length)}</strong> of{' '}
                                <strong>{sortedAndFilteredAdmissions.length}</strong> admissions
                            </p>
                        </div>

                        <div className={styles.paginationControls}>
                            {/* Items Per Page Selector */}
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

                            {/* Pagination Buttons */}
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

                            {/* Page Info */}
                            <div className={styles.pageInfo}>
                                <p>
                                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Notes Modal */}
            <NotesModal
                isOpen={notesModalOpen}
                onClose={closeNotesModal}
                noteEntries={noteEntries}
                newNoteText={newNoteText}
                setNewNoteText={setNewNoteText}
                onSaveNewNote={saveNewNote}
                onDeleteNote={deleteNoteEntry}
                admission={admissions.find(a => a.id === selectedAdmissionIdForNotes)}
                formatTimestamp={formatTimestamp}
                savingNote={savingNote}
                deletingNoteId={deletingNoteId}
            />

            {/* Details Modal */}
            <DetailsModal
                isOpen={detailsModalOpen}
                onClose={closeDetailsModal}
                admission={admissions.find(a => a.id === selectedAdmissionIdForDetails)}
                onStatusChange={handleStatusChange}
                onPreview={setPreviewModal}
                statusUpdating={statusUpdating}
                updatingId={updatingId}
            />

            {/* Document Preview Modal */}
            <DocumentPreviewModal
                isOpen={previewModal !== null}
                onClose={() => setPreviewModal(null)}
                preview={previewModal}
            />

            <DownloadModal
                isOpen={downloadModalOpen}
                onClose={() => setDownloadModalOpen(false)}
                data={admissions}
                columns={[
                    { key: 'admission_number', label: 'Admission Number' },
                    { key: 'created_at', label: 'Date' },
                    { key: 'child_name', label: 'Child Name' },
                    { key: 'child_dob', label: 'Date of Birth' },
                    { key: 'child_gender', label: 'Gender' },
                    { key: 'child_place_of_birth', label: 'Place of Birth' },
                    { key: 'parent_name', label: 'Parent Name' },
                    { key: 'parent_email', label: 'Email' },
                    { key: 'parent_mobile_number', label: 'Mobile' },
                    { key: 'program_name', label: 'Program' },
                    { key: 'previous_school', label: 'Previous School' },
                    { key: 'admission_status', label: 'Status' },
                ]}
                fileName="Admissions_Export"
                defaultMonths="6"
                onDateRangeChange={handleAdmissionDownload}
                title="Download Admissions Data"
                description="Select a date range and format to download your admission records"
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

// ✨ NOTES MODAL COMPONENT ✨
const NotesModal = ({
    isOpen,
    onClose,
    noteEntries,
    newNoteText,
    setNewNoteText,
    onSaveNewNote,
    onDeleteNote,
    admission,
    formatTimestamp,
    savingNote,
    deletingNoteId,
}: {
    isOpen: boolean;
    onClose: () => void;
    noteEntries: NoteEntry[];
    newNoteText: string;
    setNewNoteText: (text: string) => void;
    onSaveNewNote: () => void;
    onDeleteNote: (noteId: string) => void;
    admission?: Admission;
    formatTimestamp: (timestamp: string) => string;
    savingNote?: boolean;
    deletingNoteId?: string | null;
}) => {
    const isProcessing = savingNote || !!deletingNoteId;
    const childName = getChildName(admission || {} as Admission);
    const parentName = getParentName(admission || {} as Admission);

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
                        className={styles.notesModal}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <div className={styles.modalHeader}>
                            <div>
                                <h2>📝 Internal Notes</h2>
                                <p>{childName} • {parentName}</p>
                                {noteEntries.length > 0 && (
                                    <p className={styles.notesCount}>
                                        <FaHistory /> {noteEntries.length} note{noteEntries.length !== 1 ? 's' : ''} saved
                                    </p>
                                )}
                            </div>
                            <button
                                className={styles.closeBtn}
                                onClick={onClose}
                                aria-label="Close"
                                disabled={isProcessing}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className={styles.modalContent}>
                            {/* Notes History Section */}
                            {noteEntries.length > 0 && (
                                <div className={styles.notesHistory}>
                                    <h3 className={styles.notesHistoryTitle}>
                                        <FaHistory /> Note History
                                    </h3>
                                    <div className={styles.notesList}>
                                        <AnimatePresence>
                                            {noteEntries.map((entry, index) => (
                                                <motion.div
                                                    key={entry.id}
                                                    className={styles.noteEntry}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    layout
                                                >
                                                    <div className={styles.noteEntryHeader}>
                                                        <span className={styles.noteNumber}>Note #{index + 1}</span>
                                                        <span className={styles.noteTimestamp}>
                                                            🕒 {formatTimestamp(entry.timestamp)}
                                                        </span>
                                                        <motion.button
                                                            type="button"
                                                            className={styles.deleteNoteBtn}
                                                            onClick={() => onDeleteNote(entry.id)}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            title="Delete note"
                                                            disabled={!!deletingNoteId}
                                                        >
                                                            {deletingNoteId === entry.id ? (
                                                                <FaSpinner className={styles.spinnerIcon} />
                                                            ) : (
                                                                <FaTrash />
                                                            )}
                                                        </motion.button>
                                                    </div>
                                                    <div className={styles.notesModalLining}></div>
                                                    <div className={styles.noteEntryContent}>
                                                        <p>{entry.text}</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}

                            {/* Divider */}
                            {noteEntries.length > 0 && (
                                <div className={styles.notesDivider}>
                                    <span>New Note</span>
                                </div>
                            )}

                            {/* New Note Input Section */}
                            <div className={styles.newNoteSection}>
                                <h3 className={styles.newNoteTitle}>
                                    ➕ Add New Note
                                </h3>
                                <textarea
                                    value={newNoteText}
                                    onChange={(e) => setNewNoteText(e.target.value)}
                                    placeholder="Write your internal notes here... e.g., 'Follow up on interview' or 'Additional documents required'"
                                    className={styles.noteTextarea}
                                    rows={6}
                                    disabled={isProcessing}
                                />
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.cancelBtn}
                                onClick={onClose}
                                disabled={isProcessing}
                            >
                                <FaTimes /> Close
                            </button>
                            <motion.button
                                className={styles.saveBtn}
                                onClick={onSaveNewNote}
                                disabled={!newNoteText.trim() || isProcessing}
                                whileHover={{ scale: !newNoteText.trim() || isProcessing ? 1 : 1.05 }}
                                whileTap={{ scale: !newNoteText.trim() || isProcessing ? 1 : 0.95 }}
                            >
                                {savingNote ? (
                                    <>
                                        <FaSpinner className={styles.loadingIcon} /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <FaCheck /> Save Note
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

// ✨ DETAILS MODAL COMPONENT ✨
const DetailsModal = ({
    isOpen,
    onClose,
    admission,
    onStatusChange,
    onPreview,
    statusUpdating,
}: {
    isOpen: boolean;
    onClose: () => void;
    admission?: Admission;
    onStatusChange: (id: string, status: Admission['admission_status']) => void;
    onPreview: (preview: { url: string; type: 'image' | 'pdf' | 'document'; name: string }) => void;
    statusUpdating: boolean;
    updatingId: string | null;
}) => {
    if (!admission) return null;

    const childName = getChildName(admission);
    const parentName = getParentName(admission);

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
                        className={styles.detailsModal}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <div className={styles.modalHeader}>
                            <div>
                                <h2>👤 Admission Details</h2>
                                <p>{childName} • {parentName}</p>
                            </div>
                            <button
                                className={styles.closeBtn}
                                onClick={onClose}
                                aria-label="Close"
                                disabled={statusUpdating}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className={styles.modalContent}>
                            {/* Details Grid */}
                            <div className={styles.detailsGrid}>
                                <DetailItem label="Child Name" value={childName} />
                                <DetailItem label="Date of Birth" value={admission.child_dob || 'N/A'} />
                                <DetailItem label="Gender" value={admission.child_gender || 'N/A'} />
                                <DetailItem label="Place of Birth" value={admission.child_place_of_birth || 'N/A'} />
                                <DetailItem label="Parent Name" value={parentName} />
                                <DetailItem label="Email" value={getParentEmail(admission)} />
                                <DetailItem label="Mobile" value={getParentMobile(admission)} />
                                <DetailItem label="Program" value={getProgram(admission)} />
                                <DetailItem label="Previous School" value={admission.previous_school || 'N/A'} />
                            </div>

                            {/* Status Section */}
                            <div className={styles.statusSection}>
                                <label className={styles.sectionLabel}>📊 Status</label>
                                <div className={styles.statusContainer}>
                                    <select
                                        value={getStatus(admission)}
                                        onChange={(e) => onStatusChange(admission.id, e.target.value as Admission['admission_status'])}
                                        className={styles.statusSelectModal}
                                        disabled={statusUpdating}
                                    >
                                        <option value="In Review">In Review</option>
                                        <option value="Reviewed">Reviewed</option>
                                        <option value="Interview Scheduled">Interview Scheduled</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                    {statusUpdating && (
                                        <div className={styles.updatingIndicator}>
                                            <FaSpinner className={styles.spinnerIcon} />
                                            <span>Updating...</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Documents Section */}
                            <div className={styles.documentsSection}>
                                <label className={styles.sectionLabel}>📄 Documents</label>
                                <div className={styles.documentsList}>
                                    {admission.photo_url ? (
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
                                    ) : (
                                        <p className={styles.noDocuments}>No photo uploaded</p>
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
                                disabled={statusUpdating}
                            >
                                <FaTimes /> Close
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const DetailItem = ({ label, value }: { label: string; value: string | ReactNode }) => (
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
                                <h2>📄 Document Preview</h2>
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