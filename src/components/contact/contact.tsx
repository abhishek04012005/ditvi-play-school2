"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IoLocationOutline,
  IoCallOutline,
  IoMailOutline,
} from "react-icons/io5";
import { FaUser, FaPhone, FaEnvelope, FaPen } from "react-icons/fa";

import { supabase } from "@/lib/supabase";
import styles from "./contact.module.css";
import HeadingTitle from "../heading/headingtitle";
import Toast from "../../custom/toast/toast";
import SubmitModal from "../../custom/popup/popup";
import schoolDetails from "@/json/schooldetails";
import schoolDetailsHi from "@/json/schooldetails-hi";
import AirplanemodeActiveOutlinedIcon from "@mui/icons-material/AirplanemodeActiveOutlined";
import Loader from "@/custom/loader/loader";
import en from "@/translations/en.json";
import hi from "@/translations/hi.json";
import { headingTitlesEng } from "@/data/headingtitles-eng";
import { headingTitlesHi } from "@/data/headingtitles-hi";

const Contact = () => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('language') as 'en' | 'hi' | null;
      if (saved && (saved === 'en' || saved === 'hi')) {
        setLanguage(saved);
      }
    } catch (e) {
      // localStorage not available
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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  // Toast state
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const currentSchoolDetails = language === 'hi' ? schoolDetailsHi : schoolDetails;

  const headingTitles = language === 'hi' ? headingTitlesHi : headingTitlesEng;

  const contactInfo = [
    {
      icon: <IoLocationOutline size={24} />,
      title: t('contact.address'),
      details: `${currentSchoolDetails.address.street}, ${currentSchoolDetails.address.city}, ${currentSchoolDetails.address.state} - ${currentSchoolDetails.address.pincode}`,
      color: "var(--primary-yellow)",
    },
    {
      icon: <IoCallOutline size={24} />,
      title: t('contact.phone'),
      details: `${currentSchoolDetails.contact.phone}`,
      color: "var(--primary-yellow)",
    },
    {
      icon: <IoMailOutline size={24} />,
      title: t('contact.email'),
      details: `${currentSchoolDetails.contact.email}`,
      color: "var(--primary-yellow)",
    },
  ];

  const showSuccessModal = (message: string, title: string = "Success!") => {
    setModalType("success");
    setModalMessage(message);
    setModalTitle(title);
    setShowModal(true);
  };

  const showErrorModal = (message: string, title: string = "Oops! Error") => {
    setModalType("error");
    setModalMessage(message);
    setModalTitle(title);
    setShowModal(true);
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {
      name: "",
      email: "",
      phone: "",
      message: "",
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = t('contact.validation.nameRequired');
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact.validation.emailRequired');
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('contact.validation.invalidEmail');
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('contact.validation.phoneRequired');
      isValid = false;
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = t('contact.validation.invalidPhone');
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact.validation.messageRequired');
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t('contact.validation.messageMinLength');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digits = value.replace(/\D/g, "");
      const truncated = digits.slice(0, 10);

      setFormData((prev) => ({
        ...prev,
        [name]: truncated,
      }));

      if (truncated.length === 0) {
        setErrors((prev) => ({
          ...prev,
          phone: "",
        }));
      } else if (
        truncated.length === 1 &&
        !["6", "7", "8", "9"].includes(truncated)
      ) {
        setErrors((prev) => ({
          ...prev,
          phone: t('contact.validation.phoneStart'),
        }));
      } else if (truncated.length === 10) {
        if (!validatePhone(truncated)) {
          setErrors((prev) => ({
            ...prev,
            phone: t('contact.validation.invalidPhoneFormat'),
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            phone: "",
          }));
        }
      } else if (truncated.length > 0 && truncated.length < 10) {
        setErrors((prev) => ({
          ...prev,
          phone: `${t('contact.validation.enterMoreDigits')} ${10 - truncated.length} ${t('contact.validation.digits')}`,
        }));
      }
    } else if (name === "email") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (value.trim()) {
        if (!validateEmail(value)) {
          setErrors((prev) => ({
            ...prev,
            email: "Please enter a valid email address",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            email: "",
          }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          email: "",
        }));
      }
    } else if (name === "name") {
      // Only allow alphabets and spaces for name
      const alphabetsOnly = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData((prev) => ({
        ...prev,
        [name]: alphabetsOnly,
      }));

      if (value.trim()) {
        setErrors((prev) => ({
          ...prev,
          name: "",
        }));
      }
    } else if (name === "message") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (value.trim()) {
        if (value.trim().length < 10) {
          setErrors((prev) => ({
            ...prev,
            message: t('contact.validation.messageMinLength'),
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            message: "",
          }));
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showErrorModal(
        t('contact.validation.fillAllFields'),
        t('contact.validation.validationError')
      );
      return;
    }

    setLoading(true);
    setSubmitStatus("submitting");

    try {
      const { data, error } = await supabase.from("contacts").insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          status: "new",
        },
      ]);

      if (error) {
        throw error;
      }

      setSubmitStatus("success");

      // Show success modal with confetti
      showSuccessModal(
        t('contact.success.message'),
        t('contact.success.title')
      );

      // Show toast notification
      setToastType("success");
      setToastMessage(t('contact.success.toastMessage'));
      setShowToast(true);

      // Reset form
      setFormData({ name: "", email: "", phone: "", message: "" });
      setErrors({ name: "", email: "", phone: "", message: "" });

      setTimeout(() => setSubmitStatus("idle"), 3000);
    } catch (error) {
      console.error("Error:", error);
      setSubmitStatus("error");

      // Show error modal
      showErrorModal(
        t('contact.error.message'),
        t('contact.error.title')
      );

      // Show error toast
      setToastType("error");
      setToastMessage(t('contact.error.toastMessage'));
      setShowToast(true);

      setTimeout(() => setSubmitStatus("idle"), 3000);
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
    <section className={styles.contact}>
      <div className={styles.lineArt}>
        <div className={styles.circle}>
          <div className={styles.circleInner}>
            <AirplanemodeActiveOutlinedIcon
              sx={{
                fontSize: 100,
                transform: "scale(-1, 1)",
              }}
            />
          </div>
        </div>
        <div className={styles.dot}></div>
        <div className={styles.squiggly}></div>
      </div>

      <HeadingTitle text={headingTitles.contact} />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={4000}
        showConfetti={false}
      />

      {/* Submit Modal with Confetti */}
      <SubmitModal
        type={modalType}
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        title={modalTitle}
        message={modalMessage}
        showConfetti={modalType === "success"}
        autoCloseDuration={4000}
      />

      <div className={styles.container}>
        <motion.div
          className={styles.infoSection}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className={styles.infoCards}>
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                className={styles.infoCard}
                style={{ "--card-color": info.color } as any}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>{info.icon}</div>
                  <div className={styles.titleWrapper}>
                    <h4>{info.title}</h4>
                  </div>
                </div>
                <p>{info.details}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className={styles.formSection}
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              {/* Name Field */}
              <motion.div
                className={`${styles.formGroup} ${styles.fullWidth}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                <label htmlFor="name">{t('contact.form.name')} *</label>
                <div className={styles.inputWrapper}>
                  <FaUser className={styles.icon} />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder={t('contact.form.namePlaceholder')}
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? styles.inputError : ""}
                  />
                </div>
                {errors.name && (
                  <motion.span
                    className={styles.errorMessage}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.name}
                  </motion.span>
                )}
              </motion.div>

              {/* Email Field */}
              <motion.div
                className={`${styles.formGroup} ${styles.fullWidth}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                viewport={{ once: true }}
              >
                <label htmlFor="email">{t('contact.form.email')} *</label>
                <div className={styles.inputWrapper}>
                  <FaEnvelope className={styles.icon} />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder={t('contact.form.emailPlaceholder')}
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? styles.inputError : ""}
                  />
                </div>
                {errors.email && (
                  <motion.span
                    className={styles.errorMessage}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.email}
                  </motion.span>
                )}
              </motion.div>

              {/* Phone Field */}
              <motion.div
                className={`${styles.formGroup} ${styles.fullWidth}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
              >
                <label htmlFor="phone">{t('contact.form.phone')} *</label>
                <div className={styles.inputWrapper}>
                  <FaPhone className={styles.icon} />
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder={t('contact.form.phonePlaceholder')}
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={10}
                    className={errors.phone ? styles.inputError : ""}
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

              {/* Message Field */}
              <motion.div
                className={`${styles.formGroup} ${styles.fullWidth}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                viewport={{ once: true }}
              >
                <label htmlFor="message">{t('contact.form.message')} *</label>
                <div className={styles.inputWrapper}>
                  <FaPen className={styles.icon} />
                  <textarea
                    id="message"
                    name="message"
                    placeholder={t('contact.form.messagePlaceholder')}
                    value={formData.message}
                    onChange={handleChange}
                    className={errors.message ? styles.inputError : ""}
                  ></textarea>
                </div>
                {errors.message && (
                  <motion.span
                    className={styles.errorMessage}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.message}
                  </motion.span>
                )}
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className={`${styles.submitBtn} ${submitStatus !== "idle" ? styles.loading : ""
                }`}
              disabled={submitStatus !== "idle"}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: submitStatus === "idle" ? 1.02 : 1 }}
              whileTap={{ scale: submitStatus === "idle" ? 0.98 : 1 }}
            >
              <span className={styles.buttonText}>
                {submitStatus === "submitting"
                  ? t('contact.form.sending')
                  : submitStatus === "success"
                    ? t('contact.form.messageSent')
                    : submitStatus === "error"
                      ? t('contact.form.error')
                      : t('contact.form.sendMessage')}
              </span>
            </motion.button>

            <p className={styles.requiredNote}>* {t('contact.form.requiredFields')}</p>
          </form>
        </motion.div>
      </div>

      <div className={styles.mapSection}>
        <iframe
          src={schoolDetails.mapUrl}
          width="100%"
          height="400"
          style={{ border: 0, borderRadius: "20px" }}
          allowFullScreen
          loading="lazy"
        ></iframe>
      </div>
    </section>
  );
};

export default Contact;