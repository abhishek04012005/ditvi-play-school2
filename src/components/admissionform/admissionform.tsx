'use client';

import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { FaSpinner, FaCheckCircle, FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import styles from './admissionform.module.css';
import HeadingTitle from '@/components/heading/headingtitle';
import { EmojiPeople, FamilyRestroom, SchoolOutlined, DescriptionOutlined } from '@mui/icons-material';

interface FormData {
  // Child Details
  child_name: string;
  child_dob: string;
  child_gender: string;
  child_place_of_birth: string;

  // Parent Details
  parent_name: string;
  parent_mobile_number: string;
  parent_email: string;

  // Academic Details
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
  success: boolean;
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

const genders = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof FormFiles) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFiles({ ...files, [fieldName]: file });

    // Create preview for images
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
    } else if (stepNum === 4) {
      // All documents are optional - no validation required
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

      // Add form fields
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

      // Add files only if user chose to upload now
      if (uploadDocsNow) {
        if (files.photo) formDataToSend.append('photo', files.photo);
        if (files.birth_certificate) formDataToSend.append('birth_certificate', files.birth_certificate);
        if (files.aadhar_card) formDataToSend.append('aadhar_card', files.aadhar_card);
        if (files.parent_id_proof) formDataToSend.append('parent_id_proof', files.parent_id_proof);
      }

      // Submit
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

  const generatePDF = async () => {
    if (!pdfRef.current) return;

    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let yPosition = 10;

      if (imgHeight > pdfHeight - 20) {
        const pages = Math.ceil((imgHeight + 20) / (pdfHeight - 20));
        for (let i = 0; i < pages; i++) {
          if (i > 0) pdf.addPage();
          pdf.addImage(
            imgData,
            'PNG',
            10,
            yPosition - i * (pdfHeight - 20),
            imgWidth,
            imgHeight
          );
        }
      } else {
        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
      }

      pdf.save(`Admission_${submissionResult?.admission_number}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  // Success Screen
  if (submitted && submissionResult) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <FaCheckCircle className={styles.successIcon} />
          <h1>Admission Submitted Successfully!</h1>

          {/* Step 1: Child Details */}
          {step === 1 && (
            <div className={styles.stepContent}>

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
                      <label htmlFor="gender_male" className={styles.radioLabel}>Male</label>
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
                      <label htmlFor="gender_female" className={styles.radioLabel}>Female</label>
                    </div>
                  </div>
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
                </div>
              </div>
            </div>
          )}

          {/* Render confirmation slip (used for PDF) */}
          <div ref={pdfRef}>
            <AdmissionConfirmationSlip data={submissionResult} formData={formData} />
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.nextBtn}
              onClick={generatePDF}
            >
              <FaDownload /> Download PDF
            </button>

            <button
              type="button"
              className={styles.nextBtn}
              onClick={() => {
                // Reset form to allow another submission
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
            >
              Submit Another Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form Screen
  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
          <div className={styles.formLayout}>
            <main className={styles.main}>
              <HeadingTitle text="Admission Form" />
              <p className={styles.subtitle}>Fill in the details below to apply for admission</p>

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
                    { n: 4, t: 'Documents', icon: DescriptionOutlined },
                  ].map((s) => {
                    const IconComponent = s.icon;
                    return (
                      <div
                        key={s.n}
                        className={`${styles.pill} ${step >= s.n ? styles.active : ''} ${step > s.n ? styles.completed : ''}`}>
                        <span className={styles.pillNumber}>{s.n}</span>
                        <IconComponent className={styles.pillIcon} />
                        <h2 className={styles.pillText}>{s.t}</h2>
                      </div>
                    );
                  })}
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  // Prevent any native form submission (e.g. Enter key).
                  // Actual posting is only performed when the user clicks the
                  // explicit "✅ Submit Admission" button which calls handleSubmit.
                  e.preventDefault();
                }}
              >
          {/* Step 1: Child Details */}
          {step === 1 && (
            <div className={styles.stepContent}>
              {/* heading removed: step label is shown in the top stepper */}

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
                  {errors.child_name && <p className={styles.errorMessage}>{errors.child_name}</p>}
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
                      <label htmlFor="gender_male" className={styles.radioLabel}>Male</label>
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
                      <label htmlFor="gender_female" className={styles.radioLabel}>Female</label>
                    </div>
                  </div>
                  {errors.child_gender && <p className={styles.errorMessage}>{errors.child_gender}</p>}
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
                  {errors.child_place_of_birth && <p className={styles.errorMessage}>{errors.child_place_of_birth}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Parent Details */}
          {step === 2 && (
            <div className={styles.stepContent}>
              {/* heading removed: step label is shown in the top stepper */}

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
                {errors.parent_name && <p className={styles.errorMessage}>{errors.parent_name}</p>}
              </div>

              <div className={styles.formRow}>
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
                  {errors.parent_mobile_number && <p className={styles.errorMessage}>{errors.parent_mobile_number}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Academics */}
          {step === 3 && (
            <div className={styles.stepContent}>
              {/* heading removed: step label is shown in the top stepper */}

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
                      <label htmlFor={`program_${p.value}`} className={styles.radioLabel}>{p.label}</label>
                    </div>
                  ))}
                </div>
                {errors.program_name && <p className={styles.errorMessage}>{errors.program_name}</p>}
              </div>

              <div className={styles.formGroup}>
                <label>Previous School (if any)</label>
                <input
                  type="text"
                  name="previous_school"
                  value={formData.previous_school}
                  onChange={handleInputChange}
                  placeholder="Enter previous school name"
                />
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {step === 4 && (
            <div className={styles.stepContent}>
              {/* heading removed: step label is shown in the top stepper */}

              <div className={styles.formGroup}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={uploadDocsNow}
                    onChange={(e) => setUploadDocsNow(e.target.checked)}
                  />
                  <span style={{ fontWeight: 700 }}>Upload documents now</span>
                </label>
                <p style={{ marginTop: '6px', color: '#666', fontSize: '0.92rem' }}>
                  If you don't want to upload documents now, uncheck this and submit — you can upload later from the admin portal.
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Selected files</label>
                <div style={{ display: 'grid', gap: 6 }}>
                  <small>Photo: {filePreviews.photo ? (filePreviews.photo.startsWith('data:image') ? 'Image selected' : filePreviews.photo) : 'Not uploaded'}</small>
                  <small>Birth Certificate: {filePreviews.birth_certificate ?? 'Not uploaded'}</small>
                  <small>Aadhar Card: {filePreviews.aadhar_card ?? 'Not uploaded'}</small>
                  <small>Parent ID Proof: {filePreviews.parent_id_proof ?? 'Not uploaded'}</small>
                </div>
              </div>

              {uploadDocsNow && (
                <>
                  {/* Photo */}
                  <FileUploadField
                    label="Photo (Optional)"
                    fieldName="photo"
                    accept="image/*"
                    preview={filePreviews.photo}
                    onChange={(e) => handleFileChange(e, 'photo')}
                  />

                  {/* Birth Certificate */}
                  <FileUploadField
                    label="Birth Certificate (Optional)"
                    fieldName="birth_certificate"
                    accept=".pdf,image/*"
                    preview={filePreviews.birth_certificate}
                    onChange={(e) => handleFileChange(e, 'birth_certificate')}
                  />

                  {/* Aadhar Card */}
                  <FileUploadField
                    label="Aadhar Card (Optional)"
                    fieldName="aadhar_card"
                    accept=".pdf,image/*"
                    preview={filePreviews.aadhar_card}
                    onChange={(e) => handleFileChange(e, 'aadhar_card')}
                  />

                  {/* Parent ID Proof */}
                  <FileUploadField
                    label="Parent's ID Proof (Optional)"
                    fieldName="parent_id_proof"
                    accept=".pdf,image/*"
                    preview={filePreviews.parent_id_proof}
                    onChange={(e) => handleFileChange(e, 'parent_id_proof')}
                  />
                </>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className={styles.buttonGroup}>
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
                  '✅ Submit Admission'
                )}
              </button>
            )}
          </div>
              </form>
            </main>
          </div>
        </div>
      </div>
  );
}

// File Upload Field Component
function FileUploadField({
  label,
  fieldName,
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
      <div
        className={styles.fileUploadBox}
        onClick={() => inputRef.current?.click()}
      >
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
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>🎓 Ditvi Play School</h1>
      <h2 style={{ textAlign: 'center' }}>Admission Confirmation Slip</h2>
      <hr />

      <p style={{ textAlign: 'center' }}>
        <strong>Admission Number: {data.admission_number}</strong>
      </p>

      <div style={{ marginTop: '30px' }}>
        <h3>Child Details:</h3>
        <p>Name: {data.child_name}</p>
        <p>DOB: {formData.child_dob}</p>
        <p>Gender: {formData.child_gender}</p>
        <p>Place of Birth: {formData.child_place_of_birth}</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Parent Details:</h3>
        <p>Name: {formData.parent_name}</p>
        <p>Mobile: {data.parent_mobile_number}</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Program Details:</h3>
        <p>Program: {data.program_name}</p>
      </div>

      <hr style={{ marginTop: '30px' }} />
      <p style={{ fontSize: '12px', color: '#666' }}>
        Thank you for choosing Ditvi Play School. We will review your application and contact you shortly.
      </p>
    </div>
  );
}
