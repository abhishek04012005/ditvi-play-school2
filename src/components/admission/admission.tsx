'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import Toast from '../../custom/toast/toast';
import SubmitModal from '../../custom/popup/popup';
import AdmissionInfo from '../../components/admissioninfo/admissioninfo';
import styles from './admission.module.css';

const Admission = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const [formData, setFormData] = useState({
    childName: '',
    dob: '',
    gender: '',
    parentName: '',
    email: '',
    phone: '',
    address: '',
    program: '',
    previousSchool: '',
    message: ''
  });

  const [errors, setErrors] = useState({
    phone: ''
  });

  const admissionSteps = [
    { number: 1, title: 'Submit Form' },
    { number: 2, title: 'Document Review' },
    { number: 3, title: 'Interview' },
    { number: 4, title: 'Confirmation' }
  ];

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      const truncated = digits.slice(0, 10);

      setFormData(prev => ({
        ...prev,
        [name]: truncated
      }));

      if (truncated.length === 0) {
        setErrors(prev => ({ ...prev, phone: '' }));
      } else if (truncated.length === 1 && !['6', '7', '8', '9'].includes(truncated)) {
        setErrors(prev => ({
          ...prev,
          phone: 'Phone number must start with 6, 7, 8, or 9'
        }));
      } else if (truncated.length === 10) {
        if (!validatePhone(truncated)) {
          setErrors(prev => ({
            ...prev,
            phone: 'Invalid phone number format'
          }));
        } else {
          setErrors(prev => ({ ...prev, phone: '' }));
        }
      } else {
        setErrors(prev => ({
          ...prev,
          phone: 'Phone number must be 10 digits'
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const showSuccessModal = (message: string, title: string = 'Success!') => {
    setModalType('success');
    setModalMessage(message);
    setModalTitle(title);
    setShowModal(true);
  };

  const showErrorModal = (message: string, title: string = 'Oops! Error') => {
    setModalType('error');
    setModalMessage(message);
    setModalTitle(title);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone(formData.phone)) {
      setErrors(prev => ({
        ...prev,
        phone: 'Please enter a valid phone number'
      }));
      showErrorModal('Please enter a valid 10-digit phone number starting with 6-9.', 'Invalid Phone Number');
      return;
    }

    setSubmitStatus('submitting');

    try {
      const { error } = await supabase
        .from('admissions')
        .insert([
          {
            child_name: formData.childName,
            date_of_birth: formData.dob,
            gender: formData.gender,
            parent_name: formData.parentName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            program: formData.program,
            previous_school: formData.previousSchool,
            message: formData.message,
            status: 'new'
          }
        ]);

      if (error) throw error;

      setSubmitStatus('success');

      showSuccessModal(
        'Your admission application has been submitted successfully! Our team will review your application and get back to you soon.',
        'Application Submitted! 🎉'
      );

      setToastType('success');
      setToastMessage('Your admission application has been submitted successfully!');
      setShowToast(true);

      setFormData({
        childName: '',
        dob: '',
        gender: '',
        parentName: '',
        email: '',
        phone: '',
        address: '',
        program: '',
        previousSchool: '',
        message: ''
      });
      setErrors({ phone: '' });
      setActiveStep(1);

      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');

      showErrorModal(
        'Failed to submit your application. Please try again or contact our admission team directly.',
        'Failed to Submit Application'
      );

      setToastType('error');
      setToastMessage('Failed to submit application. Please try again.');
      setShowToast(true);

      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  return (
    <section className={styles.admission}>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={4000}
        showConfetti={false}
      />

      <SubmitModal
        type={modalType}
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        title={modalTitle}
        message={modalMessage}
        showConfetti={modalType === 'success'}
        autoCloseDuration={4000}
      />

      <div className={styles.decorativeCircle}></div>
      <div className={styles.decorativeDots}></div>

      <motion.h2
        className={styles.title}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        Admission Process
      </motion.h2>

      <div className={styles.stepsContainer}>
        {admissionSteps.map((step, index) => (
          <motion.div
            key={step.number}
            className={`${styles.step} ${activeStep >= step.number ? styles.active : ''}`}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div className={styles.stepNumber}>{step.number}</div>
            <div className={styles.stepTitle}>{step.title}</div>
            {index < admissionSteps.length - 1 && <div className={styles.connector} />}
          </motion.div>
        ))}
      </div>

      <div className={styles.contentWrapper}>
        <motion.div
          className={styles.formSection}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3>Application Form</h3>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="childName">Child's Full Name</label>
                <input
                  type="text"
                  id="childName"
                  name="childName"
                  value={formData.childName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="dob">Date of Birth</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="program">Desired Program</label>
                <select
                  id="program"
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Program</option>
                  <option value="toddler">Toddler Program</option>
                  <option value="nursery">Nursery Program</option>
                  <option value="prek">Pre-K Program</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="parentName">Parent's Name</label>
                <input
                  type="text"
                  id="parentName"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10 digit mobile number"
                  required
                />
                {errors.phone && (
                  <span className={styles.errorMessage}>{errors.phone}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="previousSchool">Previous School (if any)</label>
                <input
                  type="text"
                  id="previousSchool"
                  name="previousSchool"
                  value={formData.previousSchool}
                  onChange={handleChange}
                />
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label htmlFor="message">Additional Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`${styles.submitBtn} ${submitStatus !== 'idle' ? styles.loading : ''}`}
              disabled={submitStatus !== 'idle'}
            >
              {submitStatus === 'submitting' ? 'Submitting...' :
                submitStatus === 'success' ? 'Application Sent!' :
                  submitStatus === 'error' ? 'Error! Try Again' :
                    'Submit Application'}
            </button>
          </form>
        </motion.div>

        {/* Using the AdmissionInfo component */}
        <AdmissionInfo variant="default" showDocuments={true} showContact={true} />
      </div>
    </section>
  );
};

export default Admission;