"use client"

import React from 'react'
import styles from './fee-structure.module.css'
import generatePdf from '../../lib/generatePdf'

const PROGRAMS_WITH_FEES = [
  {
    name: 'Toddlers',
    ageGroup: 'Ages 2–3',
    icon: '👶',
    img: '/assets/programs/toddler.jpg',
    monthlyFee: '₹8,500',
    annualFee: '₹1,02,000',
    registrationFee: '₹2,000',
    description: 'Sensory play & bonding with certified caregivers',
    includes: [
      'Daily play-based learning activities',
      'Snacks & meals included',
      'Diaper changing & basic care',
      'Monthly progress reports',
      'Parent-teacher meetings',
      'Outdoor play time',
    ],
    additionalCharges: [
      { name: 'Extra class (per month)', price: '₹500' },
      { name: 'Special workshop', price: '₹1,000' },
      { name: 'Field trips', price: '₹2,000–₹3,000' },
    ],
  },
  {
    name: 'Nursery',
    ageGroup: 'Ages 3–4',
    icon: '🧒',
    img: '/assets/programs/nursery.jpg',
    monthlyFee: '₹10,000',
    annualFee: '₹1,20,000',
    registrationFee: '₹2,000',
    description: 'Foundation learning & routine building',
    includes: [
      'Structured daily routines',
      'Alphabet & number introduction',
      'Art, crafts & creative activities',
      'Story time & music sessions',
      'Snacks & lunch included',
      'Playground access',
      'Monthly assessments',
    ],
    additionalCharges: [
      { name: 'Extra class (per month)', price: '₹600' },
      { name: 'Art supplies kit', price: '₹1,500' },
      { name: 'Educational games', price: '₹500–₹1,000' },
    ],
  },
  {
    name: 'Pre-Kindergarten',
    ageGroup: 'Ages 4–5',
    icon: '📚',
    img: '/assets/programs/prekg.jpg',
    monthlyFee: '₹12,000',
    annualFee: '₹1,44,000',
    registrationFee: '₹2,500',
    description: 'Pre-academics & literacy foundation',
    includes: [
      'Phonics & pre-reading program',
      'Basic mathematics & number skills',
      'STEM exploration activities',
      'Art, music & physical education',
      'Lunch & healthy snacks',
      'Bi-weekly skills assessment',
      'Parent-teacher conferences',
    ],
    additionalCharges: [
      { name: 'Advanced STEM kit', price: '₹1,500–₹2,000' },
      { name: 'Special classes (per month)', price: '₹700' },
      { name: 'School events & excursions', price: '₹2,500–₹4,000' },
    ],
  },
  {
    name: 'Kindergarten',
    ageGroup: 'Ages 5–6',
    icon: '🎓',
    img: '/assets/programs/kg.jpg',
    monthlyFee: '₹14,000',
    annualFee: '₹1,68,000',
    registrationFee: '₹3,000',
    description: 'School readiness & academic skills',
    includes: [
      'English, Math & Science curriculum',
      'Reading & writing program',
      'Problem-solving activities',
      'Computer basics introduction',
      'Sports & physical activities',
      'Creative projects & competitions',
      'Monthly progress tracking',
      'School readiness preparation',
    ],
    additionalCharges: [
      { name: 'Tech classes (per month)', price: '₹800' },
      { name: 'Competitive exam prep', price: '₹1,000–₹1,500' },
      { name: 'Annual day & events', price: '₹5,000–₹7,000' },
    ],
  },
]

const PAYMENT_TERMS = [
  { term: 'Monthly', description: 'Pay monthly fees', icon: '📅' },
  { term: 'Quarterly', description: '3-month advance (5% discount)', icon: '📊' },
  { term: 'Semi-Annual', description: '6-month advance (8% discount)', icon: '💰' },
  { term: 'Annual', description: 'Full year upfront (12% discount)', icon: '⭐' },
]

const POLICIES = [
  'Registration fee is non-refundable',
  'One month notice required for withdrawal',
  'Fee increase annually (April)',
  'Late fee: ₹500 per day after due date',
  'Sibling discount: 10% on second child',
  'Multiple year enrollment discount available',
]

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
      <div className={styles.actionRow}>
        <h2 className={styles.title}>Fee Structure — Download PDF</h2>
        <button className={styles.downloadBtn} onClick={handleDownload}>Download PDF</button>
      </div>

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
