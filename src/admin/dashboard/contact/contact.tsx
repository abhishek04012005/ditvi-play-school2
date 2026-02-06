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
    FaEnvelope,
    FaUser,
    FaWhatsapp,
    FaStickyNote,
    FaTimes,
    FaCheck,
    FaClock,
    FaHistory,
    FaTrash,
    FaChevronLeft,
    FaChevronRight,
    FaDownload
} from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import styles from './contact.module.css';
import HeadingTitle from '@/components/heading/headingtitle';
import Loader from '@/custom/loader/loader';
import { DownloadModal } from '../download/DownloadData';
import EditNoteIcon from '@mui/icons-material/EditNote';
import whatsappMessages from '@/json/whatsappMessages';


interface NoteEntry {
    text: string;
    timestamp: string;
    id: string;
    userName?: string;
}

interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: 'new' | 'replied' | 'resolved' | 'archived';
    created_at: string;
    notes?: NoteEntry[] | null;
}

interface StatusCard {
    label: string;
    count: number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    status: 'new' | 'replied' | 'resolved' | 'archived';
    id: string;
}

type SortField = 'created_at' | 'name' | 'status';
type SortOrder = 'asc' | 'desc';
type ItemsPerPage = 20 | 50 | 100;

// Generate WhatsApp message for contact
const generateContactWhatsAppMessage = (): string => {
    return whatsappMessages.contact;
};

const ContactDashboard = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'new' | 'replied' | 'resolved' | 'archived'>('all');
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [notesModalOpen, setNotesModalOpen] = useState(false);
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [newNoteText, setNewNoteText] = useState('');
    const [noteEntries, setNoteEntries] = useState<NoteEntry[]>([]);
    const [isEditingNewNote, setIsEditingNewNote] = useState(false);
    const [savingNote, setSavingNote] = useState(false);
    const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

    // ✨ PAGINATION STATE ✨
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(20);

    const [downloadModalOpen, setDownloadModalOpen] = useState(false);

    useEffect(() =>{
        fetchContacts();
    }, []);

    // ✨ RESET TO PAGE 1 WHEN FILTER/SEARCH CHANGES ✨
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filter]);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('contacts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Fetch error:', error);
                throw error;
            }

            // ✨ PROCESS NOTES FROM JSONB COLUMN ✨
            const processedData = (data || []).map((contact: any) => {
                let notes: NoteEntry[] = [];

                if (contact.notes && Array.isArray(contact.notes)) {
                    notes = contact.notes as NoteEntry[];
                } else if (typeof contact.notes === 'string') {
                    try {
                        notes = JSON.parse(contact.notes);
                    } catch (e) {
                        console.error('Error parsing notes:', e);
                        notes = [];
                    }
                }

                return {
                    ...contact,
                    notes: notes.length > 0 ? notes : null,
                };
            });

            setContacts(processedData);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Failed to fetch contacts');
            setContacts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleContactDownload = (startDate: Date, endDate: Date) => {
        return contacts.filter((contacts) => {
            const admissionDate = new Date(contacts.created_at);
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

    const sortedAndFilteredContacts = contacts
        .filter(contact => {
            const matchesSearch =
                contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.phone.includes(searchTerm);

            const matchesFilter = filter === 'all' || contact.status === filter;

            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            if (sortField === 'created_at') {
                return sortOrder === 'asc'
                    ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            return sortOrder === 'asc'
                ? a[sortField].localeCompare(b[sortField])
                : b[sortField].localeCompare(a[sortField]);
        });

    // ✨ PAGINATION LOGIC ✨
    const totalPages = Math.ceil(sortedAndFilteredContacts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedContacts = sortedAndFilteredContacts.slice(startIndex, endIndex);

    const statusCounts = {
        total: contacts.length,
        new: contacts.filter((c) => c.status === 'new').length,
        replied: contacts.filter((c) => c.status === 'replied').length,
        resolved: contacts.filter((c) => c.status === 'resolved').length,
        archived: contacts.filter((c) => c.status === 'archived').length,
    };

    const statusCards: StatusCard[] = [
        {
            label: 'Total Contacts',
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
            icon: <FaEnvelope />,
            color: '#3b82f6',
            bgColor: '#eff6ff',
            status: 'new',
            id: 'new',
        },
        {
            label: 'Replied',
            count: statusCounts.replied,
            icon: <FaClock />,
            color: '#f59e0b',
            bgColor: '#fffbf0',
            status: 'replied',
            id: 'replied',
        },
        {
            label: 'Resolved',
            count: statusCounts.resolved,
            icon: <FaCheckCircle />,
            color: '#10b981',
            bgColor: '#f0fdf4',
            status: 'resolved',
            id: 'resolved',
        },
        {
            label: 'Archived',
            count: statusCounts.archived,
            icon: <FaSpinner />,
            color: '#6b7280',
            bgColor: '#f3f4f6',
            status: 'archived',
            id: 'archived',
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

    const updateStatus = async (id: string, status: Contact['status']) => {
        try {
            const { error } = await supabase
                .from('contacts')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            setContacts((prev) =>
                prev.map((contact) =>
                    contact.id === id ? { ...contact, status } : contact
                )
            );
            toast.success('Status updated successfully');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to update status');
        }
    };

    const openNotesModal = (contact: Contact) => {
        setSelectedContactId(contact.id);
        setNoteEntries(contact.notes || []);
        setNewNoteText('');
        setIsEditingNewNote(false);
        setNotesModalOpen(true);
    };

    const closeNotesModal = () => {
        setNotesModalOpen(false);
        setSelectedContactId(null);
        setNoteEntries([]);
        setNewNoteText('');
        setIsEditingNewNote(false);
        setDeletingNoteId(null);
    };

    const saveNewNote = async () => {
        if (!selectedContactId) {
            console.error('❌ No contact selected');
            toast.error('Please select a contact first');
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
                .from('contacts')
                .update({
                    notes: updatedNotes,
                })
                .eq('id', selectedContactId)
                .select();

            if (error) {
                console.error('❌ Supabase error:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error('Failed to update contact - no data returned');
            }

            console.log('✅ Note saved successfully:', data[0]);

            setContacts((prev) =>
                prev.map((contact) =>
                    contact.id === selectedContactId
                        ? {
                            ...contact,
                            notes: updatedNotes,
                        }
                        : contact
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
        if (!selectedContactId) {
            console.error('❌ No contact selected');
            toast.error('Please select a contact first');
            return;
        }

        try {
            setDeletingNoteId(noteId);

            console.log('🗑️ Deleting note ID:', noteId);

            const updatedNotes = noteEntries.filter((entry) => entry.id !== noteId);

            console.log('🗑️ Updated notes after deletion:', updatedNotes);

            const { data, error } = await supabase
                .from('contacts')
                .update({
                    notes: updatedNotes.length > 0 ? updatedNotes : null,
                })
                .eq('id', selectedContactId)
                .select();

            if (error) {
                console.error('❌ Supabase error:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error('Failed to update contact - no data returned');
            }

            console.log('✅ Note deleted successfully:', data[0]);

            setNoteEntries(updatedNotes);

            setContacts((prev) =>
                prev.map((contact) =>
                    contact.id === selectedContactId
                        ? {
                            ...contact,
                            notes: updatedNotes.length > 0 ? updatedNotes : null,
                        }
                        : contact
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
            // Scroll to top of table
            const tableElement = document.querySelector(`.${styles.tableWrapper}`);
            if (tableElement) {
                tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    if (loading) {
        return <Loader isVisible={true} message="Loading Contact Dashboard..." fullScreen={true} />;
    }

    return (
        <div className={styles.dashboardWrapper}>
            <HeadingTitle text="Contact Dashboard" />

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
                                placeholder="Search by name, email or phone..."
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
                            <option value="replied">Replied</option>
                            <option value="resolved">Resolved</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('created_at')}>
                                    Date {getSortIcon('created_at')}
                                </th>
                                <th onClick={() => handleSort('name')}>
                                    Name {getSortIcon('name')}
                                </th>
                                <th>Email</th>
                                <th>Contact</th>
                                <th>Message</th>
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
                                        <FaSpinner className={styles.loadingIcon} /> Loading
                                    </td>
                                </tr>
                            ) : sortedAndFilteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className={styles.noResults}>
                                        No contacts found
                                    </td>
                                </tr>
                            ) : (
                                paginatedContacts.map((contact) => (
                                    <motion.tr
                                        key={contact.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <td>
                                            {new Date(contact.created_at).toLocaleDateString('en-US', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td>{contact.name}</td>
                                        <td>
                                            <a
                                                href={`mailto:${contact.email}`}
                                                className={styles.emailLink}
                                                title={contact.email}
                                            >
                                                {contact.email}
                                            </a>
                                        </td>
                                        <td>
                                            <div className={styles.contactLinks}>
                                                <span>{contact.phone}</span>
                                                <a
                                                    href={`tel:${contact.phone}`}
                                                    className={styles.phoneLink}
                                                    title="Call"
                                                >
                                                    <FaPhoneAlt />
                                                </a>
                                                <a
                                                    href={`https://wa.me/91${contact.phone.replace(/\D/g, '')}?text=${encodeURIComponent(generateContactWhatsAppMessage())}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.whatsappLink}
                                                    title="Send WhatsApp message"
                                                >
                                                    <FaWhatsapp />
                                                </a>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.messageCell}>
                                                {contact.message}
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                className={`${styles.notesBtn} ${contact.notes && contact.notes.length > 0 ? styles.hasNotes : ''}`}
                                                onClick={() => openNotesModal(contact)}
                                                title={contact.notes && contact.notes.length > 0 ? `${contact.notes.length} notes` : 'Add note'}
                                            >
                                                <FaStickyNote />
                                                {contact.notes && contact.notes.length > 0 && (
                                                    <span className={styles.notesIndicator}>{contact.notes.length}</span>
                                                )}
                                            </button>
                                        </td>
                                        <td>
                                            <span className={`${styles.status} ${styles[contact.status]}`}>
                                                {contact.status}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                value={contact.status}
                                                onChange={(e) =>
                                                    updateStatus(contact.id, e.target.value as Contact['status'])
                                                }
                                                className={styles.statusSelect}
                                            >
                                                <option value="new">New</option>
                                                <option value="replied">Replied</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ✨ PAGINATION SECTION ✨ */}
                {sortedAndFilteredContacts.length > 0 && (
                    <div className={styles.paginationSection}>
                        <div className={styles.paginationInfo}>
                            <p className={styles.paginationText}>
                                Showing {startIndex + 1} to {Math.min(endIndex, sortedAndFilteredContacts.length)} of {sortedAndFilteredContacts.length} contacts
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
                                        // Show first page, last page, current page, and nearby pages
                                        const showPage =
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1);

                                        if (!showPage) {
                                            // Show ellipsis if needed
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
                                    Page {currentPage} of {totalPages}
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
                contact={contacts.find(c => c.id === selectedContactId)}
                formatTimestamp={formatTimestamp}
                savingNote={savingNote}
                deletingNoteId={deletingNoteId}
                canDeleteNotes={parseInt(localStorage.getItem('adminRoleId') || '-1') === 0}
            />

            <DownloadModal
                isOpen={downloadModalOpen}
                onClose={() => setDownloadModalOpen(false)}
                data={contacts}
                columns={[
                    { key: 'created_at', label: 'Date' },
                    { key: 'name', label: 'Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'message', label: 'message' },
                    { key: 'status', label: 'Status' },
                ]}
                fileName="Contact_Export"
                defaultMonths="6"
                onDateRangeChange={handleContactDownload}
                title="Download Contact Data"
                description="Select a date range and format to download your admission records"
            />
        </div>
    );
};

// Rest of the component code remains the same...
// (NotesModal, StatusCardComponent, etc.)

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
    contact,
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
    contact?: Contact;
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
                                <h2><EditNoteIcon/> Notes for {contact?.name}</h2>
                                <p>{contact?.email} • {contact?.phone}</p>
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
                                    placeholder="Write your note here... e.g., 'Follow up next week'"
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

export default ContactDashboard;