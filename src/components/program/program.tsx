    'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './program.module.css';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ToddlerProgramImage from '../../../public/assets/programs/toddler.jpg'
import NurseryProgramImage from '../../../public/assets/programs/nursery.jpg'
import PreKGProgramImage from '../../../public/assets/programs/prekg.jpg'
import KGProgramImage from '../../../public/assets/programs/kg.jpg'
import HeadingTitle from '../heading/headingtitle';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LineArt from '@/custom/lineart/lineart';
import en from '@/translations/en.json';
import hi from '@/translations/hi.json';
import programsEng from '@/data/programs-eng';
import programsHi from '@/data/programs-hi';
import { headingTitlesEng } from '@/data/headingtitles-eng';
import { headingTitlesHi } from '@/data/headingtitles-hi';

const Program = () => {
    const [activeProgram, setActiveProgram] = useState(0);
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

    const programs = language === 'hi' ? programsHi : programsEng;

    const headingTitles = language === 'hi' ? headingTitlesHi : headingTitlesEng;

    const admissionNow = () => {
        window.location.href = '/admission-form';
    }

    return (
        <section className={styles.programs}>
            
                <LineArt
                    circle={{
                        size: 200,
                        borderColor: 'var(--primary-yellow)',
                        borderWidth: 3,
                        borderStyle: 'dashed',
                        opacity: 1,
                        animationSpeed: 30,
                        top: '7%',
                        left: '80%',
                        icon: <LocalShippingOutlinedIcon sx={{ fontSize: 40, transform: 'scale(-1, 1)' }} />,
                        iconColor: 'var(--primary-purple)',
                        showIcon: true
                    }}
                    dot={{
                        size: 150,
                        color: 'var(--primary-yellow)',
                        opacity: 0.3,
                        animationSpeed: 6,
                        top: '80%',
                        left: '5%',
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
        


            <HeadingTitle text={headingTitles.programs} />

            <div className={styles.programTabs}>
                {programs.map((program, index) => (
                    <motion.button
                        key={program.title}
                        className={`${styles.tabButton} ${index === activeProgram ? styles.activeTab : ''}`}
                        onClick={() => setActiveProgram(index)}
                        style={{ '--tab-color': program.color } as any}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {program.title}
                    </motion.button>
                ))}
            </div>

            <motion.div
                className={styles.programContent}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                key={activeProgram}
            >
                <div className={styles.programInfo}>
                    <h3 className={styles.programTitle}>
                        {programs[activeProgram].title}
                        <div className={styles.ageGroupContainer}>
                            <span className={styles.ageLabel}>
                                Age:
                            </span>
                            <span className={styles.ageGroup}> {programs[activeProgram].ageGroup}</span>
                        </div>
                    </h3>
                    <p className={styles.description}>{programs[activeProgram].description}</p>

                    <div className={styles.features}>
                        {programs[activeProgram].features.map((feature, index) => (
                            <motion.div
                                key={feature}
                                className={styles.feature}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <span className={styles.featureIcon}>•</span>
                                {feature}
                            </motion.div>
                        ))}
                    </div>

                    <div className={styles.schedule}>
                        <span className={styles.scheduleIcon}><AccessTimeIcon /></span>
                        {programs[activeProgram].schedule}
                    </div>

                    <motion.button
                        className={styles.enrollButton}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={admissionNow}
                    >
                        Admission Now
                    </motion.button>
                </div>

                <div className={styles.programImageWrapper}>
                    <Image
                        src={programs[activeProgram].image}
                        alt={programs[activeProgram].title}
                        fill
                        className={styles.programImage}
                    />
                </div>
            </motion.div>
        </section>
    );
};

export default Program;