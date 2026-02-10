'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import styles from './brochureTemplate.module.css';
import HeroImage1 from '../../../public/assets/hero/1.jpg';
import FounderImage from '../../../public/assets/about/director.jpg';
import Logo from '../../../public/assets/logo/logo.png';
import schoolDetails from '@/json/schooldetails';
import schoolDetailsEng from '@/json/schooldetails-eng';
import schoolDetailsHi from '@/json/schooldetails-hi';
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
    enquiry_number?: string
    admission_number?: string
    parent_name: string
    child_name: string
    phone: string
    program: string
    created_at: string
  }
}

const BrochureTemplate = ({ enquiryData }: BrochureTemplateProps) => {
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

  // Get student data from props or URL parameters
  const studentName = enquiryData?.child_name || searchParams?.get('child_name') || searchParams?.get('studentName') || ''
  const parentName = enquiryData?.parent_name || searchParams?.get('parent_name') || searchParams?.get('parentName') || ''
  const enquiryNumber = enquiryData?.enquiry_number || searchParams?.get('enquiry_number') || searchParams?.get('enquiryNumber') || ''
  const admissionNumber = enquiryData?.admission_number || searchParams?.get('admission_number') || searchParams?.get('admissionNumber') || ''
  const program = enquiryData?.program || searchParams?.get('program') || ''

  const currentSchoolDetails = language === 'en' ? schoolDetailsEng : schoolDetailsHi
  const testimonials: TestimonialItem[] = [
    {
      name: language === 'en' ? 'Shivam Sharma' : 'शिवम शर्मा',
      role: language === 'en' ? 'Parent of Rahul, Age 2' : 'राहुल के माता-पिता, आयु 2',
      quote: language === 'en' 
        ? `The progress Rahul has made since joining ${currentSchoolDetails.name} is incredible. He's more curious and confident every day.`
        : `राहुल ने ${currentSchoolDetails.name} में शामिल होने के बाद जो प्रगति की है वह अविश्वसनीय है। वह हर दिन अधिक जिज्ञासु और आत्मविश्वासी हो रहा है।`
    },
    {
      name: language === 'en' ? 'Ritika Kumari' : 'रितिका कुमारी',
      role: language === 'en' ? 'Parent of Riya, Age 3' : 'रिया की माता-पिता, आयु 3',
      quote: language === 'en' 
        ? `Riya absolutely loves going to ${currentSchoolDetails.name}. The playful learning approach keeps her engaged and happy.`
        : `रिया को ${currentSchoolDetails.name} जाना बहुत पसंद है। खेल के माध्यम से सीखने का दृष्टिकोण उसे लगे रहता है।`
    },
    {
      name: language === 'en' ? 'Akash Verma' : 'आकाश वर्मा',
      role: language === 'en' ? 'Parent of Samarth, Age 2' : 'समर्थ के माता-पिता, आयु 2',
      quote: language === 'en' 
        ? `${currentSchoolDetails.name} has created a nurturing space where Samarth feels safe and excited to learn new things.`
        : `${currentSchoolDetails.name} ने एक पोषणकारी स्थान बनाया है जहाँ समर्थ सुरक्षित और नई चीजें सीखने के लिए उत्सुक महसूस करता है।`
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
      title: language === 'en' ? 'Creative Learning' : 'रचनात्मक सीखना',
      description: language === 'en' ? 'Engaging activities that spark imagination and curiosity' : 'आकर्षक गतिविधियाँ जो कल्पना और जिज्ञासा को जगाती हैं'
    },
    {
      title: language === 'en' ? 'Safe Environment' : 'सुरक्षित वातावरण',
      description: language === 'en' ? 'Secure and nurturing space for your child' : 'आपके बच्चे के लिए सुरक्षित और पोषणकारी स्थान'
    },
    {
      title: language === 'en' ? 'Expert Teachers' : 'विशेषज्ञ शिक्षकों',
      description: language === 'en' ? 'Experienced and caring education professionals' : 'अनुभवी और देखभालशील शिक्षा पेशेवर'
    },
    {
      title: language === 'en' ? 'Fun Activities' : 'मजेदार गतिविधियाँ',
      description: language === 'en' ? 'Balanced mix of learning and playtime activities' : 'सीखने और खेल के समय की गतिविधियों का संतुलित मिश्रण'
    }
  ];

  return (
    <div className={styles.brochure}>
      {/* Language Toggle Section */}
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

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <Image
            src={HeroImage1}
            alt={currentSchoolDetails.name}
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
                alt={currentSchoolDetails.name}
                className={styles.heroLogo}
                priority
              />
            </div>
            <h1 className={styles.heroTitle}>{currentSchoolDetails.name}</h1>
            <p className={styles.heroSubtitle}>{language === 'en' ? 'Play School' : 'प्ले स्कूल'}</p>
            {(studentName || admissionNumber || enquiryNumber) && (
              <div className={styles.studentInfo} style={{ display: 'block', margin: '1.5rem 0', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px' }}>
                {studentName && (
                  <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white', marginBottom: '1rem', textAlign: 'center' }}>
                    {language === 'en' 
                      ? `Welcome ${studentName}, We appreciate you. ${admissionNumber ? 'Admission' : 'Enquiry'} No: ${admissionNumber || enquiryNumber}`
                      : `${studentName} का स्वागत है, हम आपकी सराहना करते हैं। ${admissionNumber ? 'प्रवेश' : 'पूछताछ'} क्रमांक: ${admissionNumber || enquiryNumber}`}
                  </p>
                )}
                {program && (
                  <p style={{ fontSize: '1rem', color: 'white', marginBottom: '0', textAlign: 'center' }}>
                    {language === 'en' ? 'Program' : 'कार्यक्रम'}: <strong>{program}</strong>
                  </p>
                )}
              </div>
            )}
            <p className={styles.heroTagline}>{language === 'en' ? 'Where Learning Meets Fun and Adventure' : 'जहाँ सीखना मजे और रोमांच से मिलता है'}</p>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className={styles.section}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>{language === 'en' ? `Welcome to ${currentSchoolDetails.name}` : `${currentSchoolDetails.name} में आपका स्वागत है`}</h2>
          </div>
          <p className={styles.sectionDescription}>
            {language === 'en' 
              ? 'We are committed to creating a nurturing environment where young minds flourish. Our play school combines modern educational methods with traditional values, ensuring each child receives the foundation they need for future success.'
              : 'हम एक पोषणकारी वातावरण बनाने के लिए प्रतिबद्ध हैं जहाँ युवा मन विकसित होते हैं। हमारा प्ले स्कूल आधुनिक शैक्षणिक तरीकों को पारंपरिक मूल्यों के साथ जोड़ता है, जिससे प्रत्येक बच्चे को भविष्य की सफलता के लिए आवश्यक नींव मिलती है।'}
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
            <h2>{language === 'en' ? 'Our Programs' : 'हमारे कार्यक्रम'}</h2>
          </div>
          <div className={styles.programsOverviewGrid}>
            {currentSchoolDetails.feeStructure?.programs?.map((program) => (
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
            <h2>{language === 'en' ? "What's Included in Every Program" : 'हर कार्यक्रम में क्या शामिल है'}</h2>
          </div>
          <div className={styles.programsDetailsGrid}>
            {currentSchoolDetails.feeStructure?.programs?.map((program) => (
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
            <h2>{language === 'en' ? 'From Our Founder' : 'हमारे संस्थापक से'}</h2>
          </div>
          <div className={styles.directorBox}>
            <div className={styles.directorImageBox}>
              <Image
                src={FounderImage}
                alt={currentSchoolDetails.director.name}
                className={styles.directorImageStyle}
              />
            </div>
            <div className={styles.directorTextBox}>
              <p className={styles.directorQuote}>
                &ldquo;{language === 'en'
                  ? `As an educator with over 15 years of experience, I founded ${currentSchoolDetails.name} with a vision to create a space where children can learn, grow, and thrive. Our approach combines modern educational methods with traditional values.`
                  : `15 वर्षों के शिक्षा अनुभव के साथ, मैंने ${currentSchoolDetails.name} की स्थापना एक दृष्टिकोण के साथ की कि बच्चे सीख सकें, बढ़ सकें और फल-फूल सकें। हमारा दृष्टिकोण आधुनिक शैक्षणिक तरीकों को पारंपरिक मूल्यों के साथ जोड़ता है।`}
                &rdquo;
              </p>
              <div className={styles.directorInfo}>
                <h3>{currentSchoolDetails.director.name}</h3>
                <p>{currentSchoolDetails.director.designation}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.section}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>{language === 'en' ? 'What Parents Say' : 'माता-पिता क्या कहते हैं'}</h2>
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
            <h2>{language === 'en' ? 'Get In Touch' : 'संपर्क में रहें'}</h2>
          </div>
          <div className={styles.contactCardsGrid}>
            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>
                <PhoneIcon sx={{ fontSize: 28, color: '#6a4c93' }} />
              </div>
              <h3>{language === 'en' ? 'Phone' : 'फोन'}</h3>
              <p>{currentSchoolDetails.contact.phone}</p>
            </div>
            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>
                <EmailIcon sx={{ fontSize: 28, color: '#6a4c93' }} />
              </div>
              <h3>{language === 'en' ? 'Email' : 'ईमेल'}</h3>
              <p>{currentSchoolDetails.contact.email}</p>
            </div>
            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>
                <WhatsAppIcon sx={{ fontSize: 28, color: '#6a4c93' }} />
              </div>
              <h3>WhatsApp</h3>
              <p>{currentSchoolDetails.contact.whatsapp}</p>
            </div>
          </div>

          <div className={styles.addressCard}>
            <h3><LocationOnIcon sx={{ fontSize: 18, color: '#6a4c93', marginRight: '8px', verticalAlign: 'middle' }} /> {language === 'en' ? 'Address' : 'पता'}</h3>
            <p className={styles.addressText}>
              {currentSchoolDetails.address.street}<br />
              {currentSchoolDetails.address.city}, {currentSchoolDetails.address.state} - {currentSchoolDetails.address.pincode}<br />
              {currentSchoolDetails.address.country}
            </p>
          </div>

          <div className={styles.ctaBox}>
            <p>{language === 'en' 
              ? `Visit us today and discover why ${currentSchoolDetails.name} is the perfect choice for your child's early education.`
              : `आज ही हमारे पास आएं और जानें कि ${currentSchoolDetails.name} आपके बच्चे की प्रारंभिक शिक्षा के लिए सही विकल्प क्यों है।`}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2026 {currentSchoolDetails.name}. {language === 'en' ? 'All rights reserved.' : 'सर्वाधिकार सुरक्षित।'}</p>
      </footer>
    </div>
  );
};

export default BrochureTemplate;
