'use client';

import React from 'react';
import Image from 'next/image';
import styles from './brochureTemplate.module.css';
import HeroImage1 from '../../../public/assets/hero/1.jpg';
import FounderImage from '../../../public/assets/about/director.jpg';
import Logo from '../../../public/assets/logo/logo.png';
import schoolDetails from '@/json/schooldetails';
import schoolDetailsEng from '@/json/schooldetails-eng';
import StarIcon from '@mui/icons-material/Star';
import PaletteIcon from '@mui/icons-material/Palette';
import ShieldIcon from '@mui/icons-material/Shield';
import SchoolIcon from '@mui/icons-material/School';
import CelebrationIcon from '@mui/icons-material/Celebration';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EventIcon from '@mui/icons-material/Event';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

interface TestimonialItem {
  name: string;
  role: string;
  quote: string;
}

interface BrochureTemplateProps {
  enquiryData?: {
    enquiry_number: string
    parent_name: string
    child_name: string
    phone: string
    program: string
    created_at: string
  }
}

const BrochureTemplate = ({ enquiryData }: BrochureTemplateProps) => {
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

  const getPaymentIcon = (term: string) => {
    const lowerTerm = term.toLowerCase();
    if (lowerTerm.includes('monthly')) return <AttachMoneyIcon sx={{ fontSize: 28, color: '#6a4c93' }} />;
    if (lowerTerm.includes('quarterly')) return <EventIcon sx={{ fontSize: 28, color: '#6a4c93' }} />;
    if (lowerTerm.includes('annual')) return <AccountBalanceIcon sx={{ fontSize: 28, color: '#6a4c93' }} />;
    return <CreditCardIcon sx={{ fontSize: 28, color: '#6a4c93' }} />;
  };

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
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <Image
            src={HeroImage1}
            alt={schoolDetails.name}
            className={styles.heroImage}
            priority
            fill
            style={{ objectFit: 'cover' }}
          />
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroTextContent}>
            <div className={styles.logoBox}>
              <Image
                src={Logo}
                alt={schoolDetails.name}
                className={styles.heroLogo}
                priority
              />
            </div>
            <h1 className={styles.heroTitle}>{schoolDetails.name}</h1>
            <p className={styles.heroSubtitle}>Play School</p>
            {enquiryData && (
              <div className={styles.studentInfo}>
                <div className={styles.infoBadge}>
                  <span className={styles.badgeLabel}>Welcome</span>
                  <span className={styles.badgeValue}>{enquiryData.child_name}</span>
                </div>
                <div className={styles.infoBadge}>
                  <span className={styles.badgeLabel}>Program</span>
                  <span className={styles.badgeValue}>{enquiryData.program}</span>
                </div>
                <div className={styles.infoBadge}>
                  <span className={styles.badgeLabel}>Enquiry ID</span>
                  <span className={styles.badgeValue}>{enquiryData.enquiry_number}</span>
                </div>
              </div>
            )}
            <p className={styles.heroTagline}>Where Learning Meets Fun and Adventure</p>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className={styles.section}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>Welcome to {schoolDetails.name}</h2>
          </div>
          <p className={styles.sectionDescription}>
            We are committed to creating a nurturing environment where young minds flourish. Our play school combines modern educational methods with traditional values, ensuring each child receives the foundation they need for future success.
          </p>
          <div className={styles.highlightGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.highlightCard}>
                <div className={styles.highlightIcon}>
                  {index === 0 && <PaletteIcon sx={{ fontSize: 36, color: '#6a4c93' }} />}
                  {index === 1 && <ShieldIcon sx={{ fontSize: 36, color: '#6a4c93' }} />}
                  {index === 2 && <SchoolIcon sx={{ fontSize: 36, color: '#6a4c93' }} />}
                  {index === 3 && <CelebrationIcon sx={{ fontSize: 36, color: '#6a4c93' }} />}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Overview Section */}
      <section className={styles.section}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>Our Programs</h2>
          </div>
          <div className={styles.programsOverviewGrid}>
            {schoolDetailsEng.feeStructure?.programs?.map((program) => (
              <div key={program.name} className={styles.programOverviewCard}>
                <div className={styles.programOverviewIcon}>
                  <MenuBookIcon sx={{ fontSize: 32, color: '#6a4c93' }} />
                </div>
                <h3 className={styles.programOverviewName}>{program.name}</h3>
                <p className={styles.programAgeGroup}>{program.ageGroup}</p>
                <p className={styles.programDescriptionBrochure}>{program.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Details Section */}
      <section className={styles.section} style={{ backgroundColor: '#f9f9f9' }}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>What's Included in Every Program</h2>
          </div>
          <div className={styles.programsDetailsGrid}>
            {schoolDetailsEng.feeStructure?.programs?.map((program) => (
              <div key={program.name} className={styles.programDetailCard}>
                <h3>{program.name}</h3>
                <ul className={styles.includesListBrochure}>
                  {program.includes.slice(0, 4).map((item, idx) => (
                    <li key={idx}> {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Director Section */}
      <section className={styles.section} style={{ backgroundColor: '#f9f9f9' }}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>From Our Founder</h2>
          </div>
          <div className={styles.directorBox}>
            <div className={styles.directorImageBox}>
              <Image
                src={FounderImage}
                alt={schoolDetails.director.name}
                className={styles.directorImageStyle}
              />
            </div>
            <div className={styles.directorTextBox}>
              <p className={styles.directorQuote}>
                &ldquo;As an educator with over 15 years of experience, I founded {schoolDetails.name} with a vision to create a space where children can learn, grow, and thrive. Our approach combines modern educational methods with traditional values.&rdquo;
              </p>
              <div className={styles.directorInfo}>
                <h3>{schoolDetails.director.name}</h3>
                <p>{schoolDetails.director.designation}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.section}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>What Parents Say</h2>
          </div>
          <div className={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className={styles.testimonialItem}>
                <div className={styles.starsRow}>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={styles.starIcon} sx={{ fontSize: 16, color: '#6a4c93' }} />
                  ))}
                </div>
                <p className={styles.testimonialText}>&quot;{testimonial.quote}&quot;</p>
                <h4 className={styles.testimonialAuthor}>{testimonial.name}</h4>
                <p className={styles.testimonialRole}>{testimonial.role}</p>
              </div>
            ))}
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
              <div className={styles.contactIcon}>
                <PhoneIcon sx={{ fontSize: 28, color: '#6a4c93' }} />
              </div>
              <h3>Phone</h3>
              <p>{schoolDetails.contact.phone}</p>
            </div>
            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>
                <EmailIcon sx={{ fontSize: 28, color: '#6a4c93' }} />
              </div>
              <h3>Email</h3>
              <p>{schoolDetails.contact.email}</p>
            </div>
            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>
                <WhatsAppIcon sx={{ fontSize: 28, color: '#6a4c93' }} />
              </div>
              <h3>WhatsApp</h3>
              <p>{schoolDetails.contact.whatsapp}</p>
            </div>
          </div>

          <div className={styles.addressCard}>
            <h3><LocationOnIcon sx={{ fontSize: 18, color: '#6a4c93', marginRight: '8px', verticalAlign: 'middle' }} /> Address</h3>
            <p className={styles.addressText}>
              {schoolDetails.address.street}<br />
              {schoolDetails.address.city}, {schoolDetails.address.state} - {schoolDetails.address.pincode}<br />
              {schoolDetails.address.country}
            </p>
          </div>

          <div className={styles.ctaBox}>
            <p>Visit us today and discover why {schoolDetails.name} is the perfect choice for your child's early education.</p>
          </div>
        </div>
      </section>

      
      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2026 {schoolDetails.name}. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BrochureTemplate;
