'use client';

import React, { useEffect, useState } from 'react';
import styles from './admissionpdftemplate.module.css';
import { schoolDetails } from '@/json/schooldetails';

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
    parent_name?: string;
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
const PDFHeader: React.FC<{ logoUrl: string | null }> = ({ logoUrl }) => {
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
                        Phone: {schoolDetails.contact.phone} | Email: {schoolDetails.contact.email}
                    </p>
                </div>
                {/* {logoUrl && (
                    <img src={logoUrl} alt="School Logo" className={styles.logoRight} />
                )} */}
                <div className={styles.logo}>

                </div>
            </div>
            <h2 className={styles.formTitle}>ADMISSION FORM</h2>
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
const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className={styles.field}>
        <label className={styles.fieldLabel}>{label}</label>
        <div className={styles.fieldValue}>{value || 'N/A'}</div>
    </div>
);

// Photo Field Component
const PhotoField: React.FC<{ photoUrl?: string | null }> = ({ photoUrl }) => {
    const [photoError, setPhotoError] = useState(false);
    const convertedPhotoUrl = photoUrl ? getGoogleDriveImageURL(photoUrl) : null;

    if (!convertedPhotoUrl || photoError) {
        return null;
    }

    return (
        <div className={styles.photoField}>
            <label className={styles.fieldLabel}>Photo</label>
            <div className={styles.childPhotoContainer}>
                <img
                    src={convertedPhotoUrl}
                    alt="Child Photo"
                    className={styles.childPhoto}
                    onLoad={() => {
                        console.log('✅ Child photo loaded successfully from:', convertedPhotoUrl);
                    }}
                    onError={(e) => {
                        console.error('❌ Failed to load child photo');
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

    useEffect(() => {
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

    const getParentName = () => {
        const firstName = admission.parent_first_name || '';
        const lastName = admission.parent_last_name || '';
        return `${firstName} ${lastName}`.trim() || admission.parent_name || 'N/A';
    };

    const todayDate = formatDate(new Date().toISOString());

    return (
        <div className={styles.pdfContainer}>
            {/* Header with Logo */}
            <PDFHeader logoUrl={logoUrl} />

            {/* Admission Number & Date */}
            <div className={styles.metaSection}>
                <div className={styles.metaRow}>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Admission No:</span>
                        <span className={styles.metaValue}>{admission.admission_number?.toString() || 'N/A'}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Date:</span>
                        <span className={styles.metaValue}>{todayDate}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Session:</span>
                        <span className={styles.metaValue}>{admission.session || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Child Information */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>1. STUDENT DETAILS</h3>
                <div className={styles.childInfoContainer}>
                    <div className={styles.childInfoContent}>
                        <div className={styles.sectionContent}>
                            <FieldRow columns={2}>
                                <Field label="Child Name:" value={getChildName()} />
                                <Field label="DOB (dd/mm/yyyy):" value={formatDate(admission.child_dob)} />
                            </FieldRow>
                            <FieldRow columns={2}>
                                <Field label="Gender:" value={admission.child_gender || 'N/A'} />
                                <Field label="Place of Birth:" value={admission.child_place_of_birth || 'N/A'} />
                            </FieldRow>
                            <FieldRow columns={2}>
                                <Field label="Blood Group:" value={admission.child_blood_group || 'N/A'} />
                                <Field label="Age Group:" value={calculateAgeGroup(admission.child_dob)} />
                            </FieldRow>
                        </div>
                    </div>
                    <div className={styles.childPhotoWrapper}>
                        {photoUrl && (
                            <PhotoField photoUrl={photoUrl} />
                        )}
                    </div>
                </div>
            </div>

            {/* Parent Information */}
            <PDFSection title="2. PARENT/GUARDIAN DETAILS">
                <FieldRow columns={1}>
                    <Field label="Name:" value={getParentName()} />
                </FieldRow>
                <FieldRow columns={2}>
                    <Field label="Mobile:" value={admission.parent_mobile_number || 'N/A'} />
                    <Field label="Email:" value={admission.parent_email || 'N/A'} />
                </FieldRow>
                <FieldRow columns={1}>
                    <Field label="Address:" value={admission.parent_address || 'N/A'} />
                </FieldRow>
            </PDFSection>

            {/* Program & Admission Details */}
            <PDFSection title="3. PROGRAM & ADMISSION DETAILS">
                <FieldRow columns={2}>
                    <Field label="Program:" value={admission.program_name || 'N/A'} />
                    <Field label="Previous School:" value={admission.previous_school || 'N/A'} />
                </FieldRow>
                <FieldRow columns={1}>
                    <Field label="Status:" value={admission.admission_status || 'N/A'} />
                </FieldRow>
            </PDFSection>

            {/* Consent & Signatures */}
            <div className={styles.signatureSection}>
                <h3 className={styles.sectionTitle}>SIGNATURES & DECLARATION</h3>

                <div className={styles.consentBox}>
                    <p className={styles.consentText}>
                        I hereby declare that the information provided is true and correct. I understand and accept the admission policies of {schoolDetails.name}.
                    </p>
                        <div className={styles.dateFieldSmall}>Date: __________</div>
                        <div className={styles.dateFieldSmall}>Place: __________</div>
                </div>

                <div className={styles.signatureBoxContainer}>
                    <div className={styles.signatureBox}>
                        <div className={styles.signatureSpace}></div>
                        <div className={styles.signatureLabel}>Parent/Guardian</div>
                        {/* <div className={styles.dateFieldSmall}>Date: __________</div> */}
                    </div>


                    <div className={styles.signatureBox}>
                        <div className={styles.signatureName}>{schoolDetails.director?.name || 'Director'}</div>
                        <div className={styles.signatureSpace}></div>
                        <div className={styles.signatureLabel}>Admission Authority</div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className={styles.footerSection}>
                <div className={styles.footerContent}>
                    <span className={styles.footerItem}>Doc ID: {admission.admission_number}</span>
                    <span className={styles.footerItem}>•</span>
                    <span className={styles.footerItem}>Generated: {todayDate}</span>
                    <span className={styles.footerItem}>•</span>
                    <span className={styles.footerItem}>Official Form</span>
                </div>
            </div>
        </div>
    );
};

export default AdmissionPDFTemplate;