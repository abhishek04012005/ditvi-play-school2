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
    FaEdit,
    FaCheck,
} from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import styles from './enquiry.module.css';
import HeadingTitle from '@/components/heading/headingtitle';

interface Enquiry {
    id: string;
    parent_name: string;
    child_name: string;
    phone: string;
    program: string;
    status: 'new' | 'contacted' | 'enrolled' | 'cancelled';
    created_at: string;
    notes?: string;
    notes_updated_at?: string;
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

const EnquiryDashboard = () => {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'enrolled' | 'cancelled'>('all');
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [notesModalOpen, setNotesModalOpen] = useState(false);
    const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);
    const [noteText, setNoteText] = useState('');

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('enquiries')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setEnquiries(data || []);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to fetch enquiries');
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

    const sortedAndFilteredEnquiries = enquiries
        .filter((enquiry) => {
            const matchesSearch =
                enquiry.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                enquiry.child_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                enquiry.phone.includes(searchTerm);

            const matchesFilter = filter === 'all' || enquiry.status === filter;

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
            console.error('Error:', error);
            toast.error('Failed to update status');
        }
    };

    const openNotesModal = (enquiry: Enquiry) => {
        setSelectedEnquiryId(enquiry.id);
        setNoteText(enquiry.notes || '');
        setNotesModalOpen(true);
    };

    const closeNotesModal = () => {
        setNotesModalOpen(false);
        setSelectedEnquiryId(null);
        setNoteText('');
    };

    const saveNote = async () => {
        if (!selectedEnquiryId) return;

        try {
            const { error } = await supabase
                .from('enquiries')
                .update({
                    notes: noteText,
                    notes_updated_at: new Date().toISOString(),
                })
                .eq('id', selectedEnquiryId);

            if (error) throw error;

            setEnquiries((prev) =>
                prev.map((enquiry) =>
                    enquiry.id === selectedEnquiryId
                        ? {
                            ...enquiry,
                            notes: noteText,
                            notes_updated_at: new Date().toISOString(),
                        }
                        : enquiry
                )
            );

            toast.success('Note saved successfully');
            closeNotesModal();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to save note');
        }
    };

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
                                <th onClick={() => handleSort('created_at')}>
                                    Date {getSortIcon('created_at')}
                                </th>
                                <th onClick={() => handleSort('child_name')}>
                                    Child Name {getSortIcon('child_name')}
                                </th>
                                <th onClick={() => handleSort('parent_name')}>
                                    Parent Name {getSortIcon('parent_name')}
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
                                sortedAndFilteredEnquiries.map((enquiry) => (
                                    <motion.tr
                                        key={enquiry.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <td>
                                            {new Date(enquiry.created_at).toLocaleDateString('en-US', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td>{enquiry.child_name}</td>
                                        <td>{enquiry.parent_name}</td>
                                        <td>{enquiry.program}</td>
                                        <td>
                                            <div className={styles.contactLinks}>
                                                <span>{enquiry.phone}</span>
                                                <a
                                                    href={`tel:${enquiry.phone}`}
                                                    className={styles.phoneLink}
                                                    title="Call"
                                                >
                                                    <FaPhoneAlt />
                                                </a>
                                                <a
                                                    href={`https://wa.me/${enquiry.phone.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.whatsappLink}
                                                    title="WhatsApp"
                                                >
                                                    <FaWhatsapp />
                                                </a>
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                className={`${styles.notesBtn} ${enquiry.notes ? styles.hasNotes : ''}`}
                                                onClick={() => openNotesModal(enquiry)}
                                                title={enquiry.notes ? enquiry.notes : 'Add note'}
                                            >
                                                <FaStickyNote />
                                                {enquiry.notes && <span className={styles.notesIndicator}></span>}
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
            </div>

            {/* Notes Modal */}
            <NotesModal
                isOpen={notesModalOpen}
                onClose={closeNotesModal}
                noteText={noteText}
                setNoteText={setNoteText}
                onSave={saveNote}
                enquiry={enquiries.find(e => e.id === selectedEnquiryId)}
            />
        </div>
    );
};

const NotesModal = ({
    isOpen,
    onClose,
    noteText,
    setNoteText,
    onSave,
    enquiry,
}: {
    isOpen: boolean;
    onClose: () => void;
    noteText: string;
    setNoteText: (text: string) => void;
    onSave: () => void;
    enquiry?: Enquiry;
}) => {
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
                                <h2>Notes for {enquiry?.child_name}</h2>
                                <p>{enquiry?.parent_name} • {enquiry?.phone}</p>
                                {enquiry?.notes_updated_at && (
                                    <p className={styles.lastUpdated}>
                                        Last updated: {new Date(enquiry.notes_updated_at).toLocaleDateString('en-US', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                )}
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
                            <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Add your notes here... e.g., 'Parent requested callback next week on Tuesday'"
                                className={styles.noteTextarea}
                                rows={8}
                            />
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.cancelBtn}
                                onClick={onClose}
                            >
                                <FaTimes /> Cancel
                            </button>
                            <button
                                className={styles.saveBtn}
                                onClick={onSave}
                                disabled={!noteText.trim()}
                            >
                                <FaCheck /> Save Note
                            </button>
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