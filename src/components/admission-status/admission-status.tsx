"use client";
import { JSX, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaTimes,
  FaSpinner,
  FaArrowRight,
  FaExclamationCircle,
  FaEdit,
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import styles from "./admission-status.module.css";
import HeadingTitle from "@/components/heading/headingtitle";
import PhoneVerificationModal from "@/components/modals/phone-verification-modal/phone-verification-modal";
import CorrectionForm from "@/components/correction-form/correction-form";
import en from "@/translations/en.json";
import hi from "@/translations/hi.json";

interface AdmissionStatus {
  id: string;
  admission_number: string;
  child_first_name?: string;
  childFirstName?: string;
  child_name?: string;
  parent_mobile_number?: string;
  admission_status: "In Review" | "Reviewed" | "Interview Scheduled" | "Confirmed" | "Rejected" | "Under Correction";
  program_name?: string;
  program?: string;
  remark?: string;
  created_at: string;
  updated_at?: string;
  child_dob?: string;
  child_gender?: string;
  child_place_of_birth?: string;
  child_blood_group?: string;
  father_name?: string;
  mother_name?: string;
  parent_email?: string;
  parent_address?: string;
  previous_school?: string;
}

interface StatusConfig {
  icon: JSX.Element;
  color: string;
  bgColor: string;
  description: string;
  step: number;
  message: string;
}

const statusConfig: Record<string, StatusConfig> = {
  "In Review": {
    icon: <FaFileAlt />,
    color: "#3b82f6",
    bgColor: "#eff6ff",
    description: "Your application is under review",
    step: 1,
    message: "Our team is reviewing your admission application. We'll notify you soon.",
  },
  Reviewed: {
    icon: <FaCheckCircle />,
    color: "#f59e0b",
    bgColor: "#fffbf0",
    description: "Application reviewed",
    step: 2,
    message: "Your application has been reviewed. Next step: Interview scheduling.",
  },
  "Interview Scheduled": {
    icon: <FaClock />,
    color: "#8b5cf6",
    bgColor: "#faf5ff",
    description: "Interview is scheduled",
    step: 3,
    message: "Your interview has been scheduled. Please check your email for details.",
  },
  Confirmed: {
    icon: <FaCheckCircle />,
    color: "#10b981",
    bgColor: "#f0fdf4",
    description: "Admission confirmed",
    step: 4,
    message: "Congratulations! Your admission has been confirmed. Welcome aboard!",
  },
  Rejected: {
    icon: <FaTimes />,
    color: "#ef4444",
    bgColor: "#fef2f2",
    description: "Application rejected",
    step: 0,
    message: "Unfortunately, your application has been rejected. Feel free to reapply next year.",
  },
  "Under Correction": {
    icon: <FaEdit />,
    color: "#8b5cf6",
    bgColor: "#faf5ff",
    description: "Application under correction",
    step: 2,
    message: "Please review the remarks and make the necessary corrections to your application.",
  },
};

const getChildName = (admission: AdmissionStatus): string => {
  return (
    admission.child_first_name ||
    admission.childFirstName ||
    admission.child_name ||
    "N/A"
  );
};
const getFatherName = (admission: AdmissionStatus): string => {
  return admission.father_name || "N/A";
}
const getMotherName = (admission: AdmissionStatus): string => {
  return admission.mother_name || "N/A";
}
const getProgram = (admission: AdmissionStatus): string => {
  return admission.program_name || admission.program || "N/A";
};

const getStatusConfig = (status: string): StatusConfig => {
  return statusConfig[status] || statusConfig["In Review"];
};

export default function AdmissionStatus() {
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [admissionData, setAdmissionData] = useState<AdmissionStatus | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
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

  const statusConfigTranslated: Record<string, StatusConfig> = {
    "In Review": {
      icon: <FaFileAlt />,
      color: "#3b82f6",
      bgColor: "#eff6ff",
      description: t('admissionStatus.inReviewDesc'),
      step: 1,
      message: t('admissionStatus.inReviewMsg'),
    },
    Reviewed: {
      icon: <FaCheckCircle />,
      color: "#f59e0b",
      bgColor: "#fffbf0",
      description: t('admissionStatus.reviewedDesc'),
      step: 2,
      message: t('admissionStatus.reviewedMsg'),
    },
    "Interview Scheduled": {
      icon: <FaClock />,
      color: "#8b5cf6",
      bgColor: "#faf5ff",
      description: t('admissionStatus.interviewDesc'),
      step: 3,
      message: t('admissionStatus.interviewMsg'),
    },
    Confirmed: {
      icon: <FaCheckCircle />,
      color: "#10b981",
      bgColor: "#f0fdf4",
      description: t('admissionStatus.confirmedDesc'),
      step: 4,
      message: t('admissionStatus.confirmedMsg'),
    },
    Rejected: {
      icon: <FaTimes />,
      color: "#ef4444",
      bgColor: "#fef2f2",
      description: t('admissionStatus.rejectedDesc'),
      step: 0,
      message: t('admissionStatus.rejectedMsg'),
    },
    "Under Correction": {
      icon: <FaEdit />,
      color: "#8b5cf6",
      bgColor: "#faf5ff",
      description: t('admissionStatus.correctionDesc'),
      step: 2,
      message: t('admissionStatus.correctionMsg'),
    },
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!admissionNumber.trim()) {
      toast.error(t('admissionStatus.enterAdmissionNumber'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setAdmissionData(null);
      setSearched(true);

      const { data, error: supabaseError } = await supabase
        .from("admission")
        .select("*")
        .eq("admission_number", admissionNumber.trim())
        .single();

      if (supabaseError || !data) {
        setError(
          t('admissionStatus.admissionNumberNotFound')
        );
        toast.error(t('admissionStatus.admissionNotFound'));
        return;
      }

      setAdmissionData(data);
      toast.success(t('admissionStatus.admissionFound'));
    } catch (err) {
      console.error("Error:", err);
      setError(t('admissionStatus.errorOccurred'));
      toast.error(t('admissionStatus.errorSearching'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAdmissionNumber("");
    setAdmissionData(null);
    setSearched(false);
    setError(null);
  };

  return (
    <section className={styles.admissionStatusSection}>
      <div className={styles.decorativeElements}>
        <div className={styles.circle}></div>
        <div className={styles.dot}></div>
        <div className={styles.squiggly}></div>
      </div>

      <HeadingTitle text={t('admissionStatus.checkAdmissionStatus')} />

      <div className={styles.container}>
        {/* Search Form */}
        <motion.div
          className={styles.searchContainer}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className={styles.formWrapper}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <FaSearch className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder={t('admissionStatus.enterAdmissionNumber')}
                    value={admissionNumber}
                    onChange={(e) =>
                      setAdmissionNumber(e.target.value.toUpperCase())
                    }
                    className={styles.searchInput}
                    disabled={loading}
                  />
                </div>
                <motion.button
                  type="submit"
                  className={styles.searchBtn}
                  disabled={loading || !admissionNumber.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <FaSpinner className={styles.spinnerIcon} /> {t('admissionStatus.searching')}
                    </>
                  ) : (
                    <>
                      <FaSearch /> {t('admissionStatus.search')}
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            <p className={styles.helpText}>
              {t('admissionStatus.admissionNumberHint')}
            </p>
          </div>
        </motion.div>

        {/* Status Display */}
        <AnimatePresence>
          {searched && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {error ? (
                <motion.div
                  className={styles.errorCard}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.errorIcon}>
                    <FaExclamationCircle />
                  </div>
                  <div className={styles.errorContent}>
                    <h3>{t('admissionStatus.notFound')}</h3>
                    <p>{error}</p>
                  </div>
                  <motion.button
                    onClick={handleReset}
                    className={styles.resetBtn}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t('admissionStatus.tryAgain')}
                  </motion.button>
                </motion.div>
              ) : admissionData ? (
                showCorrectionForm ? (
                  <CorrectionForm
                    admissionId={admissionData.id}
                    admissionNumber={admissionData.admission_number}
                    currentData={admissionData}
                    remark={admissionData.remark}
                    onSuccess={handleReset}
                    onCancel={() => setShowCorrectionForm(false)}
                  />
                ) : (
                  <StatusResultCard
                    admission={admissionData}
                    onReset={handleReset}
                    language={language}
                    t={t}
                    statusConfigTranslated={statusConfigTranslated}
                    onEditClick={() => {
                      if (admissionData.admission_status === "Under Correction") {
                        setShowPhoneVerification(true);
                      }
                    }}
                  />
                )
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phone Verification Modal */}
        <PhoneVerificationModal
          isOpen={showPhoneVerification}
          admissionNumber={admissionNumber}
          lastFourDigits={admissionData?.parent_mobile_number?.slice(-4) || "****"}
          onVerificationSuccess={() => {
            setShowPhoneVerification(false);
            setShowCorrectionForm(true);
          }}
          onClose={() => setShowPhoneVerification(false)}
        />

        {/* Empty State */}

      </div>
    </section>
  );
}

const StatusResultCard = ({
  admission,
  onReset,
  language,
  t,
  onEditClick,
  statusConfigTranslated,
}: {
  admission: AdmissionStatus;
  onReset: () => void;
  language: 'en' | 'hi';
  t: (key: string) => string;
  onEditClick?: () => void;
  statusConfigTranslated: Record<string, StatusConfig>;
}) => {
  const status = admission.admission_status;
  const statusData = statusConfigTranslated[status] || statusConfigTranslated["In Review"];
  const childName = getChildName(admission);
  const fatherName = getFatherName(admission);
  const motherName = getMotherName(admission);
  const program = getProgram(admission);

  const createdDate = new Date(admission.created_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <motion.div
      className={styles.resultCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className={styles.resultHeader}>
        <div className={styles.resultHeaderLeft}>

          <div>
            <h2>{language === 'hi' ? t('admissionStatus.admissionNumber') : 'Admission'} #{admission.admission_number}</h2>
            <p className={styles.applicationDate}>
              {t('admissionStatus.appliedOn')} {createdDate}
            </p>
          </div>
        </div>
        <div className={styles.headerButtons}>
        
          <div className={styles.statusBadge}>
            <div
              className={styles.statusBadgeDot}
              style={{ backgroundColor: statusData.color }}
            ></div>
            <span style={{ color: statusData.color, fontWeight: 700 }}>
              {status}
            </span>
          </div>
          {status === "Under Correction" && onEditClick && (
            <div
              className={styles.editBtn}
              onClick={onEditClick}
            >
              <FaEdit /> {t('admissionStatus.editDetails')}
            </div>
          )}


        </div>
      </div>

      {/* Details Grid */}
      <div className={styles.detailsGrid}>
        <div className={styles.detailCard}>
          <label>{t('admissionStatus.childName')}</label>
          <p>{childName}</p>
        </div>
        <div className={styles.detailCard}>
          <label>{t('admissionStatus.fatherName')}</label>
          <p>{admission.father_name}</p>
        </div>

        <div className={styles.detailCard}>
          <label>{t('admissionStatus.motherName')}</label>
          <p>{admission.mother_name}</p>
        </div>
        <div className={styles.detailCard}>
          <label>{t('admissionStatus.appliedProgram')}</label>
          <p>{program}</p>
        </div>
      </div>

      {/* Status Message */}
      <motion.div
        className={styles.statusMessage}
        style={{
          backgroundColor: statusData.bgColor,
          borderColor: statusData.color,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div style={{ color: statusData.color, fontSize: "1.5rem" }}>
          {statusData.icon}
        </div>
        <div>
          <h4 style={{ color: statusData.color }}>
            {statusData.description}
          </h4>
          <p>{statusData.message}</p>
        </div>
      </motion.div>

      {/* Timeline */}
      <StatusTimeline status={status} language={language} t={t} />

      {/* Next Steps */}
      <NextStepsSection status={status} language={language} t={t} />

      {/* Contact Section */}
      <motion.div
        className={styles.contactSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h4>{t('admissionStatus.needHelp')}</h4>
        <p>
          {t('admissionStatus.helpText')}
        </p>
        <div className={styles.contactLinks}>
          <a href="tel:+919876543210" className={styles.contactLink}>
            {t('admissionStatus.callUs')}
          </a>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contactLink}
          >
            {t('admissionStatus.whatsapp')}
          </a>
          <a href="mailto:admissions@ditvi.com" className={styles.contactLink}>
            {t('admissionStatus.emailUs')}
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

const StatusTimeline = ({ status, language, t }: { status: string; language: 'en' | 'hi'; t: (key: string) => string }) => {
  const steps = [
    { label: t('admissionStatus.inReview'), completed: true },
    {
      label: t('admissionStatus.reviewed'),
      completed: status !== "In Review" && status !== "Rejected",
    },
    {
      label: t('admissionStatus.interview'),
      completed:
        status === "Interview Scheduled" || status === "Confirmed",
    },
    { label: t('admissionStatus.confirmed'), completed: status === "Confirmed" },
  ];

  return (
    <motion.div
      className={styles.timelineSection}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <h4>{language === 'hi' ? t('admissionStatus.applicationTimeline') : 'Application Timeline'}</h4>
      <div className={styles.timeline}>
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className={`${styles.timelineStep} ${step.completed ? styles.completed : ""
              }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={styles.timelineCircle}>
              {step.completed ? <FaCheckCircle /> : <div />}
            </div>
            <p>{step.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const NextStepsSection = ({ status, language, t }: { status: string; language: 'en' | 'hi'; t: (key: string) => string }) => {
  const nextSteps: Record<string, string> = {
    "In Review": t('admissionStatus.inReviewMsg'),
    Reviewed: t('admissionStatus.reviewedMsg'),
    "Interview Scheduled": t('admissionStatus.interviewMsg'),
    Confirmed: t('admissionStatus.confirmedMsg'),
    Rejected: t('admissionStatus.rejectedMsg'),
    "Under Correction": t('admissionStatus.correctionMsg'),
  };

  return (
    <motion.div
      className={styles.nextStepsSection}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.25 }}
    >
      <div className={styles.nextStepsHeader}>
        <FaArrowRight />
        <h4>{t('admissionStatus.nextSteps')}</h4>
      </div>
      <p>
        {nextSteps[status] || "Please contact us for more information."}
      </p>
    </motion.div>
  );
};