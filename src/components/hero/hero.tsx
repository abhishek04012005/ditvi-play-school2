'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './hero.module.css';
import HeroImage1 from '../../../public/assets/hero/1.jpg';
import HeroImage2 from '../../../public/assets/hero/2.jpg';
import HeroImage3 from '../../../public/assets/hero/3.jpg';
import schoolDetails from '@/json/schooldetails';
import en from '@/translations/en.json';
import hi from '@/translations/hi.json';



const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
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

  const slides = [
    {
      image: HeroImage1,
      title: t('hero.title'),
      subtitle: t('hero.subtitle'),
      description: t('hero.description'),
      ctaText: t('nav.programs'),
      ctaLink: '/programs'
    },
    {
      image: HeroImage2,
      title: t('about.mission'),
      subtitle: t('about.title'),
      description: t('hero.subtitle'),
      ctaText: t('nav.admission'),
      ctaLink: '/admission-form'
    },
    {
      image: HeroImage3,
      title: t('contact.title'),
      subtitle: t('contact.subtitle'),
      description: t('footer.aboutSchool'),
      ctaText: t('nav.contact'),
      ctaLink: '/contact'
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (!isHovered) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [isHovered]);

  return (
    <section 
      className={styles.hero}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode='wait'>
        {slides.map((slide, index) => (
          index === currentSlide && (
            <motion.div
              key={index}
              className={styles.slide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.7 }}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className={styles.image}
              />
              <div className={styles.overlay} />
              <motion.div 
                className={styles.content}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <motion.h1 
                  className={styles.title}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {slide.title}
                  <motion.span 
                    className={styles.subtitle}
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    {slide.subtitle}
                  </motion.span>
                </motion.h1>
                <motion.p 
                  className={styles.description}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  {slide.description}
                </motion.p>
                <Link href={slide.ctaLink}>
                  <motion.button 
                    className={styles.cta}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {slide.ctaText}
                    <span className={styles.ctaArrow}>→</span>
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      <div className={styles.navigation}>
        <motion.button 
          className={`${styles.navBtn} ${styles.prevBtn}`}
          onClick={prevSlide}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span>←</span>
        </motion.button>
        <motion.button 
          className={`${styles.navBtn} ${styles.nextBtn}`}
          onClick={nextSlide}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span>→</span>
        </motion.button>
      </div>

      <div className={styles.indicators}>
        {slides.map((_, index) => (
          <motion.button
            key={index}
            className={`${styles.indicator} ${
              index === currentSlide ? styles.activeIndicator : ''
            }`}
            onClick={() => setCurrentSlide(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;