"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilePdf, FaImage, FaFileAlt, FaTimes, FaSpinner, FaUpload, FaArrowLeft, FaEye, FaDownload } from 'react-icons/fa';
import toast from 'react-hot-toast';
import styles from './correction-form.module.css';
import { schoolDetails } from '@/json/schooldetails';
import schoolDetailsHi from '@/json/schooldetails-hi';
import Loader from '@/custom/loader/loader';
import {
    EmojiPeople,
    FamilyRestroom,
    SchoolOutlined,
    DescriptionOutlined,
} from "@mui/icons-material";

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
    const [previewModal, setPreviewModal] = useState<{ url: string; type: 'image' | 'pdf' | 'document'; name: string } | null>(null);
    const [language, setLanguage] = useState<'en' | 'hi'>('en');

    useEffect(() => {
        const saved = localStorage.getItem('language') as 'en' | 'hi' | null;
        if (saved && (saved === 'en' || saved === 'hi')) {
            setLanguage(saved);
        }
    }, []);

    const currentSchoolDetails = language === 'hi' ? schoolDetailsHi : schoolDetails;

    // Available document fields
    const documentFields = [
        { field: 'photo', label: 'Child Photo', accept: 'image/*' },
        { field: 'birth_certificate', label: 'Birth Certificate', accept: 'application/pdf,image/*' },
        { field: 'aadhar_card', label: 'Aadhar Card', accept: 'application/pdf,image/*' },
        { field: 'parent_id_proof', label: 'Parent ID Proof', accept: 'application/pdf,image/*' },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        let processedValue = value;
        
        // Fields that should only contain alphabets and spaces
        const nameFields = ['child_name', 'parent_name', 'child_place_of_birth'];
        if (nameFields.includes(name)) {
            processedValue = value.replace(/[^a-zA-Z\s]/g, '');
        }
        
        setFormData((prev) => ({
            ...prev,
            [name]: processedValue,
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

    const getGoogleDriveURL = (url: string, type: 'image' | 'pdf' | 'document') => {
        if (!url) return url;

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

        if (type === 'image') {
            return `/api/proxy-drive-file?id=${fileId}&type=view`;
        } else if (type === 'pdf') {
            return `https://drive.google.com/file/d/${fileId}/preview`;
        }

        return `https://drive.google.com/uc?export=download&id=${fileId}`;
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
                        <h3 className={styles.sectionTitle}><EmojiPeople /> Child Details</h3>
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
                        <h3 className={styles.sectionTitle}><FamilyRestroom /> Parent Details</h3>
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
                        <h3 className={styles.sectionTitle}><SchoolOutlined/> Program Details</h3>
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
                                    {currentSchoolDetails.programs.map((program) => (
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
                        <h3 className={styles.sectionTitle}><DescriptionOutlined/> Documents</h3>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-gray)', fontSize: '0.9rem' }}>
                            Upload new documents to replace the previous ones
                        </p>
                        <div className={styles.documentGrid}>
                            {documentFields.map((doc) => {
                                const uploadedFile = files.find((f) => f.field === doc.field);
                                const dbField = `${doc.field}_url` as keyof typeof currentData;
                                const existingUrl = currentData[dbField];
                                const fileTypeKey = `${doc.field}_url`;

                                return (
                                    <div key={doc.field} className={styles.documentItem}>
                                        <label className={styles.documentLabel}>{doc.label}</label>

                                        {/* Show existing document if available */}
                                        {existingUrl && !uploadedFile?.file && (
                                            <div className={styles.existingDocument}>
                                                <div className={styles.existingDocumentInfo}>
                                                    <FaFileAlt className={styles.existingDocIcon} />
                                                    <span className={styles.existingDocLabel}>Current Document</span>
                                                </div>
                                                <div className={styles.existingDocumentActions}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewModal({
                                                            url: existingUrl,
                                                            type: doc.field === 'photo' ? 'image' : 'pdf',
                                                            name: doc.label
                                                        })}
                                                        className={styles.previewBtn}
                                                        title="Preview document"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <a
                                                        href={getGoogleDriveURL(existingUrl, 'document')}
                                                        download
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={styles.downloadBtn}
                                                        title="Download document"
                                                    >
                                                        <FaDownload />
                                                    </a>
                                                </div>
                                                <div className={styles.replaceHint}>
                                                    <p>Select a new file below to replace</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* New file upload or selected file */}
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
                                                    <FaUpload /> {existingUrl ? 'Click to replace' : 'Click to upload'}
                                                </label>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Document Preview Modal */}
                    <DocumentPreviewModal
                        isOpen={previewModal !== null}
                        onClose={() => setPreviewModal(null)}
                        preview={previewModal}
                        getGoogleDriveURL={getGoogleDriveURL}
                    />

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
                <Loader message="Processing your corrections, please wait..." />
            )}
        </div>
    );
}

// Document Preview Modal Component
const DocumentPreviewModal = ({
    isOpen,
    onClose,
    preview,
    getGoogleDriveURL,
}: {
    isOpen: boolean;
    onClose: () => void;
    preview: { url: string; type: 'image' | 'pdf' | 'document'; name: string } | null;
    getGoogleDriveURL: (url: string, type: 'image' | 'pdf' | 'document') => string;
}) => {
    if (!preview) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className={styles.modal}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <div className={styles.modalHeader}>
                            <div>
                                <h2>📄 Document Preview</h2>
                                <p>{preview.name}</p>
                            </div>
                            <button
                                className={styles.closeBtn}
                                onClick={onClose}
                                aria-label="Close"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className={styles.previewContent}>
                            {preview.type === 'image' ? (
                                <img
                                    src={getGoogleDriveURL(preview.url, 'image')}
                                    alt={preview.name}
                                    className={styles.previewImage}
                                    onError={() => toast.error('Failed to load image preview')}
                                />
                            ) : preview.type === 'pdf' ? (
                                <iframe
                                    src={getGoogleDriveURL(preview.url, 'pdf')}
                                    title="PDF Preview"
                                    className={styles.previewIframe}
                                />
                            ) : (
                                <div className={styles.previewPlaceholder}>
                                    <p>Unable to preview this document type.</p>
                                </div>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <a
                                href={getGoogleDriveURL(preview.url, 'document')}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.downloadLink}
                            >
                                <FaDownload /> Download
                            </a>
                            <button className={styles.cancelBtn} onClick={onClose}>
                                <FaTimes /> Close
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
