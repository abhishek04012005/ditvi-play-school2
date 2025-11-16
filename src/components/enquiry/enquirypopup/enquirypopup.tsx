'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaChild, FaPhone, FaTimes } from 'react-icons/fa';
import { PiGraduationCapBold } from 'react-icons/pi';
import { supabase } from '@/lib/supabase';
import Toast from '../../../custom/toast/toast';
import SubmitModal from '../../../custom/popup/popup';
import styles from './enquirypopup.module.css';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';

const programs = [
    "Play Group (1.5 - 2.5 years)",
    "Nursery (2.5 - 3.5 years)",
    "Junior KG (3.5 - 4.5 years)",
    "Senior KG (4.5 - 5.5 years)"
];

interface EnquiryPopupProps {
    delay?: number;
    onClose?: () => void;
}

const EnquiryPopup = ({ delay = 5000, onClose }: EnquiryPopupProps) => {
    const [showPopup, setShowPopup] = useState(false);
    const [popupDismissed, setPopupDismissed] = useState(false);
    const [loading, setLoading] = useState(false);

    // Toast state
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'success' | 'error'>('success');
    const [modalMessage, setModalMessage] = useState('');
    const [modalTitle, setModalTitle] = useState('');

    const [formData, setFormData] = useState({
        parentName: '',
        childName: '',
        phone: '',
        program: ''
    });

    const [errors, setErrors] = useState({
        phone: '',
        parentName: '',
        childName: '',
        program: ''
    });

    // Show popup after delay on page load
    useEffect(() => {
        if (!popupDismissed) {
            const timer = setTimeout(() => {
                setShowPopup(true);
            }, delay);

            return () => clearTimeout(timer);
        }
    }, [delay, popupDismissed]);

    const validatePhone = (phone: string): boolean => {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone);
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
            } else if (truncated.length > 0 && truncated.length < 10) {
                setErrors(prev => ({
                    ...prev,
                    phone: `Enter ${10 - truncated.length} more digits`
                }));
            }
        } else if (name === 'parentName') {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
            if (value.trim()) {
                setErrors(prev => ({ ...prev, parentName: '' }));
            }
        } else if (name === 'childName') {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
            if (value.trim()) {
                setErrors(prev => ({ ...prev, childName: '' }));
            }
        } else if (name === 'program') {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
            if (value) {
                setErrors(prev => ({ ...prev, program: '' }));
            }
        }
    };

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {
            phone: '',
            parentName: '',
            childName: '',
            program: ''
        };
        let isValid = true;

        if (!formData.parentName.trim()) {
            newErrors.parentName = 'Parent name is required';
            isValid = false;
        }

        if (!formData.childName.trim()) {
            newErrors.childName = 'Child name is required';
            isValid = false;
        }

        if (!formData.program) {
            newErrors.program = 'Please select a program';
            isValid = false;
        }

        if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            showErrorModal('Please fill all fields correctly', 'Validation Error');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from('enquiries')
                .insert([
                    {
                        parent_name: formData.parentName,
                        child_name: formData.childName,
                        phone: formData.phone,
                        program: formData.program,
                        status: 'new'
                    }
                ]);

            if (error) throw error;

            showSuccessModal(
                'Thank you for your enquiry! Our admission team will contact you soon to discuss your child\'s admission.',
                'Enquiry Submitted Successfully! 🎉'
            );

            setToastType('success');
            setToastMessage('Your enquiry has been submitted successfully!');
            setShowToast(true);

            setFormData({
                parentName: '',
                childName: '',
                phone: '',
                program: ''
            });
            setErrors({ phone: '', parentName: '', childName: '', program: '' });

            // Close popup after successful submission
            setTimeout(() => {
                handleClosePopup();
            }, 500);
        } catch (error) {
            console.error('Error:', error);

            showErrorModal(
                'Failed to submit your enquiry. Please try again or contact us directly.',
                'Failed to Submit Enquiry'
            );

            setToastType('error');
            setToastMessage('Failed to submit enquiry. Please try again.');
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setPopupDismissed(true);
        if (onClose) onClose();
    };

    return (
        <>
            {/* Toast Notification */}
            <Toast
                message={toastMessage}
                type={toastType}
                isVisible={showToast}
                onClose={() => setShowToast(false)}
                duration={4000}
                showConfetti={false}
            />

            {/* Submit Modal */}
            <SubmitModal
                type={modalType}
                isVisible={showModal}
                onClose={() => setShowModal(false)}
                title={modalTitle}
                message={modalMessage}
                showConfetti={modalType === 'success'}
                autoCloseDuration={4000}
            />

            {/* Popup Modal */}
            <AnimatePresence>
                {showPopup && (
                    <motion.div
                        className={styles.popupOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={handleClosePopup}
                    >
                        <motion.div
                            className={styles.popupContainer}
                            initial={{ scale: 0.8, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.8, y: 50, opacity: 0 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <motion.button
                                type="button"
                                className={styles.popupCloseBtn}
                                onClick={handleClosePopup}
                                whileHover={{ rotate: 90, scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label="Close popup"
                            >
                                <FaTimes />
                            </motion.button>

                            {/* Popup Header */}
                            <motion.div
                                className={styles.popupHeader}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className={styles.popupBadge}>🎓 Limited Seats Only</div>
                                <h2 className={styles.popupTitle}>Start Your Child's Journey Today!</h2>
                                <p className={styles.popupSubtitle}>
                                    Join 500+ happy families.
                                </p >
                                <p className={styles.popupSubtitle}>
                                    <strong>Enquire today, get 10% off your first month admission!</strong>
                                </p>
                            </motion.div>

                            {/* Popup Form */}
                            <motion.div
                                className={styles.popupFormWrapper}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <form onSubmit={handleSubmit} className={styles.popupForm}>
                                    {/* Parent Name */}
                                    <motion.div
                                        className={styles.formGroup}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                    >
                                        <label htmlFor="popupParentName">Parent's Name *</label>
                                        <div className={styles.inputWrapper}>
                                            <FaUser className={styles.icon} />
                                            <input
                                                type="text"
                                                id="popupParentName"
                                                name="parentName"
                                                placeholder="Enter parent's full name"
                                                value={formData.parentName}
                                                onChange={handleChange}
                                                className={errors.parentName ? styles.inputError : ''}
                                            />
                                        </div>
                                        {errors.parentName && (
                                            <motion.span
                                                className={styles.errorMessage}
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                {errors.parentName}
                                            </motion.span>
                                        )}
                                    </motion.div>

                                    {/* Child Name */}
                                    <motion.div
                                        className={styles.formGroup}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <label htmlFor="popupChildName">Child's Name *</label>
                                        <div className={styles.inputWrapper}>
                                            <FaChild className={styles.icon} />
                                            <input
                                                type="text"
                                                id="popupChildName"
                                                name="childName"
                                                placeholder="Enter child's full name"
                                                value={formData.childName}
                                                onChange={handleChange}
                                                className={errors.childName ? styles.inputError : ''}
                                            />
                                        </div>
                                        {errors.childName && (
                                            <motion.span
                                                className={styles.errorMessage}
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                {errors.childName}
                                            </motion.span>
                                        )}
                                    </motion.div>

                                    {/* Phone Number */}
                                    <motion.div
                                        className={styles.formGroup}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.45 }}
                                    >
                                        <label htmlFor="popupPhone">Phone Number *</label>
                                        <div className={styles.inputWrapper}>
                                            <FaPhone className={styles.icon} />
                                            <input
                                                type="tel"
                                                id="popupPhone"
                                                name="phone"
                                                placeholder="10-digit mobile number"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                maxLength={10}
                                                className={errors.phone ? styles.inputError : ''}
                                            />
                                            {formData.phone && (
                                                <span className={styles.phoneCounter}>
                                                    {formData.phone.length}/10
                                                </span>
                                            )}
                                        </div>
                                        {errors.phone && (
                                            <motion.span
                                                className={styles.errorMessage}
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                {errors.phone}
                                            </motion.span>
                                        )}
                                    </motion.div>

                                    {/* Program Selection */}
                                    <motion.div
                                        className={styles.formGroup}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <label htmlFor="popupProgram">Select Program *</label>
                                        <div className={styles.inputWrapper}>
                                            <PiGraduationCapBold className={styles.icon} />
                                            <select
                                                id="popupProgram"
                                                name="program"
                                                value={formData.program}
                                                onChange={handleChange}
                                                className={errors.program ? styles.inputError : ''}
                                            >
                                                <option value="">-- Select Program --</option>
                                                {programs.map((program) => (
                                                    <option key={program} value={program}>
                                                        {program}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.program && (
                                            <motion.span
                                                className={styles.errorMessage}
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                {errors.program}
                                            </motion.span>
                                        )}
                                    </motion.div>

                                    {/* Submit Button */}
                                    <motion.button
                                        type="submit"
                                        className={styles.submitButton}
                                        disabled={loading}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.55 }}
                                        whileHover={{ scale: loading ? 1 : 1.02 }}
                                        whileTap={{ scale: loading ? 1 : 0.98 }}
                                    >
                                        <span className={styles.buttonText}>
                                            {loading ? (
                                                <>
                                                    <span className={styles.spinner}></span>
                                                    Submitting...
                                                </>
                                            ) : (
                                                'Submit Enquiry'
                                            )}
                                        </span>
                                    </motion.button>
                                </form>
                            </motion.div>

                            {/* Popup Footer */}
                            <motion.div
                                className={styles.popupFooter}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <p className={styles.popupSecure}> <DoneOutlinedIcon/> 100% Secure • <DoneOutlinedIcon/> Quick Response • <DoneOutlinedIcon/> No Spam</p>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default EnquiryPopup;