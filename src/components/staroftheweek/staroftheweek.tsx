'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaTimes, FaStar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Confetti from '@/components/confetti/confetti';
import styles from './staroftheweek.module.css';

export interface StarOfTheWeek {
    id: string;
    name: string;
    image_url: string;
    reason: string;
    class: string;
    start_date: string;
    end_date: string;
}

interface StarOfWeekProps {
    asSection?: boolean;
}

const StarOfWeek = ({ asSection = false }: StarOfWeekProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [starData, setStarData] = useState<StarOfTheWeek | null>(null);
    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        fetchCurrentStar();

        if (!asSection) {
            const timer = setTimeout(() => {
                setIsVisible(true);
                setShowConfetti(true);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [asSection]);

    const fetchCurrentStar = async () => {
        try {
            setLoading(true);
            const currentDate = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('star_of_the_week')
                .select('*')
                .lte('start_date', currentDate)
                .gte('end_date', currentDate)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error('Supabase error:', error);
                setStarData(null);
                return;
            }

            if (data) {
                console.log('Fetched data:', data);

                // Validate and process image URL
                if (data.image_url) {
                    try {
                        // Check if the URL is already a full URL or just a path
                        let imageUrl = data.image_url;

                        // If it's not a full URL, construct it
                        if (!imageUrl.startsWith('http')) {
                            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                            imageUrl = `${supabaseUrl}/storage/v1/object/public/star-of-week-images/${imageUrl}`;
                        }

                        // Verify the image URL is accessible
                        const response = await fetch(imageUrl, {
                            method: 'HEAD',
                            mode: 'no-cors'
                        });

                        data.image_url = imageUrl;
                        console.log('Image URL validated:', imageUrl);
                    } catch (e) {
                        console.error('Error validating image URL:', e);
                        data.image_url = '/assets/default-avatar.png';
                    }
                } else {
                    data.image_url = '/assets/default-avatar.png';
                }
            }

            setStarData(data);
        } catch (error) {
            console.error('Error fetching star of the week:', error);
            setStarData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setShowConfetti(false);
    };

    const StarContent = () => {
        if (loading) {
            return (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading...</p>
                </div>
            );
        }

        if (!starData) {
            return (
                <div className={styles.noData}>
                    <FaStar className={styles.noDataIcon} />
                    <p>No star of the week selected</p>
                </div>
            );
        }

        return (
            <div className={styles.content}>
                <div className={styles.header}>
                    <motion.div
                        initial={{ rotate: -20 }}
                        animate={{ rotate: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <FaStar className={styles.starIcon} />
                    </motion.div>
                    <h2>Star of the Week</h2>
                    <motion.div
                        initial={{ rotate: 20 }}
                        animate={{ rotate: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <FaStar className={styles.starIcon} />
                    </motion.div>
                </div>

                <motion.div
                    className={styles.imageWrapper}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {starData.image_url ? (
                        <div className={styles.imageContainer}>
                            <Image
                                src={starData.image_url}
                                alt={starData.name}
                                width={200}
                                height={200}
                                className={styles.studentImage}
                                priority
                                unoptimized
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = '/assets/default-avatar.png';
                                }}
                            />
                        </div>
                    ) : (
                        <div className={styles.imagePlaceholder}>
                            <FaStar />
                        </div>
                    )}
                </motion.div>

                <motion.div
                    className={styles.details}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <h3>{starData.name}</h3>
                    <p className={styles.class}>{starData.class}</p>
                    <p className={styles.reason}>{starData.reason}</p>
                    <p className={styles.date}>
                        {new Date(starData.start_date).toLocaleDateString()} - {new Date(starData.end_date).toLocaleDateString()}
                    </p>
                </motion.div>

                <div className={styles.decorativeElements}>
                    <motion.div
                        className={styles.star1}
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <FaStar />
                    </motion.div>
                    <motion.div
                        className={styles.star2}
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    >
                        <FaStar />
                    </motion.div>
                    <motion.div
                        className={styles.star3}
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                    >
                        <FaStar />
                    </motion.div>
                </div>
            </div>
        );
    };

    if (asSection) {
        return (
            <section className={styles.section}>
                <div className={styles.sectionContainer}>
                    <motion.div
                        className={styles.sectionContent}
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <StarContent />
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <>
            {/* Confetti Component - Triggered when popup is visible */}
            {showConfetti && (
                <Confetti
                    trigger={showConfetti}
                    duration={3000}
                    particleCount={2000}
                    spread={170}
                    intensity="high"
                    colors={['#6a4c93', '#ffd166', '#ff6b6b', '#4ecdc4', '#ffe66d']}
                />
            )}

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        className={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                    >
                        <motion.div
                            className={styles.popup}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", damping: 15, stiffness: 200 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.button
                                className={styles.closeButton}
                                onClick={handleClose}
                                aria-label="Close popup"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaTimes />
                            </motion.button>
                            <StarContent />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default StarOfWeek;