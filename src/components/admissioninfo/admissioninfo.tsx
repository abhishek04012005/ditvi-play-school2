'use client';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaPhone, FaEnvelope } from 'react-icons/fa';
import styles from './admissioninfo.module.css';
import schoolDetails from '@/json/schooldetails';

interface AdmissionInfoProps {
    variant?: 'default' | 'compact' | 'minimal';
    showDocuments?: boolean;
    showContact?: boolean;
    className?: string;
}

const AdmissionInfo = ({
    variant = 'default',
    showDocuments = true,
    showContact = true,
    className = ''
}: AdmissionInfoProps) => {
    const requiredDocuments = [
        'Birth Certificate',
        'Immunization Records',
        'Recent Photographs',
        'Previous School Records (if any)',
        'Parent ID Proof',
        'Address Proof'
    ];

    return (
        <motion.div
            className={`${styles.infoSection} ${styles[variant]} ${className}`}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
        >
            {showDocuments && (
                <motion.div
                    className={styles.requirementsList}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    viewport={{ once: true }}
                >
                    <div className={styles.header}>
                        <h3>Required Documents</h3>
                        <span className={styles.docIcon}>📋</span>
                    </div>
                    <ul>
                        {requiredDocuments.map((doc, index) => (
                            <motion.li
                                key={doc}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                viewport={{ once: true }}
                            >
                                <FaCheckCircle className={styles.checkIcon} />
                                <span>{doc}</span>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {showContact && (
                <motion.div
                    className={styles.contactInfo}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: showDocuments ? 0.2 : 0.1 }}
                    viewport={{ once: true }}
                >
                    <div className={styles.header}>
                        <h3>Need Help?</h3>
                        <span className={styles.helpIcon}>🤝</span>
                    </div>
                    <p>Contact our admission team:</p>
                    <div className={styles.contactDetails}>
                        <motion.a
                            href={`mailto:${schoolDetails.contact.email}`}
                            className={styles.contactItem}
                            whileHover={{ scale: 1.05, x: 5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaEnvelope className={styles.contactIcon} />
                            <span>{schoolDetails.contact.email}</span>
                        </motion.a>
                        <motion.a
                            href={`tel:${schoolDetails.contact.phone}`}
                            className={styles.contactItem}
                            whileHover={{ scale: 1.05, x: 5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaPhone className={styles.contactIcon} />
                            <span>{schoolDetails.contact.phone}</span>
                        </motion.a>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default AdmissionInfo;