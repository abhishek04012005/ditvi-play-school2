'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import styles from './googledriveupload.module.css';
import Loader from '@/custom/loader/loader';

interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    fileId: string;
    fileName: string;
    driveLink: string;
    userName: string;
    uploadTime: string;
  };
  error?: string;
}

export default function GoogleDriveUploadForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadResponse['data'][]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setPhotoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!photoFile) {
      toast.error('Please select a photo');
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData for multipart upload
      const uploadFormData = new FormData();
      uploadFormData.append('name', formData.name.trim());
      if (formData.email.trim()) {
        uploadFormData.append('email', formData.email.trim());
      }
      uploadFormData.append('photo', photoFile);

      // Send to API
      const response = await fetch('/api/upload-to-drive', {
        method: 'POST',
        body: uploadFormData,
      });

      const result: UploadResponse = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Upload failed');
        return;
      }

      // Success
      toast.success(result.message);
      
      // Add to uploaded files list
      if (result.data) {
        setUploadedFiles([result.data, ...uploadedFiles]);
      }

      // Reset form
      setFormData({ name: '', email: '' });
      setPhotoFile(null);
      setPhotoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('An error occurred during upload');
    } finally {
      setLoading(false);
    }
  };

    if (loading) {
    return (
      <Loader
        isVisible={true}
        message="Submitting your application..."
        fullScreen={true}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>📸 Google Drive Upload</h1>
          <p>Upload your name and photo to Google Drive using OAuth2.0</p>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Name Input */}
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleNameChange}
              disabled={loading}
              required
            />
          </div>

          {/* Email Input */}
          <div className={styles.formGroup}>
            <label htmlFor="email">Email (Optional)</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleEmailChange}
              disabled={loading}
            />
          </div>

          {/* Photo Upload */}
          <div className={styles.formGroup}>
            <label htmlFor="photo">Photo *</label>
            <div className={styles.photoUploadWrapper}>
              <input
                ref={fileInputRef}
                type="file"
                id="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={loading}
                className={styles.fileInput}
              />
              <label htmlFor="photo" className={styles.photoLabel}>
                {photoPreview ? (
                  <div className={styles.previewContainer}>
                    <Image
                      src={photoPreview}
                      alt="Preview"
                      width={150}
                      height={150}
                      className={styles.previewImage}
                      unoptimized
                    />
                    <span className={styles.changeText}>Click to change photo</span>
                  </div>
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <span className={styles.uploadIcon}>📷</span>
                    <span>Click to upload photo</span>
                    <small>Max 10MB • JPG, PNG, GIF, WebP</small>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Uploading...
              </>
            ) : (
              <>
                ⬆️ Upload to Google Drive
              </>
            )}
          </button>
        </form>

        {/* Info Section */}
        <div className={styles.infoSection}>
          <h3>ℹ️ How it works:</h3>
          <ul>
            <li>✅ Fill in your name and select a photo</li>
            <li>✅ Click "Upload to Google Drive"</li>
            <li>✅ Your photo is uploaded securely using OAuth2.0</li>
            <li>✅ Access token automatically refreshes from refresh token</li>
            <li>✅ View uploaded files below</li>
          </ul>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className={styles.card}>
          <div className={styles.listHeader}>
            <h2>📁 Recently Uploaded ({uploadedFiles.length})</h2>
          </div>

          <div className={styles.filesList}>
            {uploadedFiles.map((file, index) => (
              <div key={index} className={styles.fileItem}>
                <div className={styles.fileIcon}>📄</div>
                <div className={styles.fileInfo}>
                  <p className={styles.fileName}>{file?.fileName || 'Unknown'}</p>
                  <p className={styles.fileUser}>User: {file?.userName || 'Unknown'}</p>
                  <p className={styles.fileTime}>
                    {file?.uploadTime ? new Date(file.uploadTime).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <a
                  href={file?.driveLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.driveLink}
                >
                  🔗 View in Drive
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
