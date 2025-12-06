'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaCog,
    FaSignOutAlt,
    FaUserCircle,
    FaChevronDown,
    FaUsers,
} from 'react-icons/fa';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import styles from './navbar.module.css';
import schoolDetails from '@/json/schooldetails';
import Loader from '@/custom/loader/loader';

interface NavItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
    submenu?: NavItem[];
    badge?: number;
}

const AdminNavbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();

    // Pages where admin navbar should NOT appear
    const hiddenPages = ['/admin/login', '/admin/register', '/admin/forgot-password'];

    // Check if we're in admin section AND not on a hidden page
    const isAdminPath = pathname?.startsWith('/admin') && !hiddenPages.includes(pathname);

    // Admin navigation items
    const navItems: NavItem[] = [
        {
            label: 'Dashboard',
            href: '/admin/dashboard',
        },
        {
            label: 'Admission Dashboard',
            href: '/admin/dashboard/admission',
        },
        {
            label: 'Enquiry Dashboard',
            href: '/admin/dashboard/enquiry',
        },
        {
            label: 'Contact Dashboard',
            href: '/admin/dashboard/contact',
        },
        {
            label: 'Spotlight Dashboard',
            href: '/admin/dashboard/spotlight',
        }
    ];

    const isActive = (href?: string) => href && pathname === href;

    // Initialize state with null/empty to match server-side render
    const [adminRoleId, setAdminRoleId] = useState<number | null>(null);
    const [adminUsername, setAdminUsername] = useState<string>('');

    // Update state only after component mounts (client-side only)
    useEffect(() => {
        try {
            const v = localStorage.getItem('adminRoleId');
            if (v !== null) {
                const n = parseInt(v, 10);
                if (!isNaN(n)) setAdminRoleId(n);
            }
            const name = localStorage.getItem('adminUsername');
            if (name) setAdminUsername(name);
        } catch (e) {
            // ignore
        }
    }, [pathname]);

    const handleLogout = async () => {
        setLoading(true);
        try {
            try {
                localStorage.removeItem('adminUsername');
                localStorage.removeItem('adminRoleId');
                localStorage.removeItem('adminEmail');
                localStorage.removeItem('isAdminLoggedIn');
            } catch (e) {
                // ignore
            }
            window.location.href = '/admin/login';
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleSubmenu = (label: string) => setOpenSubmenu(openSubmenu === label ? null : label);

    // Only render navbar if in admin section AND not on hidden pages
    if (!isAdminPath) return null;
    if (loading) return <Loader isVisible={true} message="Logging out..." fullScreen={true} />;

    return (
        <>
            <nav className={styles.navbar}>
                <div className={styles.navContainer}>
                    {/* Logo Section */}
                    <Link href="/admin/dashboard" className={styles.logo}>
                        <Image
                            src={schoolDetails?.logo || '/logo.png'}
                            alt={schoolDetails?.name || 'School Logo'}
                            width={40}
                            height={40}
                            className={styles.logoImage}
                            priority
                        />
                        <span className={styles.logoText}>Admin</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className={`${styles.navLinks} ${isMenuOpen ? styles.open : ''}`}>
                        {navItems.map((item) => (
                            <div key={item.label} className={styles.navItemWrapper}>
                                {item.submenu ? (
                                    <>
                                        <button
                                            className={styles.navLinkWithSubmenu}
                                            onClick={() => toggleSubmenu(item.label)}
                                        >
                                            {item.label}
                                            <FaChevronDown
                                                className={`${styles.dropdownIcon} ${openSubmenu === item.label ? styles.rotated : ''}`}
                                            />
                                        </button>

                                        {/* Desktop Submenu */}
                                        <div className={`${styles.submenu} ${styles.desktopSubmenu}`}>
                                            {item.submenu.map((subitem) => (
                                                <Link
                                                    key={subitem.label}
                                                    href={subitem.href || '#'}
                                                    className={`${styles.submenuItem} ${isActive(subitem.href) ? styles.active : ''}`}
                                                >
                                                    {subitem.label}
                                                </Link>
                                            ))}
                                        </div>

                                        {/* Mobile Submenu */}
                                        <AnimatePresence>
                                            {openSubmenu === item.label && (
                                                <motion.div
                                                    className={styles.mobileSubmenu}
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                >
                                                    {item.submenu.map((subitem) => (
                                                        <Link
                                                            key={subitem.label}
                                                            href={subitem.href || '#'}
                                                            className={`${styles.submenuItem} ${isActive(subitem.href) ? styles.active : ''}`}
                                                            onClick={() => setIsMenuOpen(false)}
                                                        >
                                                            {subitem.label}
                                                        </Link>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    // If tele-caller (role_id === 2), disable all except Admission Dashboard
                                    (adminRoleId === 2 && item.href !== '/admin/dashboard/admission') ? (
                                        <div className={`${styles.navLink} ${styles.inactive}`}>
                                            {item.label}
                                            {item.badge && (
                                                <span className={styles.badge}>{item.badge}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <Link
                                            href={item.href || '#'}
                                            className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {item.label}
                                            {item.badge && (
                                                <span className={styles.badge}>{item.badge}</span>
                                            )}
                                        </Link>
                                    )
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className={styles.navWrapper}>


                        {/* Profile Dropdown */}
                        <div className={styles.profileWrapper}>
                            <motion.button
                                className={styles.profileBtn}
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaUserCircle />
                            </motion.button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        className={styles.profileMenu}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <div className={styles.profileHeader}>
                                            <h4>{adminUsername || 'Admin User'}</h4>
                                        </div>

                                        <div className={styles.profileMenuItems}>
                                            <Link
                                                href="/admin/profile"
                                                className={styles.profileMenuItem}
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <FaUserCircle /> My Profile
                                            </Link>
                                            <Link
                                                href="/admin/change-password"
                                                className={styles.profileMenuItem}
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <FaCog /> Change Password
                                            </Link>
                                            {adminRoleId === 0 && (
                                                <Link
                                                    href="/admin/manage-user"
                                                    className={styles.profileMenuItem}
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <FaUsers /> Manage Users
                                                </Link>
                                            )}
                                        </div>

                                        <div className={styles.divider}></div>

                                        <button
                                            className={styles.logoutBtn}
                                            onClick={handleLogout}
                                        >
                                            <FaSignOutAlt /> Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className={styles.mobileMenuBtn}
                            onClick={toggleMenu}
                            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                        >
                            {isMenuOpen ? (
                                <CloseIcon sx={{ fontSize: 24, color: 'var(--primary-purple)' }} />
                            ) : (
                                <MenuIcon sx={{ fontSize: 24, color: 'var(--primary-purple)' }} />
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Navbar Spacer */}
            <div className={styles.navbarSpacer}></div>
        </>
    );
};

export default AdminNavbar
