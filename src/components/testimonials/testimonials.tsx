'use client';
import React, { useRef } from 'react';
import Image, { StaticImageData } from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Autoplay } from 'swiper/modules';
import { FaQuoteLeft, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/navigation';
import styles from './testimonials.module.css';
import HeadingTitle from '../heading/headingtitle';
import Image1 from '../../../public/assets/testimonial/1.jpg'
import Image2 from '../../../public/assets/testimonial/2.png'
import Image3 from '../../../public/assets/testimonial/3.png'
import Image4 from '../../../public/assets/testimonial/4.png'
import Image5 from '../../../public/assets/testimonial/5.png'
import schoolDetails from '@/json/schooldetails';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import LineArt from '@/custom/lineart/lineart';



interface TestimonialItem {
  id: number;
  name: string;
  role: string;
  image: string | StaticImageData;
  quote: string;
  rating: number;
}

const testimonials: TestimonialItem[] = [
  {
    id: 1,
    name: 'Shivam Sharma',
    role: 'Parent of Rahul, Age 2',
    image: Image1,
    quote: `The progress Rahul has made since joining ${schoolDetails.name} is incredible. He’s more curious and confident every day.`,
    rating: 5
  },
  {
    id: 2,
    name: 'Ritika Kumari',
    role: 'Parent of Riya, Age 3',
    image: Image2,
    quote: `Riya absolutely loves going to ${schoolDetails.name}. The playful learning approach keeps her engaged and happy.`,
    rating: 5
  },
  {
    id: 3,
    name: 'Akash Verma',
    role: 'Parent of Samarth, Age 2',
    image: Image3,
    quote: `${schoolDetails.name} has created a nurturing space where Samarth feels safe and excited to learn new things and explore.`,
    rating: 5
  },
  {
    id: 4,
    name: 'Neha Singh',
    role: 'Parent of Khushal, Age 4',
    image: Image4,
    quote: `The staff at ${schoolDetails.name} are incredibly supportive. Khushal’s communication skills have improved so much.`,
    rating: 5
  },
  {
    id: 5,
    name: 'Prerna Shah',
    role: 'Parent of Kiyansh, Age 4',
    image: Image5,
    quote: `We’re thrilled with Kiyansh’s development. ${schoolDetails.name} blends fun and learning in the best way possible.`,
    rating: 5
  },
];



const Testimonials = () => {
  const swiperRef = useRef<SwiperType | null>(null);

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
        <HeadingTitle text="What Parents Say" />

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