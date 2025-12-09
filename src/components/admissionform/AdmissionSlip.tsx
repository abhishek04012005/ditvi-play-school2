'use client';

import React from 'react';
import slipStyles from './admissionslip.module.css';
import { schoolDetails } from '@/json/schooldetails';
import { FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

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

interface DocumentStatus {
    photo: 'uploaded' | 'pending' | 'notUploaded';
    birth_certificate: 'uploaded' | 'pending' | 'notUploaded';
    aadhar_card: 'uploaded' | 'pending' | 'notUploaded';
    parent_id_proof: 'uploaded' | 'pending' | 'notUploaded';
}

interface AdmissionSlipProps {
    data: SubmissionResult;
    formData: FormData;
    documentStatus?: DocumentStatus;
}

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

// Get status icon for document
const getDocumentStatusIcon = (status: 'uploaded' | 'pending' | 'notUploaded') => {
    switch (status) {
        case 'uploaded':
            return <FaCheckCircle style={{ color: '#10b981' }} />;
        case 'pending':
            return <FaClock style={{ color: '#ffbf00' }} />;
        case 'notUploaded':
            return <FaTimesCircle style={{ color: '#ef4444' }} />;
        default:
            return null;
    }
};

// Get status text for document
const getDocumentStatusText = (status: 'uploaded' | 'pending' | 'notUploaded'): string => {
    switch (status) {
        case 'uploaded':
            return 'Uploaded';
        case 'pending':
            return 'Pending';
        case 'notUploaded':
            return 'Not Uploaded';
        default:
            return 'Unknown';
    }
};

// Main Component
const AdmissionSlip: React.FC<AdmissionSlipProps> = ({ data, formData, documentStatus }) => {
    const logoSrc = typeof schoolDetails.logo === 'string'
        ? schoolDetails.logo
        : (schoolDetails.logo as any)?.src;

    const todayDate = formatDate(new Date().toISOString());

    return (
        <div className={slipStyles.slipContainer}>
            {/* Header Section */}
            <div className={slipStyles.header}>
                <div className={slipStyles.headerTop}>
                    {logoSrc && (
                        <img src={logoSrc} alt="School Logo" className={slipStyles.logo} />
                    )}
                    <div className={slipStyles.headerCenter}>
                        <h1 className={slipStyles.schoolName}>{schoolDetails.name}</h1>
                        <p className={slipStyles.address}>{schoolDetails.address.street}</p>
                        <p className={slipStyles.addressDetail}>
                            {schoolDetails.address.city}, {schoolDetails.address.state} - {schoolDetails.address.pincode}
                        </p>
                        <p className={slipStyles.contact}>
                            Phone: {schoolDetails.contact.phone} | Email: {schoolDetails.contact.email}
                        </p>
                    </div>
                    {logoSrc && (
                        <img src={logoSrc} alt="School Logo" className={slipStyles.logo} />
                    )}
                </div>
                <div className={slipStyles.dividerMain}></div>
                <h2 className={slipStyles.formTitle}>ADMISSION CONFIRMATION SLIP</h2>
                <div className={slipStyles.dividerMain}></div>
            </div>

            {/* Meta Section - Admission Number */}
            <div className={slipStyles.metaSection}>
                <div className={slipStyles.metaRow}>
                    <div className={slipStyles.metaItem}>
                        <span className={slipStyles.metaLabel}>Admission No:</span>
                        <span className={slipStyles.metaValue}>{data.admission_number}</span>
                    </div>
                    <div className={slipStyles.metaItem}>
                        <span className={slipStyles.metaLabel}>Date:</span>
                        <span className={slipStyles.metaValue}>{todayDate}</span>
                    </div>
                    <div className={slipStyles.metaItem}>
                        <span className={slipStyles.metaLabel}>Status:</span>
                        <span className={slipStyles.metaValue}>Under Review</span>
                    </div>
                </div>
            </div>

            {/* Child Information Section */}
            <div className={slipStyles.section}>
                <h3 className={slipStyles.sectionTitle}>1. CHILD INFORMATION</h3>
                <div className={slipStyles.sectionContent}>
                    <div className={slipStyles.fieldRow}>
                        <div className={slipStyles.field}>
                            <label className={slipStyles.fieldLabel}>Child Name:</label>
                            <div className={slipStyles.fieldValue}>{data.child_name || 'N/A'}</div>
                        </div>
                        <div className={slipStyles.field}>
                            <label className={slipStyles.fieldLabel}>Date of Birth:</label>
                            <div className={slipStyles.fieldValue}>{formatDate(formData.child_dob)}</div>
                        </div>
                    </div>
                    <div className={slipStyles.fieldRow}>
                        <div className={slipStyles.field}>
                            <label className={slipStyles.fieldLabel}>Gender:</label>
                            <div className={slipStyles.fieldValue}>{formData.child_gender || 'N/A'}</div>
                        </div>
                        <div className={slipStyles.field}>
                            <label className={slipStyles.fieldLabel}>Place of Birth:</label>
                            <div className={slipStyles.fieldValue}>{formData.child_place_of_birth || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Parent Information Section */}
            <div className={slipStyles.section}>
                <h3 className={slipStyles.sectionTitle}>2. PARENT/GUARDIAN INFORMATION</h3>
                <div className={slipStyles.sectionContent}>
                    <div className={slipStyles.fieldRow}>
                        <div className={slipStyles.field}>
                            <label className={slipStyles.fieldLabel}>Parent Name:</label>
                            <div className={slipStyles.fieldValue}>{formData.parent_name || 'N/A'}</div>
                        </div>
                        <div className={slipStyles.field}>
                            <label className={slipStyles.fieldLabel}>Mobile Number:</label>
                            <div className={slipStyles.fieldValue}>{data.parent_mobile_number || 'N/A'}</div>
                        </div>
                    </div>
                    <div className={`${slipStyles.fieldRow} ${slipStyles.fullWidth}`}>
                        <div className={slipStyles.field}>
                            <label className={slipStyles.fieldLabel}>Address:</label>
                            <div className={slipStyles.fieldValue}>{formData.parent_address || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Program Details Section */}
            <div className={slipStyles.section}>
                <h3 className={slipStyles.sectionTitle}>3. PROGRAM & ADMISSION DETAILS</h3>
                <div className={slipStyles.sectionContent}>
                    <div className={slipStyles.fieldRow}>
                        <div className={slipStyles.field}>
                            <label className={slipStyles.fieldLabel}>Program:</label>
                            <div className={slipStyles.fieldValue}>{data.program_name || 'N/A'}</div>
                        </div>
                        <div className={slipStyles.field}>
                            <label className={slipStyles.fieldLabel}>Previous School:</label>
                            <div className={slipStyles.fieldValue}>{formData.previous_school || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Status Section */}
            {documentStatus && (
                <div className={slipStyles.section}>
                    <h3 className={slipStyles.sectionTitle}>4. DOCUMENT STATUS</h3>
                    <div className={slipStyles.documentGrid}>
                        <div className={slipStyles.documentItem}>
                            <div className={slipStyles.documentIcon}>
                                {getDocumentStatusIcon(documentStatus.photo)}
                            </div>
                            <div className={slipStyles.documentInfo}>
                                <p className={slipStyles.documentName}>Photograph</p>
                                <p className={slipStyles.documentStatus}>{getDocumentStatusText(documentStatus.photo)}</p>
                            </div>
                        </div>
                        <div className={slipStyles.documentItem}>
                            <div className={slipStyles.documentIcon}>
                                {getDocumentStatusIcon(documentStatus.birth_certificate)}
                            </div>
                            <div className={slipStyles.documentInfo}>
                                <p className={slipStyles.documentName}>Birth Certificate</p>
                                <p className={slipStyles.documentStatus}>{getDocumentStatusText(documentStatus.birth_certificate)}</p>
                            </div>
                        </div>
                        <div className={slipStyles.documentItem}>
                            <div className={slipStyles.documentIcon}>
                                {getDocumentStatusIcon(documentStatus.aadhar_card)}
                            </div>
                            <div className={slipStyles.documentInfo}>
                                <p className={slipStyles.documentName}>Aadhar Card</p>
                                <p className={slipStyles.documentStatus}>{getDocumentStatusText(documentStatus.aadhar_card)}</p>
                            </div>
                        </div>
                        <div className={slipStyles.documentItem}>
                            <div className={slipStyles.documentIcon}>
                                {getDocumentStatusIcon(documentStatus.parent_id_proof)}
                            </div>
                            <div className={slipStyles.documentInfo}>
                                <p className={slipStyles.documentName}>Parent ID Proof</p>
                                <p className={slipStyles.documentStatus}>{getDocumentStatusText(documentStatus.parent_id_proof)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Important Instructions Section */}
            <div className={slipStyles.section}>
                <h3 className={slipStyles.sectionTitle}>5. IMPORTANT INSTRUCTIONS</h3>
                <div className={slipStyles.instructionsList}>
                    <div className={slipStyles.instructionItem}>
                        <span className={slipStyles.instructionNumber}>•</span>
                        <span className={slipStyles.instructionText}>Please keep this admission slip safe for future reference</span>
                    </div>
                    <div className={slipStyles.instructionItem}>
                        <span className={slipStyles.instructionNumber}>•</span>
                        <span className={slipStyles.instructionText}>A detailed admission confirmation will be sent to your registered email</span>
                    </div>
                    <div className={slipStyles.instructionItem}>
                        <span className={slipStyles.instructionNumber}>•</span>
                        <span className={slipStyles.instructionText}>All submitted documents must be original or self-attested copies</span>
                    </div>
                    <div className={slipStyles.instructionItem}>
                        <span className={slipStyles.instructionNumber}>•</span>
                        <span className={slipStyles.instructionText}>Contact the school office for any queries or clarifications</span>
                    </div>
                </div>
            </div>

            {/* Contact Information Section */}
            <div className={slipStyles.section}>
                <h3 className={slipStyles.sectionTitle}>6. SCHOOL CONTACT</h3>
                <div className={slipStyles.contactGrid}>
                    <div className={slipStyles.contactItem}>
                        <span className={slipStyles.contactLabel}>Phone:</span>
                        <span className={slipStyles.contactValue}>{schoolDetails.contact.phone}</span>
                    </div>
                    <div className={slipStyles.contactItem}>
                        <span className={slipStyles.contactLabel}>Email:</span>
                        <span className={slipStyles.contactValue}>{schoolDetails.contact.email}</span>
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <div className={slipStyles.footerSection}>
                <div className={slipStyles.footerContent}>
                    <p className={slipStyles.footerMessage}>
                        Thank you for choosing {schoolDetails.name}. We look forward to welcoming{' '}
                        <strong>{data.child_name}</strong> to our school family.
                    </p>
                    <div className={slipStyles.footerMeta}>
                        <span className={slipStyles.footerItem}>Doc ID: {data.admission_number}</span>
                        <span className={slipStyles.footerItem}>•</span>
                        <span className={slipStyles.footerItem}>Generated: {todayDate}</span>
                        <span className={slipStyles.footerItem}>•</span>
                        <span className={slipStyles.footerItem}>Official Confirmation</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdmissionSlip;
