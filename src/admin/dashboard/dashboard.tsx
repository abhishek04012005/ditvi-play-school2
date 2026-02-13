'use client';
import { useState, useEffect } from 'react';
import {
    MailOutlined,
    PeopleOutlined,
    SchoolOutlined,
    StarOutlined,
    BabyChangingStationOutlined,
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import styles from './dashboard.module.css';
import Loader from '@/custom/loader/loader';
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
    father_name: string;
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
    const [selectedTab, setSelectedTab] = useState<'contacts' | 'enquiries' | 'admissions'>('contacts');
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

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

    const rangedContacts = getDateRangeData(contacts, 30);
    const rangedEnquiries = getDateRangeData(enquiries, 30);

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

    const rangedAdmissions = getDateRangeData(admissions, 30);
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

    const rangedSpotlights = getDateRangeData(spotlights, 30);
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
            subtitle: `${contactMetrics.new} new`,
            icon: <MailOutlined />,
            color: '#6a4c93',
            bgColor: '#f3e8ff',
        },
        {
            title: 'Total Enquiries',
            value: enquiryMetrics.total,
            subtitle: `${enquiryMetrics.enrolled} enrolled`,
            icon: <PeopleOutlined />,
            color: '#10b981',
            bgColor: '#f0fdf4',
        },
        {
            title: 'Total Admissions',
            value: admissionMetrics.total,
            subtitle: `${admissionMetrics.approved} approved`,
            icon: <SchoolOutlined />,
            color: '#3b82f6',
            bgColor: '#eff6ff',
        },
        {
            title: 'Total Spotlights',
            value: spotlightMetrics.total,
            subtitle: `${spotlightMetrics.published} published`,
            icon: <StarOutlined />,
            color: '#f59e0b',
            bgColor: '#fffbf0',
        },
    ];

    if (loading) {
        return <Loader />;
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.dashboardHeader}>
                <div>
                    <HeadingTitle text='Dashboard' />
                    <p className={styles.dashboardSubtitle}>Last 30 days overview</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                {statCards.map((card, index) => (
                    <StatCardComponent 
                        key={index} 
                        card={card} 
                        index={index}
                        isHovered={hoveredCard === index}
                        onHover={() => setHoveredCard(index)}
                        onHoverEnd={() => setHoveredCard(null)}
                    />
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className={styles.activitySection}>
                <div className={styles.activityHeader}>
                    <div>
                        <h2 className={styles.activityTitle}>Recent Activity</h2>
                        <p className={styles.activitySubtitle}>Latest updates from the system</p>
                    </div>
                    <div className={styles.tabSwitch}>
                        <button
                            className={`${styles.tab} ${selectedTab === 'contacts' ? styles.active : ''}`}
                            onClick={() => setSelectedTab('contacts')}
                        >
                            <MailOutlined sx={{ mr: 0.5, fontSize: '0.9rem' }} />Contacts
                        </button>
                        <button
                            className={`${styles.tab} ${selectedTab === 'enquiries' ? styles.active : ''}`}
                            onClick={() => setSelectedTab('enquiries')}
                        >
                            <BabyChangingStationOutlined sx={{ mr: 0.5, fontSize: '0.9rem' }} />Enquiries
                        </button>
                        <button
                            className={`${styles.tab} ${selectedTab === 'admissions' ? styles.active : ''}`}
                            onClick={() => setSelectedTab('admissions')}
                        >
                            <SchoolOutlined sx={{ mr: 0.5, fontSize: '0.9rem' }} />Admissions
                        </button>
                    </div>
                </div>

                <div className={styles.activityListWrapper}>
                    <div className={styles.activityList}>
                        {selectedTab === 'contacts' ? (
                            rangedContacts.slice(0, 5).length > 0 ? (
                                rangedContacts.slice(0, 5).map((contact) => (
                                    <ActivityItem
                                        key={contact.id}
                                        name={contact.name}
                                        detail={contact.email}
                                        status={contact.status}
                                        date={contact.created_at}
                                    />
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <MailOutlined />
                                    <p>No contacts</p>
                                </div>
                            )
                        ) : selectedTab === 'enquiries' ? (
                            rangedEnquiries.slice(0, 5).length > 0 ? (
                                rangedEnquiries.slice(0, 5).map((enquiry) => (
                                    <ActivityItem
                                        key={enquiry.id}
                                        name={enquiry.child_name}
                                        detail={enquiry.program}
                                        status={enquiry.status}
                                        date={enquiry.created_at}
                                    />
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <PeopleOutlined />
                                    <p>No enquiries</p>
                                </div>
                            )
                        ) : rangedAdmissions.slice(0, 5).length > 0 ? (
                            rangedAdmissions.slice(0, 5).map((admission) => (
                                <ActivityItem
                                    key={admission.id}
                                    name={admission.child_name || admission.child_first_name || 'N/A'}
                                    detail={admission.program_name || 'N/A'}
                                    status={admission.admission_status}
                                    date={admission.created_at}
                                />
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <SchoolOutlined />
                                <p>No admissions</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCardComponent = ({ 
    card, 
    index, 
    isHovered, 
    onHover, 
    onHoverEnd 
}: { 
    card: StatCard; 
    index: number;
    isHovered: boolean;
    onHover: () => void;
    onHoverEnd: () => void;
}) => {
    return (
        <div 
            className={`${styles.statCardWrapper} ${isHovered ? styles.cardHovered : ''}`}
            onMouseEnter={onHover}
            onMouseLeave={onHoverEnd}
            style={{
                animationDelay: `${index * 0.1}s`
            }}
        >
            <div className={styles.statCardInner}>
                <div className={styles.statCardGradient} style={{ background: `linear-gradient(135deg, ${card.color}20, ${card.color}05)` }}></div>
                <div className={styles.statCardContent}>
                    <div className={styles.statCardTop}>
                        <div className={styles.statCardIcon} style={{ color: card.color, backgroundColor: `${card.color}15` }}>
                            {card.icon}
                        </div>
                        <div className={styles.statCardIconBg} style={{ backgroundColor: card.bgColor }}></div>
                    </div>
                    <div className={styles.statCardBottom}>
                        <h4 className={styles.statCardTitle}>{card.title}</h4>
                        <div className={styles.statCardValue}>{card.value}</div>
                        <p className={styles.statCardSubtitle}>{card.subtitle}</p>
                    </div>
                </div>
                <div className={styles.statCardAccent} style={{ backgroundColor: card.color }}></div>
            </div>
        </div>
    );
};

const ActivityItem = ({
    name,
    detail,
    status,
    date,
}: {
    name: string;
    detail: string;
    status: string;
    date: string;
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
        <div className={styles.activityItemWrapper}>
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
        </div>
    );
};

export default Dashboard;