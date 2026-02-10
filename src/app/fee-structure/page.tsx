"use client"

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import styles from './fee-structure.module.css'
import generatePdf from '../../lib/generatePdf'
import { schoolDetailsEng } from '@/json/schooldetails-eng'

const PROGRAMS_WITH_FEES = schoolDetailsEng.feeStructure?.programs || []
const PAYMENT_TERMS = schoolDetailsEng.feeStructure?.paymentTerms || []
const POLICIES = schoolDetailsEng.feeStructure?.policies || []

function FeeStructureContent() {
  const searchParams = useSearchParams()
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
    const addr = schoolDetailsEng.address
    if (!addr) return 'N/A'
    const parts = [addr.street, addr.city, addr.state, addr.pincode].filter(Boolean)
    return parts.join(', ')
  }

  return (
    <main className={styles.container}>
      <div id="pdf-fee-content" className={styles.pdfWrapper}>
        {/* Page 1: Cover & Overview */}
        <article className={styles.pdfPage}>
          <div className={styles.coverHeader}>
            <div className={styles.studentInfoHeaderOverlay}>
              <img src="/assets/logo/logo.png" alt="School logo" className={styles.headerLogo} />
              <h1 className={styles.headerTitle}>{schoolDetailsEng.name}</h1>
            </div>
            <p className={styles.headerSubtitle}>Fee Structure</p>

            <div className={styles.enquiryInfo}>
              <div>
                <p>Enquiry No: <span className={styles.enquiryField}>{enquiryNumber}</span></p>
              </div>
              <div>
                <p>Dated: <span className={styles.enquiryField}>{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
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
                  We are delighted to acknowledge your enquiry with us. The enquiry, registered under{' '}
                  <strong>
                    {enquiryNumber ? `Enquiry No ${enquiryNumber}` : `Admission No ${admissionNumber}`}
                  </strong>
                  , has been created on <strong>{formatDate(createdAt)}</strong> for the student{' '}
                  <strong>{studentName}</strong>, child of <strong>{parentName}</strong>. The requested program is{' '}
                  <strong>{program}</strong>, and our admissions team will be happy to assist you further with the next steps.
                </p>
              </div>
            </div>
          )}


          <div className={styles.overviewBox}>
            <h2>Program Overview</h2>
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
            <p><strong>Note:</strong> All fees are inclusive of meals, snacks, and basic supplies. Additional charges apply for special activities.</p>
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
                <span className={styles.feeLabel}>Monthly Fee</span>
                <span className={styles.feeAmount}>{program.monthlyFee}</span>
              </div>
              <div className={styles.feeItem}>
                <span className={styles.feeLabel}>Annual Fee</span>
                <span className={styles.feeAmount}>{program.annualFee}</span>
              </div>
              <div className={styles.feeItem}>
                <span className={styles.feeLabel}>Registration</span>
                <span className={styles.feeAmount}>{program.registrationFee}</span>
              </div>
            </div>

            <div className={styles.section}>
              <h3>Program Description</h3>
              <p>{program.description}</p>
            </div>

            <div className={styles.section}>
              <h3>What's Included</h3>
              <ul className={styles.includesList}>
                {program.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className={styles.section}>
              <h3>Additional Charges</h3>
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
            <h3>Questions?</h3>
            <p><strong>Contact Admissions:</strong></p>
            <p>📞 Phone: {schoolDetailsEng.contact?.phone || 'N/A'}</p>
            <p>✉️ Email: {schoolDetailsEng.contact?.email || 'N/A'}</p>
            <p>📍 Address: {formatAddress()}</p>
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
