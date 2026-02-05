"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { MdDateRange } from "react-icons/md";
import {
  FaSpinner,
  FaCheckCircle,
  FaDownload,
  FaEnvelope,
  FaChild,
  FaBirthdayCake,
  FaUser,
  FaPhone,
  FaSchool,
  FaFile,
  FaMapMarkerAlt
} from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import styles from "./admissionform.module.css";
import HeadingTitle from "@/components/heading/headingtitle";
import {
  EmojiPeople,
  FamilyRestroom,
  SchoolOutlined,
  DescriptionOutlined,
} from "@mui/icons-material";
import LineArt from "@/custom/lineart/lineart";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { schoolDetails } from "@/json/schooldetails";
import schoolDetailsHi from "@/json/schooldetails-hi";
import Loader from "@/custom/loader/loader";
import { MdBloodtype } from "react-icons/md";
import AdmissionSlip from "./AdmissionSlip";
import en from "@/translations/en.json";
import hi from "@/translations/hi.json";


interface FormData {
  child_name: string;
  child_dob: string;
  child_gender: string;
  child_place_of_birth: string;
  child_blood_group: string;
  father_name: string;
  mother_name: string;
  parent_address: string;
  parent_mobile_number: string;
  parent_email: string;
  program_name: string;
  previous_school: string;
}

interface FormFiles {
  photo: File | null;
  birth_certificate: File | null;
  aadhar_card: File | null;
  parent_id_proof: File | null;
}

interface SubmissionResult {
  admission_number: string;
  child_name: string;
  parent_mobile_number: string;
  program_name: string;
}



export default function AdmissionForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploadDocsNow, setUploadDocsNow] = useState(true);
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

  const [formData, setFormData] = useState<FormData>({
    child_name: "",
    child_dob: "",
    child_gender: "",
    child_place_of_birth: "",
    child_blood_group: "",
    father_name: "",
    mother_name: "",
    parent_address: "",
    parent_mobile_number: "",
    parent_email: "",
    program_name: "",
    previous_school: "",
  });

  const [files, setFiles] = useState<FormFiles>({
    photo: null,
    birth_certificate: null,
    aadhar_card: null,
    parent_id_proof: null,
  });

  const [filePreviews, setFilePreviews] = useState<{
    [key: string]: string | null;
  }>({
    photo: null,
    birth_certificate: null,
    aadhar_card: null,
    parent_id_proof: null,
  });

  // store metadata for uploaded files (uploaded-on-select)
  const [fileMeta, setFileMeta] = useState<{
    [key: string]: { fileId?: string; downloadUrl?: string; webViewLink?: string; fileName?: string } | null;
  }>(
    {
      photo: null,
      birth_certificate: null,
      aadhar_card: null,
      parent_id_proof: null,
    }
  );

  const [fileUploadStatus, setFileUploadStatus] = useState<{ [key: string]: 'idle' | 'uploading' | 'done' | 'error' }>({
    photo: 'idle',
    birth_certificate: 'idle',
    aadhar_card: 'idle',
    parent_id_proof: 'idle',
  });

  const pdfRef = useRef<HTMLDivElement>(null);

  const currentSchoolDetails = language === 'hi' ? schoolDetailsHi : schoolDetails;
  const programs = currentSchoolDetails.programs.map(p => p.name);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    let processedValue = value;

    // Fields that should only contain alphabets and spaces
    const nameFields = ['child_name', 'father_name', 'mother_name', 'child_place_of_birth'];
    if (nameFields.includes(name)) {
      processedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }

    // Fields that should only contain numbers
    const numberFields = ['parent_mobile_number'];
    if (numberFields.includes(name)) {
      processedValue = value.replace(/[^0-9]/g, '');
    }

    setFormData({ ...formData, [name]: processedValue });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof FormFiles
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and PDF files are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setFiles({ ...files, [fieldName]: file });

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews({
          ...filePreviews,
          [fieldName]: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreviews({ ...filePreviews, [fieldName]: "📄 " + file.name });
    }

    // Immediately upload selected file to Google Drive and store returned link
    // Only attempt upload if uploadDocsNow flag is true
    if (uploadDocsNow) {
      uploadFileToDrive(file, fieldName as string);
    }
  };

  const uploadFileToDrive = async (file: File, fieldName: string) => {
    try {
      setFileUploadStatus((s) => ({ ...s, [fieldName]: 'uploading' }));

      const fd = new FormData();
      fd.append('file', file);
      fd.append('field', fieldName);

      const toastId = toast.loading(`Uploading ${fieldName}...`);

      const res = await fetch(`/api/admission/upload-file`, {
        method: 'POST',
        body: fd,
      });

      const json = await res.json();

      if (!res.ok) {
        console.error('Upload error:', json);
        setFileUploadStatus((s) => ({ ...s, [fieldName]: 'error' }));
        toast.dismiss(toastId);
        toast.error(json.error || 'Failed to upload file');
        return;
      }

      const downloadUrl = json?.data?.downloadUrl || json?.data?.driveLink || json?.data?.webViewLink;
      const fileId = json?.data?.fileId;
      const fileName = json?.data?.fileName || file.name;

      if (downloadUrl) {
        setFileMeta((m) => ({ ...m, [fieldName]: { fileId, downloadUrl, webViewLink: json?.data?.webViewLink, fileName } }));
        setFileUploadStatus((s) => ({ ...s, [fieldName]: 'done' }));
        toast.dismiss(toastId);
        toast.success(`${fieldName} uploaded`);
      } else {
        setFileUploadStatus((s) => ({ ...s, [fieldName]: 'error' }));
        toast.dismiss(toastId);
        toast.error('Upload finished but no link returned');
      }
    } catch (error) {
      console.error('UploadToDrive error:', error);
      setFileUploadStatus((s) => ({ ...s, [fieldName]: 'error' }));
      toast.error('An error occurred while uploading file');
    }
  };

  const validateStep = (stepNum: number): boolean => {
    const errors: string[] = [];
    const fieldErrors: { [key: string]: string } = {};

    if (stepNum === 1) {
      if (!formData.child_name.trim()) {
        errors.push("Student name is required");
        fieldErrors.child_name = "Student name is required";
      }
      if (!formData.child_dob) {
        errors.push("Date of birth is required");
        fieldErrors.child_dob = "Date of birth is required";
      }
      if (!formData.child_gender) {
        errors.push("Gender is required");
        fieldErrors.child_gender = "Gender is required";
      }
      if (!formData.child_place_of_birth.trim()) {
        errors.push("Place of birth is required");
        fieldErrors.child_place_of_birth = "Place of birth is required";
      }
    } else if (stepNum === 2) {
      if (!formData.father_name.trim()) {
        errors.push("Father name is required");
        fieldErrors.father_name = "Father name is required";
      }
      if (!formData.mother_name.trim()) {
        errors.push("Mother name is required");
        fieldErrors.mother_name = "Mother name is required";
      }
      if (!formData.parent_address.trim()) {
        errors.push("Address is required");
        fieldErrors.parent_address = "Address is required";
      }
      if (!formData.parent_mobile_number.trim()) {
        errors.push("Mobile number is required");
        fieldErrors.parent_mobile_number = "Mobile number is required";
      }
      if (!/^[0-9]{10}$/.test(formData.parent_mobile_number)) {
        errors.push("Mobile number must be 10 digits");
        fieldErrors.parent_mobile_number = "Mobile number must be 10 digits";
      }
    } else if (stepNum === 3) {
      if (!formData.program_name) {
        errors.push("Program is required");
        fieldErrors.program_name = "Program is required";
      }
    }

    if (errors.length > 0) {
      setErrors(fieldErrors);
      toast.error(errors[0]);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    if (!validateStep(4)) return;

    try {
      setLoading(true);

      const formDataToSend = new FormData();

      formDataToSend.append("child_name", formData.child_name);
      formDataToSend.append("child_dob", formData.child_dob);
      formDataToSend.append("child_gender", formData.child_gender);
      formDataToSend.append(
        "child_place_of_birth",
        formData.child_place_of_birth
      );
      if (formData.child_blood_group) {
        formDataToSend.append("child_blood_group", formData.child_blood_group);
      }
      formDataToSend.append("father_name", formData.father_name);
      formDataToSend.append("mother_name", formData.mother_name);
      formDataToSend.append("parent_address", formData.parent_address);
      formDataToSend.append(
        "parent_mobile_number",
        formData.parent_mobile_number
      );
      if (formData.parent_email) {
        formDataToSend.append("parent_email", formData.parent_email);
      }
      formDataToSend.append("program_name", formData.program_name);
      if (formData.previous_school) {
        formDataToSend.append("previous_school", formData.previous_school);
      }

      if (uploadDocsNow) {
        // Prefer client-uploaded download URLs (fileMeta[].downloadUrl). Also include
        // file IDs so server can move files into admission folder and rename them.
        if (fileMeta.photo?.downloadUrl) {
          formDataToSend.append('photo_url', fileMeta.photo.downloadUrl);
        } else if (files.photo) {
          formDataToSend.append('photo', files.photo);
        }
        if (fileMeta.photo?.fileId) {
          formDataToSend.append('photo_file_id', fileMeta.photo.fileId);
        }

        if (fileMeta.birth_certificate?.downloadUrl) {
          formDataToSend.append('birth_certificate_url', fileMeta.birth_certificate.downloadUrl);
        } else if (files.birth_certificate) {
          formDataToSend.append('birth_certificate', files.birth_certificate);
        }
        if (fileMeta.birth_certificate?.fileId) {
          formDataToSend.append('birth_certificate_file_id', fileMeta.birth_certificate.fileId);
        }

        if (fileMeta.aadhar_card?.downloadUrl) {
          formDataToSend.append('aadhar_card_url', fileMeta.aadhar_card.downloadUrl);
        } else if (files.aadhar_card) {
          formDataToSend.append('aadhar_card', files.aadhar_card);
        }
        if (fileMeta.aadhar_card?.fileId) {
          formDataToSend.append('aadhar_card_file_id', fileMeta.aadhar_card.fileId);
        }

        if (fileMeta.parent_id_proof?.downloadUrl) {
          formDataToSend.append('parent_id_proof_url', fileMeta.parent_id_proof.downloadUrl);
        } else if (files.parent_id_proof) {
          formDataToSend.append('parent_id_proof', files.parent_id_proof);
        }
        if (fileMeta.parent_id_proof?.fileId) {
          formDataToSend.append('parent_id_proof_file_id', fileMeta.parent_id_proof.fileId);
        }
      }

      const response = await fetch("/api/admission", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Submission failed");
        return;
      }

      setSubmissionResult(result.data);
      setSubmitted(true);
      toast.success("Admission submitted successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred during submission");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!pdfRef.current) return;

    try {
      toast.loading("Generating PDF...");

      // Add PDF export class to force A4 size on all devices
      pdfRef.current.classList.add('pdfExport');

      // Wait for class to be applied
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: 794, // A4 width at 96 DPI: 210mm = 794px
        height: 1123, // A4 height at 96 DPI: 297mm = 1123px
        windowHeight: 1123,
        windowWidth: 794,
        allowTaint: true,
        onclone: (clonedDocument) => {
          // Force A4 dimensions on cloned element
          const clonedElement = clonedDocument.querySelector('[class*="slipContainer"]');
          if (clonedElement) {
            (clonedElement as HTMLElement).style.width = '794px';
            (clonedElement as HTMLElement).style.height = '1123px';
            (clonedElement as HTMLElement).style.maxWidth = '794px';
            (clonedElement as HTMLElement).style.maxHeight = '1123px';
            (clonedElement as HTMLElement).style.margin = '0';
            (clonedElement as HTMLElement).style.padding = '19px'; // 0.5cm in px
          }
        },
      });

      // Remove PDF export class
      pdfRef.current.classList.remove('pdfExport');

      // Create PDF with exact A4 dimensions (210mm x 297mm)
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");

      // Add image to fill entire A4 page (0,0 to 210mm,297mm)
      pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
      pdf.save(`Admission_${submissionResult?.admission_number}.pdf`);

      toast.dismiss();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      pdfRef.current?.classList.remove('pdfExport');
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  const handlePrint = () => {
    if (!pdfRef.current) return;
    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Admission Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
          </style>
        </head>
        <body>
          ${pdfRef.current.innerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  const handleShare = async () => {
    const text = `I have successfully submitted my admission application to ${currentSchoolDetails.name}! Admission Number: ${submissionResult?.admission_number}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Admission Confirmation",
          text: text,
          url: window.location.href,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Admission details copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy to clipboard");
      }
    }
  };

  const isAnyUploading = Object.values(fileUploadStatus).some(
    (s) => s === 'uploading'
  );

  if (isAnyUploading) {
    return (
      <Loader
        isVisible={true}
        message="Uploading documents..."
        fullScreen={true}
      />
    );
  }

  if (loading) {
    return (
      <Loader
        isVisible={true}
        message="Submitting your application..."
        fullScreen={true}
      />
    );
  }

  // Success Screen
  if (submitted && submissionResult) {
    return (
      <section className={styles.successBox}>
        <LineArt
          circle={{
            size: 200,
            borderColor: "var(--primary-yellow)",
            borderWidth: 3,
            borderStyle: "dashed",
            opacity: 1,
            animationSpeed: 30,
            bottom: "7%",
            left: "7%",
            icon: (
              <SchoolOutlinedIcon
                sx={{ fontSize: 40, transform: "scale(-1, 1)" }}
              />
            ),
            iconColor: "var(--primary-purple)",
            showIcon: true,
          }}
          dot={{
            size: 150,
            color: "var(--primary-yellow)",
            opacity: 0.3,
            animationSpeed: 6,
            top: "10%",
            right: "5%",
            blur: 60,
            show: true,
          }}
          zIndex={1}
        />

        <div className={styles.container}>
          <motion.div
            className={styles.successCard}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={{ scale: [0.8, 1.1, 1] }}
              transition={{ duration: 0.6 }}
              className={styles.checkmarkContainer}
            >
              <FaCheckCircle className={styles.successIcon} />
            </motion.div>

            <h1 className={styles.successTitle}>
              {t('admission.success.title')}
            </h1>
            <p className={styles.successSubtitle}>
              {t('admission.success.subtitle')}
            </p>

            <motion.div
              className={styles.successButtonGroup}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <button className={styles.btnPrimary} onClick={downloadPDF}>
                <FaDownload className={styles.btnIcon} />
                <span>{t('admission.success.downloadPdf')}</span>
              </button>
            </motion.div>
            {/* Confirmation Slip */}
            <motion.div
              ref={pdfRef}
              className={styles.confirmationSlipContainer}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <AdmissionSlip
                data={submissionResult}
                formData={formData}
                documentStatus={{
                  photo: fileMeta.photo?.downloadUrl ? 'uploaded' : fileUploadStatus.photo === 'uploading' ? 'pending' : 'notUploaded',
                  birth_certificate: fileMeta.birth_certificate?.downloadUrl ? 'uploaded' : fileUploadStatus.birth_certificate === 'uploading' ? 'pending' : 'notUploaded',
                  aadhar_card: fileMeta.aadhar_card?.downloadUrl ? 'uploaded' : fileUploadStatus.aadhar_card === 'uploading' ? 'pending' : 'notUploaded',
                  parent_id_proof: fileMeta.parent_id_proof?.downloadUrl ? 'uploaded' : fileUploadStatus.parent_id_proof === 'uploading' ? 'pending' : 'notUploaded',
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Form Screen
  return (
    <>
      <section className={styles.admissionForm}>
        <LineArt
          circle={{
            size: 200,
            borderColor: "var(--primary-yellow)",
            borderWidth: 3,
            borderStyle: "dashed",
            opacity: 1,
            animationSpeed: 30,
            bottom: "7%",
            left: "7%",
            icon: (
              <SchoolOutlinedIcon
                sx={{ fontSize: 40, transform: "scale(-1, 1)" }}
              />
            ),
            iconColor: "var(--primary-purple)",
            showIcon: true,
          }}
          dot={{
            size: 150,
            color: "var(--primary-yellow)",
            opacity: 0.3,
            animationSpeed: 6,
            top: "10%",
            right: "5%",
            blur: 60,
            show: true,
          }}
          squiggly={{
            size: 100,
            color: "var(--primary-purple)",
            opacity: 0.1,
            animationSpeed: 8,
            top: "30%",
            left: "2%",
            show: true,
            reverse: true,
          }}
          zIndex={1}
        />
        <HeadingTitle text={t('admission.title')} />
        <div className={styles.container}>
          <div className={styles.formCard}>
            <div className={styles.formLayout}>
              <main className={styles.main}>
                <p className={styles.subtitle}>
                  {t('admission.subtitle')}
                </p>

                {/* Progress Bar */}
                <div className={styles.topProgress} aria-hidden>
                  <div className={styles.progressWrap}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${((step - 1) / 3) * 100}%` }}
                    />
                  </div>

                  <div className={styles.pills}>
                    {[
                      { n: 1, t: t('admission.steps.student'), icon: EmojiPeople },
                      { n: 2, t: t('admission.steps.parents'), icon: FamilyRestroom },
                      { n: 3, t: t('admission.steps.academic'), icon: SchoolOutlined },
                      { n: 4, t: t('admission.steps.documents'), icon: DescriptionOutlined },
                    ].map((s) => {
                      const IconComponent = s.icon;
                      return (
                        <div
                          key={s.n}
                          className={`${styles.pill} ${step >= s.n ? styles.active : ""
                            } ${step > s.n ? styles.completed : ""}`}
                        >
                          <span className={styles.pillNumber}>{s.n}</span>
                          <IconComponent className={styles.pillIcon} />
                          <h2 className={styles.pillText}>{s.t}</h2>
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.progressWrap}>
                    <div className={styles.progressBar} />
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  {/* Step 1: Child Details */}
                  {step === 1 && (
                    <motion.div
                      className={styles.stepContent}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>{t('admission.form.studentName')} *</label>
                          <div className={styles.inputWrapper}>
                            <FaChild className={styles.icon} />
                            <input
                              type="text"
                              name="child_name"
                              value={formData.child_name}
                              onChange={handleInputChange}
                              placeholder={t('admission.form.studentNamePlaceholder')}
                              required
                            />
                          </div>
                          {errors.child_name && (
                            <p className={styles.errorMessage}>
                              {errors.child_name}
                            </p>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label>{t('admission.form.dob')} *</label>
                          <div className={styles.inputWrapper}>
                            <MdDateRange className={styles.icon} />
                            <input
                              type="date"
                              name="child_dob"
                              value={formData.child_dob}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          {errors.child_dob && (
                            <p className={styles.errorMessage}>
                              {errors.child_dob}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>{t('admission.form.gender')} *</label>
                          <div className={styles.radioGroup}>
                            <div className={styles.radioItem}>
                              <input
                                type="radio"
                                id="gender_male"
                                name="child_gender"
                                value="Male"
                                checked={formData.child_gender === "Male"}
                                onChange={handleInputChange}
                                className={styles.radioInput}
                              />
                              <label
                                htmlFor="gender_male"
                                className={styles.radioLabel}
                              >
                                {t('admission.form.male')}
                              </label>
                            </div>

                            <div className={styles.radioItem}>
                              <input
                                type="radio"
                                id="gender_female"
                                name="child_gender"
                                value="Female"
                                checked={formData.child_gender === "Female"}
                                onChange={handleInputChange}
                                className={styles.radioInput}
                              />
                              <label
                                htmlFor="gender_female"
                                className={styles.radioLabel}
                              >
                                {t('admission.form.female')}
                              </label>
                            </div>
                          </div>
                          {errors.child_gender && (
                            <p className={styles.errorMessage}>
                              {errors.child_gender}
                            </p>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label>{t('admission.form.placeOfBirth')} *</label>
                          <div className={styles.inputWrapper}>
                            <FaBirthdayCake className={styles.icon} />
                            <input
                              type="text"
                              name="child_place_of_birth"
                              value={formData.child_place_of_birth}
                              onChange={handleInputChange}
                              placeholder={t('admission.form.placeOfBirthPlaceholder')}
                              required
                            />
                          </div>
                          {errors.child_place_of_birth && (
                            <p className={styles.errorMessage}>
                              {errors.child_place_of_birth}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>{t('admission.form.bloodGroup')}</label>
                          <div className={styles.inputWrapper}>
                            <MdBloodtype className={styles.icon} />
                            <select
                              name="child_blood_group"
                              value={formData.child_blood_group}
                              onChange={handleInputChange}
                              className={styles.selectInput}
                            >
                              <option value="">{t('admission.form.selectBloodGroup')}</option>
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
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Parent Details */}
                  {step === 2 && (
                    <motion.div
                      className={styles.stepContent}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>{t('admission.form.fatherName')} *</label>
                          <div className={styles.inputWrapper}>
                            <FaUser className={styles.icon} />
                            <input
                              type="text"
                              name="father_name"
                              value={formData.father_name}
                              onChange={handleInputChange}
                              placeholder={t('admission.form.fatherNamePlaceholder')}
                              required
                            />

                            {errors.father_name && (
                              <p className={styles.errorMessage}>
                                {errors.father_name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className={styles.formGroup}>
                          <label>{t('admission.form.motherName')} *</label>
                          <div className={styles.inputWrapper}>
                            <FaUser className={styles.icon} />
                            <input
                              type="text"
                              name="mother_name"
                              value={formData.mother_name}
                              onChange={handleInputChange}
                              placeholder={t('admission.form.motherNamePlaceholder')}
                              required
                            />

                            {errors.mother_name && (
                              <p className={styles.errorMessage}>
                                {errors.mother_name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className={styles.formGroup}>
                          <label>{t('admission.form.mobileNumber')} *</label>
                          <div className={styles.inputWrapper}>
                            <FaPhone className={styles.icon} />
                            <input
                              type="tel"
                              name="parent_mobile_number"
                              value={formData.parent_mobile_number}
                              onChange={handleInputChange}
                              placeholder={t('admission.form.mobileNumberPlaceholder')}
                              maxLength={10}
                              pattern="[0-9]{10}"
                              required
                            />
                          </div>
                          {errors.parent_mobile_number && (
                            <p className={styles.errorMessage}>
                              {errors.parent_mobile_number}
                            </p>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label>{t('admission.form.email')}</label>
                          <div className={styles.inputWrapper}>
                            <FaEnvelope className={styles.icon} />
                            <input
                              type="email"
                              name="parent_email"
                              value={formData.parent_email}
                              onChange={handleInputChange}
                              placeholder={t('admission.form.emailPlaceholder')}
                            />
                          </div>
                        </div>
                      </div>

                      <div className={styles.formRowFull}>
                        <div className={styles.formGroup}>
                          <label>{t('admission.form.address')} *</label>
                          <div className={styles.inputWrapper}>
                            <FaMapMarkerAlt className={styles.icon} />
                            <textarea
                              name="parent_address"
                              value={formData.parent_address}
                              onChange={handleInputChange}
                              placeholder={t('admission.form.addressPlaceholder')}
                              rows={3}
                              required
                              className={styles.textarea}
                            />
                          </div>
                          {errors.parent_address && (
                            <p className={styles.errorMessage}>
                              {errors.parent_address}
                            </p>
                          )}
                        </div>
                      </div>

                    </motion.div>
                  )}

                  {/* Step 3: Academic Details */}
                  {step === 3 && (
                    <motion.div
                      className={styles.stepContent}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>{t('admission.form.selectProgram')} *</label>
                          <div className={styles.radioGroup}>
                            {programs.map((program) => (
                              <div className={styles.radioItem} key={program}>
                                <input
                                  type="radio"
                                  id={`program_${program}`}
                                  name="program_name"
                                  value={program}
                                  checked={formData.program_name === program}
                                  onChange={handleInputChange}
                                  className={styles.radioInput}
                                />
                                <label
                                  htmlFor={`program_${program}`}
                                  className={styles.radioLabel}
                                >
                                  {program}
                                </label>
                              </div>
                            ))}
                          </div>
                          {errors.program_name && (
                            <p className={styles.errorMessage}>
                              {errors.program_name}
                            </p>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label>{t('admission.form.previousSchool')}</label>
                          <div className={styles.inputWrapper}>
                            <FaSchool className={styles.icon} />
                            <input
                              type="text"
                              name="previous_school"
                              value={formData.previous_school}
                              onChange={handleInputChange}
                              placeholder={t('admission.form.previousSchoolPlaceholder')}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Documents */}
                  {step === 4 && (
                    <motion.div
                      className={styles.stepContent}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className={styles.formGroup}>
                        <label>{t('admission.form.selectedFilesStatus')}</label>
                        <div className={styles.selectedFiles}>
                          <div
                            className={`${styles.fileStatusItem} ${filePreviews.photo
                              ? styles.uploaded
                              : styles.notUploaded
                              }`}
                          >
                            <span className={styles.fileStatusIcon}>
                              {filePreviews.photo ? "✓" : "○"}
                            </span>
                            <span className={styles.fileStatusText}>
                              {t('admission.form.photoStatus')}
                              {filePreviews.photo
                                ? filePreviews.photo.startsWith("data:image")
                                  ? t('admission.form.imageSelected')
                                  : filePreviews.photo
                                : t('admission.form.photoNotUploaded')}
                            </span>
                          </div>

                          <div
                            className={`${styles.fileStatusItem} ${filePreviews.birth_certificate
                              ? styles.uploaded
                              : styles.notUploaded
                              }`}
                          >
                            <span className={styles.fileStatusIcon}>
                              {filePreviews.birth_certificate ? "✓" : "○"}
                            </span>
                            <span className={styles.fileStatusText}>
                              {t('admission.form.birthCertificateStatus')}
                              {filePreviews.birth_certificate
                                ? filePreviews.birth_certificate.startsWith(
                                  "data:image"
                                )
                                  ? t('admission.form.imageSelected')
                                  : filePreviews.birth_certificate
                                : t('admission.form.photoNotUploaded')}
                            </span>
                          </div>

                          <div
                            className={`${styles.fileStatusItem} ${filePreviews.aadhar_card
                              ? styles.uploaded
                              : styles.notUploaded
                              }`}
                          >
                            <span className={styles.fileStatusIcon}>
                              {filePreviews.aadhar_card ? "✓" : "○"}
                            </span>
                            <span className={styles.fileStatusText}>
                              {t('admission.form.aadharCardStatus')}
                              {filePreviews.aadhar_card
                                ? filePreviews.aadhar_card.startsWith(
                                  "data:image"
                                )
                                  ? t('admission.form.imageSelected')
                                  : filePreviews.aadhar_card
                                : t('admission.form.photoNotUploaded')}
                            </span>
                          </div>

                          <div
                            className={`${styles.fileStatusItem} ${filePreviews.parent_id_proof
                              ? styles.uploaded
                              : styles.notUploaded
                              }`}
                          >
                            <span className={styles.fileStatusIcon}>
                              {filePreviews.parent_id_proof ? "✓" : "○"}
                            </span>
                            <span className={styles.fileStatusText}>
                              {t('admission.form.parentIdStatus')}
                              {filePreviews.parent_id_proof
                                ? filePreviews.parent_id_proof.startsWith(
                                  "data:image"
                                )
                                  ? t('admission.form.imageSelected')
                                  : filePreviews.parent_id_proof
                                : t('admission.form.photoNotUploaded')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {uploadDocsNow && (
                        <>
                          <FileUploadField
                            label={t('admission.form.photoLabel')}
                            fieldName="photo"
                            accept="image/*"
                            preview={filePreviews.photo}
                            onChange={(e) => handleFileChange(e, "photo")}
                          />

                          <FileUploadField
                            label={t('admission.form.birthCertificateLabel')}
                            fieldName="birth_certificate"
                            accept=".pdf,image/*"
                            preview={filePreviews.birth_certificate}
                            onChange={(e) =>
                              handleFileChange(e, "birth_certificate")
                            }
                          />

                          <FileUploadField
                            label={t('admission.form.aadharCardLabel')}
                            fieldName="aadhar_card"
                            accept=".pdf,image/*"
                            preview={filePreviews.aadhar_card}
                            onChange={(e) => handleFileChange(e, "aadhar_card")}
                          />

                          <FileUploadField
                            label={t('admission.form.parentIdLabel')}
                            fieldName="parent_id_proof"
                            accept=".pdf,image/*"
                            preview={filePreviews.parent_id_proof}
                            onChange={(e) =>
                              handleFileChange(e, "parent_id_proof")
                            }
                          />
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* Navigation Buttons */}
                  <motion.div className={styles.buttonGroup} layout>
                    {step > 1 && (
                      <button
                        type="button"
                        className={styles.prevBtn}
                        onClick={() => setStep(step - 1)}
                      >
                        {t('admission.form.previousButton')}
                      </button>
                    )}

                    {step < 4 ? (
                      <button
                        type="button"
                        className={styles.nextBtn}
                        onClick={() => {
                          if (validateStep(step)) {
                            setStep(step + 1);
                          }
                        }}
                      >
                        {t('admission.form.nextButton')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={styles.submitBtn}
                        disabled={loading}
                        onClick={() => handleSubmit()}
                      >
                        {loading ? (
                          <>
                            <FaSpinner className={styles.spinner} />{" "}
                            {t('admission.form.submitting')}
                          </>
                        ) : (
                          ` ${t('admission.form.submitButton')}`
                        )}
                      </button>
                    )}
                  </motion.div>
                </form>
              </main>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// File Upload Field Component
function FileUploadField({
  label,
  accept,
  preview,
  onChange,
}: {
  label: string;
  fieldName: string;
  accept: string;
  preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.fileUploadField}>
      <label>{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        className={styles.fileInput}
        style={{ display: "none" }}
      />
      <div
        className={styles.fileUploadBox}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <div className={styles.filePreview}>
            {preview.startsWith("data:image") ? (
              <img src={preview} alt="Preview" />
            ) : (
              <p>{preview}</p>
            )}
            <p className={styles.clickToChange}>Click to change</p>
          </div>
        ) : (
          <div className={styles.uploadPlaceholder}>
            <span><FaFile className={styles.fileColor} /> Click to upload file</span>
            <small>Max 10MB • JPG, PNG, PDF</small>
          </div>
        )}
      </div>
    </div>
  );
}
