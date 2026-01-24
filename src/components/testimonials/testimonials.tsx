'use client';
import React, { useRef, useState, useEffect } from 'react';
import Image, { StaticImageData } from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Autoplay } from 'swiper/modules';
import { FaQuoteLeft, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/navigation';
import styles from './testimonials.module.css';
import HeadingTitle from '../heading/headingtitle';
import schoolDetails from '@/json/schooldetails';
import schoolDetailsHi from '@/json/schooldetails-hi';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import LineArt from '@/custom/lineart/lineart';
import en from '@/translations/en.json';
import hi from '@/translations/hi.json';
import { TestimonialItem } from '@/types/testimonials-types';
import testimonialsEng from '@/data/testimonials-eng';
import testimonialsHi from '@/data/testimonials-hi';
import { headingTitlesEng } from '@/data/headingtitles-eng';
import { headingTitlesHi } from '@/data/headingtitles-hi';




const Testimonials = () => {
  const swiperRef = useRef<SwiperType | null>(null);
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

  const testimonials = language === 'hi' ? testimonialsHi : testimonialsEng;

  const headingTitles = language === 'hi' ? headingTitlesHi : headingTitlesEng;

  return (
    <section className={styles.testimonials}>

      <LineArt
        circle={{
          size: 200,
          borderColor: 'var(--primary-yellow)',
          borderWidth: 3,
          borderStyle: 'dashed',
          opacity: 1,
          animationSpeed: 30,
          bottom: '7%',
          left: '2%',
          icon: <BusinessCenterOutlinedIcon sx={{ fontSize: 40, transform: 'scale(-1, 1)' }} />,
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
        <HeadingTitle text={headingTitles.testimonials} />

        <div className={styles.sliderContainer}>
          <button
            className={`${styles.navigationButton} ${styles.prevButton}`}
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label="Previous testimonial"
            type="button"
          >
            <FaChevronLeft />
          </button>

          <button
            className={`${styles.navigationButton} ${styles.nextButton}`}
            onClick={() => swiperRef.current?.slideNext()}
            aria-label="Next testimonial"
            type="button"
          >
            <FaChevronRight />
          </button>

          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            loop
            speed={1000}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 30 }
            }}
            className={styles.swiper}
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <article className={styles.testimonialCard}>
                  <FaQuoteLeft className={styles.quoteIcon} />
                  <p className={styles.quote}>{testimonial.quote}</p>

                  <div className={styles.rating}>
                    {Array.from({ length: testimonial.rating }, (_, i) => (
                      <FaStar key={i} className={styles.star} />
                    ))}
                  </div>

                  <div className={styles.clientInfo}>
                    <div className={styles.clientImage}>
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={60}
                        height={60}
                        className={styles.image}
                      />
                    </div>
                    <div className={styles.clientDetails}>
                      <h4 className={styles.clientName}>{testimonial.name}</h4>
                      <p className={styles.clientRole}>{testimonial.role}</p>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;