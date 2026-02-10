"use client"

import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import styles from './fee-structure.module.css'
import generatePdf from '../../lib/generatePdf'
import { schoolDetailsEng } from '@/json/schooldetails-eng'
import { schoolDetailsHi } from '@/json/schooldetails-hi'

const PROGRAMS_WITH_FEES_EN = schoolDetailsEng.feeStructure?.programs || []
const PAYMENT_TERMS_EN = schoolDetailsEng.feeStructure?.paymentTerms || []
const POLICIES_EN = schoolDetailsEng.feeStructure?.policies || []

// For Hindi, we use Hindi school details which now has feeStructure
const PROGRAMS_WITH_FEES_HI = schoolDetailsHi.feeStructure?.programs || []
const PAYMENT_TERMS_HI = schoolDetailsHi.feeStructure?.paymentTerms || []
const POLICIES_HI = schoolDetailsHi.feeStructure?.policies || []

function FeeStructureContent() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const saved = localStorage.getItem('language') as 'en' | 'hi' | null
    if (saved && (saved === 'en' || saved === 'hi')) {
      setLanguage(saved)
    }
    setMounted(true)
  }, [])

  const handleLanguageSwitch = (lang: 'en' | 'hi') => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  if (!mounted) return <div>Loading...</div>

  // Use appropriate school details based on language
  const schoolDetailsBase = language === 'en' ? schoolDetailsEng : schoolDetailsHi
  const schoolDetailsForTranslations = language === 'en' ? schoolDetailsEng : schoolDetailsHi
  const PROGRAMS_WITH_FEES = language === 'en' ? PROGRAMS_WITH_FEES_EN : PROGRAMS_WITH_FEES_HI

  // Handle both old and new parameter names for compatibility
  const studentName = searchParams.get('studentName') || searchParams.get('child_name') || searchParams.get('name')
  const parentName = searchParams.get('parentName') || searchParams.get('parent_name')
  const enquiryNumber = searchParams.get('enquiryNumber') || searchParams.get('enquiry_number')
  const admissionNumber = searchParams.get('admissionNumber') || searchParams.get('admission_number')
  const createdAt = searchParams.get('createdAt') || searchParams.get('created_at')
  const program = searchParams.get('program')

  async function handleDownload() {
    try {
      await generatePdf('pdf-fee-content', 'ditvi-fee-structure.pdf')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('PDF generation failed', err)
      alert('PDF generation failed. Check console for details.')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatAddress = () => {
    const addr = schoolDetailsBase.address
    if (!addr) return 'N/A'
    const parts = [addr.street, addr.city, addr.state, addr.pincode].filter(Boolean)
    return parts.join(', ')
  }

  return (
    <main className={styles.container}>
      {/* Language Toggle Button */}
      <div className={styles.languageToggleSection}>
        <button
          onClick={() => handleLanguageSwitch('en')}
          className={`${styles.languageButton} ${language === 'en' ? styles.active : ''}`}
        >
          English
        </button>
        <button
          onClick={() => handleLanguageSwitch('hi')}
          className={`${styles.languageButton} ${language === 'hi' ? styles.active : ''}`}
        >
          हिन्दी
        </button>
      </div>
      <div id="pdf-fee-content" className={styles.pdfWrapper}>
        {/* Page 1: Cover & Overview */}
        <article className={styles.pdfPage}>
          <div className={styles.coverHeader}>
            <div className={styles.studentInfoHeaderOverlay}>
              <img src="/assets/logo/logo.png" alt="School logo" className={styles.headerLogo} />
              <h1 className={styles.headerTitle}>{schoolDetailsForTranslations.name}</h1>
            </div>
            <p className={styles.headerSubtitle}>{language === 'en' ? 'Fee Structure' : 'शुल्क संरचना'}</p>

            <div className={styles.enquiryInfo}>
              <div>
                <p>{language === 'en' ? 'Enquiry No' : 'पूछताछ क्रमांक'}: <span className={styles.enquiryField}>{enquiryNumber}</span></p>
              </div>
              <div>
                <p>{language === 'en' ? 'Dated' : 'दिनांक'}: <span className={styles.enquiryField}>{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
              </div>
            </div>
          </div>

          <div className={styles.coverSection}>
            <div className={styles.heroGalleryGrid}>
              <div className={styles.heroLarge}>
                <img src="/assets/hero/1.jpg" alt="hero-1" className={styles.heroImage} />
              </div>
            </div>

          </div>

          {/* Student Information Header - Overlaid on Hero Image */}
          {(studentName || parentName || enquiryNumber || admissionNumber) && (
            <div className={styles.overviewCard}>
              <div className={styles.studentInfoBox}>
                <p className={styles.detailedMessage}>
                  {language === 'en' ? (
                    <>
                      We are delighted to acknowledge your enquiry with us. The enquiry, registered under{' '}
                      <strong>
                        {enquiryNumber ? `Enquiry No ${enquiryNumber}` : `Admission No ${admissionNumber}`}
                      </strong>
                      , has been created on <strong>{formatDate(createdAt)}</strong> for the student{' '}
                      <strong>{studentName}</strong>, child of <strong>{parentName}</strong>. The requested program is{' '}
                      <strong>{program}</strong>, and our admissions team will be happy to assist you further with the next steps.
                    </>
                  ) : (
                    <>
                      हम आपकी पूछताछ को स्वीकार करते हुए प्रसन्न हैं। पूछताछ, जो &nbsp;
                      <strong>
                         {enquiryNumber ? `पूछताछ क्रमांक ${enquiryNumber}` : `प्रवेश क्रमांक ${admissionNumber}`}
                      </strong>
                      के तहत पंजीकृत है, को <strong>{formatDate(createdAt)}</strong> को छात्र <strong>{studentName}</strong>, <strong>{parentName}</strong> के बच्चे के लिए बनाया गया है। अनुरोधित कार्यक्रम <strong>{program}</strong> है, और हमारी प्रवेश टीम आपको अगले चरणों में सहायता करने के लिए खुश होगी।
                    </>
                  )}
                </p>
              </div>
            </div>
          )}


          <div className={styles.overviewBox}>
            <h2>{language === 'en' ? 'Program Overview' : 'कार्यक्रम अवलोकन'}</h2>
            <div className={styles.overviewGrid}>
              {PROGRAMS_WITH_FEES.map((prog) => (
                <div key={prog.name} className={styles.overviewCard}>
                  <div className={styles.cardIcon}>
                    {prog.img ? (
                      <img src={prog.img} alt={prog.name} className={styles.programCardIcon} />
                    ) : (
                      prog.icon
                    )}
                  </div>
                  <h3>{prog.name}</h3>
                  <p className={styles.ageText}>{prog.ageGroup}</p>
                  <p className={styles.feeHighlight}>{prog.monthlyFee}/month</p>
                  <p className={styles.annualText}>₹{prog.annualFee.split('₹')[1]}/year</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.footerNote}>
            <p><strong>{language === 'en' ? 'Note:' : 'नोट:'}</strong> {language === 'en' ? 'All fees are inclusive of meals, snacks, and basic supplies. Additional charges apply for special activities.' : 'सभी शुल्क भोजन, नाश्ते और बुनियादी आपूर्तियों सहित हैं। विशेष गतिविधियों के लिए अतिरिक्त शुल्क लागू होते हैं।'}</p>
          </div>
        </article>

        {/* Pages 2-5: Individual Program Details */}
        {PROGRAMS_WITH_FEES.map((program, idx) => (
          <article key={program.name} className={styles.pdfPage}>
            <div className={styles.programHeader}>
              <div className={styles.programIcon}>
                {program.img ? (
                  <img src={program.img} alt={program.name} className={styles.programCardIcon} />
                ) : (
                  program.icon
                )}
              </div>
              <div>
                <h2>{program.name}</h2>
                <p className={styles.programAge}>{program.ageGroup}</p>
              </div>
            </div>

            <div className={styles.feeBox}>
              <div className={styles.feeItem}>
                <span className={styles.feeLabel}>{language === 'en' ? 'Monthly Fee' : 'मासिक शुल्क'}</span>
                <span className={styles.feeAmount}>{program.monthlyFee}</span>
              </div>
              <div className={styles.feeItem}>
                <span className={styles.feeLabel}>{language === 'en' ? 'Annual Fee' : 'वार्षिक शुल्क'}</span>
                <span className={styles.feeAmount}>{program.annualFee}</span>
              </div>
              <div className={styles.feeItem}>
                <span className={styles.feeLabel}>{language === 'en' ? 'Registration' : 'पंजीकरण'}</span>
                <span className={styles.feeAmount}>{program.registrationFee}</span>
              </div>
            </div>

            <div className={styles.section}>
              <h3>{language === 'en' ? "Program Description" : "कार्यक्रम विवरण"}</h3>
              <p>{program.description}</p>
            </div>

            <div className={styles.section}>
              <h3>{language === 'en' ? "What's Included" : "क्या शामिल है"}</h3>
              <ul className={styles.includesList}>
                {program.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className={styles.section}>
              <h3>{language === 'en' ? "Additional Charges" : "अतिरिक्त शुल्क"}</h3>
              <table className={styles.chargesTable}>
                <tbody>
                  {program.additionalCharges.map((charge) => (
                    <tr key={charge.name}>
                      <td>{charge.name}</td>
                      <td className={styles.chargePrice}>{charge.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}

        {/* Page 6: Payment Terms & Policies */}
        <article className={styles.pdfPage}>
          <div className={styles.contactBox}>
            <h3>{language === 'en' ? 'Questions?' : 'सवाल?'}</h3>
            <p><strong>{language === 'en' ? 'Contact Admissions:' : 'प्रवेश से संपर्क करें:'}</strong></p>
            <p>📞 {language === 'en' ? 'Phone' : 'फोन'}: {schoolDetailsBase.contact?.phone || 'N/A'}</p>
            <p>✉️ {language === 'en' ? 'Email' : 'ईमेल'}: {schoolDetailsBase.contact?.email || 'N/A'}</p>
            <p>📍 {language === 'en' ? 'Address' : 'पता'}: {formatAddress()}</p>
          </div>
        </article>
      </div>
    </main>
  )
}

export default function FeeStructurePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeeStructureContent />
    </Suspense>
  )
}
