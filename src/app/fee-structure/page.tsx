"use client"

import styles from './fee-structure.module.css'
import generatePdf from '../../lib/generatePdf'
import { schoolDetails } from '@/json/schooldetails'

const PROGRAMS_WITH_FEES = schoolDetails.feeStructure?.programs || []
const PAYMENT_TERMS = schoolDetails.feeStructure?.paymentTerms || []
const POLICIES = schoolDetails.feeStructure?.policies || []

export default function FeeStructurePage() {
  async function handleDownload() {
    try {
      await generatePdf('pdf-fee-content', 'ditvi-fee-structure.pdf')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('PDF generation failed', err)
      alert('PDF generation failed. Check console for details.')
    }
  }

  return (
    <main className={styles.container}>
      

      <div id="pdf-fee-content" className={styles.pdfWrapper}>
        {/* Page 1: Cover & Overview */}
        <article className={styles.pdfPage}>
          <div className={styles.coverSection}>
            <img src="/assets/logo/logo.png" alt="School logo" className={styles.logo} />
            <h1 className={styles.coverTitle}>Ditvi Play School</h1>
            <p className={styles.coverSubtitle}>Fee Structure & Payment Information</p>
            <p className={styles.coverYear}>{new Date().getFullYear()}</p>
            {/* Hero gallery to visually match site branding and provide cover imagery */}
            <div className={styles.heroGalleryGrid}>
              <div className={styles.heroLarge}>
                <img src="/assets/hero/1.jpg" alt="hero-1" />
              </div>
              <div className={styles.heroSmall}>
                <img src="/assets/hero/2.jpg" alt="hero-2" />
              </div>
              <div className={styles.heroSmall}>
                <img src="/assets/hero/3.jpg" alt="hero-3" />
              </div>
            </div>

            {/* <div className={styles.heroThumbs}>
              <div className={styles.heroThumb}><img src="/assets/programs/toddler.jpg" alt="Toddlers" /></div>
              <div className={styles.heroThumb}><img src="/assets/programs/nursery.jpg" alt="Nursery" /></div>
              <div className={styles.heroThumb}><img src="/assets/gallery/independenceday.png" alt="Independence Day" /></div>
            </div> */}
          </div>

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
          <h2 className={styles.sectionTitle}>Payment Terms & Policies</h2>

          <div className={styles.section}>
            <h3>Payment Options</h3>
            <div className={styles.paymentGrid}>
              {PAYMENT_TERMS.map((option) => (
                <div key={option.term} className={styles.paymentCard}>
                  <div className={styles.paymentIcon}>{option.icon}</div>
                  <h4>{option.term}</h4>
                  <p>{option.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h3>Important Policies</h3>
            <ul className={styles.policiesList}>
              {POLICIES.map((policy) => (
                <li key={policy}>{policy}</li>
              ))}
            </ul>
          </div>

          <div className={styles.contactBox}>
            <h3>Questions?</h3>
            <p><strong>Contact Admissions:</strong></p>
            <p>📞 Phone: (555) 123-4567</p>
            <p>✉️ Email: admissions@ditvi.school</p>
            <p>📍 Address: 123 Main Street, Your City</p>
          </div>
        </article>
      </div>
    </main>
  )
}
