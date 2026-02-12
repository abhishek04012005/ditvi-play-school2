'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { GestureOutlined, SmartphoneOutlined } from '@mui/icons-material';
import styles from './arSlider.module.css';

interface ImageData {
  src: string;
  name: string;
  description: string;
}

type Props = {
  images: ImageData[];
};

export default function ArSlider({ images }: Props) {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  if (!images || images.length === 0) return <div>No images</div>;

  const current = images[index];

  return (
    <div className={styles.container}>
      {/* Instructions */}
      <div className={styles.instructions}>
        <div className={styles.instructionItem}>
          <GestureOutlined className={styles.instructionIcon} />
          <span>Swipe or click arrows to browse</span>
        </div>
        <div className={styles.instructionItem}>
          <SmartphoneOutlined className={styles.instructionIcon} />
          <span>Point your device to view in AR</span>
        </div>
      </div>

      {/* Image Details */}
      <motion.div
        className={styles.detailsHeader}
        key={`details-${index}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className={styles.imageName}>{current.name}</h2>
        <p className={styles.imageDescription}>{current.description}</p>
        <div className={styles.counter}>
          {index + 1} / {images.length}
        </div>
      </motion.div>

      {/* Slider */}
      <div className={styles.slider}>
        <div className={styles.viewport}>
          <motion.div
            className={styles.track}
            key={index}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) next();
              if (info.offset.x > 50) prev();
            }}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Image
              src={current.src}
              alt={current.name}
              width={800}
              height={600}
              className={styles.image}
            />
          </motion.div>
        </div>

        <button className={styles.prev} onClick={prev} aria-label="Previous">
          ‹
        </button>
        <button className={styles.next} onClick={next} aria-label="Next">
          ›
        </button>

        <div className={styles.dots}>
          {images.map((_, i) => (
            <button
              key={i}
              className={i === index ? styles.dotActive : styles.dot}
              onClick={() => setIndex(i)}
              aria-label={`Go to ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
