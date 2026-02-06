'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from './about.module.css';
import FounderImage from '../../../public/assets/about/director.jpg'
import HeadingTitle from '../heading/headingtitle';
import schoolDetails from '@/json/schooldetails';
import schoolDetailsHi from '@/json/schooldetails-hi';
import LineArt from '@/custom/lineart/lineart';
import LocalFloristOutlinedIcon from '@mui/icons-material/LocalFloristOutlined';
import en from '@/translations/en.json';
import hi from '@/translations/hi.json';
import { aboutFeaturesEng, founderMessageEng } from '@/data/about-eng';
import { aboutFeaturesHi, founderMessageHi } from '@/data/about-hi';
import { sectionTitlesEng } from '@/data/sectiontitles-eng';
import { sectionTitlesHi } from '@/data/sectiontitles-hi';


const About = () => {
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

  const features = language === 'hi' ? aboutFeaturesHi : aboutFeaturesEng;
  const founderMessage = language === 'hi' ? founderMessageHi : founderMessageEng;
  const sectionTitles = language === 'hi' ? sectionTitlesHi : sectionTitlesEng;



  return (
    <>
      <section className={styles.about}>
        <LineArt
          circle={{
            size: 200,
            borderColor: 'var(--primary-yellow)',
            borderWidth: 3,
            borderStyle: 'dashed',
            opacity: 1,
            animationSpeed: 30,
            bottom: '0%',
            left: '2%',
            icon: <LocalFloristOutlinedIcon sx={{ fontSize: 40, transform: 'scale(-1, 1)' }} />,
            iconColor: 'var(--primary-purple)',
            showIcon: true
          }}
          dot={{
            size: 150,
            color: 'var(--primary-yellow)',
            opacity: 0.3,
            animationSpeed: 6,
            top: '10%',
            right: '5%',
            blur: 60,
            show: true
          }}
          squiggly={{
            size: 100,
            color: 'var(--primary-purple)',
            opacity: 0.1,
            animationSpeed: 8,
            top: '30%',
            left: '2%',
            show: true,
            reverse: true
          }}
          zIndex={1}
        />
        <motion.div
          className={styles.aboutContent}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <HeadingTitle text={t('about.title')} />
          <p className={styles.aboutDescription}>
            {t('about.description')}
          </p>
        </motion.div>

        <div className={styles.featuresGrid}>
          {features.map((feature, index) => {
            const Icon = feature.icon as any;
            return (
              <motion.div
                key={feature.title}
                className={styles.featureCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={styles.featureIcon}>
                  {typeof feature.icon === 'string' ? (
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      width={40}
                      height={40}
                    />
                  ) : (
                    <Icon className={styles.featureIconsInner} fontSize="large" aria-label={feature.title} sx={{ color: 'var(--primary-yellow)' }} />
                  )}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>


      <section className={styles.founderSection}>
        <motion.div
          className={styles.founderContent}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className={styles.founderImageWrapper}>
            <Image
              src={founderMessage.image}
              alt={founderMessage.name}
              fill
              className={styles.founderImage}
            />
          </div>
          <div className={styles.founderMessage}>
            <h2 className={styles.sectionTitle}>{sectionTitles.founderMessage}</h2>
            <p className={styles.messageText}>{founderMessage.message}</p>
            <div className={styles.founderInfo}>
              <h3>{founderMessage.name}</h3>
              <p>{founderMessage.position}</p>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default About;