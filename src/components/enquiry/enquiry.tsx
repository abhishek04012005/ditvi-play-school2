'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaChild, FaPhone } from 'react-icons/fa';
import { PiGraduationCapBold } from 'react-icons/pi';
import { supabase } from '@/lib/supabase';
import Toast from '../../custom/toast/toast';
import SubmitModal from '../../custom/popup/popup';
import AdmissionInfo from '../../components/admissioninfo/admissioninfo';
import styles from './enquiry.module.css';
import HeadingTitle from '../heading/headingtitle';
import LineArt from '@/custom/lineart/lineart';
import AirplanemodeActiveOutlinedIcon from '@mui/icons-material/AirplanemodeActiveOutlined';

const programs = [
    "Play Group (1.5 - 2.5 years)",
    "Nursery (2.5 - 3.5 years)",
    "Junior KG (3.5 - 4.5 years)",
    "Senior KG (4.5 - 5.5 years)"
];

const Enquiry = () => {
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
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
        const newErrors: typeof errors = { phone: '', parentName: '', childName: '', program: '' };
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
                    <HeadingTitle text="Admission Enquiry" />
                    <motion.p
                        className={styles.subtitle}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        Take the first step towards your child's bright future. Fill out the form below and we'll get back to you shortly.
                    </motion.p>
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
                            <h3>Quick Enquiry Form</h3>
                            <p>Fill in your details and we'll contact you</p>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <motion.div
                                className={styles.formGroup}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                viewport={{ once: true }}
                            >
                                <label htmlFor="parentName">Parent's Name *</label>
                                <div className={styles.inputWrapper}>
                                    <FaUser className={styles.icon} />
                                    <input
                                        type="text"
                                        id="parentName"
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

                            <motion.div
                                className={styles.formGroup}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.15 }}
                                viewport={{ once: true }}
                            >
                                <label htmlFor="childName">Child's Name *</label>
                                <div className={styles.inputWrapper}>
                                    <FaChild className={styles.icon} />
                                    <input
                                        type="text"
                                        id="childName"
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

                            <motion.div
                                className={styles.formGroup}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                viewport={{ once: true }}
                            >
                                <label htmlFor="phone">Phone Number *</label>
                                <div className={styles.inputWrapper}>
                                    <FaPhone className={styles.icon} />
                                    <input
                                        type="tel"
                                        id="phone"
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

                            <motion.div
                                className={styles.formGroup}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.25 }}
                                viewport={{ once: true }}
                            >
                                <label htmlFor="program">Select Program *</label>
                                <div className={styles.inputWrapper}>
                                    <PiGraduationCapBold className={styles.icon} />
                                    <select
                                        id="program"
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
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Enquiry'
                                    )}
                                </span>
                            </motion.button>

                            <p className={styles.requiredNote}>* Required fields</p>
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