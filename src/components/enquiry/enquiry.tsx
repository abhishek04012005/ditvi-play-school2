'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaChild, FaPhone } from 'react-icons/fa';
import { PiGraduationCapBold } from 'react-icons/pi';
import { saveEnquiryToDatabase, generateEnquiryNumber } from '@/lib/enquiry';
import Toast from '../../custom/toast/toast';
import SubmitModal from '../../custom/popup/popup';
import AdmissionInfo from '../../components/admissioninfo/admissioninfo';
import styles from './enquiry.module.css';
import HeadingTitle from '../heading/headingtitle';
import LineArt from '@/custom/lineart/lineart';
import AirplanemodeActiveOutlinedIcon from '@mui/icons-material/AirplanemodeActiveOutlined';
import Loader from '@/custom/loader/loader';
import { schoolDetails } from '@/json/schooldetails';
import schoolDetailsHi from '@/json/schooldetails-hi';
import en from '@/translations/en.json';
import hi from '@/translations/hi.json';



const Enquiry = () => {
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'success' | 'error'>('success');
    const [modalMessage, setModalMessage] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [language, setLanguage] = useState<'en' | 'hi'>('en');

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

    const programs = currentSchoolDetails.programs.map(p => p.name);


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
                    phone: t('enquiry.form.phoneStart')
                }));
            } else if (truncated.length === 10) {
                if (!validatePhone(truncated)) {
                    setErrors(prev => ({
                        ...prev,
                        phone: t('enquiry.form.phoneFormat')
                    }));
                } else {
                    setErrors(prev => ({ ...prev, phone: '' }));
                }
            } else if (truncated.length > 0 && truncated.length < 10) {
                setErrors(prev => ({
                    ...prev,
                    phone: `${t('enquiry.form.enterMoreDigits')} ${10 - truncated.length} ${t('enquiry.form.digits')}`
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
        } else if (name === 'childName') {
            // Only allow alphabets and spaces for child name
            const alphabetsOnly = value.replace(/[^a-zA-Z\s]/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: alphabetsOnly
            }));
            if (alphabetsOnly.trim()) {
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
        const newErrors: typeof errors = { phone: '', parentName: '', childName: '', program: '' };
        let isValid = true;

        if (!formData.parentName.trim()) {
            newErrors.parentName = t('enquiry.form.parentNameRequired');
            isValid = false;
        }

        if (!formData.childName.trim()) {
            newErrors.childName = t('enquiry.form.childNameRequired');
            isValid = false;
        }

        if (!formData.program) {
            newErrors.program = t('enquiry.form.programRequired');
            isValid = false;
        }

        if (!validatePhone(formData.phone)) {
            newErrors.phone = t('enquiry.form.phoneRequired');
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            showErrorModal(
                t('enquiry.form.formValidation.fillAllFields'),
                t('enquiry.form.formValidation.validationError')
            );
            return;
        }

        setLoading(true);

        try {
            const result = await saveEnquiryToDatabase({
                parent_name: formData.parentName,
                child_name: formData.childName,
                phone: formData.phone,
                program: formData.program,
                status: 'new'
            });

            showSuccessModal(
                `${t('enquiry.form.formSuccess.message')}${result.enquiry_number}${t('enquiry.form.formSuccess.messageSuffix')}`,
                t('enquiry.form.formSuccess.title')
            );

            setToastType('success');
            setToastMessage(t('enquiry.form.formSuccess.toastMessage'));
            setShowToast(true);

            setFormData({
                parentName: '',
                childName: '',
                phone: '',
                program: ''
            });
            setErrors({ phone: '', parentName: '', childName: '', program: '' });
        } catch (error) {
            console.error('Error:', error);

            showErrorModal(
                t('enquiry.form.formError.message'),
                t('enquiry.form.formError.title')
            );

            setToastType('error');
            setToastMessage(t('enquiry.form.formError.toastMessage'));
            setShowToast(true);
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
        <section className={styles.enquiry}>
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

            <LineArt
                circle={{
                    size: 200,
                    borderColor: 'var(--primary-yellow)',
                    borderWidth: 3,
                    borderStyle: 'dashed',
                    opacity: 1,
                    animationSpeed: 30,
                    bottom: '70%',
                    left: '0%',
                    icon: <AirplanemodeActiveOutlinedIcon sx={{ fontSize: 40, transform: 'scale(-1, 1)' }} />,
                    iconColor: 'var(--primary-purple)',
                    showIcon: true
                }}
                dot={{
                    size: 150,
                    color: 'var(--primary-yellow)',
                    opacity: 0.3,
                    animationSpeed: 6,
                    top: '10%',
                    right: '5%',
                    blur: 60,
                    show: true
                }}
                squiggly={{
                    size: 100,
                    color: 'var(--primary-purple)',
                    opacity: 0.1,
                    animationSpeed: 8,
                    top: '90%',
                    left: '2%',
                    show: true,
                    reverse: true
                }}
                zIndex={1}
            />

            <div className={styles.container}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className={styles.headerSection}
                >
                    <HeadingTitle text={t('enquiry.form.heading')} />

                </motion.div>

                <motion.div
                    className={styles.contentWrapper}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <motion.div
                        className={styles.formSection}
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        viewport={{ once: true }}
                    >
                        <div className={styles.formHeader}>
                            <h3>{t('enquiry.form.formTitle')}</h3>
                            <p>{t('enquiry.form.formSubtitle')}</p>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <motion.div
                                className={styles.formGroup}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                viewport={{ once: true }}
                            >
                                <label htmlFor="parentName">{t('enquiry.form.parentNameLabel')} *</label>
                                <div className={styles.inputWrapper}>
                                    <FaUser className={styles.icon} />
                                    <input
                                        type="text"
                                        id="parentName"
                                        name="parentName"
                                        placeholder={t('enquiry.form.parentNamePlaceholder')}
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

                            <motion.div
                                className={styles.formGroup}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.15 }}
                                viewport={{ once: true }}
                            >
                                <label htmlFor="childName">{t('enquiry.form.childNameLabel')} *</label>
                                <div className={styles.inputWrapper}>
                                    <FaChild className={styles.icon} />
                                    <input
                                        type="text"
                                        id="childName"
                                        name="childName"
                                        placeholder={t('enquiry.form.childNamePlaceholder')}
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

                            <motion.div
                                className={styles.formGroup}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                viewport={{ once: true }}
                            >
                                <label htmlFor="phone">{t('enquiry.form.phoneLabel')} *</label>
                                <div className={styles.inputWrapper}>
                                    <FaPhone className={styles.icon} />
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        placeholder={t('enquiry.form.phonePlaceholder')}
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

                            <motion.div
                                className={styles.formGroup}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.25 }}
                                viewport={{ once: true }}
                            >
                                <label htmlFor="program">{t('enquiry.form.programLabel')} *</label>
                                <div className={styles.inputWrapper}>
                                    <PiGraduationCapBold className={styles.icon} />
                                    <select
                                        id="program"
                                        name="program"
                                        value={formData.program}
                                        onChange={handleChange}
                                        className={errors.program ? styles.inputError : ''}
                                    >
                                        <option value="">{t('enquiry.form.programPlaceholder')}</option>
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

                            <motion.button
                                type="submit"
                                className={styles.submitButton}
                                disabled={loading}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.3 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className={styles.buttonText}>
                                    {loading ? (
                                        <>
                                            <span className={styles.spinner}></span>
                                            {t('enquiry.form.submitting')}
                                        </>
                                    ) : (
                                        t('enquiry.form.submitButton')
                                    )}
                                </span>
                            </motion.button>

                            <p className={styles.requiredNote}>* {t('enquiry.form.requiredNote')}</p>
                        </form>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        viewport={{ once: true }}
                        className={styles.infoSection}
                    >
                        <AdmissionInfo variant="compact" showDocuments={true} showContact={true} />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Enquiry;