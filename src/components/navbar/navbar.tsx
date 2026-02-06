'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { FaWhatsapp } from 'react-icons/fa';
import { BiMessageDetail, BiSearch } from 'react-icons/bi';
import styles from './navbar.module.css';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import schoolDetails from '@/json/schooldetails';
import schoolDetailsHi from '@/json/schooldetails-hi';
import LanguageToggle from '@/components/LanguageToggle/LanguageToggle';
import en from '@/translations/en.json';
import hi from '@/translations/hi.json';
import whatsappMessages from '@/json/whatsappMessages';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  
  // Load translations
  useEffect(() => {
    try {
      const saved = localStorage.getItem('language') as 'en' | 'hi' | null;
      if (saved && (saved === 'en' || saved === 'hi')) {
        setLanguage(saved);
      }
    } catch (e) {
      // localStorage might not be available
    }
  }, []);
  
  // Get translations based on current language
  const translations = language === 'hi' ? hi : en;
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key.split('.').pop();
  };

  const isAdminPage = pathname?.startsWith('/admin');

  const currentSchoolDetails = schoolDetails;

  const handleWhatsAppClick = () => {
    const message = whatsappMessages.contact;
    window.open(`https://wa.me/${currentSchoolDetails.contact.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAdmissionClick = () => {
    // Reload the page when admission button is clicked
    window.location.href = '/admission-form';
  };

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/about', label: t('nav.aboutUs') },
    { href: '/programs', label: t('nav.programs') },
    { href: '/spotlight', label: t('nav.spotlight') },
    { href: '/gallery', label: t('nav.gallery') },
    { href: '/contact', label: t('nav.contact') },

  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (isAdminPage) {
    return null;
  }


  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo}>
            <Image
              src={currentSchoolDetails.logo}
              alt={currentSchoolDetails.name + ' Logo'}
              width={40}
              height={40}
            />
            <span className={styles.logoText}>{currentSchoolDetails.name}</span>
          </Link>

          <div className={styles.navWrapper}>
            <div className={`${styles.navLinks} ${isMenuOpen ? styles.open : ''}`}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navLink} ${pathname === link.href ? styles.active : ''
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <button 
              onClick={handleAdmissionClick}
              className={styles.enrollBtn}
            >
              {t('nav.admission')}
            </button>

            <LanguageToggle />

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


      <div className={styles.floatingButtons}>
        <Link
          href="/enquiry"
          className={`${styles.floatingButton} ${styles.enquiryButton}`}
        >
          <BiMessageDetail />
          <span>{t('nav.contact')}</span>
        </Link>
        <Link
          href="/admission-status"
          className={`${styles.floatingButton} ${styles.searchButton}`}
        >
          <BiSearch />
          <span>{t('nav.admissionStatus')}</span>
        </Link>
        <button
          className={`${styles.floatingButton} ${styles.whatsappButton}`}
          onClick={handleWhatsAppClick}
          aria-label="Contact on WhatsApp"
        >
          <FaWhatsapp />
          <span>WhatsApp</span>
        </button>
      </div>
    </>
  );
};

export default Navbar;