'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaYoutube, FaLinkedinIn, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import styles from './footer.module.css';
import schoolDetails from '@/json/schooldetails';


const Footer = () => {
  const socialLinks = [
    { icon: <FaFacebookF />, url: `${schoolDetails.socialMedia.facebook}`, label: 'Facebook' },
    { icon: <FaXTwitter />, url: `${schoolDetails.socialMedia.x}`, label: 'X' },
    { icon: <FaInstagram />, url: `${schoolDetails.socialMedia.instagram}`, label: 'Instagram' },
    { icon: <FaYoutube />, url: `${schoolDetails.socialMedia.youtube}`, label: 'YouTube' },
    { icon: <FaLinkedinIn />, url: `${schoolDetails.socialMedia.linkedin}`, label: 'LinkedIn' }
  ];

  const quickLinks = [
    { text: 'Home', href: '/' },
    { text: 'About Us', href: '/about' },
    { text: 'Programs', href: '/programs' },
    { text: 'Admission', href: '/admission-form' },
    { text: 'Gallery', href: '/gallery' },
    { text: 'Contact', href: '/contact' },
    { text: 'Admin', href: '/admin/login' },
  ];

  const contactDetails = [
    {
      icon: <FaMapMarkerAlt />,
      text: `${schoolDetails.address.street}, ${schoolDetails.address.city}, ${schoolDetails.address.state} - ${schoolDetails.address.pincode}`,
      type: 'address'
    },
    {
      icon: <FaPhoneAlt />,
      text: `${schoolDetails.contact.phone}`,
      type: 'phone',
      href: `tel:${schoolDetails.contact.phone}`
    },
    {
      icon: <FaEnvelope />,
      text: `${schoolDetails.contact.email}`,
      type: 'email',
      href: `mailto:${schoolDetails.contact.email}`
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.decorativeWave}>
        <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="var(--white)"
            fillOpacity="0"
            d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div className={styles.content}>
        <div className={styles.mainSection}>
          <motion.div
            className={styles.logoSection}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Image
              src={schoolDetails.logo}
              alt={schoolDetails.name + ' Logo'}
              width={150}
              height={150}
              className={styles.logo}
            />
            <p>Nurturing young minds with love, care, and creative learning experiences.</p>
            <div className={styles.socialLinks}>
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.url}
                  className={styles.socialIcon}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div
            className={styles.linksSection}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3>Quick Links</h3>
            <ul>
              {quickLinks.map((link) => (
                <li key={link.text}>
                  <Link href={link.href}>{link.text}</Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className={styles.contactSection}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3>Contact Details</h3>
            <ul>
              {contactDetails.map((info, index) => (
                <li key={index} className={styles.contactItem}>
                  <span className={styles.contactIcon}>
                    {info.icon}
                  </span>
                  {info.href ? (
                    <motion.a
                      href={info.href}
                      className={styles.contactLink}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {info.text}
                    </motion.a>
                  ) : (
                    <span className={styles.contactText}>{info.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          className={styles.bottomBar}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <p>&copy; {new Date().getFullYear()} {schoolDetails.name}. All rights reserved.</p>
          <p>Powered by <a href="https://technologies.ditvi.org/" target='_blank'> <strong>Ditvi Technologies</strong></a></p>
          <div className={styles.bottomLinks}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;