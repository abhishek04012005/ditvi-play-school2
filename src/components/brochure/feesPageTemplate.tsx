'use client';

import React from 'react';
import styles from './brochureTemplate.module.css';
import schoolDetails from '@/json/schooldetails';
import { feesStructure } from '@/json/feesStructure';

export default function FeesPageTemplate() {
  return (
    <div className={styles.brochure}>
      {/* Hero Section with Header */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.logoBox}>
            <h1 className={styles.heroTitle}>{schoolDetails.name}</h1>
            <p className={styles.heroSubtitle}>Transparent & Flexible Fee Structure</p>
          </div>
        </div>
      </section>

      {/* Fees Structure Section */}
      <section className={styles.section}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>{feesStructure.title}</h2>
          </div>
          <p className={styles.sectionDescription}>{feesStructure.description}</p>

          <div className={styles.feesGrid}>
            {feesStructure.programs.map((program, idx) => (
              <div key={idx} className={styles.feesCard}>
                <div className={styles.feesHeader}>
                  <h3>{program.name}</h3>
                  <p className={styles.ageGroup}>{program.ageGroup}</p>
                </div>

                <div className={styles.feesTableContainer}>
                  <table className={styles.feesTable}>
                    <thead>
                      <tr>
                        <th>Period</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {program.fees.map((fee, i) => (
                        <tr key={i}>
                          <td>
                            <span className={styles.periodName}>{fee.period}</span>
                            <span className={styles.periodDesc}>{fee.description}</span>
                          </td>
                          <td className={styles.amountCell}>₹{fee.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={styles.highlights}>
                  {program.highlights.map((highlight, i) => (
                    <p key={i} className={styles.highlight}>✓ {highlight}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.additionalSection}>
            <h3>Additional Charges</h3>
            <div className={styles.additionalGrid}>
              {feesStructure.additionalCharges.map((charge, idx) => (
                <div key={idx} className={styles.additionalItem}>
                  <div className={styles.additionalName}>{charge.name}</div>
                  <div className={styles.additionalAmount}>₹{charge.amount.toLocaleString()}</div>
                  <div className={styles.additionalDesc}>{charge.description}</div>
                  <div className={styles.additionalFreq}>{charge.frequency}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.discountsSection}>
            <h3>Available Discounts</h3>
            <div className={styles.discountsGrid}>
              {feesStructure.discounts.map((discount, idx) => (
                <div key={idx} className={styles.discountItem}>
                  <div className={styles.discountBadge}>{discount.value}</div>
                  <h4>{discount.type}</h4>
                  <p>{discount.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.policiesSection}>
            <h3>Payment Policies & Terms</h3>
            <ul className={styles.policiesList}>
              {feesStructure.policies.map((policy, idx) => (
                <li key={idx}>{policy}</li>
              ))}
            </ul>
          </div>

          <div className={styles.ctaBox}>
            <p>For more information, please contact our admissions team</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.section}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>Get In Touch</h2>
          </div>
          <div className={styles.contactCardsGrid}>
            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>📱</div>
              <h3>Phone</h3>
              <p>{schoolDetails.contact.phone}</p>
            </div>
            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>✉️</div>
              <h3>Email</h3>
              <p>{schoolDetails.contact.email}</p>
            </div>
            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>💬</div>
              <h3>WhatsApp</h3>
              <p>{schoolDetails.contact.whatsapp}</p>
            </div>
          </div>

          <div className={styles.addressCard}>
            <h3>📍 Our Location</h3>
            <p className={styles.addressText}>
              {schoolDetails.address.street}<br />
              {schoolDetails.address.city}, {schoolDetails.address.state} - {schoolDetails.address.pincode}<br />
              {schoolDetails.address.country}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2025 {schoolDetails.name}. All rights reserved. | Nurturing young minds, building bright futures.</p>
      </footer>
    </div>
  );
}
