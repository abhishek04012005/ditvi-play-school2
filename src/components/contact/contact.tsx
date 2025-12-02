"use client";
import { useState } from "react";
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
import AirplanemodeActiveOutlinedIcon from "@mui/icons-material/AirplanemodeActiveOutlined";
import Loader from "@/custom/loader/loader";

const Contact = () => {
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

  const contactInfo = [
    {
      icon: <IoLocationOutline size={24} />,
      title: "Address",
      details: `${schoolDetails.address.street}, ${schoolDetails.address.city}, ${schoolDetails.address.state} - ${schoolDetails.address.pincode}`,
      color: "var(--primary-yellow)",
    },
    {
      icon: <IoCallOutline size={24} />,
      title: "Contact No.",
      details: `${schoolDetails.contact.phone}`,
      color: "var(--primary-yellow)",
    },
    {
      icon: <IoMailOutline size={24} />,
      title: "Email Id",
      details: `${schoolDetails.contact.email}`,
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
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
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
          phone: "Phone number must start with 6, 7, 8, or 9",
        }));
      } else if (truncated.length === 10) {
        if (!validatePhone(truncated)) {
          setErrors((prev) => ({
            ...prev,
            phone: "Invalid phone number format",
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
          phone: `Enter ${10 - truncated.length} more digits`,
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
      setFormData((prev) => ({
        ...prev,
        [name]: value,
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
            message: "Message must be at least 10 characters",
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
        "Please fill all fields correctly before submitting.",
        "Validation Error"
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
        "We will get back to you soon.",
        "🎉Thank you!🎉"
      );

      // Show toast notification
      setToastType("success");
      setToastMessage("Your message has been sent successfully!");
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
        "Failed to send your message. Please try again later or contact us directly.",
        "Failed to Send Message"
      );

      // Show error toast
      setToastType("error");
      setToastMessage("Failed to send message. Please try again.");
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

      <HeadingTitle text="Contact Us" />

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
                <label htmlFor="name">Your Name *</label>
                <div className={styles.inputWrapper}>
                  <FaUser className={styles.icon} />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your name"
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
                <label htmlFor="email">Your Email *</label>
                <div className={styles.inputWrapper}>
                  <FaEnvelope className={styles.icon} />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
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
                <label htmlFor="phone">Your Phone *</label>
                <div className={styles.inputWrapper}>
                  <FaPhone className={styles.icon} />
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="10-digit mobile number"
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
                <label htmlFor="message">Your Message *</label>
                <div className={styles.inputWrapper}>
                  <FaPen className={styles.icon} />
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Write your message here..."
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
                  ? "Sending..."
                  : submitStatus === "success"
                    ? "Message Sent!"
                    : submitStatus === "error"
                      ? "Error! Try Again"
                      : "Send Message"}
              </span>
            </motion.button>

            <p className={styles.requiredNote}>* Required fields</p>
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