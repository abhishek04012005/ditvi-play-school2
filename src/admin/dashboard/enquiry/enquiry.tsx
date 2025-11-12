'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaPhoneAlt, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import styles from './enquiry.module.css';

interface Enquiry {
    id: string;
    parent_name: string;
    child_name: string;
    phone: string;
    program: string;
    status: 'new' | 'contacted' | 'enrolled' | 'cancelled';
    created_at: string;
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

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
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
        .filter(enquiry => {
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

    const updateStatus = async (id: string, status: Enquiry['status']) => {
        try {
            const { error } = await supabase
                .from('enquiries')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            setEnquiries(prev => 
                prev.map(enquiry => 
                    enquiry.id === id ? { ...enquiry, status } : enquiry
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
                <h1>Enquiry Dashboard</h1>
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
                        onChange={(e) => setFilter(e.target.value as Enquiry['status'])}
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
                            <th onClick={() => handleSort('status')}>
                                Status {getSortIcon('status')}
                            </th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className={styles.loading}>Loading enquiries...</td>
                            </tr>
                        ) : sortedAndFilteredEnquiries.length === 0 ? (
                            <tr>
                                <td colSpan={7} className={styles.noResults}>No enquiries found</td>
                            </tr>
                        ) : (
                            sortedAndFilteredEnquiries.map((enquiry) => (
                                <tr key={enquiry.id}>
                                    <td>{new Date(enquiry.created_at).toLocaleDateString()}</td>
                                    <td>{enquiry.child_name}</td>
                                    <td>{enquiry.parent_name}</td>
                                    <td>{enquiry.program}</td>
                                    <td>
                                        <a href={`tel:${enquiry.phone}`} className={styles.phoneLink}>
                                            <FaPhoneAlt /> {enquiry.phone}
                                        </a>
                                    </td>
                                    <td>
                                        <span 
                                            className={`${styles.status} ${styles[enquiry.status]}`}
                                        >
                                            {enquiry.status}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            value={enquiry.status}
                                            onChange={(e) => updateStatus(enquiry.id, e.target.value as Enquiry['status'])}
                                            className={styles.statusSelect}
                                        >
                                            <option value="new">New</option>
                                            <option value="contacted">Contacted</option>
                                            <option value="enrolled">Enrolled</option>
                                            <option value="cancelled">Cancelled</option>
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

export default EnquiryDashboard;