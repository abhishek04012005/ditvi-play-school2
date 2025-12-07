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
  
  let fileId = '';
  
  if (url.includes('id=')) {
    fileId = url.split('id=')[1]?.split('&')[0];
  } else if (url.includes('/d/')) {
    fileId = url.split('/d/')[1]?.split('/')[0];
  } else if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) fileId = match[1];
  }
  
  if (!fileId) return url;
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
};

// Header Component
const PDFHeader: React.FC<{ logoUrl: string | null; photoUrl?: string | null }> = ({ logoUrl, photoUrl }) => (
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
      {photoUrl && (
        <img src={getGoogleDriveImageURL(photoUrl)} alt="Child Photo" className={styles.childPhoto} />
      )}
    </div>
    <div className={styles.dividerMain}></div>
    <h2 className={styles.formTitle}>ADMISSION FORM</h2>
    <div className={styles.dividerMain}></div>
  </div>
);

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

        // Load Child Photo
        if (admission.photo_url) {
          setPhotoUrl(admission.photo_url);
        }
      } catch (e) {
        console.warn('Asset load failed:', e);
      }
    };

    loadAssets();
  }, [admission.photo_url]);

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
      {/* Header with Logo and Child Photo */}
      <PDFHeader logoUrl={logoUrl} photoUrl={photoUrl} />

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
      <PDFSection title="1. CHILD INFORMATION">
        <FieldRow columns={2}>
          <Field label="Child Name:" value={getChildName()} />
          <Field label="DOB:" value={formatDate(admission.child_dob)} />
        </FieldRow>
        <FieldRow columns={2}>
          <Field label="Gender:" value={admission.child_gender || 'N/A'} />
          <Field label="Place of Birth:" value={admission.child_place_of_birth || 'N/A'} />
        </FieldRow>
        <FieldRow columns={2}>
          <Field label="Blood Group:" value={admission.child_blood_group || 'N/A'} />
          <Field label="Age Group:" value={calculateAgeGroup(admission.child_dob)} />
        </FieldRow>
      </PDFSection>

      {/* Parent Information */}
      <PDFSection title="2. PARENT/GUARDIAN INFORMATION">
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
        </div>

        <div className={styles.signatureBoxContainer}>
          <div className={styles.signatureBox}>
            <div className={styles.signatureSpace}></div>
            <div className={styles.signatureLabel}>Parent/Guardian</div>
            <div className={styles.dateFieldSmall}>Date: __________</div>
          </div>

          <div className={styles.signatureBox}>
            <div className={styles.signatureSpace}></div>
            <div className={styles.signatureLabel}>Teacher/Authority</div>
            <div className={styles.dateFieldSmall}>Date: __________</div>
          </div>

          <div className={styles.signatureBox}>
            <div className={styles.signatureName}>{schoolDetails.director?.name || 'Director'}</div>
            <div className={styles.signatureSpace}></div>
            <div className={styles.signatureLabel}>Director</div>
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