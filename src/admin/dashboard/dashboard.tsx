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
} from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import styles from './dashboard.module.css';
import HeadingTitle from '@/components/heading/headingtitle';

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
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('month');
    const [selectedTab, setSelectedTab] = useState<'contacts' | 'enquiries'>('contacts');

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

            setContacts(contactData || []);
            setEnquiries(enquiryData || []);
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
        return data.filter((item) => new Date(item.created_at) >= pastDate);
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

    const rangedContacts = getDateRangeData(contacts, getDaysForRange());
    const rangedEnquiries = getDateRangeData(enquiries, getDaysForRange());

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
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' },
        },
    };

    if (loading) {
        return (
            <div className={styles.loadingWrapper}>
                <motion.div
                    className={styles.loadingContent}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className={styles.loadingSpinner}></div>
                    <p>Loading dashboard...</p>
                </motion.div>
            </div>
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
                    <div className={styles.headerControls}>
                        <div className={styles.dateRangeControl}>
                            <FaCalendarAlt className={styles.controlIcon} />
                            {['week', 'month', 'year'].map((range) => (
                                <motion.button
                                    key={range}
                                    className={`${styles.rangeBtn} ${dateRange === range ? styles.active : ''
                                        }`}
                                    onClick={() => setDateRange(range)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {range === 'week' ? 'Last 7 Days' : range === 'month' ? 'Last 30 Days' : 'Last Year'}
                                </motion.button>
                            ))}
                        </div>
                    </div>
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