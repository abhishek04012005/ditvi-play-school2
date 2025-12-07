"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFilePdf, FaImage, FaFileAlt, FaTimes, FaSpinner, FaUpload, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import styles from './correction-form.module.css';
import { schoolDetails } from '@/json/schooldetails';

interface CorrectionFormProps {
  admissionId: string;
  admissionNumber: string;
  currentData: Record<string, any>;
  remark?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FileUpload {
  field: string;
  file: File | null;
  preview?: string;
  fileName?: string;
}

export default function CorrectionForm({
  admissionId,
  admissionNumber,
  currentData,
  remark,
  onSuccess,
  onCancel,
}: CorrectionFormProps) {
  const [formData, setFormData] = useState(currentData);
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available document fields
  const documentFields = [
    { field: 'photo', label: 'Child Photo', accept: 'image/*' },
    { field: 'birth_certificate', label: 'Birth Certificate', accept: 'application/pdf,image/*' },
    { field: 'aadhar_card', label: 'Aadhar Card', accept: 'application/pdf,image/*' },
    { field: 'parent_id_proof', label: 'Parent ID Proof', accept: 'application/pdf,image/*' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFiles((prev) => {
      const existing = prev.findIndex((f) => f.field === field);
      const newFile: FileUpload = {
        field,
        file,
        fileName: file.name,
      };

      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newFile;
        return updated;
      }

      return [...prev, newFile];
    });
  };

  const removeFile = (field: string) => {
    setFiles((prev) => prev.filter((f) => f.field !== field));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.child_name?.trim()) {
      setError('Child name is required');
      return;
    }
    if (!formData.parent_address?.trim()) {
      setError('Parent address is required');
      return;
    }

    try {
      setLoading(true);

      // Map field names to database column names
      const fieldToDatabaseMap: { [key: string]: string } = {
        'photo': 'photo_url',
        'birth_certificate': 'birth_certificate_url',
        'aadhar_card': 'aadhar_card_url',
        'parent_id_proof': 'parent_id_proof_url',
      };

      // Prepare update payload with form data
      const updatePayload: any = {
        ...formData,
      };

      // If there are files to upload, upload them and collect URLs
      if (files.length > 0) {
        for (const fileUpload of files) {
          if (!fileUpload.file) continue;

          const uploadFormData = new FormData();
          uploadFormData.append('file', fileUpload.file);
          uploadFormData.append('field_name', fileUpload.field);
          uploadFormData.append('admissionNumber', admissionNumber);

          console.log(`📤 Uploading ${fileUpload.field}...`);

          const uploadResponse = await fetch('/api/admission/upload-file', {
            method: 'POST',
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            const result = await uploadResponse.json();
            console.error(`❌ Upload failed for ${fileUpload.field}:`, result);
            throw new Error(result.error || `Failed to upload ${fileUpload.field}`);
          }

          // Get the uploaded file URL from response
          const uploadResult = await uploadResponse.json();
          console.log(`✅ Upload response for ${fileUpload.field}:`, uploadResult);

          const fileUrl = uploadResult?.data?.downloadUrl || uploadResult?.data?.webViewLink;
          
          if (fileUrl) {
            // Map field name to database column and add URL to update payload
            const dbField = fieldToDatabaseMap[fileUpload.field];
            if (dbField) {
              updatePayload[dbField] = fileUrl;
              console.log(`✅ Added ${dbField} = ${fileUrl}`);
            }
          } else {
            console.warn(`⚠️ No URL found in upload response for ${fileUpload.field}`);
          }
        }
      }
      
      console.log(`📝 Final updatePayload:`, updatePayload);

      // Now update the admission with all data (form + file URLs)
      const updateResponse = await fetch(`/api/admission/${admissionId}/corrections`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!updateResponse.ok) {
        const result = await updateResponse.json();
        console.error(`❌ Corrections API error:`, result);
        throw new Error(result.error || 'Failed to update admission');
      }

      console.log(`✅ Admission updated successfully!`);
      toast.success('Corrections submitted successfully!');
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button
            className={styles.backBtn}
            onClick={onCancel}
            aria-label="Go back"
          >
            <FaArrowLeft /> Back
          </button>
          <h1>Edit Your Admission Details</h1>
          <p>Make the necessary corrections as indicated by the admin remarks</p>
        </div>

        {/* Remark Box */}
        {remark && (
          <motion.div
            className={styles.remarkBox}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className={styles.remarkLabel}>📝 Admin Remarks</span>
            <p className={styles.remarkText}>{remark}</p>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Child Details */}
          <motion.div
            className={styles.formSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className={styles.sectionTitle}>👶 Child Details</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Child Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="child_name"
                  value={formData.child_name || ''}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Enter child name"
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Date of Birth</label>
                <input
                  type="date"
                  name="child_dob"
                  value={formData.child_dob || ''}
                  onChange={handleInputChange}
                  className={styles.input}
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Gender</label>
                <select
                  name="child_gender"
                  value={formData.child_gender || ''}
                  onChange={handleInputChange}
                  className={styles.select}
                  disabled={loading}
                >
                  <option value="">-- Select --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Place of Birth</label>
                <input
                  type="text"
                  name="child_place_of_birth"
                  value={formData.child_place_of_birth || ''}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Enter place of birth"
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Blood Group</label>
                <select
                  name="child_blood_group"
                  value={formData.child_blood_group || ''}
                  onChange={handleInputChange}
                  className={styles.select}
                  disabled={loading}
                >
                  <option value="">-- Select --</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Parent Details */}
          <motion.div
            className={styles.formSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className={styles.sectionTitle}>👨‍👩‍👧 Parent Details</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Parent Name</label>
                <input
                  type="text"
                  name="parent_name"
                  value={formData.parent_name || ''}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Enter parent name"
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  name="parent_email"
                  value={formData.parent_email || ''}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Enter email"
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Address <span className={styles.required}>*</span>
                </label>
                <textarea
                  name="parent_address"
                  value={formData.parent_address || ''}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Enter complete address"
                  disabled={loading}
                />
              </div>
            </div>
          </motion.div>

          {/* Program Details */}
          <motion.div
            className={styles.formSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className={styles.sectionTitle}>🎓 Program Details</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Program</label>
                <select
                  name="program_name"
                  value={formData.program_name || ''}
                  onChange={handleInputChange}
                  className={styles.select}
                  disabled={loading}
                >
                  <option value="">-- Select Program --</option>
                  {schoolDetails.programs.map((program) => (
                    <option key={program.name} value={program.name}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Previous School</label>
                <input
                  type="text"
                  name="previous_school"
                  value={formData.previous_school || ''}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Enter previous school (optional)"
                  disabled={loading}
                />
              </div>
            </div>
          </motion.div>

          {/* Documents */}
          <motion.div
            className={styles.formSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className={styles.sectionTitle}>📄 Documents</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-gray)', fontSize: '0.9rem' }}>
              Upload new documents to replace the previous ones
            </p>
            <div className={styles.documentGrid}>
              {documentFields.map((doc) => {
                const uploadedFile = files.find((f) => f.field === doc.field);
                return (
                  <div key={doc.field} className={styles.documentItem}>
                    <label className={styles.documentLabel}>{doc.label}</label>
                    {uploadedFile?.file ? (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div className={styles.fileName}>✓ {uploadedFile.file.name}</div>
                        <button
                          type="button"
                          onClick={() => removeFile(doc.field)}
                          className={styles.removeBtn}
                          disabled={loading}
                        >
                          <FaTimes /> Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          id={`file-${doc.field}`}
                          type="file"
                          accept={doc.accept}
                          onChange={(e) => handleFileChange(e, doc.field)}
                          className={styles.fileInput}
                          disabled={loading}
                        />
                        <label
                          htmlFor={`file-${doc.field}`}
                          className={styles.uploadLabel}
                        >
                          <FaUpload /> Click to upload
                        </label>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <FaSpinner className={styles.spinner} />
                  Submitting...
                </>
              ) : (
                <>
                  <FaUpload />
                  Submit Corrections
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <motion.div
          className={styles.loadingOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className={styles.loadingContent}>
            <FaSpinner className={styles.spinner} style={{ fontSize: '2rem', color: 'var(--primary-purple)' }} />
            <p>Submitting your corrections...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
