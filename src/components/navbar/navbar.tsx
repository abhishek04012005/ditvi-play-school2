'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { FaWhatsapp } from 'react-icons/fa';
import { BiMessageDetail } from 'react-icons/bi';
import styles from './navbar.module.css';
import Logo from '../../../public/assets/logo/logo.png'
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import schoolDetails from '@/json/schooldetails';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isAdminPage = pathname?.startsWith('/admin');


  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${schoolDetails.contact.whatsapp}`, '_blank'); // Replace with your WhatsApp number
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/programs', label: 'Programs' },
    { href: '/spotlight', label: 'Spotlight' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/contact', label: 'Contact' },

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
              src={schoolDetails.logo}
              alt={schoolDetails.name + ' Logo'}
              width={40}
              height={40}
            />
            <span className={styles.logoText}>{schoolDetails.name}</span>
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

            <Link href="/admission-form" className={styles.enrollBtn}>
              Admission Now
            </Link>

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
          <span>Enquiry</span>
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