'use client';

import React, { useEffect, useState } from 'react';
import styles from './admissionpdftemplate.module.css';
import { schoolDetails } from '@/json/schooldetails';
import enTranslations from '@/translations/en.json';
import hiTranslations from '@/translations/hi.json';

export interface Admission {
    admission_number: any;
    id: string;
    child_first_name?: string;
    childFirstName?: string;
    child_name?: string;
    child_dob: string;
    child_gender: string;
    child_place_of_birth: string;
    child_blood_group?: string;
    father_name?: string;
    mother_name?: string;
    category?: string;
    parent_first_name?: string;
    parent_last_name?: string;
    parent_address?: string;
    parent_mobile_number?: string;
    parent_email?: string;
    program_name?: string;
    session?: string;
    previous_school?: string;
    admission_status: string;
    photo_url?: string | null;
    remark?: string;
    created_at: string;
}

interface AdmissionPDFTemplateProps {
    admission: Admission;
    isPrinting?: boolean;
}

// Utility Functions
const calculateAgeGroup = (dob: string): string => {
    if (!dob) return 'N/A';
    try {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 2) return 'Play Group (1.5-2.5 yrs)';
        if (age < 3) return 'Nursery (2.5-3.5 yrs)';
        if (age < 4) return 'Junior KG (3.5-4.5 yrs)';
        if (age < 5) return 'Senior KG (4.5-5.5 yrs)';
        return 'Above 5 years';
    } catch {
        return 'N/A';
    }
};

const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch {
        return 'N/A';
    }
};

const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);

    const formattedDate = date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const formattedTime = date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true   // ensures AM/PM format
    });

    return `${formattedDate} ${formattedTime}`;
}

const todayDateTime = formatDateTime(new Date().toISOString());



const getGoogleDriveImageURL = (url: string): string => {
    if (!url) return '';

    // Check if already using proxy API (which is the proper way)
    if (url.includes('/api/proxy-drive-file')) {
        return url;
    }

    let fileId = '';

    // Try to extract file ID from various Google Drive URL formats
    if (url.includes('?id=')) {
        // Format: ...?id=FILE_ID&...
        fileId = url.split('?id=')[1]?.split('&')[0] || '';
    } else if (url.includes('&id=')) {
        // Format: ...&id=FILE_ID&...
        fileId = url.split('&id=')[1]?.split('&')[0] || '';
    } else if (url.includes('/d/')) {
        // Format: drive.google.com/file/d/FILE_ID/view
        fileId = url.split('/d/')[1]?.split('/')[0] || '';
    } else if (url.includes('/folders/')) {
        // Format: drive.google.com/drive/folders/FILE_ID
        fileId = url.split('/folders/')[1]?.split('?')[0] || '';
    } else if (url.includes('uc?export=download')) {
        // Extract file ID from existing download URL
        fileId = url.split('id=')[1] || '';
    }

    // If no file ID found but it looks like a Drive URL, return as-is
    if (!fileId && url.includes('drive.google.com')) {
        console.warn('Could not extract file ID from Google Drive URL:', url);
        return url;
    }

    // If no file ID found and it's not a Drive URL, return original URL
    if (!fileId) {
        console.warn('Not a Google Drive URL, using as-is:', url);
        return url;
    }

    // Return the API proxy URL for proper image loading (same as used in admission.tsx)
    return `/api/proxy-drive-file?id=${fileId}&type=view`;
};

// Header Component
const PDFHeader: React.FC<{ logoUrl: string | null; t: (key: string) => string }> = ({ logoUrl, t }) => {
    return (
        <div className={styles.header}>
            <div className={styles.headerTop}>
                {logoUrl && (
                    <img src={logoUrl} alt="School Logo" className={styles.logo} />
                )}
                <div className={styles.headerCenter}>
                    <h1 className={styles.schoolName}>{schoolDetails.name}</h1>
                    <p className={styles.address}>{schoolDetails.address.street}</p>
                    <p className={styles.addressDetail}>
                        {schoolDetails.address.city}, {schoolDetails.address.state} - {schoolDetails.address.pincode}
                    </p>
                    <p className={styles.contact}>
                        Phone: {schoolDetails.contact.phone} | Email: {schoolDetails.contact.email} | Website: {schoolDetails.website}
                    </p>
                </div>
                <div className={styles.logo}>

                </div>
            </div>
            <h2 className={styles.formTitle}>{t('admissionPDF.formTitle')}</h2>
        </div>
    );
};

// Section Component
const PDFSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <div className={styles.sectionContent}>{children}</div>
    </div>
);

// Field Row Component
const FieldRow: React.FC<{ children: React.ReactNode; columns?: 1 | 2 | 3 }> = ({ children, columns = 2 }) => (
    <div className={`${styles.fieldRow} ${styles[`col${columns}`]}`}>
        {children}
    </div>
);

// Field Component
const Field: React.FC<{ label: string; value: string; t: (key: string) => string }> = ({ label, value, t }) => (
    <div className={styles.field}>
        <label className={styles.fieldLabel}>{label}</label>
        <div className={styles.fieldValue}>{value || t('admissionPDF.na')}</div>
    </div>
);

// Photo Field Component
const PhotoField: React.FC<{ photoUrl?: string | null; t: (key: string) => string }> = ({ photoUrl, t }) => {
    const [photoError, setPhotoError] = useState(false);
    const convertedPhotoUrl = photoUrl ? getGoogleDriveImageURL(photoUrl) : null;

    if (!convertedPhotoUrl || photoError) {
        return null;
    }

    return (
        <div className={styles.photoField}>
            <label className={styles.fieldLabel}>{t('admissionPDF.photo')}</label>
            <div className={styles.childPhotoContainer}>
                <img
                    src={convertedPhotoUrl}
                    alt="Student Photo"
                    className={styles.childPhoto}
                    onLoad={() => {
                        console.log('[SUCCESS] Student photo loaded successfully from:', convertedPhotoUrl);
                    }}
                    onError={(e) => {
                        console.error('[ERROR] Failed to load student photo');
                        console.error('Converted URL:', convertedPhotoUrl);
                        console.error('Original URL:', photoUrl);
                        console.error('Error:', e);
                        setPhotoError(true);
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                />
            </div>
        </div>
    );
};

// Main Component
const AdmissionPDFTemplate: React.FC<AdmissionPDFTemplateProps> = ({ admission, isPrinting = false }) => {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [language, setLanguage] = useState<'en' | 'hi'>('en');

    // Get translations based on language
    const allTranslations = language === 'hi' ? hiTranslations : enTranslations;
    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = allTranslations;
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    };

    useEffect(() => {
        // Detect language from localStorage
        const savedLanguage = localStorage.getItem('language') as 'en' | 'hi' | null;
        if (savedLanguage === 'hi' || savedLanguage === 'en') {
            setLanguage(savedLanguage);
        }

        const loadAssets = async () => {
            try {
                // Load Logo
                const logoSrc = typeof schoolDetails.logo === 'string'
                    ? schoolDetails.logo
                    : (schoolDetails.logo as any)?.src;

                if (logoSrc) {
                    setLogoUrl(logoSrc);
                }

                // Load Child Photo with detailed logging
                if (admission.photo_url) {
                    console.log('PDF Template: Found photo_url for admission', admission.id, admission.photo_url);
                    setPhotoUrl(admission.photo_url);
                } else {
                    console.log('PDF Template: No photo_url found for admission', admission.id);
                    console.log('Admission object keys:', Object.keys(admission));
                }
            } catch (e) {
                console.error('Asset load failed:', e);
            }
        };

        loadAssets();
    }, [admission.photo_url, admission.id]);

    const getChildName = () =>
        admission.child_first_name || admission.childFirstName || admission.child_name || 'N/A';

    const todayDate = formatDate(new Date().toISOString());

    return (
        <div className={styles.pdfContainer}>
            {/* Header with Logo */}
            <PDFHeader logoUrl={logoUrl} t={t} />

            {/* Admission Number & Date */}
            <div className={styles.metaSection}>
                <div className={styles.metaRow}>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>{t('admissionPDF.admissionNo')}</span>
                        <span className={styles.metaValue}>{admission.admission_number?.toString() || t('admissionPDF.na')}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>{t('admissionPDF.session')}</span>
                        <span className={styles.metaValue}>{schoolDetails.session || t('admissionPDF.na')}</span>
                    </div>
                </div>
            </div>

            {/* Child Information */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>{t('admissionPDF.studentDetails')}</h3>
                <div className={styles.childInfoContainer}>
                    <div className={styles.childInfoContent}>
                        <div className={styles.sectionContent}>
                            <FieldRow columns={2}>
                                <Field label={t('admissionPDF.studentName')} value={getChildName()} t={t} />
                                <Field label={t('admissionPDF.dob')} value={formatDate(admission.child_dob)} t={t} />
                            </FieldRow>
                            <FieldRow columns={2}>
                                <Field label={t('admissionPDF.gender')} value={admission.child_gender || t('admissionPDF.na')} t={t} />
                                <Field label={t('admissionPDF.placeOfBirth')} value={admission.child_place_of_birth || t('admissionPDF.na')} t={t} />
                            </FieldRow>
                            <FieldRow columns={3}>
                                <Field label={t('admissionPDF.bloodGroup')} value={admission.child_blood_group || t('admissionPDF.na')} t={t} />
                                <Field label={t('admissionPDF.ageGroup')} value={calculateAgeGroup(admission.child_dob)} t={t} />
                                <Field label={t('admissionPDF.category')} value={admission.category || t('admissionPDF.na')} t={t} />
                            </FieldRow>
                        </div>
                        
                    </div>
                    
                    <div className={styles.childPhotoWrapper}>
                        {photoUrl && (
                            <PhotoField photoUrl={photoUrl} t={t} />
                        )}
                    </div>
                </div>
            </div>

            {/* Parent Information */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>{t('admissionPDF.parentDetails')}</h3>
                <div className={styles.sectionContent}>
                    <FieldRow columns={2}>
                        <Field label={t('admissionPDF.fatherName')} value={admission.father_name || t('admissionPDF.na')} t={t} />
                        <Field label={t('admissionPDF.motherName')} value={admission.mother_name || t('admissionPDF.na')} t={t} />
                    </FieldRow>
                    <FieldRow columns={2}>
                        <Field label={t('admissionPDF.mobile')} value={admission.parent_mobile_number || t('admissionPDF.na')} t={t} />
                        <Field label={t('admissionPDF.email')} value={admission.parent_email || t('admissionPDF.na')} t={t} />
                    </FieldRow>
                    <FieldRow columns={1}>
                        <Field label={t('admissionPDF.address')} value={admission.parent_address || t('admissionPDF.na')} t={t} />
                    </FieldRow>
                </div>
            </div>

            {/* Program & Admission Details */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>{t('admissionPDF.programDetails')}</h3>
                <div className={styles.sectionContent}>
                    <FieldRow columns={2}>
                        <Field label={t('admissionPDF.program')} value={admission.program_name || t('admissionPDF.na')} t={t} />
                        <Field label={t('admissionPDF.previousSchool')} value={admission.previous_school || t('admissionPDF.na')} t={t} />
                    </FieldRow>
                    <FieldRow columns={1}>
                        <Field label={t('admissionPDF.status')} value={admission.admission_status || t('admissionPDF.na')} t={t} />
                    </FieldRow>
                </div>
            </div>

            {/* Consent & Signatures */}
            <div className={styles.signatureSection}>
                <h3 className={styles.sectionTitle}>{t('admissionPDF.signaturesTitle')}</h3>

                <div className={styles.consentBox}>
                    <p className={styles.consentText}>
                        {t('admissionPDF.consentText')} {schoolDetails.name}.
                    </p>
                    <div className={styles.dateFieldSmall}>{t('admissionPDF.date')} __________</div>
                    <div className={styles.dateFieldSmall}>{t('admissionPDF.place')} __________</div>
                </div>

                <div className={styles.signatureBoxContainer}>
                    <div className={styles.signatureBox}>
                        <div className={styles.signatureSpace}></div>
                        <div className={styles.signatureLabel}>{t('admissionPDF.parentGuardian')}</div>
                    </div>

                    <div className={styles.signatureBox}>
                        <div className={styles.signatureName}>{schoolDetails.admissionAuthority || ''}</div>
                        <div className={styles.signatureSpace}></div>
                        <div className={styles.signatureLabel}>{t('admissionPDF.admissionAuthority')}</div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className={styles.footerSection}>
                <div className={styles.footerContent}>
                    <span className={styles.footerItem}>{t('admissionPDF.docId')} {admission.admission_number}</span>
                    <span className={styles.footerItem}>•</span>
                    <span className={styles.footerItem}>{t('admissionPDF.generatedAt')} {todayDateTime}</span>
                </div>
            </div>
        </div>
    );
};

export default AdmissionPDFTemplate;