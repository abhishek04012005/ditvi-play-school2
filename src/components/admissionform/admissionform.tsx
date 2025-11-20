'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaSpinner, FaCheckCircle, FaDownload, FaPrint, FaShare } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import styles from './admissionform.module.css';
import HeadingTitle from '@/components/heading/headingtitle';
import { EmojiPeople, FamilyRestroom, SchoolOutlined, DescriptionOutlined } from '@mui/icons-material';
import LineArt from '@/custom/lineart/lineart';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { schoolDetails } from '@/json/schooldetails';

interface FormData {
  child_name: string;
  child_dob: string;
  child_gender: string;
  child_place_of_birth: string;
  parent_name: string;
  parent_mobile_number: string;
  parent_email: string;
  program_name: string;
  previous_school: string;
}

interface FormFiles {
  photo: File | null;
  birth_certificate: File | null;
  aadhar_card: File | null;
  parent_id_proof: File | null;
}

interface SubmissionResult {
  admission_number: string;
  child_name: string;
  parent_mobile_number: string;
  program_name: string;
}

const programs = [
  { value: 'playgroup', label: 'Play Group' },
  { value: 'nursery', label: 'Nursery' },
  { value: 'kg1', label: 'KG - 1' },
  { value: 'kg2', label: 'KG - 2' },
];

export default function AdmissionForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploadDocsNow, setUploadDocsNow] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    child_name: '',
    child_dob: '',
    child_gender: '',
    child_place_of_birth: '',
    parent_name: '',
    parent_mobile_number: '',
    parent_email: '',
    program_name: '',
    previous_school: '',
  });

  const [files, setFiles] = useState<FormFiles>({
    photo: null,
    birth_certificate: null,
    aadhar_card: null,
    parent_id_proof: null,
  });

  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string | null }>({
    photo: null,
    birth_certificate: null,
    aadhar_card: null,
    parent_id_proof: null,
  });

  const pdfRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof FormFiles) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFiles({ ...files, [fieldName]: file });

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews({ ...filePreviews, [fieldName]: reader.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreviews({ ...filePreviews, [fieldName]: '📄 ' + file.name });
    }
  };

  const validateStep = (stepNum: number): boolean => {
    const errors: string[] = [];
    const fieldErrors: { [key: string]: string } = {};

    if (stepNum === 1) {
      if (!formData.child_name.trim()) {
        errors.push('Child name is required');
        fieldErrors.child_name = 'Child name is required';
      }
      if (!formData.child_dob) {
        errors.push('Date of birth is required');
        fieldErrors.child_dob = 'Date of birth is required';
      }
      if (!formData.child_gender) {
        errors.push('Gender is required');
        fieldErrors.child_gender = 'Gender is required';
      }
      if (!formData.child_place_of_birth.trim()) {
        errors.push('Place of birth is required');
        fieldErrors.child_place_of_birth = 'Place of birth is required';
      }
    } else if (stepNum === 2) {
      if (!formData.parent_name.trim()) {
        errors.push('Parent name is required');
        fieldErrors.parent_name = 'Parent name is required';
      }
      if (!formData.parent_mobile_number.trim()) {
        errors.push('Mobile number is required');
        fieldErrors.parent_mobile_number = 'Mobile number is required';
      }
      if (!/^[0-9]{10}$/.test(formData.parent_mobile_number)) {
        errors.push('Mobile number must be 10 digits');
        fieldErrors.parent_mobile_number = 'Mobile number must be 10 digits';
      }
    } else if (stepNum === 3) {
      if (!formData.program_name) {
        errors.push('Program is required');
        fieldErrors.program_name = 'Program is required';
      }
    }

    if (errors.length > 0) {
      setErrors(fieldErrors);
      toast.error(errors[0]);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    if (!validateStep(4)) return;

    try {
      setLoading(true);

      const formDataToSend = new FormData();

      formDataToSend.append('child_name', formData.child_name);
      formDataToSend.append('child_dob', formData.child_dob);
      formDataToSend.append('child_gender', formData.child_gender);
      formDataToSend.append('child_place_of_birth', formData.child_place_of_birth);
      formDataToSend.append('parent_name', formData.parent_name);
      formDataToSend.append('parent_mobile_number', formData.parent_mobile_number);
      if (formData.parent_email) {
        formDataToSend.append('parent_email', formData.parent_email);
      }
      formDataToSend.append('program_name', formData.program_name);
      if (formData.previous_school) {
        formDataToSend.append('previous_school', formData.previous_school);
      }

      if (uploadDocsNow) {
        if (files.photo) formDataToSend.append('photo', files.photo);
        if (files.birth_certificate) formDataToSend.append('birth_certificate', files.birth_certificate);
        if (files.aadhar_card) formDataToSend.append('aadhar_card', files.aadhar_card);
        if (files.parent_id_proof) formDataToSend.append('parent_id_proof', files.parent_id_proof);
      }

      const response = await fetch('/api/admission', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Submission failed');
        return;
      }

      setSubmissionResult(result.data);
      setSubmitted(true);
      toast.success('Admission submitted successfully!');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An error occurred during submission');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!pdfRef.current) return;

    try {
      toast.loading('Generating PDF...');

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Admission_${submissionResult?.admission_number}.pdf`);

      toast.dismiss();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error('Failed to generate PDF');
    }
  };

  const handlePrint = () => {
    if (!pdfRef.current) return;
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Admission Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
          </style>
        </head>
        <body>
          ${pdfRef.current.innerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  const handleShare = async () => {
    const text = `I have successfully submitted my admission application to ${schoolDetails.name}! Admission Number: ${submissionResult?.admission_number}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Admission Confirmation',
          text: text,
          url: window.location.href,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        toast.success('Admission details copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy to clipboard');
      }
    }
  };

  // Success Screen
  if (submitted && submissionResult) {
    return (
      <section className={styles.successBox}>
        <LineArt
          circle={{
            size: 200,
            borderColor: 'var(--primary-yellow)',
            borderWidth: 3,
            borderStyle: 'dashed',
            opacity: 1,
            animationSpeed: 30,
            bottom: '7%',
            left: '7%',
            icon: <SchoolOutlinedIcon sx={{ fontSize: 40, transform: 'scale(-1, 1)' }} />,
            iconColor: 'var(--primary-purple)',
            showIcon: true,
          }}
          dot={{
            size: 150,
            color: 'var(--primary-yellow)',
            opacity: 0.3,
            animationSpeed: 6,
            top: '10%',
            right: '5%',
            blur: 60,
            show: true,
          }}
          zIndex={1}
        />

        <div className={styles.container}>
          <motion.div
            className={styles.successCard}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={{ scale: [0.8, 1.1, 1] }}
              transition={{ duration: 0.6 }}
              className={styles.checkmarkContainer}
            >
              <FaCheckCircle className={styles.successIcon} />
            </motion.div>

            <h1 className={styles.successTitle}>Admission Submitted Successfully!</h1>
            <p className={styles.successSubtitle}>
              Your application has been received. Check your email for further updates.
            </p>

            {/* Confirmation Slip */}
            <motion.div
              ref={pdfRef}
              className={styles.confirmationSlipContainer}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <AdmissionConfirmationSlip data={submissionResult} formData={formData} />
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className={styles.successButtonGroup}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <button className={styles.btnPrimary} onClick={downloadPDF}>
                <FaDownload className={styles.btnIcon} />
                <span>Download PDF</span>
              </button>
          
              {/* <button className={styles.btnSecondary} onClick={handleShare}>
                <FaShare className={styles.btnIcon} />
                <span>Share</span>
              </button> */}
            </motion.div>

            {/* Info Box */}
            <motion.div
              className={styles.infoBox}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h3>📋 What's Next?</h3>
              <ul className={styles.infoList}>
                <li>You will receive an email confirmation shortly</li>
                <li>Our team will review your application within 3-5 business days</li>
                <li>You will be contacted at the provided phone number for verification</li>
                <li>Fee payment and final admission details will be shared soon</li>
              </ul>
            </motion.div>

            {/* New Application Button */}
            <motion.button
              className={styles.newApplicationBtn}
              onClick={() => {
                setSubmitted(false);
                setSubmissionResult(null);
                setStep(1);
                setFormData({
                  child_name: '',
                  child_dob: '',
                  child_gender: '',
                  child_place_of_birth: '',
                  parent_name: '',
                  parent_mobile_number: '',
                  parent_email: '',
                  program_name: '',
                  previous_school: '',
                });
                setFiles({
                  photo: null,
                  birth_certificate: null,
                  aadhar_card: null,
                  parent_id_proof: null,
                });
                setFilePreviews({
                  photo: null,
                  birth_certificate: null,
                  aadhar_card: null,
                  parent_id_proof: null,
                });
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Submit Another Application
            </motion.button>
          </motion.div>
        </div>
      </section>
    );
  }

  // Form Screen
  return (
    <>
      <section className={styles.admissionForm}>
        <LineArt
          circle={{
            size: 200,
            borderColor: 'var(--primary-yellow)',
            borderWidth: 3,
            borderStyle: 'dashed',
            opacity: 1,
            animationSpeed: 30,
            bottom: '7%',
            left: '7%',
            icon: <SchoolOutlinedIcon sx={{ fontSize: 40, transform: 'scale(-1, 1)' }} />,
            iconColor: 'var(--primary-purple)',
            showIcon: true,
          }}
          dot={{
            size: 150,
            color: 'var(--primary-yellow)',
            opacity: 0.3,
            animationSpeed: 6,
            top: '10%',
            right: '5%',
            blur: 60,
            show: true,
          }}
          squiggly={{
            size: 100,
            color: 'var(--primary-purple)',
            opacity: 0.1,
            animationSpeed: 8,
            top: '30%',
            left: '2%',
            show: true,
            reverse: true,
          }}
          zIndex={1}
        />
        <HeadingTitle text="Admission Form" />
        <div className={styles.container}>
          <div className={styles.formCard}>
            <div className={styles.formLayout}>
              <main className={styles.main}>
                <p className={styles.subtitle}>Fill in the details below to apply for admission</p>

                {/* Progress Bar */}
                <div className={styles.topProgress} aria-hidden>
                  <div className={styles.progressWrap}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${((step - 1) / 3) * 100}%` }}
                    />
                  </div>

                  <div className={styles.pills}>
                    {[
                      { n: 1, t: 'Child Details', icon: EmojiPeople },
                      { n: 2, t: "Parent's Details", icon: FamilyRestroom },
                      { n: 3, t: 'Academic Details', icon: SchoolOutlined },
                      { n: 4, t: 'Upload Documents', icon: DescriptionOutlined },
                    ].map((s) => {
                      const IconComponent = s.icon;
                      return (
                        <div
                          key={s.n}
                          className={`${styles.pill} ${step >= s.n ? styles.active : ''} ${step > s.n ? styles.completed : ''}`}
                        >
                          <span className={styles.pillNumber}>{s.n}</span>
                          <IconComponent className={styles.pillIcon} />
                          <h2 className={styles.pillText}>{s.t}</h2>
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.progressWrap}>
                    <div className={styles.progressBar} />
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  {/* Step 1: Child Details */}
                  {step === 1 && (
                    <motion.div
                      className={styles.stepContent}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>Child's Full Name *</label>
                          <input
                            type="text"
                            name="child_name"
                            value={formData.child_name}
                            onChange={handleInputChange}
                            placeholder="Enter child's full name"
                            required
                          />
                          {errors.child_name && (
                            <p className={styles.errorMessage}>{errors.child_name}</p>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label>Date of Birth *</label>
                          <input
                            type="date"
                            name="child_dob"
                            value={formData.child_dob}
                            onChange={handleInputChange}
                            required
                          />
                          {errors.child_dob && <p className={styles.errorMessage}>{errors.child_dob}</p>}
                        </div>
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>Gender *</label>
                          <div className={styles.radioGroup}>
                            <div className={styles.radioItem}>
                              <input
                                type="radio"
                                id="gender_male"
                                name="child_gender"
                                value="male"
                                checked={formData.child_gender === 'male'}
                                onChange={handleInputChange}
                                className={styles.radioInput}
                              />
                              <label htmlFor="gender_male" className={styles.radioLabel}>
                                Male
                              </label>
                            </div>

                            <div className={styles.radioItem}>
                              <input
                                type="radio"
                                id="gender_female"
                                name="child_gender"
                                value="female"
                                checked={formData.child_gender === 'female'}
                                onChange={handleInputChange}
                                className={styles.radioInput}
                              />
                              <label htmlFor="gender_female" className={styles.radioLabel}>
                                Female
                              </label>
                            </div>
                          </div>
                          {errors.child_gender && (
                            <p className={styles.errorMessage}>{errors.child_gender}</p>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label>Place of Birth *</label>
                          <input
                            type="text"
                            name="child_place_of_birth"
                            value={formData.child_place_of_birth}
                            onChange={handleInputChange}
                            placeholder="Enter place of birth"
                            required
                          />
                          {errors.child_place_of_birth && (
                            <p className={styles.errorMessage}>{errors.child_place_of_birth}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Parent Details */}
                  {step === 2 && (
                    <motion.div
                      className={styles.stepContent}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>Parent's Full Name *</label>
                          <input
                            type="text"
                            name="parent_name"
                            value={formData.parent_name}
                            onChange={handleInputChange}
                            placeholder="Enter parent's full name"
                            required
                          />
                          {errors.parent_name && (
                            <p className={styles.errorMessage}>{errors.parent_name}</p>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label>Mobile Number *</label>
                          <input
                            type="tel"
                            name="parent_mobile_number"
                            value={formData.parent_mobile_number}
                            onChange={handleInputChange}
                            placeholder="10-digit mobile number"
                            maxLength={10}
                            pattern="[0-9]{10}"
                            required
                          />
                          {errors.parent_mobile_number && (
                            <p className={styles.errorMessage}>{errors.parent_mobile_number}</p>
                          )}
                        </div>
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>Email (Optional)</label>
                          <input
                            type="email"
                            name="parent_email"
                            value={formData.parent_email}
                            onChange={handleInputChange}
                            placeholder="Enter parent's email"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Academic Details */}
                  {step === 3 && (
                    <motion.div
                      className={styles.stepContent}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>Program *</label>
                          <div className={styles.radioGroup}>
                            {programs.map((p) => (
                              <div className={styles.radioItem} key={p.value}>
                                <input
                                  type="radio"
                                  id={`program_${p.value}`}
                                  name="program_name"
                                  value={p.value}
                                  checked={formData.program_name === p.value}
                                  onChange={handleInputChange}
                                  className={styles.radioInput}
                                />
                                <label htmlFor={`program_${p.value}`} className={styles.radioLabel}>
                                  {p.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          {errors.program_name && (
                            <p className={styles.errorMessage}>{errors.program_name}</p>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label>Previous School (Optional)</label>
                          <input
                            type="text"
                            name="previous_school"
                            value={formData.previous_school}
                            onChange={handleInputChange}
                            placeholder="Enter previous school name"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Documents */}
                  {step === 4 && (
                    <motion.div
                      className={styles.stepContent}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className={styles.formGroup}>
                        <label>Selected Files Status</label>
                        <div className={styles.selectedFiles}>
                          <div
                            className={`${styles.fileStatusItem} ${filePreviews.photo ? styles.uploaded : styles.notUploaded}`}
                          >
                            <span className={styles.fileStatusIcon}>
                              {filePreviews.photo ? '✓' : '○'}
                            </span>
                            <span className={styles.fileStatusText}>
                              Photo:{' '}
                              {filePreviews.photo
                                ? filePreviews.photo.startsWith('data:image')
                                  ? 'Image selected'
                                  : filePreviews.photo
                                : 'Not uploaded'}
                            </span>
                          </div>

                          <div
                            className={`${styles.fileStatusItem} ${filePreviews.birth_certificate ? styles.uploaded : styles.notUploaded}`}
                          >
                            <span className={styles.fileStatusIcon}>
                              {filePreviews.birth_certificate ? '✓' : '○'}
                            </span>
                            <span className={styles.fileStatusText}>
                              Birth Certificate:{' '}
                              {filePreviews.birth_certificate
                                ? filePreviews.birth_certificate.startsWith('data:image')
                                  ? 'Image selected'
                                  : filePreviews.birth_certificate
                                : 'Not uploaded'}
                            </span>
                          </div>

                          <div
                            className={`${styles.fileStatusItem} ${filePreviews.aadhar_card ? styles.uploaded : styles.notUploaded}`}
                          >
                            <span className={styles.fileStatusIcon}>
                              {filePreviews.aadhar_card ? '✓' : '○'}
                            </span>
                            <span className={styles.fileStatusText}>
                              Aadhar Card:{' '}
                              {filePreviews.aadhar_card
                                ? filePreviews.aadhar_card.startsWith('data:image')
                                  ? 'Image selected'
                                  : filePreviews.aadhar_card
                                : 'Not uploaded'}
                            </span>
                          </div>

                          <div
                            className={`${styles.fileStatusItem} ${filePreviews.parent_id_proof ? styles.uploaded : styles.notUploaded}`}
                          >
                            <span className={styles.fileStatusIcon}>
                              {filePreviews.parent_id_proof ? '✓' : '○'}
                            </span>
                            <span className={styles.fileStatusText}>
                              Parent ID Proof:{' '}
                              {filePreviews.parent_id_proof
                                ? filePreviews.parent_id_proof.startsWith('data:image')
                                  ? 'Image selected'
                                  : filePreviews.parent_id_proof
                                : 'Not uploaded'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {uploadDocsNow && (
                        <>
                          <FileUploadField
                            label="Photo (Optional)"
                            fieldName="photo"
                            accept="image/*"
                            preview={filePreviews.photo}
                            onChange={(e) => handleFileChange(e, 'photo')}
                          />

                          <FileUploadField
                            label="Birth Certificate (Optional)"
                            fieldName="birth_certificate"
                            accept=".pdf,image/*"
                            preview={filePreviews.birth_certificate}
                            onChange={(e) => handleFileChange(e, 'birth_certificate')}
                          />

                          <FileUploadField
                            label="Aadhar Card (Optional)"
                            fieldName="aadhar_card"
                            accept=".pdf,image/*"
                            preview={filePreviews.aadhar_card}
                            onChange={(e) => handleFileChange(e, 'aadhar_card')}
                          />

                          <FileUploadField
                            label="Parent's ID Proof (Optional)"
                            fieldName="parent_id_proof"
                            accept=".pdf,image/*"
                            preview={filePreviews.parent_id_proof}
                            onChange={(e) => handleFileChange(e, 'parent_id_proof')}
                          />
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* Navigation Buttons */}
                  <motion.div className={styles.buttonGroup} layout>
                    {step > 1 && (
                      <button
                        type="button"
                        className={styles.prevBtn}
                        onClick={() => setStep(step - 1)}
                      >
                        ← Previous
                      </button>
                    )}

                    {step < 4 ? (
                      <button
                        type="button"
                        className={styles.nextBtn}
                        onClick={() => {
                          if (validateStep(step)) {
                            setStep(step + 1);
                          }
                        }}
                      >
                        Next →
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={styles.submitBtn}
                        disabled={loading}
                        onClick={() => handleSubmit()}
                      >
                        {loading ? (
                          <>
                            <FaSpinner className={styles.spinner} /> Submitting...
                          </>
                        ) : (
                          '✓ Submit Admission'
                        )}
                      </button>
                    )}
                  </motion.div>
                </form>
              </main>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// File Upload Field Component
function FileUploadField({
  label,
  accept,
  preview,
  onChange,
}: {
  label: string;
  fieldName: string;
  accept: string;
  preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.fileUploadField}>
      <label>{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        className={styles.fileInput}
        style={{ display: 'none' }}
      />
      <div className={styles.fileUploadBox} onClick={() => inputRef.current?.click()}>
        {preview ? (
          <div className={styles.filePreview}>
            {preview.startsWith('data:image') ? (
              <img src={preview} alt="Preview" />
            ) : (
              <p>{preview}</p>
            )}
            <p className={styles.clickToChange}>Click to change</p>
          </div>
        ) : (
          <div className={styles.uploadPlaceholder}>
            <span>📁 Click to upload file</span>
            <small>Max 10MB • JPG, PNG, PDF</small>
          </div>
        )}
      </div>
    </div>
  );
}

// Admission Confirmation Slip Component
function AdmissionConfirmationSlip({
  data,
  formData,
}: {
  data: SubmissionResult;
  formData: FormData;
}) {
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

  return (
    <motion.div
      className={styles.confirmationSlip}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with School Logo & Name */}
      <motion.div className={styles.slipHeader} variants={itemVariants}>
        <div className={styles.schoolBranding}>
          {schoolDetails.logo && (
            <div className={styles.logoContainer}>
              <img
                src={typeof schoolDetails.logo === 'string' ? schoolDetails.logo : schoolDetails.logo.src}
                alt={schoolDetails.name}
                className={styles.schoolLogo}
              />
            </div>
          )}
          <div className={styles.schoolInfo}>
            <h2 className={styles.schoolName}>{schoolDetails.name}</h2>
            <p className={styles.schoolTagline}>
              {schoolDetails.address.street}, {schoolDetails.address.city}
            </p>
            <p className={styles.schoolContact}>
              📞 {schoolDetails.contact.phone} | 📧 {schoolDetails.contact.email}
            </p>
          </div>
        </div>
        <div className={styles.headerDivider}></div>
      </motion.div>

      {/* Admission Number */}
      <motion.div className={styles.admissionNumberBox} variants={itemVariants}>
        <span className={styles.admissionLabel}>Admission Number</span>
        <span className={styles.admissionNumber}>{data.admission_number}</span>
      </motion.div>

      {/* Details Grid */}
      <div className={styles.detailsGrid}>
        {/* Child Details */}
        <motion.div className={styles.detailSection} variants={itemVariants}>
          <h3 className={styles.sectionTitle}>👶 Child Details</h3>
          <div className={styles.detailRow}>
            <span className={styles.label}>Name</span>
            <span className={styles.value}>{data.child_name}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Date of Birth</span>
            <span className={styles.value}>{formData.child_dob}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Gender</span>
            <span className={styles.value}>{formData.child_gender}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Place of Birth</span>
            <span className={styles.value}>{formData.child_place_of_birth}</span>
          </div>
        </motion.div>

        {/* Parent Details */}
        <motion.div className={styles.detailSection} variants={itemVariants}>
          <h3 className={styles.sectionTitle}>👨‍👩‍👧 Parent Details</h3>
          <div className={styles.detailRow}>
            <span className={styles.label}>Parent Name</span>
            <span className={styles.value}>{formData.parent_name}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Contact Number</span>
            <span className={styles.value}>{data.parent_mobile_number}</span>
          </div>
        </motion.div>

        {/* Program Details */}
        <motion.div className={styles.detailSection} variants={itemVariants}>
          <h3 className={styles.sectionTitle}>🎓 Program Details</h3>
          <div className={styles.detailRow}>
            <span className={styles.label}>Applied Program</span>
            <span className={styles.programBadge}>{data.program_name}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Application Status</span>
            <span className={styles.statusBadge}>Under Review</span>
          </div>
        </motion.div>
      </div>

      {/* Footer Message */}
      <motion.div className={styles.slipFooter} variants={itemVariants}>
        <p className={styles.footerText}>
          Thank you for choosing {schoolDetails.name}. We will review your application and contact you shortly.
        </p>
        <p className={styles.footerDate}>
          Date:{' '}
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </motion.div>
    </motion.div>
  );
}