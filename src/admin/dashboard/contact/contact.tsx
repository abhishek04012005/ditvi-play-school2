'use client';
import { useState, useEffect } from 'react';
import { FaSearch, FaPhoneAlt, FaEnvelope, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import styles from './contact.module.css';

interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: 'new' | 'replied' | 'resolved' | 'archived';
    created_at: string;
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

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
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

    const updateStatus = async (id: string, status: Contact['status']) => {
        try {
            const { error } = await supabase
                .from('contacts')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            setContacts(prev => 
                prev.map(contact => 
                    contact.id === id ? { ...contact, status } : contact
                )
            );
            toast.success('Status updated successfully');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to update status');
        }
    };

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <h1>Contact Messages</h1>
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
                        onChange={(e) => setFilter(e.target.value as Contact['status'])}
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
                            <th>Contact</th>
                            <th>Message</th>
                            <th onClick={() => handleSort('status')}>
                                Status {getSortIcon('status')}
                            </th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className={styles.loading}>Loading contacts...</td>
                            </tr>
                        ) : sortedAndFilteredContacts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className={styles.noResults}>No contacts found</td>
                            </tr>
                        ) : (
                            sortedAndFilteredContacts.map((contact) => (
                                <tr key={contact.id}>
                                    <td>{new Date(contact.created_at).toLocaleDateString()}</td>
                                    <td>{contact.name}</td>
                                    <td>
                                        <div className={styles.contactInfo}>
                                            <a href={`tel:${contact.phone}`} className={styles.phoneLink}>
                                                <FaPhoneAlt /> {contact.phone}
                                            </a>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.message}>
                                            {contact.message}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.status} ${styles[contact.status]}`}>
                                            {contact.status}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            value={contact.status}
                                            onChange={(e) => updateStatus(contact.id, e.target.value as Contact['status'])}
                                            className={styles.statusSelect}
                                        >
                                            <option value="new">New</option>
                                            <option value="replied">Replied</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContactDashboard;