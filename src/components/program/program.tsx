'use client';
import { useState } from 'react';
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

const Program = () => {
    const [activeProgram, setActiveProgram] = useState(0);

    const programs = [
        {
            title: "Toddler Program",
            ageGroup: "1.5 - 2.5 Years",
            description: "Early development focused on sensory exploration and basic social skills.",
            features: [
                "Sensory Activities",
                "Basic Language Development",
                "Motor Skills Development",
                "Social Interaction",
            ],
            image: ToddlerProgramImage,
            schedule: "2-3 hours daily",
            color: "var(--primary-yellow)"
        },
        {
            title: "Nursery Program",
            ageGroup: "2.5 - 3.5 Years",
            description: "Structured learning with emphasis on creativity and independence.",
            features: [
                "Creative Arts & Crafts",
                "Pre-Writing Skills",
                "Number Concepts",
                "Physical Activities",
            ],
            image: NurseryProgramImage,
            schedule: "3-4 hours daily",
            color: "var(--primary-yellow)"
        },
        {
            title: "Pre-KG Program",
            ageGroup: "3.5 - 4.5 Years",
            description: "Comprehensive preparation for kindergarten with focus on academic and social skills.",
            features: [
                "Early Reading & Writing",
                "Basic Mathematics",
                "Science Exploration",
                "Social Development",
            ],
            image: PreKGProgramImage,
            schedule: "4-5 hours daily",
            color: "var(--primary-yellow)"
        },
        {
            title: "Kindergarten Readiness Program",
            ageGroup: "4.5 - 5.5 Years",
            description: "Focused readiness curriculum that builds confidence, independence, and foundational academic skills for a smooth transition to kindergarten.",
            features: [
                "Advanced Pre-Reading & Phonics",
                "Early Math Concepts & Problem Solving",
                "Structured Classroom Routines",
                "Emotional Regulation & Peer Skills",
            ],
            image: KGProgramImage,
            schedule: "5-6 hours daily",
            color: "var(--primary-yellow)"
        }
    ];

    return (
        <section className={styles.programs}>
            {/* <div className={styles.decorativeWave}>
                <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fill="var(--primary-yellow)"
                        fillOpacity="1"
                        d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>
                </svg>
            </div> */}

            <div className={styles.lineArt}>
                <div className={styles.circle}>
                    <div className={styles.circleInner}>
                        <LocalShippingOutlinedIcon sx={{
                            fontSize: 40,
                            transform: 'scale(-1, 1)' // This creates horizontal mirror effect
                        }} />
                    </div>
                </div>
                <div className={styles.dot}></div>
                <div className={styles.squiggly}></div>
            </div>

            <HeadingTitle text="Our Programs" />

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