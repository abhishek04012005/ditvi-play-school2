'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import styles from './brochureTemplate.module.css';
import schoolDetails from '@/json/schooldetails';
import { feesStructure } from '@/json/feesStructure';
import Logo from '../../../public/assets/logo/logo.png';
import Image from 'next/image';

// Color themes for each program
const programColors: { [key: string]: { bg: string; accent: string; light: string } } = {
  Toddlers: { bg: '#FF6B9D', accent: '#FF1493', light: '#FFE0ED' },
  Nursery: { bg: '#4ECDC4', accent: '#1AAFA0', light: '#D9F7F5' },
  'Pre-K': { bg: '#95E1D3', accent: '#38B6A8', light: '#E8F7F4' },
  Kindergarten: { bg: '#FFA502', accent: '#FF8500', light: '#FFE8CC' },
};

export default function FeesPageTemplate() {
  const searchParams = useSearchParams();
  const [enquiryData, setEnquiryData] = useState({
    child_name: '',
    parent_name: '',
    enquiry_number: '',
    phone: '',
    program: '',
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setEnquiryData({
      child_name: searchParams.get('name') || '',
      parent_name: searchParams.get('parent_name') || '',
      enquiry_number: searchParams.get('enquiry_number') || '',
      phone: searchParams.get('phone') || '',
      program: searchParams.get('program') || '',
    });
    setIsLoaded(true);
  }, [searchParams]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className={styles.brochure}>
      {/* Enhanced Hero Section with Gradient */}
      <section
        className={styles.heroSection}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          position: 'relative',
        }}
      >
        {/* Decorative Elements */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)',
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(70px)',
            zIndex: 2,
          }}
        />

        <motion.div
          className={styles.heroTextContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ position: 'relative', zIndex: 3 }}
        >
          <div className={styles.logoBox}>
            <motion.div
              className={styles.heroLogo}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3, type: 'spring', stiffness: 100 }}
              style={{
                padding: '16px',
                borderRadius: '20px',
              }}
            >
              <Image
                src={Logo}
                alt="Logo"
                width={100}
                height={100}
                style={{ objectFit: 'contain' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h1 className={styles.heroTitle} style={{ textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                {schoolDetails.name}
              </h1>
              <p className={styles.heroSubtitle} style={{ fontSize: 'clamp(1rem, 5vw, 1.3rem)', marginTop: '8px', textShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                💰 Fee Structure & Payment Options
              </p>
            </motion.div>
          </div>

          {/* Enquiry Details Badges - Premium styling */}
          {enquiryData.child_name && (
            <motion.div
              className={styles.studentInfo}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ marginTop: '30px', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}
            >
              <motion.div
                className={styles.infoBadge}
                variants={itemVariants}
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                }}
              >
                <span className={styles.badgeLabel} style={{ fontSize: '0.85rem' }}>
                  👋 Welcome
                </span>
                <span className={styles.badgeValue} style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                  {enquiryData.child_name}
                </span>
              </motion.div>

              {enquiryData.program && (
                <motion.div
                  className={styles.infoBadge}
                  variants={itemVariants}
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                  }}
                >
                  <span className={styles.badgeLabel} style={{ fontSize: '0.85rem' }}>
                    📚 Program
                  </span>
                  <span className={styles.badgeValue} style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                    {enquiryData.program}
                  </span>
                </motion.div>
              )}

              {enquiryData.enquiry_number && (
                <motion.div
                  className={styles.infoBadge}
                  variants={itemVariants}
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                  }}
                >
                  <span className={styles.badgeLabel} style={{ fontSize: '0.85rem' }}>
                    🔔 Ref #
                  </span>
                  <span className={styles.badgeValue} style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                    {enquiryData.enquiry_number}
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Fee Structure Section */}
      <motion.section
        className={styles.section}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className={styles.sectionContainer}>
          <motion.div
            className={styles.sectionHeader}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2>💎 {feesStructure.title}</h2>
          </motion.div>

          <motion.p
            className={styles.sectionDescription}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {feesStructure.description}
          </motion.p>

          <motion.div
            className={styles.feesGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}
          >
            {feesStructure.programs.map((program, idx) => {
              const colors = programColors[program.name] || programColors.Toddlers;
              return (
              <motion.div
                key={idx}
                className={styles.feesCard}
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5 }}
                style={{
                  overflow: 'hidden',
                  position: 'relative',
                  borderTop: `6px solid ${colors.accent}`,
                }}
              >
                {/* Program Color Header */}
                <div
                  style={{
                    background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.accent} 100%)`,
                    padding: '24px 20px',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Decorative Elements */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-20px',
                      right: '-20px',
                      width: '120px',
                      height: '120px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-30px',
                      left: '-30px',
                      width: '100px',
                      height: '100px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '50%',
                    }}
                  />

                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div
                      style={{
                        fontSize: '3rem',
                        marginBottom: '8px',
                      }}
                    >
                      {program.name === 'Toddlers' && '🧒'}
                      {program.name === 'Nursery' && '👧'}
                      {program.name === 'Pre-K' && '👦'}
                      {program.name === 'Kindergarten' && '📚'}
                    </div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: 'bold' }}>
                      {program.name}
                    </h3>
                    <p style={{ margin: 0, opacity: 0.95, fontSize: '0.9rem' }}>
                      {program.ageGroup}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    padding: '20px',
                  }}
                >
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
                      <motion.p
                        key={i}
                        className={styles.highlight}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        style={{ margin: '6px 0' }}
                      >
                        ✓ {highlight}
                      </motion.p>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
            })}
          </motion.div>

          {/* Additional Charges Section */}
          <motion.div
            className={styles.additionalSection}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <h3 style={{ marginBottom: '25px' }}>➕ Additional Charges</h3>
            <motion.div
              className={styles.additionalGrid}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}
            >
              {feesStructure.additionalCharges.map((charge, idx) => (
                <motion.div
                  key={idx}
                  className={styles.additionalItem}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={styles.additionalName}>{charge.name}</div>
                  <div className={styles.additionalAmount}>₹{charge.amount.toLocaleString()}</div>
                  <div className={styles.additionalDesc}>{charge.description}</div>
                  <div className={styles.additionalFreq}>{charge.frequency}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Discounts Section */}
          <motion.div
            className={styles.discountsSection}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <h3 style={{ marginBottom: '25px' }}>🎁 Available Discounts</h3>
            <motion.div
              className={styles.discountsGrid}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}
            >
              {feesStructure.discounts.map((discount, idx) => (
                <motion.div
                  key={idx}
                  className={styles.discountItem}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  style={{
                    background: 'linear-gradient(135deg, #FFF5E6 0%, #FFE8CC 100%)',
                    border: '2px solid #FFD700',
                  }}
                >
                  <div className={styles.discountBadge}>{discount.value}</div>
                  <h4>{discount.type}</h4>
                  <p>{discount.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Policies Section */}
          <motion.div
            className={styles.policiesSection}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <h3 style={{ marginBottom: '25px' }}>📋 Payment Policies & Terms</h3>
            <motion.ul
              className={styles.policiesList}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px', listStyle: 'none', padding: 0 }}
            >
              {feesStructure.policies.map((policy, idx) => (
                <motion.li
                  key={idx}
                  variants={itemVariants}
                  style={{
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #f9f7ff 0%, #fafbfc 100%)',
                    borderLeft: '4px solid #FFD700',
                    borderRadius: '8px',
                  }}
                >
                  ✅ {policy}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* CTA Box */}
          <motion.div
            className={styles.ctaBox}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p>
              📞 For questions about fees, payment plans, or to discuss scholarships, please don't
              hesitate to contact our admissions team
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        className={styles.section}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className={styles.sectionContainer}>
          <motion.div
            className={styles.sectionHeader}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2>📞 Get In Touch</h2>
          </motion.div>

          <motion.div
            className={styles.contactCardsGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}
          >
            <motion.div
              className={styles.contactCard}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className={styles.contactIcon} style={{ fontSize: '2.5rem' }}>
                📱
              </div>
              <h3>Phone</h3>
              <p>{schoolDetails.contact.phone}</p>
            </motion.div>

            <motion.div
              className={styles.contactCard}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className={styles.contactIcon} style={{ fontSize: '2.5rem' }}>
                ✉️
              </div>
              <h3>Email</h3>
              <p>{schoolDetails.contact.email}</p>
            </motion.div>

            <motion.div
              className={styles.contactCard}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className={styles.contactIcon} style={{ fontSize: '2.5rem' }}>
                💬
              </div>
              <h3>WhatsApp</h3>
              <p>{schoolDetails.contact.whatsapp}</p>
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.addressCard}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3>📍 Our Location</h3>
            <p className={styles.addressText}>
              {schoolDetails.address.street}
              <br />
              {schoolDetails.address.city}, {schoolDetails.address.state} -{' '}
              {schoolDetails.address.pincode}
              <br />
              {schoolDetails.address.country}
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className={styles.footer}>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          &copy; 2025 {schoolDetails.name}. All rights reserved. | Nurturing young minds, building
          bright futures.
        </motion.p>
      </footer>
    </div>
  );
}
