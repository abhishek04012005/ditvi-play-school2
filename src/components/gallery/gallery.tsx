'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import { IoGridOutline } from 'react-icons/io5';
import { FaChevronLeft, FaChevronRight, FaSearch, FaTimes, FaPlay, FaYoutube, FaInstagram, FaVideo } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './gallery.module.css';
import { GalleryItem, YouTubeVideo, InstagramVideo, NormalVideo } from '../../json/gallery';
import HeadingTitle from '../heading/headingtitle';

interface GalleryProps {
    items: GalleryItem[];
    youtubeVideos?: YouTubeVideo[];
    instagramVideos?: InstagramVideo[];
    normalVideos?: NormalVideo[];
    isHomePage?: boolean;
}

type SelectedMedia = GalleryItem | YouTubeVideo | InstagramVideo | NormalVideo | null;
type MediaType = 'photo' | 'youtube' | 'instagram' | 'video' | null;

const Gallery = ({ items, youtubeVideos = [], instagramVideos = [], normalVideos = [], isHomePage = false }: GalleryProps) => {
    const swiperRef = useRef<SwiperType | null>(null);
    const [selectedMedia, setSelectedMedia] = useState<SelectedMedia>(null);
    const [mediaType, setMediaType] = useState<MediaType>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'photos' | 'youtube' | 'instagram' | 'videos'>('photos');

    const handleMediaClick = (media: SelectedMedia, type: MediaType) => {
        setSelectedMedia(media);
        setMediaType(type);
        if (type === 'photo') {
            setCurrentImageIndex(items.findIndex(i => i.id === (media as GalleryItem).id));
        }
    };

    const handleNextImage = () => {
        if (mediaType === 'photo') {
            const nextIndex = (currentImageIndex + 1) % items.length;
            setCurrentImageIndex(nextIndex);
            setSelectedMedia(items[nextIndex]);
        }
    };

    const handlePrevImage = () => {
        if (mediaType === 'photo') {
            const prevIndex = (currentImageIndex - 1 + items.length) % items.length;
            setCurrentImageIndex(prevIndex);
            setSelectedMedia(items[prevIndex]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowRight' && mediaType === 'photo') handleNextImage();
        if (e.key === 'ArrowLeft' && mediaType === 'photo') handlePrevImage();
        if (e.key === 'Escape') {
            setSelectedMedia(null);
            setMediaType(null);
        }
    };

    // Homepage Slider View
    if (isHomePage) {
        return (
            <section className={styles.galleryHome}>
                <div className={styles.container}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <HeadingTitle text="Our Gallery" />
                    </motion.div>

                    {/* Photos Slider */}
                    <div className={styles.sliderSection}>
                        <h3 className={styles.sliderTitle}>📸 Photo Gallery</h3>
                        <div className={styles.sliderContainer}>
                            <Swiper
                                modules={[Navigation, Autoplay, Pagination]}
                                slidesPerView="auto"
                                centeredSlides={true}
                                spaceBetween={30}
                                loop={true}
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
                                    delay: 3000,
                                    disableOnInteraction: false,
                                    pauseOnMouseEnter: true
                                }}
                                breakpoints={{
                                    320: { slidesPerView: 1, spaceBetween: 20 },
                                    768: { slidesPerView: 2, spaceBetween: 30 },
                                    1024: { slidesPerView: 3, spaceBetween: 30 }
                                }}
                                className={styles.swiper}
                            >
                                {items.map((item) => (
                                    <SwiperSlide key={item.id} className={styles.swiperSlide}>
                                        <motion.div
                                            className={styles.galleryCard}
                                            whileHover={{ y: -10 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className={styles.imageWrapper}>
                                                <Image
                                                    src={item.image}
                                                    alt={item.title}
                                                    width={400}
                                                    height={300}
                                                    className={styles.image}
                                                    priority
                                                />
                                            </div>
                                            <div className={styles.cardContent}>
                                                <h4>{item.title}</h4>
                                                <p>{item.description}</p>
                                            </div>
                                        </motion.div>
                                    </SwiperSlide>
                                ))}
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
                    </div>

                    {/* YouTube Videos Slider */}
                    {youtubeVideos.length > 0 && (
                        <div className={styles.sliderSection}>
                            <h3 className={styles.sliderTitle}>
                                <FaYoutube className={styles.sliderIcon} />
                                Featured Videos
                            </h3>
                            <div className={styles.sliderContainer}>
                                <Swiper
                                    modules={[Navigation, Autoplay, Pagination]}
                                    slidesPerView="auto"
                                    centeredSlides={true}
                                    spaceBetween={30}
                                    loop={true}
                                    speed={800}
                                    pagination={{ clickable: true, dynamicBullets: true }}
                                    navigation={{
                                        prevEl: `.${styles.videoPrevButton}`,
                                        nextEl: `.${styles.videoNextButton}`,
                                    }}
                                    autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                                    breakpoints={{
                                        320: { slidesPerView: 1, spaceBetween: 20 },
                                        768: { slidesPerView: 2, spaceBetween: 30 },
                                        1024: { slidesPerView: 3, spaceBetween: 30 }
                                    }}
                                    className={styles.swiper}
                                >
                                    {youtubeVideos.map((video) => (
                                        <SwiperSlide key={video.id} className={styles.swiperSlide}>
                                            <motion.div
                                                className={styles.videoCard}
                                                whileHover={{ y: -10 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className={styles.videoWrapper}>
                                                    <Image
                                                        src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
                                                        alt={video.title}
                                                        width={400}
                                                        height={300}
                                                        className={styles.image}
                                                    />
                                                    <div className={styles.playButtonOverlay}>
                                                        <div className={styles.playButtonLarge}>▶</div>
                                                    </div>
                                                </div>
                                                <div className={styles.cardContent}>
                                                    <h4>{video.title}</h4>
                                                    <p>{video.description}</p>
                                                </div>
                                            </motion.div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                                <motion.button
                                    className={`${styles.navigationButton} ${styles.videoPrevButton}`}
                                    onClick={() => swiperRef.current?.slidePrev()}
                                    aria-label="Previous video"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FaChevronLeft />
                                </motion.button>

                                <motion.button
                                    className={`${styles.navigationButton} ${styles.videoNextButton}`}
                                    onClick={() => swiperRef.current?.slideNext()}
                                    aria-label="Next video"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FaChevronRight />
                                </motion.button>
                            </div>
                        </div>
                    )}

                    {/* View All Button */}
                    <motion.div
                        className={styles.viewAllContainer}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <Link href="/gallery" className={styles.viewAllButton}>
                            <IoGridOutline />
                            View Full Gallery
                        </Link>
                    </motion.div>
                </div>
            </section>
        );
    }

    // Full Gallery Page View
    return (
        <section className={styles.galleryPage}>
            <div className={styles.container}>
                <HeadingTitle text="Gallery" />

                {/* Tab Navigation */}
                <motion.div
                    className={styles.tabContainer}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className={styles.tabButtons}>
                        <motion.button
                            className={`${styles.tabButton} ${activeTab === 'photos' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('photos')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <IoGridOutline />
                            Photos
                            <span className={styles.tabCount}>{items.length}</span>
                        </motion.button>
                        <motion.button
                            className={`${styles.tabButton} ${activeTab === 'youtube' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('youtube')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaYoutube />
                            YouTube
                            <span className={styles.tabCount}>{youtubeVideos.length}</span>
                        </motion.button>
                        <motion.button
                            className={`${styles.tabButton} ${activeTab === 'instagram' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('instagram')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaInstagram />
                            Instagram
                            <span className={styles.tabCount}>{instagramVideos.length}</span>
                        </motion.button>
                        <motion.button
                            className={`${styles.tabButton} ${activeTab === 'videos' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('videos')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaVideo />
                            Videos
                            <span className={styles.tabCount}>{normalVideos.length}</span>
                        </motion.button>
                    </div>
                </motion.div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={styles.tabContent}
                >
                    {/* Photos Grid */}
                    {activeTab === 'photos' && (
                        <div className={styles.gridContainer}>
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    className={styles.galleryCard}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className={styles.imageWrapper}>
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            width={400}
                                            height={300}
                                            className={styles.image}
                                        />
                                        <div className={styles.overlay}>
                                            <div className={styles.overlayContent}>
                                                <h3>{item.title}</h3>
                                                <p>{item.description}</p>
                                                <button
                                                    className={styles.viewButton}
                                                    onClick={() => handleMediaClick(item, 'photo')}
                                                >
                                                    <FaSearch />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* YouTube Videos Grid */}
                    {activeTab === 'youtube' && (
                        <div className={styles.gridContainer}>
                            {youtubeVideos.map((video) => (
                                <motion.div
                                    key={video.id}
                                    className={styles.videoCardGrid}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className={styles.videoWrapper}>
                                        <Image
                                            src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
                                            alt={video.title}
                                            width={400}
                                            height={300}
                                            className={styles.image}
                                        />
                                        <div className={styles.videoOverlay}>
                                            <motion.button
                                                className={styles.playButton}
                                                onClick={() => handleMediaClick(video, 'youtube')}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <FaPlay />
                                            </motion.button>
                                            <div className={styles.videoBadge}>
                                                <FaYoutube />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.videoInfo}>
                                        <h3>{video.title}</h3>
                                        <p>{video.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Instagram Videos Grid */}
                    {activeTab === 'instagram' && (
                        <div className={styles.gridContainer}>
                            {instagramVideos.map((video) => (
                                <motion.div
                                    key={video.id}
                                    className={styles.videoCardGrid}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className={styles.videoWrapper}>
                                        {video.thumbnail && (
                                            <Image
                                                src={video.thumbnail}
                                                alt={video.title}
                                                width={400}
                                                height={300}
                                                className={styles.image}
                                            />
                                        )}
                                        <div className={styles.videoOverlay}>
                                            <motion.button
                                                className={styles.playButton}
                                                onClick={() => handleMediaClick(video, 'instagram')}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <FaPlay />
                                            </motion.button>
                                            <div className={styles.videoBadge}>
                                                <FaInstagram />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.videoInfo}>
                                        <h3>{video.title}</h3>
                                        <p>{video.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Normal Videos Grid */}
                    {activeTab === 'videos' && (
                        <div className={styles.gridContainer}>
                            {normalVideos.map((video) => (
                                <motion.div
                                    key={video.id}
                                    className={styles.videoCardGrid}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className={styles.videoWrapper}>
                                        <Image
                                            src={video.thumbnail}
                                            alt={video.title}
                                            width={400}
                                            height={300}
                                            className={styles.image}
                                        />
                                        <div className={styles.videoOverlay}>
                                            <motion.button
                                                className={styles.playButton}
                                                onClick={() => handleMediaClick(video, 'video')}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <FaPlay />
                                            </motion.button>
                                            <div className={styles.videoBadge}>
                                                <FaVideo />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.videoInfo}>
                                        <h3>{video.title}</h3>
                                        <p>{video.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Image Lightbox */}
            <AnimatePresence>
                {selectedMedia && mediaType === 'photo' && (
                    <motion.div
                        className={styles.lightboxOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setSelectedMedia(null); setMediaType(null); }}
                        onKeyDown={handleKeyDown}
                        tabIndex={0}
                    >
                        <motion.div
                            className={styles.lightboxContent}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.button
                                className={styles.closeButton}
                                onClick={() => { setSelectedMedia(null); setMediaType(null); }}
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <FaTimes />
                            </motion.button>

                            <div className={styles.mainImageContainer}>
                                <motion.div
                                    key={(selectedMedia as GalleryItem).id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className={styles.mainImageWrapper}
                                >
                                    <Image
                                        src={(selectedMedia as GalleryItem).image}
                                        alt={(selectedMedia as GalleryItem).title}
                                        width={900}
                                        height={600}
                                        className={styles.mainImage}
                                        priority
                                    />
                                </motion.div>
                            </div>

                            <motion.div
                                className={styles.lightboxDetails}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2>{(selectedMedia as GalleryItem).title}</h2>
                                <p>{(selectedMedia as GalleryItem).description}</p>
                                <div className={styles.imageCounter}>
                                    {currentImageIndex + 1} / {items.length}
                                </div>
                            </motion.div>

                            <motion.button
                                className={`${styles.lightboxNavButton} ${styles.prevNavButton}`}
                                onClick={handlePrevImage}
                                whileHover={{ scale: 1.1, x: -5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaChevronLeft />
                            </motion.button>

                            <motion.button
                                className={`${styles.lightboxNavButton} ${styles.nextNavButton}`}
                                onClick={handleNextImage}
                                whileHover={{ scale: 1.1, x: 5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaChevronRight />
                            </motion.button>

                            <div className={styles.thumbnailStrip}>
                                {items.map((item, index) => (
                                    <motion.button
                                        key={item.id}
                                        className={`${styles.thumbnail} ${index === currentImageIndex ? styles.activeThumbnail : ''}`}
                                        onClick={() => {
                                            setCurrentImageIndex(index);
                                            setSelectedMedia(item);
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            width={60}
                                            height={60}
                                            className={styles.thumbnailImage}
                                        />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Video Lightbox */}
            <AnimatePresence>
                {selectedMedia && mediaType && mediaType !== 'photo' && (
                    <motion.div
                        className={styles.videoLightboxOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setSelectedMedia(null); setMediaType(null); }}
                        onKeyDown={handleKeyDown}
                        tabIndex={0}
                    >
                        <motion.div
                            className={styles.videoLightboxContent}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.button
                                className={styles.closeButton}
                                onClick={() => { setSelectedMedia(null); setMediaType(null); }}
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <FaTimes />
                            </motion.button>

                            <div className={styles.videoPlayerContainer}>
                                {mediaType === 'youtube' && (
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${(selectedMedia as YouTubeVideo).videoId}?autoplay=1`}
                                        title={(selectedMedia as YouTubeVideo).title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className={styles.youtubePlayer}
                                    ></iframe>
                                )}
                                {mediaType === 'instagram' && (
                                    <div className={styles.instagramPlayer}>
                                        <div dangerouslySetInnerHTML={{
                                            __html: (selectedMedia as InstagramVideo).embedUrl
                                        }} />
                                    </div>
                                )}
                                {mediaType === 'video' && (
                                    <video
                                        width="100%"
                                        height="100%"
                                        controls
                                        autoPlay
                                        className={styles.htmlPlayer}
                                    >
                                        <source src={(selectedMedia as NormalVideo).videoUrl} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>

                            <motion.div
                                className={styles.videoLightboxDetails}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2>{selectedMedia.title}</h2>
                                <p>{selectedMedia.description}</p>
                                <div className={styles.videoBadgeInfo}>
                                    {mediaType === 'youtube' && <><FaYoutube /> YouTube</>}
                                    {mediaType === 'instagram' && <><FaInstagram /> Instagram</>}
                                    {mediaType === 'video' && <><FaVideo /> Video</>}
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Gallery;