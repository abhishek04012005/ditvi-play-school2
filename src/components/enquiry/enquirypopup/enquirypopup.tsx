'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaChild, FaPhone, FaTimes } from 'react-icons/fa';
import { PiGraduationCapBold } from 'react-icons/pi';
import { saveEnquiryToDatabase, generateEnquiryNumber } from '@/lib/enquiry';
import Toast from '../../../custom/toast/toast';
import SubmitModal from '../../../custom/popup/popup';
import styles from './enquirypopup.module.css';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import Loader from '@/custom/loader/loader';
import { schoolDetails } from '@/json/schooldetails';
import schoolDetailsHi from '@/json/schooldetails-hi';
import en from '@/translations/en.json';
import hi from '@/translations/hi.json';


interface EnquiryPopupProps {
    delay?: number;
    onClose?: () => void;
}

const EnquiryPopup = ({ delay = 5000, onClose }: EnquiryPopupProps) => {
    const [showPopup, setShowPopup] = useState(false);
    const [popupDismissed, setPopupDismissed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState<'en' | 'hi'>('en');

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
        studentName: '',
        phone: '',
        program: ''
    });

    const [errors, setErrors] = useState({
        phone: '',
        parentName: '',
        studentName: '',
        program: ''
    });

    useEffect(() => {
        const saved = localStorage.getItem('language') as 'en' | 'hi' | null;
        if (saved && (saved === 'en' || saved === 'hi')) {
            setLanguage(saved);
        }
    }, []);

    const translations = language === 'hi' ? hi : en;
    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = translations;
        for (const k of keys) {
            value = value?.[k];
        }
        return typeof value === 'string' ? value : key;
    };

    const currentSchoolDetails = language === 'hi' ? schoolDetailsHi : schoolDetails;
    const programs = currentSchoolDetails.programs.map(p => p.name);

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
                    phone: t('enquiry.popup.phoneStart')
                }));
            } else if (truncated.length === 10) {
                if (!validatePhone(truncated)) {
                    setErrors(prev => ({
                        ...prev,
                        phone: t('enquiry.popup.phoneFormat')
                    }));
                } else {
                    setErrors(prev => ({ ...prev, phone: '' }));
                }
            } else if (truncated.length > 0 && truncated.length < 10) {
                setErrors(prev => ({
                    ...prev,
                    phone: `${t('enquiry.popup.enterMoreDigits')} ${10 - truncated.length} ${t('enquiry.popup.digits')}`
                }));
            }
        } else if (name === 'parentName') {
            // Only allow alphabets and spaces for parent name
            const alphabetsOnly = value.replace(/[^a-zA-Z\s]/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: alphabetsOnly
            }));
            if (alphabetsOnly.trim()) {
                setErrors(prev => ({ ...prev, parentName: '' }));
            }
        } else if (name === 'studentName') {
            // Only allow alphabets and spaces for child name
            const alphabetsOnly = value.replace(/[^a-zA-Z\s]/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: alphabetsOnly
            }));
            if (alphabetsOnly.trim()) {
                setErrors(prev => ({ ...prev, studentName: '' }));
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
            studentName: '',
            program: ''
        };
        let isValid = true;

        if (!formData.parentName.trim()) {
            newErrors.parentName = t('enquiry.popup.parentNameRequired');
            isValid = false;
        }

        if (!formData.studentName.trim()) {
            newErrors.studentName = t('enquiry.popup.studentNameRequired');
            isValid = false;
        }

        if (!formData.program) {
            newErrors.program = t('enquiry.popup.programRequired');
            isValid = false;
        }

        if (!validatePhone(formData.phone)) {
            newErrors.phone = t('enquiry.popup.phoneRequired');
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            showErrorModal(
                t('enquiry.validation.fillAllFields'),
                t('enquiry.validation.validationError')
            );
            return;
        }

        setLoading(true);

        try {
            const result = await saveEnquiryToDatabase({
                parent_name: formData.parentName,
                child_name: formData.studentName,
                phone: formData.phone,
                program: formData.program,
                status: 'new'
            });

            showSuccessModal(
                `${t('enquiry.success.message')}${result.enquiry_number}${t('enquiry.success.messageSuffix')}`,
                t('enquiry.success.title')
            );

            setToastType('success');
            setToastMessage(t('enquiry.success.toastMessage'));
            setShowToast(true);

            setFormData({
                parentName: '',
                studentName: '',
                phone: '',
                program: ''
            });
            setErrors({ phone: '', parentName: '', studentName: '', program: '' });

            // Close popup after successful submission
            setTimeout(() => {
                handleClosePopup();
            }, 500);
        } catch (error) {
            console.error('Error:', error);

            showErrorModal(
                t('enquiry.error.message'),
                t('enquiry.error.title')
            );

            setToastType('error');
            setToastMessage(t('enquiry.error.toastMessage'));
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
                                <div className={styles.popupBadge}>{t('enquiry.popup.badge')}</div>
                                <h2 className={styles.popupTitle}>{t('enquiry.popup.title')}</h2>
                                <p className={styles.popupSubtitle}>
                                    {t('enquiry.popup.subtitle1')}
                                </p >
                                <p className={styles.popupSubtitle}>
                                    <strong>{t('enquiry.popup.subtitle2')}</strong>
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
                                    {/* Father Name */}
                                    <motion.div
                                        className={styles.formGroup}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                    >
                                        <label htmlFor="popupParentName">{t('enquiry.popup.parentNameLabel')} *</label>
                                        <div className={styles.inputWrapper}>
                                            <FaUser className={styles.icon} />
                                            <input
                                                type="text"
                                                id="popupParentName"
                                                name="parentName"
                                                placeholder={t('enquiry.popup.parentNamePlaceholder')}
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
                                        <label htmlFor="popupChildName">{t('enquiry.popup.studentNameLabel')} *</label>
                                        <div className={styles.inputWrapper}>
                                            <FaChild className={styles.icon} />
                                            <input
                                                type="text"
                                                id="popupChildName"
                                                name="studentName"
                                                placeholder={t('enquiry.popup.studentNamePlaceholder')}
                                                value={formData.studentName}
                                                onChange={handleChange}
                                                className={errors.studentName ? styles.inputError : ''}
                                            />
                                        </div>
                                        {errors.studentName && (
                                            <motion.span
                                                className={styles.errorMessage}
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                {errors.studentName}
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
                                        <label htmlFor="popupPhone">{t('enquiry.popup.phoneLabel')} *</label>
                                        <div className={styles.inputWrapper}>
                                            <FaPhone className={styles.icon} />
                                            <input
                                                type="tel"
                                                id="popupPhone"
                                                name="phone"
                                                placeholder={t('enquiry.popup.phonePlaceholder')}
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
                                        <label htmlFor="popupProgram">{t('enquiry.popup.programLabel')} *</label>
                                        <div className={styles.inputWrapper}>
                                            <PiGraduationCapBold className={styles.icon} />
                                            <select
                                                id="popupProgram"
                                                name="program"
                                                value={formData.program}
                                                onChange={handleChange}
                                                className={errors.program ? styles.inputError : ''}
                                            >
                                                <option value="">{t('enquiry.popup.programPlaceholder')}</option>
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
                                                    {t('enquiry.popup.submitting')}
                                                </>
                                            ) : (
                                                t('enquiry.popup.submitButton')
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
                                <p className={styles.popupSecure}> <DoneOutlinedIcon /> {t('enquiry.popup.secure')} • <DoneOutlinedIcon /> {t('enquiry.popup.quickResponse')} • <DoneOutlinedIcon /> {t('enquiry.popup.noSpam')}</p>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default EnquiryPopup;