'use client';

import React, { useState, useEffect } from 'react';
import slipStyles from './admissionslip.module.css';
import { schoolDetails } from '@/json/schooldetails';
import { FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import en from '@/translations/en.json';
import hi from '@/translations/hi.json';

interface SubmissionResult {
    parent_email: string;
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
    category: string;
    father_name: string;
    mother_name: string;
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
            return 'uploaded';
        case 'pending':
            return 'pending';
        case 'notUploaded':
            return 'notUploaded';
        default:
            return 'notUploaded';
    }
};

// Mask mobile number - hide first 6 digits, show only last 4 digits
const maskMobileNumber = (phoneNumber: string): string => {
    if (!phoneNumber) return 'N/A';
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 4) return phoneNumber;
    return 'XXXXXX' + cleaned.substring(cleaned.length - 4);
};

// Main Component
const AdmissionSlip: React.FC<AdmissionSlipProps> = ({ data, formData, documentStatus }) => {
    const [language, setLanguage] = useState<'en' | 'hi'>('en');

    useEffect(() => {
        const saved = localStorage.getItem('language') as 'en' | 'hi' | null;
        if (saved && (saved === 'en' || saved === 'hi')) {
            setLanguage(saved);
        }
    }, []);

    const translations = language === 'hi' ? hi : en;
    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = translations;
        for (const k of keys) {
            value = value?.[k];
        }
        return typeof value === 'string' ? value : key;
    };

    // Helper function to get translated document status
    const getTranslatedDocumentStatus = (status: 'uploaded' | 'pending' | 'notUploaded'): string => {
        switch (status) {
            case 'uploaded':
                return t('admissionSlip.uploaded');
            case 'pending':
                return t('admissionSlip.pending');
            case 'notUploaded':
                return t('admissionSlip.notUploaded');
            default:
                return t('admissionSlip.notUploaded');
        }
    };

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
                    {/* {logoSrc && (
                        <img src={logoSrc} alt="School Logo" className={slipStyles.logo} />
                    )} */}
                    <div className={slipStyles.logo}></div>
                </div>
                <h2 className={slipStyles.formTitle}>{t('admissionSlip.title')}</h2>
            </div>

            {/* Meta Section - Admission Number */}
            <div className={slipStyles.metaSection}>
                <div className={slipStyles.metaRow}>
                    <div className={slipStyles.metaItem}>
                        <span className={slipStyles.metaLabel}>{t('admissionSlip.metaAdmissionNo')}</span>
                        <span className={slipStyles.metaValue}>{data.admission_number}</span>
                    </div>
                    <div className={slipStyles.metaItem}>
                        <span className={slipStyles.metaLabel}>{t('admissionSlip.metaDate')}</span>
                        <span className={slipStyles.metaValue}>{todayDate}</span>
                    </div>
                    <div className={slipStyles.metaItem}>
                        <span className={slipStyles.metaLabel}>{t('admissionSlip.metaStatus')}</span>
                        <span className={slipStyles.metaValue}>{t('admissionSlip.metaUnderReview')}</span>
                    </div>
                </div>
            </div>

            {/* Child Information Section */}
            <div className={slipStyles.section}>
                <h3 className={slipStyles.sectionTitle}>{t('admissionSlip.studentDetails')}</h3>
                <div className={slipStyles.sectionContent}>
                    <div className={slipStyles.fieldRow}>
                        <div className={slipStyles.field}>
                            <label className={slipStyles.fieldLabel}>{t('admissionSlip.studentName')}</label>
                            <div className={slipStyles.fieldValue}>{data.child_name || 'N/A'}</div>
                        </div>
                        <div className={slipStyles.field}>
                            <label className={slipStyles.fieldLabel}>{t('admissionSlip.dateOfBirth')}</label>
                            <div className={slipStyles.fieldValue}>{formatDate(formData.child_dob)}</div>
                        </div>
                    </div>
                    <div className={slipStyles.fieldRow}>
                        <div className={slipStyles.field}>
                            <label className={slipStyles.fieldLabel}>{t('admissionSlip.gender')}</label>
                            <div className={slipStyles.fieldValue}>{formData.child_gender || 'N/A'}</div>
                        </div>
                        <div className={slipStyles.field}>
                            <label className={slipStyles.fieldLabel}>{t('admissionSlip.placeOfBirth')}</label>
                            <div className={slipStyles.fieldValue}>{formData.child_place_of_birth || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Parent Information Section */}
            <div className={slipStyles.section}>
                <h3 className={slipStyles.sectionTitle}>{t('admissionSlip.parentDetails')}</h3>
                <div className={slipStyles.sectionContent}>
                    <div className={slipStyles.fieldRow}>
                        <div className={slipStyles.field}>
                            <label className={slipStyles.fieldLabel}>{t('admissionSlip.fatherName')}</label>
                            <div className={slipStyles.fieldValue}>{formData.father_name || 'N/A'}</div>
                        </div>
                        <div className={slipStyles.field}>
                            <label className={slipStyles.fieldLabel}>{t('admissionSlip.motherName')}</label>
                            <div className={slipStyles.fieldValue}>{formData.mother_name || 'N/A'}</div>
                        </div>
                        <div className={slipStyles.field}>
                            <label className={slipStyles.fieldLabel}>{t('admissionSlip.mobileNumber')}</label>
                            <div className={slipStyles.fieldValue}>{maskMobileNumber(data.parent_mobile_number)}</div>
                        </div>
                        <div className={slipStyles.field}>
                            <label className={slipStyles.fieldLabel}>{t('admissionSlip.email')}</label>
                            <div className={slipStyles.fieldValue}>{data.parent_email || 'N/A'}</div>
                        </div>
                    </div>
                    <div className={`${slipStyles.fieldRow} ${slipStyles.fullWidth}`}>
                        <div className={slipStyles.field}>
                            <label className={slipStyles.fieldLabel}>{t('admissionSlip.address')}</label>
                            <div className={slipStyles.fieldValue}>{formData.parent_address || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Program Details Section */}
            <div className={slipStyles.section}>
                <h3 className={slipStyles.sectionTitle}>{t('admissionSlip.programDetails')}</h3>
                <div className={slipStyles.sectionContent}>
                    <div className={slipStyles.fieldRow}>
                        <div className={slipStyles.field}>
                            <label className={slipStyles.fieldLabel}>{t('admissionSlip.program')}</label>
                            <div className={slipStyles.fieldValue}>{data.program_name || 'N/A'}</div>
                        </div>
                        <div className={slipStyles.field}>
                            <label className={slipStyles.fieldLabel}>{t('admissionSlip.previousSchool')}</label>
                            <div className={slipStyles.fieldValue}>{formData.previous_school || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Status Section */}
            {documentStatus && (
                <div className={slipStyles.section}>
                    <h3 className={slipStyles.sectionTitle}>{t('admissionSlip.documentStatus')}</h3>
                    <div className={slipStyles.documentGrid}>
                        <div className={slipStyles.documentItem}>
                            <div className={slipStyles.documentIcon}>
                                {getDocumentStatusIcon(documentStatus.photo)}
                            </div>
                            <div className={slipStyles.documentInfo}>
                                <p className={slipStyles.documentName}>{t('admissionSlip.photograph')}</p>
                                <p className={slipStyles.documentStatus}>{getTranslatedDocumentStatus(documentStatus.photo)}</p>
                            </div>
                        </div>
                        <div className={slipStyles.documentItem}>
                            <div className={slipStyles.documentIcon}>
                                {getDocumentStatusIcon(documentStatus.birth_certificate)}
                            </div>
                            <div className={slipStyles.documentInfo}>
                                <p className={slipStyles.documentName}>{t('admissionSlip.birthCertificate')}</p>
                                <p className={slipStyles.documentStatus}>{getTranslatedDocumentStatus(documentStatus.birth_certificate)}</p>
                            </div>
                        </div>
                        <div className={slipStyles.documentItem}>
                            <div className={slipStyles.documentIcon}>
                                {getDocumentStatusIcon(documentStatus.aadhar_card)}
                            </div>
                            <div className={slipStyles.documentInfo}>
                                <p className={slipStyles.documentName}>{t('admissionSlip.aadharCard')}</p>
                                <p className={slipStyles.documentStatus}>{getTranslatedDocumentStatus(documentStatus.aadhar_card)}</p>
                            </div>
                        </div>
                        <div className={slipStyles.documentItem}>
                            <div className={slipStyles.documentIcon}>
                                {getDocumentStatusIcon(documentStatus.parent_id_proof)}
                            </div>
                            <div className={slipStyles.documentInfo}>
                                <p className={slipStyles.documentName}>{t('admissionSlip.parentIdProof')}</p>
                                <p className={slipStyles.documentStatus}>{getTranslatedDocumentStatus(documentStatus.parent_id_proof)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Important Instructions Section */}
            <div className={slipStyles.section}>
                <h3 className={slipStyles.sectionTitle}>{t('admissionSlip.importantInstructions')}</h3>
                <div className={slipStyles.instructionsList}>
                    <div className={slipStyles.instructionItem}>
                        <span className={slipStyles.instructionNumber}>•</span>
                        <span className={slipStyles.instructionText}>{t('admissionSlip.instruction1')}</span>
                    </div>
                    <div className={slipStyles.instructionItem}>
                        <span className={slipStyles.instructionNumber}>•</span>
                        <span className={slipStyles.instructionText}>{t('admissionSlip.instruction2')}</span>
                    </div>
                    <div className={slipStyles.instructionItem}>
                        <span className={slipStyles.instructionNumber}>•</span>
                        <span className={slipStyles.instructionText}>{t('admissionSlip.instruction3')}</span>
                    </div>
                    <div className={slipStyles.instructionItem}>
                        <span className={slipStyles.instructionNumber}>•</span>
                        <span className={slipStyles.instructionText}>{t('admissionSlip.instruction4')}</span>
                    </div>
                </div>
            </div>

            {/* Contact Information Section */}
            <div className={slipStyles.section}>
                <h3 className={slipStyles.sectionTitle}>{t('admissionSlip.schoolContact')}</h3>
                <div className={slipStyles.contactGrid}>
                    <div className={slipStyles.contactItem}>
                        <span className={slipStyles.contactLabel}>{t('admissionSlip.phone')}</span>
                        <span className={slipStyles.contactValue}>{schoolDetails.contact.phone}</span>
                    </div>
                    <div className={slipStyles.contactItem}>
                        <span className={slipStyles.contactLabel}>{t('admissionSlip.email')}</span>
                        <span className={slipStyles.contactValue}>{schoolDetails.contact.email}</span>
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <div className={slipStyles.footerSection}>
                <div className={slipStyles.footerContent}>
                    <p className={slipStyles.footerMessage}>
                        {t('admissionSlip.footerMessage')} {schoolDetails.name}. {t('admissionSlip.footerWelcome')}{' '}
                        <strong>{data.child_name}</strong> {t('admissionSlip.footerToSchool')}
                    </p>
                    <div className={slipStyles.footerMeta}>
                        <span className={slipStyles.footerItem}>{t('admissionSlip.docId')} {data.admission_number}</span>
                        <span className={slipStyles.footerItem}>•</span>
                        <span className={slipStyles.footerItem}>{t('admissionSlip.generated')} {todayDate}</span>
                        <span className={slipStyles.footerItem}>•</span>
                        <span className={slipStyles.footerItem}>{t('admissionSlip.officialDocument')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdmissionSlip;
