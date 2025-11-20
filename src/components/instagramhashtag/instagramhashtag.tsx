'use client';

import { useEffect, useState } from 'react';
import styles from './instagramhashtag.module.css';
import { FaInstagram, FaArrowRight, FaPlay, FaHeart, FaComment, FaShare } from 'react-icons/fa';
import Loader from '@/custom/loader/loader';

interface InstagramPost {
  id: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  isReel: boolean;
}

export default function InstagramHashtag() {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={styles.instagramSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleWrapper}>
              <FaInstagram className={styles.instagramIcon} />
              <div className={styles.titleGroup}>
                <h2 className={styles.mainTitle}>Follow Our Journey</h2>
                <p className={styles.subtitle}>
                  Discover moments of joy, learning, and growth at Ditvi Play School
                </p>
              </div>
            </div>
            <a
              href="https://www.instagram.com/ditvifoundation/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaButton}
            >
              <span>Follow on Instagram</span>
              <FaArrowRight className={styles.arrowIcon} />
            </a>
          </div>
          <div className={styles.decorativeLine}></div>
        </div>

        {/* Instagram Feed */}
        <div className={styles.feedWrapper}>
          {isLoading && (
            // <div className={styles.loadingContainer}>
            //   <div className={styles.spinner}></div>
            //   <p className={styles.loadingText}>Loading Instagram Feed...</p>
            // </div>
            <Loader/>
          )}

          <div
            className={`${styles.iframeContainer} ${iframeLoaded ? styles.loaded : ''}`}
            style={{ display: isLoading ? 'none' : 'block' }}
          >
            <iframe
              src="https://www.juicer.io/api/feeds/ditvifoundation-fcb57c83-0811-40a8-8bee-07034f9caa9c/iframe"
              frameBorder="0"
              className={styles.juicerIframe}
              title="Instagram Feed - Ditvi Play School"
              onLoad={() => {
                setIframeLoaded(true);
              }}
            ></iframe>
          </div>
        </div>

        {/* Features Grid */}
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FaPlay className={styles.icon} />
            </div>
            <h3 className={styles.featureTitle}>Daily Reels</h3>
            <p className={styles.featureText}>
              Watch exciting moments from our classroom and activities
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FaHeart className={styles.icon} />
            </div>
            <h3 className={styles.featureTitle}>Student Stories</h3>
            <p className={styles.featureText}>
              Celebrate achievements and special moments of our wonderful children
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FaComment className={styles.icon} />
            </div>
            <h3 className={styles.featureTitle}>Connect & Engage</h3>
            <p className={styles.featureText}>
              Join our community and stay updated with school events
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FaShare className={styles.icon} />
            </div>
            <h3 className={styles.featureTitle}>Share Memories</h3>
            <p className={styles.featureText}>
              Tag us in your posts and be featured on our stories
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h3 className={styles.ctaTitle}>Stay Connected</h3>
            <p className={styles.ctaDescription}>
              Don't miss out on the amazing activities and updates from Ditvi Play School.
              Follow us on Instagram to be part of our growing community!
            </p>
            <a
              href="https://www.instagram.com/ditvifoundation/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.primaryButton}
            >
              Visit Our Instagram Profile
            </a>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className={styles.backgroundDecoration}></div>
    </section>
  );
}