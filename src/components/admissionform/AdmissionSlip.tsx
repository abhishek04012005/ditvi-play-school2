'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './admissionform.module.css';
import { schoolDetails } from '@/json/schooldetails';

interface SubmissionResult {
    admission_number: string;
    child_name: string;
    parent_mobile_number: string;
    program_name: string;
}

interface FormData {
    child_name: string;
    child_dob: string;
    child_gender: string;
    child_place_of_birth: string;
    child_blood_group: string;
    parent_name: string;
    parent_address: string;
    parent_mobile_number: string;
    parent_email: string;
    program_name: string;
    previous_school: string;
}

interface AdmissionSlipProps {
    data: SubmissionResult;
    formData: FormData;
}

// Utility function to mask contact number
const maskContactNumber = (phoneNumber: string): string => {
    if (!phoneNumber) return 'Not provided';
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 4) return phoneNumber;
    return 'XXXXXX' + cleaned.slice(-4);
};

// Format date function
const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return 'N/A';
    }
};

// Main Component
const AdmissionSlip: React.FC<AdmissionSlipProps> = ({ data, formData }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 },
        },
    };

    const logoSrc = typeof schoolDetails.logo === 'string'
        ? schoolDetails.logo
        : (schoolDetails.logo as any)?.src;

    return (
        <motion.div
            className={styles.slipContainer}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Professional Header Section */}
            <motion.div className={styles.slipHeaderSection} variants={itemVariants}>
                <div className={styles.slipHeaderTop}>
                    {logoSrc && (
                        <img src={logoSrc} alt="School Logo" className={styles.slipLogo} />
                    )}
                    <div className={styles.slipHeaderCenter}>
                        <h1 className={styles.slipSchoolName}>{schoolDetails.name}</h1>
                        <p className={styles.slipSchoolAddress}>
                            {schoolDetails.address.street}, {schoolDetails.address.city}
                        </p>
                        <p className={styles.slipSchoolContact}>
                            {schoolDetails.contact.phone} | {schoolDetails.contact.email}
                        </p>
                    </div>
                    {logoSrc && (
                        <img src={logoSrc} alt="School Logo" className={styles.slipLogo} />
                    )}
                </div>
                <div className={styles.slipHeaderDivider}></div>
                <h2 className={styles.slipFormTitle}>ADMISSION CONFIRMATION SLIP</h2>
                <div className={styles.slipHeaderDivider}></div>
            </motion.div>

            {/* Admission Number Box - Prominent Display */}
            <motion.div className={styles.slipAdmissionBox} variants={itemVariants}>
                <div className={styles.slipAdmissionBoxContent}>
                    <span className={styles.slipAdmissionLabel}>Admission Number</span>
                    <span className={styles.slipAdmissionNumber}>{data.admission_number}</span>
                </div>
            </motion.div>

            {/* Details Grid - Professional 2-Column Layout */}
            <div className={styles.slipDetailsGrid}>
                {/* Child Information Section */}
                <motion.div className={styles.slipDetailSection} variants={itemVariants}>
                    <h3 className={styles.slipSectionTitle}>CHILD INFORMATION</h3>
                    <div className={styles.slipDetailContent}>
                        <div className={styles.slipDetailRow}>
                            <span className={styles.slipDetailLabel}>Child Name</span>
                            <span className={styles.slipDetailValue}>{data.child_name}</span>
                        </div>
                        <div className={styles.slipDetailRow}>
                            <span className={styles.slipDetailLabel}>Date of Birth</span>
                            <span className={styles.slipDetailValue}>{formatDate(formData.child_dob)}</span>
                        </div>
                        <div className={styles.slipDetailRow}>
                            <span className={styles.slipDetailLabel}>Gender</span>
                            <span className={styles.slipDetailValue}>{formData.child_gender || 'N/A'}</span>
                        </div>
                        <div className={styles.slipDetailRow}>
                            <span className={styles.slipDetailLabel}>Place of Birth</span>
                            <span className={styles.slipDetailValue}>{formData.child_place_of_birth || 'N/A'}</span>
                        </div>
                        <div className={styles.slipDetailRow}>
                            <span className={styles.slipDetailLabel}>Blood Group</span>
                            <span className={styles.slipDetailValue}>{formData.child_blood_group || 'N/A'}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Parent Information Section */}
                <motion.div className={styles.slipDetailSection} variants={itemVariants}>
                    <h3 className={styles.slipSectionTitle}>PARENT INFORMATION</h3>
                    <div className={styles.slipDetailContent}>
                        <div className={styles.slipDetailRow}>
                            <span className={styles.slipDetailLabel}>Parent Name</span>
                            <span className={styles.slipDetailValue}>{formData.parent_name}</span>
                        </div>
                        <div className={styles.slipDetailRow}>
                            <span className={styles.slipDetailLabel}>Mobile Number</span>
                            <span className={styles.slipDetailValue}>{maskContactNumber(data.parent_mobile_number)}</span>
                        </div>
                        <div className={styles.slipDetailRow}>
                            <span className={styles.slipDetailLabel}>Email</span>
                            <span className={styles.slipDetailValue}>{formData.parent_email || 'Not provided'}</span>
                        </div>
                        <div className={styles.slipDetailRow}>
                            <span className={styles.slipDetailLabel}>Address</span>
                            <span className={styles.slipDetailValue}>{formData.parent_address || 'N/A'}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Program Details Section */}
                <motion.div className={styles.slipDetailSection} variants={itemVariants}>
                    <h3 className={styles.slipSectionTitle}>PROGRAM DETAILS</h3>
                    <div className={styles.slipDetailContent}>
                        <div className={styles.slipDetailRow}>
                            <span className={styles.slipDetailLabel}>Applied Program</span>
                            <span className={styles.slipDetailValue}>
                                <span className={styles.slipProgramBadge}>{data.program_name}</span>
                            </span>
                        </div>
                        <div className={styles.slipDetailRow}>
                            <span className={styles.slipDetailLabel}>Previous School</span>
                            <span className={styles.slipDetailValue}>{formData.previous_school || 'N/A'}</span>
                        </div>
                        <div className={styles.slipDetailRow}>
                            <span className={styles.slipDetailLabel}>Submission Date</span>
                            <span className={styles.slipDetailValue}>
                                {new Date().toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                        <div className={styles.slipDetailRow}>
                            <span className={styles.slipDetailLabel}>Status</span>
                            <span className={styles.slipDetailValue}>
                                <span className={styles.slipStatusBadge}>Under Review</span>
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Important Notes Section */}
                <motion.div className={styles.slipDetailSection} variants={itemVariants}>
                    <h3 className={styles.slipSectionTitle}>IMPORTANT NOTES</h3>
                    <div className={styles.slipNotesContent}>
                        <ul className={styles.slipNotesList}>
                            <li>Please keep this confirmation slip for your records</li>
                            <li>We will review your application within 5-7 business days</li>
                            <li>A confirmation call will be made to the provided contact number</li>
                            <li>Required documents must be submitted as per school guidelines</li>
                            <li>For queries, contact: {schoolDetails.contact.phone}</li>
                        </ul>
                    </div>
                </motion.div>
            </div>

            {/* Footer Section */}
            <motion.div className={styles.slipFooterSection} variants={itemVariants}>
                <div className={styles.slipFooterContent}>
                    <p className={styles.slipFooterMessage}>
                        Thank you for choosing {schoolDetails.name}. We look forward to welcoming{' '}
                        <strong>{data.child_name}</strong> to our school family.
                    </p>
                    <div className={styles.slipFooterMeta}>
                        <span className={styles.slipFooterItem}>Doc ID: {data.admission_number}</span>
                        <span className={styles.slipFooterSeparator}>•</span>
                        <span className={styles.slipFooterItem}>
                            Generated: {new Date().toLocaleDateString('en-IN')}
                        </span>
                        <span className={styles.slipFooterSeparator}>•</span>
                        <span className={styles.slipFooterItem}>Official Confirmation</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AdmissionSlip;
