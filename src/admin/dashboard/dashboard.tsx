'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaEnvelope,
    FaUsers,
    FaArrowUp,
    FaArrowDown,
    FaComments,
    FaUserCheck,
    FaCalendarAlt,
    FaFilter,
    FaGraduationCap,
    FaStar,
    FaCheck,
} from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import styles from './dashboard.module.css';
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
}

interface Enquiry {
    id: string;
    parent_name: string;
    child_name: string;
    phone: string;
    program: string;
    status: 'new' | 'contacted' | 'enrolled' | 'cancelled';
    created_at: string;
}

interface Admission {
    id: string;
    child_name?: string;
    child_first_name?: string;
    program_name?: string;
    admission_status: string;
    created_at: string;
}

interface Spotlight {
    id: string;
    name: string;
    award_type: string;
    created_date: string;
    is_show_on_home_page: boolean;
}

interface StatCard {
    title: string;
    value: number;
    subtitle: string;
    icon: React.ReactNode;
    trend?: { value: number; isPositive: boolean };
    color: string;
    bgColor: string;
}

const Dashboard = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [admissions, setAdmissions] = useState<Admission[]>([]);
    const [spotlights, setSpotlights] = useState<Spotlight[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('month');
    const [selectedTab, setSelectedTab] = useState<'contacts' | 'enquiries'>('contacts');
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [isCustomRangeActive, setIsCustomRangeActive] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: contactData } = await supabase
                .from('contacts')
                .select('*')
                .order('created_at', { ascending: false });
            const { data: enquiryData } = await supabase
                .from('enquiries')
                .select('*')
                .order('created_at', { ascending: false });
            const { data: admissionData } = await supabase
                .from('admission')
                .select('*')
                .order('created_at', { ascending: false });
            const { data: spotlightData } = await supabase
                .from('awards')
                .select('*')
                .order('created_date', { ascending: false });

            setContacts(contactData || []);
            setEnquiries(enquiryData || []);
            setAdmissions(admissionData || []);
            setSpotlights(spotlightData || []);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const getDateRangeData = (data: any[], days: number) => {
        const now = new Date();
        const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        return data.filter((item) => {
            const itemDate = item.created_at || item.created_date;
            return new Date(itemDate) >= pastDate;
        });
    };

    const getCustomDateRangeData = (data: any[], startDate: string, endDate: string) => {
        if (!startDate || !endDate) return data;
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return data.filter((item) => {
            const itemDate = new Date(item.created_at || item.created_date);
            return itemDate >= start && itemDate <= end;
        });
    };

    const handleApplyCustomDate = () => {
        if (!customStartDate || !customEndDate) {
            toast.error('Please select both start and end dates');
            return;
        }
        if (new Date(customStartDate) > new Date(customEndDate)) {
            toast.error('Start date must be before end date');
            return;
        }
        setIsCustomRangeActive(true);
        setShowCustomDatePicker(false);
        toast.success('Custom date range applied');
    };

    const handleResetToDefault = () => {
        setIsCustomRangeActive(false);
        setCustomStartDate('');
        setCustomEndDate('');
        setDateRange('month');
        toast.success('Reset to default date range');
    };

    const getDaysForRange = () => {
        switch (dateRange) {
            case 'week':
                return 7;
            case 'month':
                return 30;
            case 'year':
                return 365;
            default:
                return 30;
        }
    };

    const getDateRangeLabel = () => {
        if (isCustomRangeActive && customStartDate && customEndDate) {
            const formatDate = (dateStr: string) => {
                return new Date(dateStr).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                });
            };
            return `${formatDate(customStartDate)} - ${formatDate(customEndDate)}`;
        }
        const now = new Date();
        const pastDate = new Date(now.getTime() - getDaysForRange() * 24 * 60 * 60 * 1000);
        const formatDate = (date: Date) => {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        };
        return `${formatDate(pastDate)} - ${formatDate(now)}`;
    };

    const getRangeDescription = () => {
        if (isCustomRangeActive) {
            return 'Custom Date Range';
        }
        switch (dateRange) {
            case 'week':
                return 'Last 7 Days';
            case 'month':
                return 'Last 30 Days';
            case 'year':
                return 'Last 365 Days';
            default:
                return 'Last 30 Days';
        }
    };

    const rangedContacts = isCustomRangeActive 
        ? getCustomDateRangeData(contacts, customStartDate, customEndDate)
        : getDateRangeData(contacts, getDaysForRange());
    const rangedEnquiries = isCustomRangeActive
        ? getCustomDateRangeData(enquiries, customStartDate, customEndDate)
        : getDateRangeData(enquiries, getDaysForRange());

    const contactMetrics = {
        total: rangedContacts.length,
        new: rangedContacts.filter((c) => c.status === 'new').length,
        replied: rangedContacts.filter((c) => c.status === 'replied').length,
        resolved: rangedContacts.filter((c) => c.status === 'resolved').length,
        responseRate:
            rangedContacts.length > 0
                ? Math.round(
                    ((rangedContacts.filter((c) => c.status !== 'new').length /
                        rangedContacts.length) *
                        100)
                )
                : 0,
    };

    const enquiryMetrics = {
        total: rangedEnquiries.length,
        new: rangedEnquiries.filter((e) => e.status === 'new').length,
        contacted: rangedEnquiries.filter((e) => e.status === 'contacted').length,
        enrolled: rangedEnquiries.filter((e) => e.status === 'enrolled').length,
        cancelled: rangedEnquiries.filter((e) => e.status === 'cancelled').length,
        conversionRate:
            rangedEnquiries.length > 0
                ? Math.round(
                    ((rangedEnquiries.filter((e) => e.status === 'enrolled').length /
                        rangedEnquiries.length) *
                        100)
                )
                : 0,
    };

    const rangedAdmissions = isCustomRangeActive
        ? getCustomDateRangeData(admissions, customStartDate, customEndDate)
        : getDateRangeData(admissions, getDaysForRange());
    const admissionMetrics = {
        total: rangedAdmissions.length,
        pending: rangedAdmissions.filter((a) => a.admission_status === 'In Review' || a.admission_status === 'Reviewed').length,
        approved: rangedAdmissions.filter((a) => a.admission_status === 'Confirmed').length,
        rejected: rangedAdmissions.filter((a) => a.admission_status === 'Rejected').length,
        approvalRate:
            rangedAdmissions.length > 0
                ? Math.round(
                    ((rangedAdmissions.filter((a) => a.admission_status === 'Confirmed').length /
                        rangedAdmissions.length) *
                        100)
                )
                : 0,
    };

    const rangedSpotlights = isCustomRangeActive
        ? getCustomDateRangeData(spotlights, customStartDate, customEndDate)
        : getDateRangeData(spotlights, getDaysForRange());
    const spotlightMetrics = {
        total: rangedSpotlights.length,
        published: rangedSpotlights.filter((s) => s.is_show_on_home_page).length,
        unpublished: rangedSpotlights.filter((s) => !s.is_show_on_home_page).length,
        publishRate:
            rangedSpotlights.length > 0
                ? Math.round(
                    ((rangedSpotlights.filter((s) => s.is_show_on_home_page).length /
                        rangedSpotlights.length) *
                        100)
                )
                : 0,
    };

    const statCards: StatCard[] = [
        {
            title: 'Total Contacts',
            value: contactMetrics.total,
            subtitle: `${contactMetrics.new} new this period`,
            icon: <FaEnvelope />,
            trend: { value: 12, isPositive: true },
            color: '#6a4c93',
            bgColor: '#f3e8ff',
        },
        {
            title: 'Response Rate',
            value: contactMetrics.responseRate,
            subtitle: 'of messages replied',
            icon: <FaComments />,
            trend: { value: 5, isPositive: true },
            color: '#ffbf00',
            bgColor: '#fffbf0',
        },
        {
            title: 'Total Enquiries',
            value: enquiryMetrics.total,
            subtitle: `${enquiryMetrics.new} new this period`,
            icon: <FaUsers />,
            trend: { value: 8, isPositive: true },
            color: '#6a4c93',
            bgColor: '#f3e8ff',
        },
        {
            title: 'Conversion Rate',
            value: enquiryMetrics.conversionRate,
            subtitle: `${enquiryMetrics.enrolled} students enrolled`,
            icon: <FaUserCheck />,
            trend: { value: 3, isPositive: true },
            color: '#10b981',
            bgColor: '#f0fdf4',
        },
        {
            title: 'Total Admissions',
            value: admissionMetrics.total,
            subtitle: `${admissionMetrics.approved} approved`,
            icon: <FaGraduationCap />,
            trend: { value: 6, isPositive: true },
            color: '#3b82f6',
            bgColor: '#eff6ff',
        },
        {
            title: 'Approval Rate',
            value: admissionMetrics.approvalRate,
            subtitle: 'admissions approved',
            icon: <FaCheck />,
            trend: { value: 4, isPositive: true },
            color: '#ec4899',
            bgColor: '#fdf2f8',
        },
        {
            title: 'Total Spotlights',
            value: spotlightMetrics.total,
            subtitle: `${spotlightMetrics.published} published`,
            icon: <FaStar />,
            trend: { value: 9, isPositive: true },
            color: '#f59e0b',
            bgColor: '#fffbf0',
        },
        {
            title: 'Publish Rate',
            value: spotlightMetrics.publishRate,
            subtitle: 'spotlights published',
            icon: <FaCheck />,
            trend: { value: 2, isPositive: true },
            color: '#8b5cf6',
            bgColor: '#faf5ff',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.1 },
        },
    };


    if (loading) {
        return (
            <Loader />
        );
    }

    return (
        <div className={styles.dashboard}>
            <HeadingTitle text='Dashboard' />
            <motion.div
                className={styles.headerSection}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.pageTitle}>📊 Dashboard Overview</h1>
                        <p className={styles.pageSubtitle}>
                            Viewing data from <span style={{ fontWeight: '700', color: '#6a4c93' }}>{getDateRangeLabel()}</span>
                        </p>
                    </div>
                    <div className={styles.headerControls}>
                        <div className={styles.dateRangeControl}>
                            <FaCalendarAlt className={styles.controlIcon} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Date Range</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#333' }}>{getRangeDescription()}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid #e5e5e5' }}>
                                {['week', 'month', 'year'].map((range) => (
                                    <motion.button
                                        key={range}
                                        className={`${styles.rangeBtn} ${!isCustomRangeActive && dateRange === range ? styles.active : ''
                                            }`}
                                        onClick={() => {
                                            setDateRange(range);
                                            setIsCustomRangeActive(false);
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {range === 'week' ? '7D' : range === 'month' ? '30D' : '1Y'}
                                    </motion.button>
                                ))}
                                <motion.button
                                    className={`${styles.rangeBtn} ${isCustomRangeActive ? styles.active : ''}`}
                                    onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        background: 'transparent',
                                        border: '2px solid #e5e5e5',
                                        marginLeft: '0.5rem',
                                        paddingLeft: '0.8rem',
                                        paddingRight: '0.8rem',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    📅 Custom
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* Custom Date Picker Modal */}
                    <AnimatePresence>
                        {showCustomDatePicker && (
                            <motion.div
                                className={styles.customDatePickerOverlay}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowCustomDatePicker(false)}
                            >
                                <motion.div
                                    className={styles.customDatePickerModal}
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '700', color: '#333' }}>
                                            Select Custom Date Range
                                        </h3>
                                        <p style={{ margin: '0', fontSize: '0.85rem', color: '#666' }}>
                                            Choose start and end dates for custom filtering
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={customStartDate}
                                                onChange={(e) => setCustomStartDate(e.target.value)}
                                                max={new Date().toISOString().split('T')[0]}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    border: '1px solid #e5e5e5',
                                                    borderRadius: '8px',
                                                    fontSize: '1rem',
                                                    fontFamily: 'inherit',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                value={customEndDate}
                                                onChange={(e) => setCustomEndDate(e.target.value)}
                                                max={new Date().toISOString().split('T')[0]}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    border: '1px solid #e5e5e5',
                                                    borderRadius: '8px',
                                                    fontSize: '1rem',
                                                    fontFamily: 'inherit',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                        <motion.button
                                            onClick={() => setShowCustomDatePicker(false)}
                                            style={{
                                                padding: '0.65rem 1.5rem',
                                                border: '1px solid #e5e5e5',
                                                background: '#f9f9f9',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                fontSize: '0.9rem',
                                                color: '#666'
                                            }}
                                            whileHover={{ background: '#f0f0f0' }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Cancel
                                        </motion.button>
                                        <motion.button
                                            onClick={handleApplyCustomDate}
                                            style={{
                                                padding: '0.65rem 1.5rem',
                                                background: 'linear-gradient(135deg, #6a4c93 0%, #7e5fa1 100%)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                fontSize: '0.9rem',
                                                color: '#fff'
                                            }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Apply
                                        </motion.button>
                                    </div>

                                    {isCustomRangeActive && (
                                        <motion.button
                                            onClick={handleResetToDefault}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            style={{
                                                width: '100%',
                                                marginTop: '1rem',
                                                padding: '0.65rem',
                                                background: '#fff9f0',
                                                border: '1px solid #ffbf00',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                fontSize: '0.85rem',
                                                color: '#d97706'
                                            }}
                                            whileHover={{ background: '#fffbf0' }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Reset to Default Range
                                        </motion.button>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                className={styles.statsGrid}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {statCards.map((card, index) => (
                    <motion.div key={index}>
                        <StatCardComponent card={card} />
                    </motion.div>
                ))}
            </motion.div>

            {/* Data Summary Section */}
            <motion.div 
                className={styles.dataSummarySection}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
            >
                <div className={styles.summaryHeader}>
                    <h2>📊 Complete Data Summary</h2>
                </div>
                <div className={styles.summaryGrid}>
                    {/* Total Records */}
                    <motion.div 
                        className={styles.summaryCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                    >
                        <div className={styles.summaryIcon}>📈</div>
                        <div className={styles.summaryLabel}>Total Records</div>
                        <div className={styles.summaryNumber}>
                            {contactMetrics.total + enquiryMetrics.total + admissionMetrics.total + spotlightMetrics.total}
                        </div>
                        <div className={styles.summarySubtext}>All modules combined</div>
                    </motion.div>

                    {/* Contacts Module */}
                    <motion.div 
                        className={styles.summaryCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className={styles.summaryIcon}>📧</div>
                        <div className={styles.summaryLabel}>Contacts Module</div>
                        <div className={styles.summaryNumber}>{contactMetrics.total}</div>
                        <div className={styles.summarySubtext}>{contactMetrics.new} new</div>
                    </motion.div>

                    {/* Enquiries Module */}
                    <motion.div 
                        className={styles.summaryCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        <div className={styles.summaryIcon}>👶</div>
                        <div className={styles.summaryLabel}>Enquiries Module</div>
                        <div className={styles.summaryNumber}>{enquiryMetrics.total}</div>
                        <div className={styles.summarySubtext}>{enquiryMetrics.enrolled} enrolled</div>
                    </motion.div>

                    {/* Admissions Module */}
                    <motion.div 
                        className={styles.summaryCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className={styles.summaryIcon}>🎓</div>
                        <div className={styles.summaryLabel}>Admissions Module</div>
                        <div className={styles.summaryNumber}>{admissionMetrics.total}</div>
                        <div className={styles.summarySubtext}>{admissionMetrics.approved} approved</div>
                    </motion.div>

                    {/* Spotlight Module */}
                    <motion.div 
                        className={styles.summaryCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                    >
                        <div className={styles.summaryIcon}>⭐</div>
                        <div className={styles.summaryLabel}>Spotlight Module</div>
                        <div className={styles.summaryNumber}>{spotlightMetrics.total}</div>
                        <div className={styles.summarySubtext}>{spotlightMetrics.published} published</div>
                    </motion.div>

                    {/* Contact Response Rate */}
                    <motion.div 
                        className={styles.summaryCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className={styles.summaryIcon}>💬</div>
                        <div className={styles.summaryLabel}>Response Rate</div>
                        <div className={styles.summaryNumber}>{contactMetrics.responseRate}%</div>
                        <div className={styles.summarySubtext}>Contacts replied</div>
                    </motion.div>

                    {/* Enquiry Conversion Rate */}
                    <motion.div 
                        className={styles.summaryCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                    >
                        <div className={styles.summaryIcon}>📊</div>
                        <div className={styles.summaryLabel}>Conversion Rate</div>
                        <div className={styles.summaryNumber}>{enquiryMetrics.conversionRate}%</div>
                        <div className={styles.summarySubtext}>Enquiries to enrollment</div>
                    </motion.div>

                    {/* Admission Approval Rate */}
                    <motion.div 
                        className={styles.summaryCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className={styles.summaryIcon}>✅</div>
                        <div className={styles.summaryLabel}>Approval Rate</div>
                        <div className={styles.summaryNumber}>{admissionMetrics.approvalRate}%</div>
                        <div className={styles.summarySubtext}>Admissions approved</div>
                    </motion.div>

                    {/* Pending Items */}
                    <motion.div 
                        className={styles.summaryCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 }}
                    >
                        <div className={styles.summaryIcon}>⏳</div>
                        <div className={styles.summaryLabel}>Pending Items</div>
                        <div className={styles.summaryNumber}>
                            {contactMetrics.new + enquiryMetrics.new + admissionMetrics.pending}
                        </div>
                        <div className={styles.summarySubtext}>Awaiting action</div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Analytics Section */}
            <motion.div
                className={styles.analyticsSection}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
            >
                <div className={styles.analyticsGrid}>
                    {/* Contacts Overview */}
                    <div className={styles.analyticsCard}>
                        <div className={styles.cardHeader}>
                            <h3>Contact Status</h3>
                            <FaFilter className={styles.filterIcon} />
                        </div>
                        <div className={styles.statusMetrics}>
                            <div className={styles.metricRow}>
                                <div className={styles.metricLabel}>
                                    <div
                                        className={styles.metricDot}
                                        style={{ backgroundColor: '#6a4c93' }}
                                    ></div>
                                    <span>Total</span>
                                </div>
                                <div className={styles.metricValue}>{contactMetrics.total}</div>
                            </div>
                            <div className={styles.metricRow}>
                                <div className={styles.metricLabel}>
                                    <div
                                        className={styles.metricDot}
                                        style={{ backgroundColor: '#8662b0' }}
                                    ></div>
                                    <span>New</span>
                                </div>
                                <div className={styles.metricValue}>{contactMetrics.new}</div>
                            </div>
                            <div className={styles.metricRow}>
                                <div className={styles.metricLabel}>
                                    <div
                                        className={styles.metricDot}
                                        style={{ backgroundColor: '#ffbf00' }}
                                    ></div>
                                    <span>Replied</span>
                                </div>
                                <div className={styles.metricValue}>{contactMetrics.replied}</div>
                            </div>
                            <div className={styles.metricRow}>
                                <div className={styles.metricLabel}>
                                    <div
                                        className={styles.metricDot}
                                        style={{ backgroundColor: '#10b981' }}
                                    ></div>
                                    <span>Resolved</span>
                                </div>
                                <div className={styles.metricValue}>{contactMetrics.resolved}</div>
                            </div>
                        </div>
                        <div className={styles.progressSection}>
                            <div className={styles.progressLabel}>
                                <span>Response Rate</span>
                                <span className={styles.progressValue}>
                                    {contactMetrics.responseRate}%
                                </span>
                            </div>
                            <div className={styles.progressBar}>
                                <motion.div
                                    className={styles.progressFill}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${contactMetrics.responseRate}%` }}
                                    transition={{ delay: 0.5, duration: 1 }}
                                    style={{ backgroundColor: '#6a4c93' }}
                                ></motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Enquiries Overview */}
                    <div className={styles.analyticsCard}>
                        <div className={styles.cardHeader}>
                            <h3>Enquiry Status</h3>
                            <FaFilter className={styles.filterIcon} />
                        </div>
                        <div className={styles.statusMetrics}>
                            <div className={styles.metricRow}>
                                <div className={styles.metricLabel}>
                                    <div
                                        className={styles.metricDot}
                                        style={{ backgroundColor: '#6a4c93' }}
                                    ></div>
                                    <span>Total</span>
                                </div>
                                <div className={styles.metricValue}>{enquiryMetrics.total}</div>
                            </div>
                            <div className={styles.metricRow}>
                                <div className={styles.metricLabel}>
                                    <div
                                        className={styles.metricDot}
                                        style={{ backgroundColor: '#8662b0' }}
                                    ></div>
                                    <span>New</span>
                                </div>
                                <div className={styles.metricValue}>{enquiryMetrics.new}</div>
                            </div>
                            <div className={styles.metricRow}>
                                <div className={styles.metricLabel}>
                                    <div
                                        className={styles.metricDot}
                                        style={{ backgroundColor: '#ffbf00' }}
                                    ></div>
                                    <span>Contacted</span>
                                </div>
                                <div className={styles.metricValue}>{enquiryMetrics.contacted}</div>
                            </div>
                            <div className={styles.metricRow}>
                                <div className={styles.metricLabel}>
                                    <div
                                        className={styles.metricDot}
                                        style={{ backgroundColor: '#10b981' }}
                                    ></div>
                                    <span>Enrolled</span>
                                </div>
                                <div className={styles.metricValue}>{enquiryMetrics.enrolled}</div>
                            </div>
                            <div className={styles.metricRow}>
                                <div className={styles.metricLabel}>
                                    <div
                                        className={styles.metricDot}
                                        style={{ backgroundColor: '#ef4444' }}
                                    ></div>
                                    <span>Cancelled</span>
                                </div>
                                <div className={styles.metricValue}>{enquiryMetrics.cancelled}</div>
                            </div>
                        </div>
                        <div className={styles.progressSection}>
                            <div className={styles.progressLabel}>
                                <span>Conversion Rate</span>
                                <span className={styles.progressValue}>
                                    {enquiryMetrics.conversionRate}%
                                </span>
                            </div>
                            <div className={styles.progressBar}>
                                <motion.div
                                    className={styles.progressFill}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${enquiryMetrics.conversionRate}%` }}
                                    transition={{ delay: 0.6, duration: 1 }}
                                    style={{ backgroundColor: '#10b981' }}
                                ></motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Dashboard Reporting Section */}
            <motion.div
                className={styles.reportingSection}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
            >
                <div className={styles.reportingHeader}>
                    <h2>📈 Dashboard Reporting</h2>
                    <p>Key metrics across all modules</p>
                </div>

                <div className={styles.reportingGrid}>
                    {/* Contact Status Distribution */}
                    <div className={styles.reportingCard}>
                        <h3>Contact Status Distribution</h3>
                        <div className={styles.reportingMetrics}>
                            <div className={styles.metricItem}>
                                <div className={styles.metricLabel}>
                                    <span className={styles.statusDot} style={{ backgroundColor: '#8662b0' }}></span>
                                    New
                                </div>
                                <div className={styles.metricBar}>
                                    <div className={styles.metricBarFill} style={{
                                        width: contactMetrics.total > 0 ? `${(contactMetrics.new / contactMetrics.total) * 100}%` : '0%',
                                        backgroundColor: '#8662b0'
                                    }}></div>
                                </div>
                                <div className={styles.metricValue}>{contactMetrics.new}</div>
                            </div>
                            <div className={styles.metricItem}>
                                <div className={styles.metricLabel}>
                                    <span className={styles.statusDot} style={{ backgroundColor: '#ffbf00' }}></span>
                                    Replied
                                </div>
                                <div className={styles.metricBar}>
                                    <div className={styles.metricBarFill} style={{
                                        width: contactMetrics.total > 0 ? `${(contactMetrics.replied / contactMetrics.total) * 100}%` : '0%',
                                        backgroundColor: '#ffbf00'
                                    }}></div>
                                </div>
                                <div className={styles.metricValue}>{contactMetrics.replied}</div>
                            </div>
                            <div className={styles.metricItem}>
                                <div className={styles.metricLabel}>
                                    <span className={styles.statusDot} style={{ backgroundColor: '#10b981' }}></span>
                                    Resolved
                                </div>
                                <div className={styles.metricBar}>
                                    <div className={styles.metricBarFill} style={{
                                        width: contactMetrics.total > 0 ? `${(contactMetrics.resolved / contactMetrics.total) * 100}%` : '0%',
                                        backgroundColor: '#10b981'
                                    }}></div>
                                </div>
                                <div className={styles.metricValue}>{contactMetrics.resolved}</div>
                            </div>
                        </div>
                    </div>

                    {/* Enquiry Status Distribution */}
                    <div className={styles.reportingCard}>
                        <h3>Enquiry Status Distribution</h3>
                        <div className={styles.reportingMetrics}>
                            <div className={styles.metricItem}>
                                <div className={styles.metricLabel}>
                                    <span className={styles.statusDot} style={{ backgroundColor: '#8662b0' }}></span>
                                    New
                                </div>
                                <div className={styles.metricBar}>
                                    <div className={styles.metricBarFill} style={{
                                        width: enquiryMetrics.total > 0 ? `${(enquiryMetrics.new / enquiryMetrics.total) * 100}%` : '0%',
                                        backgroundColor: '#8662b0'
                                    }}></div>
                                </div>
                                <div className={styles.metricValue}>{enquiryMetrics.new}</div>
                            </div>
                            <div className={styles.metricItem}>
                                <div className={styles.metricLabel}>
                                    <span className={styles.statusDot} style={{ backgroundColor: '#ffbf00' }}></span>
                                    Contacted
                                </div>
                                <div className={styles.metricBar}>
                                    <div className={styles.metricBarFill} style={{
                                        width: enquiryMetrics.total > 0 ? `${(enquiryMetrics.contacted / enquiryMetrics.total) * 100}%` : '0%',
                                        backgroundColor: '#ffbf00'
                                    }}></div>
                                </div>
                                <div className={styles.metricValue}>{enquiryMetrics.contacted}</div>
                            </div>
                            <div className={styles.metricItem}>
                                <div className={styles.metricLabel}>
                                    <span className={styles.statusDot} style={{ backgroundColor: '#10b981' }}></span>
                                    Enrolled
                                </div>
                                <div className={styles.metricBar}>
                                    <div className={styles.metricBarFill} style={{
                                        width: enquiryMetrics.total > 0 ? `${(enquiryMetrics.enrolled / enquiryMetrics.total) * 100}%` : '0%',
                                        backgroundColor: '#10b981'
                                    }}></div>
                                </div>
                                <div className={styles.metricValue}>{enquiryMetrics.enrolled}</div>
                            </div>
                        </div>
                    </div>

                    {/* Admission Status Distribution */}
                    <div className={styles.reportingCard}>
                        <h3>Admission Status Distribution</h3>
                        <div className={styles.reportingMetrics}>
                            <div className={styles.metricItem}>
                                <div className={styles.metricLabel}>
                                    <span className={styles.statusDot} style={{ backgroundColor: '#f59e0b' }}></span>
                                    Pending
                                </div>
                                <div className={styles.metricBar}>
                                    <div className={styles.metricBarFill} style={{
                                        width: admissionMetrics.total > 0 ? `${(admissionMetrics.pending / admissionMetrics.total) * 100}%` : '0%',
                                        backgroundColor: '#f59e0b'
                                    }}></div>
                                </div>
                                <div className={styles.metricValue}>{admissionMetrics.pending}</div>
                            </div>
                            <div className={styles.metricItem}>
                                <div className={styles.metricLabel}>
                                    <span className={styles.statusDot} style={{ backgroundColor: '#10b981' }}></span>
                                    Approved
                                </div>
                                <div className={styles.metricBar}>
                                    <div className={styles.metricBarFill} style={{
                                        width: admissionMetrics.total > 0 ? `${(admissionMetrics.approved / admissionMetrics.total) * 100}%` : '0%',
                                        backgroundColor: '#10b981'
                                    }}></div>
                                </div>
                                <div className={styles.metricValue}>{admissionMetrics.approved}</div>
                            </div>
                            <div className={styles.metricItem}>
                                <div className={styles.metricLabel}>
                                    <span className={styles.statusDot} style={{ backgroundColor: '#ef4444' }}></span>
                                    Rejected
                                </div>
                                <div className={styles.metricBar}>
                                    <div className={styles.metricBarFill} style={{
                                        width: admissionMetrics.total > 0 ? `${(admissionMetrics.rejected / admissionMetrics.total) * 100}%` : '0%',
                                        backgroundColor: '#ef4444'
                                    }}></div>
                                </div>
                                <div className={styles.metricValue}>{admissionMetrics.rejected}</div>
                            </div>
                        </div>
                    </div>

                    {/* Spotlight Distribution */}
                    <div className={styles.reportingCard}>
                        <h3>Spotlight Publication Status</h3>
                        <div className={styles.reportingMetrics}>
                            <div className={styles.metricItem}>
                                <div className={styles.metricLabel}>
                                    <span className={styles.statusDot} style={{ backgroundColor: '#10b981' }}></span>
                                    Published
                                </div>
                                <div className={styles.metricBar}>
                                    <div className={styles.metricBarFill} style={{
                                        width: spotlightMetrics.total > 0 ? `${(spotlightMetrics.published / spotlightMetrics.total) * 100}%` : '0%',
                                        backgroundColor: '#10b981'
                                    }}></div>
                                </div>
                                <div className={styles.metricValue}>{spotlightMetrics.published}</div>
                            </div>
                            <div className={styles.metricItem}>
                                <div className={styles.metricLabel}>
                                    <span className={styles.statusDot} style={{ backgroundColor: '#ef4444' }}></span>
                                    Unpublished
                                </div>
                                <div className={styles.metricBar}>
                                    <div className={styles.metricBarFill} style={{
                                        width: spotlightMetrics.total > 0 ? `${(spotlightMetrics.unpublished / spotlightMetrics.total) * 100}%` : '0%',
                                        backgroundColor: '#ef4444'
                                    }}></div>
                                </div>
                                <div className={styles.metricValue}>{spotlightMetrics.unpublished}</div>
                            </div>
                        </div>
                    </div>

                    {/* Overall Metrics */}
                    <div className={styles.reportingCard}>
                        <h3>Overall Performance Metrics</h3>
                        <div className={styles.reportingMetrics}>
                            <div className={styles.metricItem}>
                                <div className={styles.metricLabel}>
                                    <span className={styles.statusDot} style={{ backgroundColor: '#6a4c93' }}></span>
                                    Avg Response Rate
                                </div>
                                <div className={styles.metricBar}>
                                    <div className={styles.metricBarFill} style={{
                                        width: `${contactMetrics.responseRate}%`,
                                        backgroundColor: '#6a4c93'
                                    }}></div>
                                </div>
                                <div className={styles.metricValue}>{contactMetrics.responseRate}%</div>
                            </div>
                            <div className={styles.metricItem}>
                                <div className={styles.metricLabel}>
                                    <span className={styles.statusDot} style={{ backgroundColor: '#10b981' }}></span>
                                    Conversion Rate
                                </div>
                                <div className={styles.metricBar}>
                                    <div className={styles.metricBarFill} style={{
                                        width: `${enquiryMetrics.conversionRate}%`,
                                        backgroundColor: '#10b981'
                                    }}></div>
                                </div>
                                <div className={styles.metricValue}>{enquiryMetrics.conversionRate}%</div>
                            </div>
                            <div className={styles.metricItem}>
                                <div className={styles.metricLabel}>
                                    <span className={styles.statusDot} style={{ backgroundColor: '#ec4899' }}></span>
                                    Approval Rate
                                </div>
                                <div className={styles.metricBar}>
                                    <div className={styles.metricBarFill} style={{
                                        width: `${admissionMetrics.approvalRate}%`,
                                        backgroundColor: '#ec4899'
                                    }}></div>
                                </div>
                                <div className={styles.metricValue}>{admissionMetrics.approvalRate}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Data Summary Metrics */}
                    <div className={styles.reportingCard}>
                        <h3>Module Records Summary</h3>
                        <div className={styles.reportingMetrics}>
                            <div className={styles.metricItem}>
                                <div className={styles.metricLabel}>
                                    <span className={styles.statusDot} style={{ backgroundColor: '#3b82f6' }}></span>
                                    Contacts
                                </div>
                                <div className={styles.metricBar}>
                                    <div className={styles.metricBarFill} style={{
                                        width: (contactMetrics.total / (contactMetrics.total + enquiryMetrics.total + admissionMetrics.total + spotlightMetrics.total) * 100) || 0,
                                        backgroundColor: '#3b82f6'
                                    }}></div>
                                </div>
                                <div className={styles.metricValue}>{contactMetrics.total}</div>
                            </div>
                            <div className={styles.metricItem}>
                                <div className={styles.metricLabel}>
                                    <span className={styles.statusDot} style={{ backgroundColor: '#f59e0b' }}></span>
                                    Enquiries
                                </div>
                                <div className={styles.metricBar}>
                                    <div className={styles.metricBarFill} style={{
                                        width: (enquiryMetrics.total / (contactMetrics.total + enquiryMetrics.total + admissionMetrics.total + spotlightMetrics.total) * 100) || 0,
                                        backgroundColor: '#f59e0b'
                                    }}></div>
                                </div>
                                <div className={styles.metricValue}>{enquiryMetrics.total}</div>
                            </div>
                            <div className={styles.metricItem}>
                                <div className={styles.metricLabel}>
                                    <span className={styles.statusDot} style={{ backgroundColor: '#8b5cf6' }}></span>
                                    Admissions
                                </div>
                                <div className={styles.metricBar}>
                                    <div className={styles.metricBarFill} style={{
                                        width: (admissionMetrics.total / (contactMetrics.total + enquiryMetrics.total + admissionMetrics.total + spotlightMetrics.total) * 100) || 0,
                                        backgroundColor: '#8b5cf6'
                                    }}></div>
                                </div>
                                <div className={styles.metricValue}>{admissionMetrics.total}</div>
                            </div>
                            <div className={styles.metricItem}>
                                <div className={styles.metricLabel}>
                                    <span className={styles.statusDot} style={{ backgroundColor: '#ec4899' }}></span>
                                    Spotlights
                                </div>
                                <div className={styles.metricBar}>
                                    <div className={styles.metricBarFill} style={{
                                        width: (spotlightMetrics.total / (contactMetrics.total + enquiryMetrics.total + admissionMetrics.total + spotlightMetrics.total) * 100) || 0,
                                        backgroundColor: '#ec4899'
                                    }}></div>
                                </div>
                                <div className={styles.metricValue}>{spotlightMetrics.total}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Recent Activity Section */}
            <motion.div
                className={styles.activitySection}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
            >
                <div className={styles.activityHeader}>
                    <div className={styles.activityTitle}>
                        <h2>Recent Activity</h2>
                        <p>Latest updates from your contacts and enquiries</p>
                    </div>
                    <div className={styles.tabSwitch}>
                        {['contacts', 'enquiries'].map((tab) => (
                            <motion.button
                                key={tab}
                                className={`${styles.tab} ${selectedTab === tab ? styles.active : ''
                                    }`}
                                onClick={() => setSelectedTab(tab as 'contacts' | 'enquiries')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {tab === 'contacts' ? '📧 Contacts' : '👶 Enquiries'}
                            </motion.button>
                        ))}
                    </div>
                </div>

                <div className={styles.activityListWrapper}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={styles.activityList}
                        >
                            {selectedTab === 'contacts' ? (
                                rangedContacts.slice(0, 10).length > 0 ? (
                                    rangedContacts.slice(0, 10).map((contact, idx) => (
                                        <ActivityItem
                                            key={contact.id}
                                            name={contact.name}
                                            detail={contact.email}
                                            status={contact.status}
                                            date={contact.created_at}
                                            index={idx}
                                        />
                                    ))
                                ) : (
                                    <div className={styles.emptyState}>
                                        <FaEnvelope />
                                        <p>No contacts in this period</p>
                                    </div>
                                )
                            ) : rangedEnquiries.slice(0, 10).length > 0 ? (
                                rangedEnquiries.slice(0, 10).map((enquiry, idx) => (
                                    <ActivityItem
                                        key={enquiry.id}
                                        name={enquiry.child_name}
                                        detail={enquiry.program}
                                        status={enquiry.status}
                                        date={enquiry.created_at}
                                        index={idx}
                                    />
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <FaUsers />
                                    <p>No enquiries in this period</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

const StatCardComponent = ({ card }: { card: StatCard }) => {
    return (
        <motion.div
            className={styles.statCardWrapper}
            whileHover={{ translateY: -8 }}
            transition={{ duration: 0.3 }}
        >
            <div className={styles.statCardInner}>
                <div
                    className={styles.statCardBg}
                    style={{ backgroundColor: card.bgColor }}
                ></div>
                <div className={styles.statCardContent}>
                    <div className={styles.statCardTop}>
                        <div
                            className={styles.statCardIcon}
                            style={{ color: card.color }}
                        >
                            {card.icon}
                        </div>
                        {card.trend && (
                            <motion.div
                                className={`${styles.trendBadge} ${card.trend.isPositive ? styles.positive : styles.negative
                                    }`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {card.trend.isPositive ? (
                                    <FaArrowUp />
                                ) : (
                                    <FaArrowDown />
                                )}
                                <span>{card.trend.value}%</span>
                            </motion.div>
                        )}
                    </div>
                    <div className={styles.statCardBottom}>
                        <motion.div
                            className={styles.statCardValue}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            {card.value}
                        </motion.div>
                        <h4 className={styles.statCardTitle}>{card.title}</h4>
                        <p className={styles.statCardSubtitle}>{card.subtitle}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const ActivityItem = ({
    name,
    detail,
    status,
    date,
    index,
}: {
    name: string;
    detail: string;
    status: string;
    date: string;
    index: number;
}) => {
    const getStatusColor = (s: string) => {
        switch (s) {
            case 'new':
                return '#8662b0';
            case 'replied':
            case 'contacted':
                return '#ffbf00';
            case 'resolved':
            case 'enrolled':
                return '#10b981';
            case 'archived':
            case 'cancelled':
                return '#ef4444';
            default:
                return '#6a4c93';
        }
    };

    return (
        <motion.div
            className={styles.activityItemWrapper}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 8 }}
        >
            <div className={styles.activityItemContent}>
                <div className={styles.activityItemLeft}>
                    <div className={styles.activityAvatar}>{name.charAt(0).toUpperCase()}</div>
                    <div className={styles.activityInfo}>
                        <h4>{name}</h4>
                        <p>{detail}</p>
                    </div>
                </div>
                <div className={styles.activityItemRight}>
                    <span
                        className={styles.statusBadge}
                        style={{
                            backgroundColor: `${getStatusColor(status)}20`,
                            color: getStatusColor(status),
                            borderColor: getStatusColor(status),
                        }}
                    >
                        {status}
                    </span>
                    <span className={styles.activityDate}>
                        {new Date(date).toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;