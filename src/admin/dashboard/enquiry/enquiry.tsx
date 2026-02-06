'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaSearch,
    FaPhoneAlt,
    FaSort,
    FaSortUp,
    FaSortDown,
    FaSpinner,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaUser,
    FaWhatsapp,
    FaStickyNote,
    FaTimes,
    FaCheck,
    FaHistory,
    FaTrash,
    FaChevronLeft,
    FaChevronRight,
    FaDownload
} from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import styles from './enquiry.module.css';
import HeadingTitle from '@/components/heading/headingtitle';
import Loader from '@/custom/loader/loader';
import { DownloadModal } from '../download/DownloadData';
import EditNoteIcon from '@mui/icons-material/EditNote';
import schoolDetailsEng from '@/json/schooldetails-eng';



interface NoteEntry {
    text: string;
    timestamp: string;
    id: string;
    userName?: string;
}

interface Enquiry {
    enquiry_number: string;
    id: string;
    parent_name: string;
    child_name: string;
    phone: string;
    program: string;
    status: 'new' | 'contacted' | 'enrolled' | 'cancelled';
    created_at: string;
    notes?: NoteEntry[] | null;
}

interface StatusCard {
    label: string;
    count: number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    status: 'new' | 'contacted' | 'enrolled' | 'cancelled';
    id: string;
}

type SortField = 'created_at' | 'child_name' | 'parent_name' | 'status';
type SortOrder = 'asc' | 'desc';
type ItemsPerPage = 20 | 50 | 100;

// Generate WhatsApp message based on status
const generateWhatsAppMessage = (enquiry: Enquiry): string => {
    const baseMessage = `Hi ${enquiry.parent_name || 'Parent'},\n`;
    
    switch (enquiry.status) {
        case 'new':
            return baseMessage + `Thank you for enquiring about our programs at ${schoolDetailsEng.name}. We will contact you soon with more information. 😊`;
        case 'contacted':
            return baseMessage + `We appreciate your interest in our school. Our admission team is reviewing your application and will be in touch shortly. 🙏`;
        case 'enrolled':
            return baseMessage + `Congratulations! 🎉 You have been successfully enrolled in our program for ${enquiry.program}. We look forward to welcoming your child!`;
        case 'cancelled':
            return baseMessage + `Thank you for your interest in Ditvi Play School. Feel free to reach out to us in the future if you'd like to learn more about our programs.`;
        default:
            return baseMessage + `Hello! Thank you for your interest in Ditvi Play School.`;
    }
};

const EnquiryDashboard = () => {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'enrolled' | 'cancelled'>('all');
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [notesModalOpen, setNotesModalOpen] = useState(false);
    const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);
    const [newNoteText, setNewNoteText] = useState('');
    const [noteEntries, setNoteEntries] = useState<NoteEntry[]>([]);
    const [isEditingNewNote, setIsEditingNewNote] = useState(false);
    const [savingNote, setSavingNote] = useState(false);
    const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

    // ✨ PAGINATION STATE ✨
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(20);

    const [downloadModalOpen, setDownloadModalOpen] = useState(false);


    useEffect(() => {
        fetchEnquiries();
    }, []);

    // ✨ RESET TO PAGE 1 WHEN FILTER/SEARCH CHANGES ✨
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filter]);

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('enquiries')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Fetch error:', error);
                throw error;
            }

            // ✨ PROCESS NOTES FROM JSONB COLUMN ✨
            const processedData = (data || []).map((enquiry: any) => {
                let notes: NoteEntry[] = [];

                if (enquiry.notes && Array.isArray(enquiry.notes)) {
                    notes = enquiry.notes as NoteEntry[];
                } else if (typeof enquiry.notes === 'string') {
                    try {
                        notes = JSON.parse(enquiry.notes);
                    } catch (e) {
                        console.error('Error parsing notes:', e);
                        notes = [];
                    }
                }

                return {
                    ...enquiry,
                    notes: notes.length > 0 ? notes : null,
                };
            });

            setEnquiries(processedData);
        } catch (error) {
            console.error('Error fetching enquiries:', error);
            toast.error('Failed to fetch enquiries');
            setEnquiries([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEnquiryDownload = (startDate: Date, endDate: Date) => {
        return enquiries.filter((enquiries) => {
            const admissionDate = new Date(enquiries.created_at);
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

    // ✨ FIXED FILTER WITH NULL CHECKING ✨
    const sortedAndFilteredEnquiries = enquiries
        .filter((enquiry) => {
            const matchesSearch =
                (enquiry.parent_name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
                (enquiry.child_name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
                (enquiry.phone?.toString() ?? '').includes(searchTerm);

            const matchesFilter = filter === 'all' || enquiry.status === filter;

            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            if (sortField === 'created_at') {
                return sortOrder === 'asc'
                    ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }

            const aValue = (a[sortField] ?? '').toString();
            const bValue = (b[sortField] ?? '').toString();

            return sortOrder === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        });

    // ✨ PAGINATION LOGIC ✨
    const totalPages = Math.ceil(sortedAndFilteredEnquiries.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedEnquiries = sortedAndFilteredEnquiries.slice(startIndex, endIndex);

    const statusCounts = {
        total: enquiries.length,
        new: enquiries.filter((e) => e.status === 'new').length,
        contacted: enquiries.filter((e) => e.status === 'contacted').length,
        enrolled: enquiries.filter((e) => e.status === 'enrolled').length,
        cancelled: enquiries.filter((e) => e.status === 'cancelled').length,
    };

    const statusCards: StatusCard[] = [
        {
            label: 'Total Enquiries',
            count: statusCounts.total,
            icon: <FaUser />,
            color: '#6a4c93',
            bgColor: '#f3e8ff',
            status: 'new',
            id: 'total',
        },
        {
            label: 'New',
            count: statusCounts.new,
            icon: <FaSpinner />,
            color: '#8662b0',
            bgColor: '#faf5ff',
            status: 'new',
            id: 'new',
        },
        {
            label: 'Contacted',
            count: statusCounts.contacted,
            icon: <FaClock />,
            color: '#ffbf00',
            bgColor: '#fffbf0',
            status: 'contacted',
            id: 'contacted',
        },
        {
            label: 'Enrolled',
            count: statusCounts.enrolled,
            icon: <FaCheckCircle />,
            color: '#10b981',
            bgColor: '#f0fdf4',
            status: 'enrolled',
            id: 'enrolled',
        },
        {
            label: 'Cancelled',
            count: statusCounts.cancelled,
            icon: <FaTimesCircle />,
            color: '#ef4444',
            bgColor: '#fef2f2',
            status: 'cancelled',
            id: 'cancelled',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.1 },
        },
    };
    enquiries
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    const updateStatus = async (id: string, status: Enquiry['status']) => {
        try {
            const { error } = await supabase
                .from('enquiries')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            setEnquiries((prev) =>
                prev.map((enquiry) =>
                    enquiry.id === id ? { ...enquiry, status } : enquiry
                )
            );
            toast.success('Status updated successfully');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const openNotesModal = (enquiry: Enquiry) => {
        setSelectedEnquiryId(enquiry.id);
        setNoteEntries(enquiry.notes || []);
        setNewNoteText('');
        setIsEditingNewNote(false);
        setNotesModalOpen(true);
    };

    const closeNotesModal = () => {
        setNotesModalOpen(false);
        setSelectedEnquiryId(null);
        setNoteEntries([]);
        setNewNoteText('');
        setIsEditingNewNote(false);
        setDeletingNoteId(null);
    };

    const saveNewNote = async () => {
        if (!selectedEnquiryId) {
            console.error('❌ No enquiry selected');
            toast.error('Please select an enquiry first');
            return;
        }

        if (!newNoteText.trim()) {
            toast.error('Please enter a note');
            return;
        }

        try {
            setSavingNote(true);

            // Get username from localStorage
            const userName = localStorage.getItem('adminUsername') || 'Unknown User';

            const newEntry: NoteEntry = {
                id: Date.now().toString(),
                text: newNoteText.trim(),
                timestamp: new Date().toISOString(),
                userName: userName,
            };

            const updatedNotes = [...noteEntries, newEntry];

            console.log('Saving notes to JSONB:', updatedNotes);

            const { data, error } = await supabase
                .from('enquiries')
                .update({
                    notes: updatedNotes,
                })
                .eq('id', selectedEnquiryId)
                .select();

            if (error) {
                console.error('❌ Supabase error:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error('Failed to update enquiry - no data returned');
            }

            console.log('✅ Note saved successfully:', data[0]);

            setEnquiries((prev) =>
                prev.map((enquiry) =>
                    enquiry.id === selectedEnquiryId
                        ? {
                            ...enquiry,
                            notes: updatedNotes,
                        }
                        : enquiry
                )
            );

            setNoteEntries(updatedNotes);
            setNewNoteText('');
            setIsEditingNewNote(false);
            toast.success('✨ Note added successfully');
        } catch (error) {
            console.error('❌ Error saving note:', error);
            toast.error('Failed to save note');
        } finally {
            setSavingNote(false);
        }
    };

    const deleteNoteEntry = async (noteId: string) => {
        if (!selectedEnquiryId) {
            console.error('❌ No enquiry selected');
            toast.error('Please select an enquiry first');
            return;
        }

        try {
            setDeletingNoteId(noteId);

            console.log('🗑️ Deleting note ID:', noteId);

            const updatedNotes = noteEntries.filter((entry) => entry.id !== noteId);

            console.log('🗑️ Updated notes after deletion:', updatedNotes);

            const { data, error } = await supabase
                .from('enquiries')
                .update({
                    notes: updatedNotes.length > 0 ? updatedNotes : null,
                })
                .eq('id', selectedEnquiryId)
                .select();

            if (error) {
                console.error('❌ Supabase error:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error('Failed to update enquiry - no data returned');
            }

            console.log('✅ Note deleted successfully:', data[0]);

            setNoteEntries(updatedNotes);

            setEnquiries((prev) =>
                prev.map((enquiry) =>
                    enquiry.id === selectedEnquiryId
                        ? {
                            ...enquiry,
                            notes: updatedNotes.length > 0 ? updatedNotes : null,
                        }
                        : enquiry
                )
            );

            toast.success('✅ Note deleted successfully');
        } catch (error) {
            console.error('❌ Error deleting note:', error);
            toast.error('Failed to delete note');
        } finally {
            setDeletingNoteId(null);
        }
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

    if (loading) {
        return <Loader isVisible={true} message="Loading Enquiries..." fullScreen={true} />;
    }

    return (
        <div className={styles.dashboardWrapper}>
            <HeadingTitle text='Enquiry Dashboard' />

            <motion.div
                className={styles.statusCardsSection}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {statusCards.map((card) => (
                    <motion.div key={card.id} variants={itemVariants}>
                        <StatusCardComponent card={card} filter={filter} setFilter={setFilter} />
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
                                placeholder="Search by name or phone..."
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
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="enrolled">Enrolled</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Enquiry No.</th>
                                <th onClick={() => handleSort('created_at')}>
                                    Date {getSortIcon('created_at')}
                                </th>
                                <th onClick={() => handleSort('child_name')}>
                                    Student's Name {getSortIcon('child_name')}
                                </th>
                                <th onClick={() => handleSort('parent_name')}>
                                    Parent's Name {getSortIcon('parent_name')}
                                </th>
                                <th>Program</th>
                                <th>Contact</th>
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
                                        <FaSpinner className={styles.loadingIcon} /> Loading enquiries...
                                    </td>
                                </tr>
                            ) : sortedAndFilteredEnquiries.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className={styles.noResults}>
                                        No enquiries found
                                    </td>
                                </tr>
                            ) : (
                                paginatedEnquiries.map((enquiry) => (
                                    <motion.tr
                                        key={enquiry.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <td>
                                            {enquiry.enquiry_number || "N/A"}
                                        </td>
                                        <td>
                                            {new Date(enquiry.created_at).toLocaleDateString('en-US', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td>{enquiry.child_name || 'N/A'}</td>
                                        <td>{enquiry.parent_name || 'N/A'}</td>
                                        <td>{enquiry.program || 'N/A'}</td>
                                        <td>
                                            <div className={styles.contactLinks}>
                                                <span>{enquiry.phone || 'N/A'}</span>
                                                {enquiry.phone && (
                                                    <>
                                                        <a
                                                            href={`tel:${enquiry.phone}`}
                                                            className={styles.phoneLink}
                                                            title="Call"
                                                        >
                                                            <FaPhoneAlt />
                                                        </a>
                                                        <a
                                                            href={`https://wa.me/91${enquiry.phone.replace(/\D/g, '')}?text=${encodeURIComponent(generateWhatsAppMessage(enquiry))}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={styles.whatsappLink}
                                                            title={`Send WhatsApp message - Status: ${enquiry.status}`}
                                                        >
                                                            <FaWhatsapp />
                                                        </a>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                className={`${styles.notesBtn} ${enquiry.notes && enquiry.notes.length > 0 ? styles.hasNotes : ''}`}
                                                onClick={() => openNotesModal(enquiry)}
                                                title={enquiry.notes && enquiry.notes.length > 0 ? `${enquiry.notes.length} notes` : 'Add note'}
                                            >
                                                <FaStickyNote />
                                                {enquiry.notes && enquiry.notes.length > 0 && (
                                                    <span className={styles.notesIndicator}>{enquiry.notes.length}</span>
                                                )}
                                            </button>
                                        </td>
                                        <td>
                                            <span className={`${styles.status} ${styles[enquiry.status]}`}>
                                                {enquiry.status}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                value={enquiry.status}
                                                onChange={(e) =>
                                                    updateStatus(enquiry.id, e.target.value as Enquiry['status'])
                                                }
                                                className={styles.statusSelect}
                                            >
                                                <option value="new">New</option>
                                                <option value="contacted">Contacted</option>
                                                <option value="enrolled">Enrolled</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ✨ PAGINATION SECTION ✨ */}
                {sortedAndFilteredEnquiries.length > 0 && (
                    <div className={styles.paginationSection}>
                        <div className={styles.paginationInfo}>
                            <p className={styles.paginationText}>
                                Showing <strong>{startIndex + 1}</strong> to{' '}
                                <strong>{Math.min(endIndex, sortedAndFilteredEnquiries.length)}</strong> of{' '}
                                <strong>{sortedAndFilteredEnquiries.length}</strong> enquiries
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
                isEditingNewNote={isEditingNewNote}
                setIsEditingNewNote={setIsEditingNewNote}
                onSaveNewNote={saveNewNote}
                onDeleteNote={deleteNoteEntry}
                enquiry={enquiries.find(e => e.id === selectedEnquiryId)}
                formatTimestamp={formatTimestamp}
                savingNote={savingNote}
                deletingNoteId={deletingNoteId}
                canDeleteNotes={parseInt(localStorage.getItem('adminRoleId') || '-1') === 0}
            />

            <DownloadModal
                isOpen={downloadModalOpen}
                onClose={() => setDownloadModalOpen(false)}
                data={enquiries}
                columns={[
                    { key: 'created_at', label: 'Date' },
                    { key: 'child_name', label: 'Child Name' },
                    { key: 'parent_name', label: 'Parent Name' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'program', label: 'Program' },
                    { key: 'status', label: 'Status' },
                ]}
                fileName="Enquiry_Export"
                defaultMonths="6"
                onDateRangeChange={handleEnquiryDownload}
                title="Download Enquiry Data"
                description="Select a date range and format to download your admission records"
            />
        </div>
    );
};

const NotesModal = ({
    isOpen,
    onClose,
    noteEntries,
    newNoteText,
    setNewNoteText,
    isEditingNewNote,
    setIsEditingNewNote,
    onSaveNewNote,
    onDeleteNote,
    enquiry,
    formatTimestamp,
    savingNote,
    deletingNoteId,
    canDeleteNotes,
}: {
    isOpen: boolean;
    onClose: () => void;
    noteEntries: NoteEntry[];
    newNoteText: string;
    setNewNoteText: (text: string) => void;
    isEditingNewNote: boolean;
    setIsEditingNewNote: (editing: boolean) => void;
    onSaveNewNote: () => void;
    onDeleteNote: (noteId: string) => void;
    enquiry?: Enquiry;
    formatTimestamp: (timestamp: string) => string;
    savingNote?: boolean;
    deletingNoteId?: string | null;
    canDeleteNotes?: boolean;
}) => {
    const isProcessing = savingNote || !!deletingNoteId;

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
                                <h2><EditNoteIcon />Notes for {enquiry?.child_name}</h2>
                                <p>{enquiry?.parent_name} • {enquiry?.phone}</p>
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
                                                        <span className={styles.noteUser}>
                                                            👤 {entry.userName || 'Unknown User'}
                                                        </span>
                                                        <span className={styles.noteTimestamp}>
                                                            🕒 {formatTimestamp(entry.timestamp)}
                                                        </span>
                                                        {canDeleteNotes && (
                                                            <motion.button
                                                                type="button"
                                                                className={styles.deleteNoteBtn}
                                                                onClick={() => {
                                                                    console.log('🗑️ Delete clicked for note:', entry.id);
                                                                    onDeleteNote(entry.id);
                                                                }}
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                title="Delete note"
                                                                disabled={!!deletingNoteId}
                                                            >
                                                                {deletingNoteId === entry.id ? (
                                                                    <Loader isVisible={true} fullScreen={true} message="Deleting..." />
                                                                ) : (
                                                                    <FaTrash />
                                                                )}
                                                            </motion.button>
                                                        )}
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

                            {noteEntries.length > 0 && (
                                <div className={styles.notesDivider}>
                                    <span>New Note</span>
                                </div>
                            )}

                            <div className={styles.newNoteSection}>
                                <h3 className={styles.newNoteTitle}>
                                    {isEditingNewNote ? '✍️ Write New Note' : '➕ Add New Note'}
                                </h3>
                                <textarea
                                    value={newNoteText}
                                    onChange={(e) => setNewNoteText(e.target.value)}
                                    placeholder="Write your note here..."
                                    className={styles.noteTextarea}
                                    rows={6}
                                    onFocus={() => setIsEditingNewNote(true)}
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
                                        <Loader isVisible={true} fullScreen={true} message="Saving..." />
                                    </>
                                ) : (
                                    <>
                                        <FaCheck /> Save New Note
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
            onClick={() => setFilter(card.status === 'new' ? 'all' : card.status)}
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
                    {card.status !== 'new' && (
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

export default EnquiryDashboard;