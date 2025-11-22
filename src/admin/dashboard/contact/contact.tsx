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
} from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import styles from './contact.module.css';
import HeadingTitle from '@/components/heading/headingtitle';
import Loader from '@/custom/loader/loader';

interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: 'new' | 'replied' | 'resolved' | 'archived';
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
    status: 'new' | 'replied' | 'resolved' | 'archived';
    id: string;
}

type SortField = 'created_at' | 'name' | 'status';
type SortOrder = 'asc' | 'desc';

const ContactDashboard = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'new' | 'replied' | 'resolved' | 'archived'>('all');
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [notesModalOpen, setNotesModalOpen] = useState(false);
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [noteText, setNoteText] = useState('');

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('contacts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setContacts(data || []);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to fetch contacts');
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
        setNoteText(contact.notes || '');
        setNotesModalOpen(true);
    };

    const closeNotesModal = () => {
        setNotesModalOpen(false);
        setSelectedContactId(null);
        setNoteText('');
    };

    const saveNote = async () => {
        if (!selectedContactId) return;

        try {
            const { error } = await supabase
                .from('contacts')
                .update({
                    notes: noteText,
                    notes_updated_at: new Date().toISOString(),
                })
                .eq('id', selectedContactId);

            if (error) throw error;

            setContacts((prev) =>
                prev.map((contact) =>
                    contact.id === selectedContactId
                        ? {
                            ...contact,
                            notes: noteText,
                            notes_updated_at: new Date().toISOString(),
                        }
                        : contact
                )
            );

            toast.success('Note saved successfully');
            closeNotesModal();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to save note');
        }
    };

    if(loading) {
        return <Loader isVisible={true} message="Loading Contacts..." fullScreen={true} />;
    }

    return (
        <div className={styles.dashboardWrapper}>
            <HeadingTitle text='Contact Dashboard' />

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
                                        <FaSpinner className={styles.loadingIcon} /> Loading contacts...
                                    </td>
                                </tr>
                            ) : sortedAndFilteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className={styles.noResults}>
                                        No contacts found
                                    </td>
                                </tr>
                            ) : (
                                sortedAndFilteredContacts.map((contact) => (
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
                                                    href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`}
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
                                            <div className={styles.messageCell}>
                                                {contact.message}
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                className={`${styles.notesBtn} ${contact.notes ? styles.hasNotes : ''}`}
                                                onClick={() => openNotesModal(contact)}
                                                title={contact.notes ? contact.notes : 'Add note'}
                                            >
                                                <FaStickyNote />
                                                {contact.notes && <span className={styles.notesIndicator}></span>}
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
            </div>

            {/* Notes Modal */}
            <NotesModal
                isOpen={notesModalOpen}
                onClose={closeNotesModal}
                noteText={noteText}
                setNoteText={setNoteText}
                onSave={saveNote}
                contact={contacts.find(c => c.id === selectedContactId)}
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
    contact,
}: {
    isOpen: boolean;
    onClose: () => void;
    noteText: string;
    setNoteText: (text: string) => void;
    onSave: () => void;
    contact?: Contact;
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
                                <h2>Notes for {contact?.name}</h2>
                                <p>{contact?.email} • {contact?.phone}</p>
                                {contact?.notes_updated_at && (
                                    <p className={styles.lastUpdated}>
                                        Last updated: {new Date(contact.notes_updated_at).toLocaleDateString('en-US', {
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
                                placeholder="Add your notes here... e.g., 'Follow up next week'"
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

export default ContactDashboard;