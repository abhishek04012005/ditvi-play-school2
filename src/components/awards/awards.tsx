'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaTimes, FaStar, FaHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { IoGridOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import styles from './awards.module.css';
import HeadingTitle from '../heading/headingtitle';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import Confetti from '@/components/confetti/confetti';
import LineArt from '@/custom/lineart/lineart';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';

export interface Award {
    id: string;
    name: string;
    award_type: 'weekly' | 'monthly' | 'yearly';
    message: string;
    date: string;
    is_show_on_home_page: boolean;
    like_count: number;
    image_url: string;
    created_date: string;
}

interface AwardsProps {
    asSection?: boolean;
    awardType?: 'weekly' | 'monthly' | 'yearly';
    isHomePage?: boolean;
}

const BUCKET = 'star-of-week-images';

const buildPublicUrl = (pathOrUrl?: string) => {
    if (!pathOrUrl) return '/assets/default-avatar.png';
    if (pathOrUrl.startsWith('http')) return pathOrUrl;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (supabaseUrl) {
        return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${pathOrUrl}`;
    }
    return pathOrUrl;
};

const getUserId = () => {
    if (typeof window === 'undefined') return 'server';
    let userId = localStorage.getItem('user_id');
    if (!userId) {
        userId = 'guest_' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem('user_id', userId);
    }
    return userId;
};

const Awards = ({ asSection = false, awardType = 'weekly', isHomePage = false }: AwardsProps) => {
    const [awards, setAwards] = useState<Award[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAward, setSelectedAward] = useState<Award | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [confettiKey, setConfettiKey] = useState(0);

    // like state maps for fast UI updates
    const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
    const [likesMap, setLikesMap] = useState<Record<string, number>>({});

    const swiperRef = useRef<SwiperType | null>(null);
    const autoRef = useRef<number | null>(null);
    const pauseRef = useRef(false);
    const confettiTimeoutRef = useRef<number | null>(null);

    // fetch awards
    const fetchAwards = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('awards')
                .select('*')
                .order('created_date', { ascending: false });

            if (error) {
                console.error('Supabase fetch error', error);
                setAwards([]);
                return;
            }
            const processed: Award[] = (data || []).map((d: any) => ({
                ...d,
                image_url: buildPublicUrl(d.image_url)
            }));
            setAwards(processed);

            // initialize likes
            const likes: Record<string, number> = {};
            processed.forEach((p) => (likes[p.id] = p.like_count || 0));
            setLikesMap(likes);

            // fetch user likes
            const userId = getUserId();
            const ids = processed.map((p) => p.id);
            if (ids.length) {
                const { data: likedRows } = await supabase
                    .from('award_likes')
                    .select('award_id')
                    .in('award_id', ids)
                    .eq('user_id', userId);
                const liked: Record<string, boolean> = {};
                (likedRows || []).forEach((r: any) => (liked[r.award_id] = true));
                setLikedMap(liked);
            } else {
                setLikedMap({});
            }
        } catch (err) {
            console.error('fetchAwards error', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAwards();
    }, [fetchAwards]);

    // Trigger confetti with 8 second duration
    const triggerConfetti = useCallback(() => {
        if (confettiTimeoutRef.current) {
            window.clearTimeout(confettiTimeoutRef.current);
        }

        setConfettiKey((prev) => prev + 1);
        setShowConfetti(true);

        confettiTimeoutRef.current = window.setTimeout(() => {
            setShowConfetti(false);
        }, 8000);
    }, []);

    const openPopupFor = (award: Award) => {
        setSelectedAward(award);
        setShowPopup(true);
        triggerConfetti();
    };

    const closePopup = () => {
        setShowPopup(false);
        setSelectedAward(null);
        setShowConfetti(false);
        if (confettiTimeoutRef.current) {
            window.clearTimeout(confettiTimeoutRef.current);
            confettiTimeoutRef.current = null;
        }
    };

    const toggleLike = async (award: Award) => {
        const userId = getUserId();
        const liked = !!likedMap[award.id];
        try {
            if (liked) {
                await supabase.from('award_likes').delete().eq('award_id', award.id).eq('user_id', userId);
                await supabase.from('awards').update({ like_count: Math.max(0, (likesMap[award.id] || 1) - 1) }).eq('id', award.id);
                setLikedMap((m) => ({ ...m, [award.id]: false }));
                setLikesMap((m) => ({ ...m, [award.id]: Math.max(0, (m[award.id] || 1) - 1) }));
            } else {
                await supabase.from('award_likes').insert([{ award_id: award.id, user_id: userId, created_at: new Date().toISOString() }]);
                await supabase.from('awards').update({ like_count: (likesMap[award.id] || 0) + 1 }).eq('id', award.id);
                setLikedMap((m) => ({ ...m, [award.id]: true }));
                setLikesMap((m) => ({ ...m, [award.id]: (m[award.id] || 0) + 1 }));
                triggerConfetti();
            }
        } catch (err) {
            console.error('toggleLike error', err);
            toast.error('Could not update like');
        }
    };

    // Award Card Component
    const AwardCard = ({ award, isSlider = false }: { award: Award; isSlider?: boolean }) => (
        <motion.div
            className={`${styles.awardCard} ${isSlider ? styles.sliderCard : ''}`}
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
        >
            {/* Homepage Badge */}
            {award.is_show_on_home_page && (
                <div className={styles.homepageBadge}>
                    <FaStar /> Homepage
                </div>
            )}

            <div className={styles.imageWrapper}>
                <Image
                    src={award.image_url || '/assets/default-avatar.png'}
                    alt={award.name}
                    width={400}
                    height={300}
                    className={styles.image}
                    unoptimized
                />
                <div className={styles.overlay}>
                    <div className={styles.overlayContent}>
                        <h3>{award.name}</h3>
                        <p>"{award.message}"</p>
                    </div>
                </div>
            </div>

            <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                    <h4>{award.name}</h4>
                    <span className={styles.badge}>
                        {award.award_type.charAt(0).toUpperCase() + award.award_type.slice(1)}
                    </span>
                </div>

                <p className={styles.cardMessage}>"{award.message}"</p>

                <div className={styles.cardMeta}>
                    <small className={styles.cardDate}>
                        {new Date(award.date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}
                    </small>
                </div>

                <div className={styles.cardActions}>
                    <motion.button
                        type="button"
                        className={`${styles.likeButton} ${likedMap[award.id] ? styles.liked : ''}`}
                        onClick={() => toggleLike(award)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Like award"
                    >
                        <motion.span
                            animate={likedMap[award.id] ? { scale: [1, 1.3, 1] } : {}}
                            transition={{ duration: 0.25 }}
                        >
                            <FaHeart />
                        </motion.span>
                        <span className={styles.likeCount}>{likesMap[award.id] ?? award.like_count ?? 0}</span>
                    </motion.button>
                    <motion.button
                        className={styles.viewButton}
                        onClick={() => openPopupFor(award)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <RemoveRedEyeOutlinedIcon />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );

    // Homepage Slider View
    if (isHomePage) {
        return (
            <>
                {/* Confetti */}
                <AnimatePresence>
                    {showConfetti && (
                        <motion.div
                            key={`confetti-${confettiKey}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Confetti trigger={showConfetti} duration={8000} particleCount={2500} intensity="high" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <section className={styles.homeSection}>
                    <LineArt
                        circle={{
                            size: 200,
                            borderColor: 'var(--primary-yellow)',
                            borderWidth: 3,
                            borderStyle: 'dashed',
                            opacity: 1,
                            animationSpeed: 30,
                            bottom: '7%',
                            left: '60%',
                            icon: <EmojiEventsOutlinedIcon sx={{ fontSize: 40, transform: 'scale(-1, 1)' }} />,
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
                    <div className={styles.container}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <HeadingTitle text="Spotlight" />
                        </motion.div>



                        <div
                            className={styles.sliderContainer}
                            onMouseEnter={() => { pauseRef.current = true; }}
                            onMouseLeave={() => { pauseRef.current = false; }}
                        >
                            <Swiper
                                modules={[Navigation, Autoplay, Pagination]}
                                slidesPerView="auto"
                                spaceBetween={24}
                                loop={awards.length > 1}
                                speed={800}
                                pagination={{
                                    clickable: true,
                                    dynamicBullets: true,
                                }}
                                navigation={{
                                    prevEl: `.${styles.prevButton}`,
                                    nextEl: `.${styles.nextButton}`,
                                }}
                                onSwiper={(swiper) => {
                                    swiperRef.current = swiper;
                                }}
                                autoplay={{
                                    delay: 4000,
                                    disableOnInteraction: false,
                                    pauseOnMouseEnter: true
                                }}
                                breakpoints={{
                                    320: { slidesPerView: 1, spaceBetween: 16 },
                                    768: { slidesPerView: 2, spaceBetween: 20 },
                                    1024: { slidesPerView: 3, spaceBetween: 24 }
                                }}
                                className={styles.swiper}
                            >
                                {loading ? (
                                    <SwiperSlide className={styles.swiperSlide}>
                                        <div className={styles.loading}>Loading...</div>
                                    </SwiperSlide>
                                ) : awards.length === 0 ? (
                                    <SwiperSlide className={styles.swiperSlide}>
                                        <div className={styles.noData}>No awards yet.</div>
                                    </SwiperSlide>
                                ) : (
                                    awards.map((award) => (
                                        <SwiperSlide key={award.id} className={styles.swiperSlide}>
                                            <AwardCard award={award} isSlider={true} />
                                        </SwiperSlide>
                                    ))
                                )}
                            </Swiper>

                            <motion.button
                                className={`${styles.navigationButton} ${styles.prevButton}`}
                                onClick={() => swiperRef.current?.slidePrev()}
                                aria-label="Previous slide"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaChevronLeft />
                            </motion.button>

                            <motion.button
                                className={`${styles.navigationButton} ${styles.nextButton}`}
                                onClick={() => swiperRef.current?.slideNext()}
                                aria-label="Next slide"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaChevronRight />
                            </motion.button>
                        </div>
                        <motion.div
                            className={styles.viewAllContainer}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <Link href="/spotlight" className={styles.viewAllButton}>
                                <IoGridOutline />
                                View Full Spotlight
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* Popup */}
                <AnimatePresence>
                    {showPopup && selectedAward && (
                        <motion.div
                            className={styles.popupOverlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closePopup}
                        >
                            <motion.div
                                className={styles.popupContainer}
                                initial={{ scale: 0.8, y: 50, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.8, y: 50, opacity: 0 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                onClick={(e) => e.stopPropagation()}
                                role="dialog"
                                aria-modal="true"
                            >
                                <motion.button
                                    type="button"
                                    className={styles.popupCloseBtn}
                                    onClick={closePopup}
                                    whileHover={{ rotate: 90, scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label="Close popup"
                                >
                                    <FaTimes />
                                </motion.button>

                                <motion.div
                                    className={styles.popupHeader}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className={styles.popupBadge}>⭐ {selectedAward.award_type.charAt(0).toUpperCase() + selectedAward.award_type.slice(1)}</div>
                                    <h2 className={styles.popupTitle}>Achievement Recognized</h2>
                                </motion.div>

                                <motion.div
                                    className={styles.popupContent}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className={styles.popupImageWrapper}>
                                        <Image
                                            src={selectedAward.image_url || '/assets/default-avatar.png'}
                                            alt={selectedAward.name}
                                            width={220}
                                            height={220}
                                            className={styles.popupImage}
                                            unoptimized
                                            priority
                                        />
                                    </div>

                                    <div className={styles.popupDetails}>
                                        <h3>{selectedAward.name}</h3>
                                        <p className={styles.popupMessage}>"{selectedAward.message}"</p>
                                        <p className={styles.popupDate}>
                                            {new Date(selectedAward.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>

                                        <motion.button
                                            type="button"
                                            className={`${styles.popupLikeButton} ${likedMap[selectedAward.id] ? styles.liked : ''}`}
                                            onClick={() => toggleLike(selectedAward)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <motion.span
                                                animate={likedMap[selectedAward.id] ? { scale: [1, 1.3, 1] } : {}}
                                                transition={{ duration: 0.25 }}
                                            >
                                                <FaHeart />
                                            </motion.span>
                                            <span>{likesMap[selectedAward.id] ?? selectedAward.like_count ?? 0}</span>
                                        </motion.button>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className={styles.popupFooter}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <p>🌟 Celebrating Excellence 🌟</p>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        );
    }

    // Full Page Grid View
    return (
        <>
            {/* Confetti */}
            <AnimatePresence>
                {showConfetti && (
                    <motion.div
                        key={`confetti-${confettiKey}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Confetti trigger={showConfetti} duration={8000} particleCount={2500} intensity="high" />
                    </motion.div>
                )}
            </AnimatePresence>

            <section className={styles.pageSection}>
                <LineArt
                    circle={{
                        size: 200,
                        borderColor: 'var(--primary-yellow)',
                        borderWidth: 3,
                        borderStyle: 'dashed',
                        opacity: 1,
                        animationSpeed: 30,
                        bottom: '0%',
                        left: '55%',
                        icon: <EmojiEventsOutlinedIcon sx={{ fontSize: 40, transform: 'scale(-1, 1)' }} />,
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
                <div className={styles.container}>
                    <HeadingTitle text="Spotlight" />


                    {/* Grid */}
                    <motion.div
                        className={styles.gridContainer}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, staggerChildren: 0.1 }}
                        viewport={{ once: true }}
                    >
                        {loading ? (
                            <div className={styles.loading}>Loading awards...</div>
                        ) : awards.length === 0 ? (
                            <div className={styles.noData}>No awards to display</div>
                        ) : (
                            awards.map((award) => (
                                <motion.div
                                    key={award.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    viewport={{ once: true }}
                                >
                                    <AwardCard award={award} isSlider={false} />
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Popup */}
            <AnimatePresence>
                {showPopup && selectedAward && (
                    <motion.div
                        className={styles.popupOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closePopup}
                    >
                        <motion.div
                            className={styles.popupContainer}
                            initial={{ scale: 0.8, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.8, y: 50, opacity: 0 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                        >
                            <motion.button
                                type="button"
                                className={styles.popupCloseBtn}
                                onClick={closePopup}
                                whileHover={{ rotate: 90, scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label="Close popup"
                            >
                                <FaTimes />
                            </motion.button>

                            <motion.div
                                className={styles.popupHeader}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className={styles.popupBadge}>⭐ {selectedAward.award_type.charAt(0).toUpperCase() + selectedAward.award_type.slice(1)}</div>
                                <h2 className={styles.popupTitle}>Achievement Recognized</h2>
                            </motion.div>

                            <motion.div
                                className={styles.popupContent}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className={styles.popupImageWrapper}>
                                    <Image
                                        src={selectedAward.image_url || '/assets/default-avatar.png'}
                                        alt={selectedAward.name}
                                        width={220}
                                        height={220}
                                        className={styles.popupImage}
                                        unoptimized
                                        priority
                                    />
                                </div>

                                <div className={styles.popupDetails}>
                                    <h3>{selectedAward.name}</h3>
                                    <p className={styles.popupMessage}>"{selectedAward.message}"</p>
                                    <p className={styles.popupDate}>
                                        {new Date(selectedAward.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>

                                    <motion.button
                                        type="button"
                                        className={`${styles.popupLikeButton} ${likedMap[selectedAward.id] ? styles.liked : ''}`}
                                        onClick={() => toggleLike(selectedAward)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <motion.span
                                            animate={likedMap[selectedAward.id] ? { scale: [1, 1.3, 1] } : {}}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <FaHeart />
                                        </motion.span>
                                        <span>{likesMap[selectedAward.id] ?? selectedAward.like_count ?? 0}</span>
                                    </motion.button>
                                </div>
                            </motion.div>

                            <motion.div
                                className={styles.popupFooter}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <p>🌟 Celebrating Excellence 🌟</p>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Awards;