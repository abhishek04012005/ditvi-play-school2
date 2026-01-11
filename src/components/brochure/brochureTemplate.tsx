'use client';

import React from 'react';
import Image from 'next/image';
import styles from './brochureTemplate.module.css';
import HeroImage1 from '../../../public/assets/hero/1.jpg';
import FounderImage from '../../../public/assets/about/director.jpg';
import schoolDetails from '@/json/schooldetails';
import { FaStar } from 'react-icons/fa';

interface TestimonialItem {
  name: string;
  role: string;
  quote: string;
}

const BrochureTemplate = () => {
  const testimonials: TestimonialItem[] = [
    {
      name: 'Shivam Sharma',
      role: 'Parent of Rahul, Age 2',
      quote: `The progress Rahul has made since joining ${schoolDetails.name} is incredible. He's more curious and confident every day.`
    },
    {
      name: 'Ritika Kumari',
      role: 'Parent of Riya, Age 3',
      quote: `Riya absolutely loves going to ${schoolDetails.name}. The playful learning approach keeps her engaged and happy.`
    },
    {
      name: 'Akash Verma',
      role: 'Parent of Samarth, Age 2',
      quote: `${schoolDetails.name} has created a nurturing space where Samarth feels safe and excited to learn new things.`
    }
  ];

  const features = [
    {
      title: 'Creative Learning',
      description: 'Engaging activities that spark imagination and curiosity'
    },
    {
      title: 'Safe Environment',
      description: 'Secure and nurturing space for your child'
    },
    {
      title: 'Expert Teachers',
      description: 'Experienced and caring education professionals'
    },
    {
      title: 'Fun Activities',
      description: 'Balanced mix of learning and playtime activities'
    }
  ];

  return (
    <div className={styles.brochure}>
      {/* Page 1: Cover Page */}
      <div className={styles.page}>
        <div className={styles.coverPage}>
          <div className={styles.coverContent}>
            <Image
              src={HeroImage1}
              alt={schoolDetails.name}
              className={styles.coverImage}
              priority
            />
            <div className={styles.coverOverlay}>
              <h1 className={styles.schoolName}>{schoolDetails.name}</h1>
              <p className={styles.coverSubtitle}>Play School</p>
              <p className={styles.coverTagline}>Where Learning Meets Fun and Adventure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Page 2: Welcome & About */}
      <div className={styles.page}>
        <div className={styles.pageContent}>
          <div className={styles.welcomeSection}>
            <h2>Welcome to {schoolDetails.name}</h2>
            <p className={styles.welcomeText}>
              We are committed to creating a nurturing environment where young minds flourish. Our play school combines modern educational methods with traditional values, ensuring each child receives the foundation they need for future success.
            </p>
          </div>

          <div className={styles.featureGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureBox}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Page 3: Programs */}
      <div className={styles.page}>
        <div className={styles.pageContent}>
          <h2>Our Programs</h2>
          <div className={styles.programsGrid}>
            {schoolDetails.programs.map((program, index) => (
              <div key={index} className={styles.programCard}>
                <div className={styles.programName}>{program.name}</div>
                <p className={styles.programDescription}>{program.description}</p>
              </div>
            ))}
          </div>
          
          <div className={styles.directorSection}>
            <h3>From Our Founder</h3>
            <div className={styles.directorContent}>
              <Image
                src={FounderImage}
                alt={schoolDetails.director.name}
                className={styles.directorImage}
              />
              <div className={styles.directorText}>
                <p className={styles.directorMessage}>
                  As an educator with over 15 years of experience, I founded {schoolDetails.name} with a vision to create a space &ldquo;where&rdquo; children can learn, grow, and thrive. Our approach combines modern educational methods with traditional values, ensuring each child receives the foundation they need for future success.
                </p>
                <p className={styles.directorName}>{schoolDetails.director.name}</p>
                <p className={styles.directorTitle}>{schoolDetails.director.designation}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page 4: Testimonials */}
      <div className={styles.page}>
        <div className={styles.pageContent}>
          <h2>What Parents Say</h2>
          <div className={styles.testimonialsList}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className={styles.testimonialCard}>
                <div className={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={styles.star} />
                  ))}
                </div>
                <p className={styles.quote}>&quot;{testimonial.quote}&quot;</p>
                <p className={styles.testimonialName}>{testimonial.name}</p>
                <p className={styles.testimonialRole}>{testimonial.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Page 5: Contact & Footer */}
      <div className={styles.page}>
        <div className={styles.pageContent}>
          <h2>Get In Touch</h2>
          
          <div className={styles.contactGrid}>
            <div className={styles.contactBox}>
              <h4>📱 Phone</h4>
              <p>{schoolDetails.contact.phone}</p>
            </div>
            <div className={styles.contactBox}>
              <h4>✉️ Email</h4>
              <p>{schoolDetails.contact.email}</p>
            </div>
            <div className={styles.contactBox}>
              <h4>💬 WhatsApp</h4>
              <p>{schoolDetails.contact.whatsapp}</p>
            </div>
          </div>

          <div className={styles.addressSection}>
            <h4>📍 Address</h4>
            <p className={styles.address}>
              {schoolDetails.address.street}<br />
              {schoolDetails.address.city}, {schoolDetails.address.state} - {schoolDetails.address.pincode}<br />
              {schoolDetails.address.country}
            </p>
          </div>

          <div className={styles.footerInfo}>
            <p className={styles.footerText}>
              Visit us today and discover why {schoolDetails.name} is the perfect choice for your child&apos;s early education.
            </p>
          </div>

          <div className={styles.footer}>
            <p>&copy; 2025 {schoolDetails.name}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrochureTemplate;
