'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from './about.module.css';
import CreativeLearingIcon from '@mui/icons-material/EmojiObjects';
import SafeEnvironmentIcon from '@mui/icons-material/Favorite';
import ExpertTeacherIcon from '@mui/icons-material/School';
import FunActivitiesIcon from '@mui/icons-material/Celebration';
import FounderImage from '../../../public/assets/about/director.jpg'
import HeadingTitle from '../heading/headingtitle';
import schoolDetails from '@/json/schooldetails';
import LineArt from '@/custom/lineart/lineart';
import LocalFloristOutlinedIcon from '@mui/icons-material/LocalFloristOutlined';


const About = () => {
  const features = [
    {
      icon: CreativeLearingIcon,
      title: 'Creative Learning',
      description: 'Engaging activities that spark imagination and curiosity'
    },
    {
      icon: SafeEnvironmentIcon,
      title: 'Safe Environment',
      description: 'Secure and nurturing space for your child'
    },
    {
      icon: ExpertTeacherIcon,
      title: 'Expert Teachers',
      description: 'Experienced and caring education professionals'
    },
    {
      icon: FunActivitiesIcon,
      title: 'Fun Activities',
      description: 'Balanced mix of learning and playtime activities'
    }
  ];

  const founderMessage = {
    name: `${schoolDetails.director.name}`,
    position: `${schoolDetails.director.designation}`,
    message: `As an educator with over 15 years of experience, I founded ${schoolDetails.name} with a vision to create a space where children can learn, grow, and thrive. Our approach combines modern educational methods with traditional values, ensuring each child receives the foundation they need for future success.`,
    image: FounderImage
  };



  return (
    <>
      <section className={styles.about}>
        <LineArt
          circle={{
            size: 200,
            borderColor: 'var(--primary-yellow)',
            borderWidth: 3,
            borderStyle: 'dashed',
            opacity: 1,
            animationSpeed: 30,
            bottom: '0%',
            left: '2%',
            icon: <LocalFloristOutlinedIcon sx={{ fontSize: 40, transform: 'scale(-1, 1)' }} />,
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
        <motion.div
          className={styles.aboutContent}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <HeadingTitle text='About Us' />
          <p className={styles.aboutDescription}>
            At {schoolDetails.name}, we believe in nurturing young minds through a perfect blend of
            education and play. Our innovative approach to early childhood development ensures
            that every child receives the attention and guidance they need to flourish.
          </p>
        </motion.div>

        <div className={styles.featuresGrid}>
          {features.map((feature, index) => {
            const Icon = feature.icon as any;
            return (
              <motion.div
                key={feature.title}
                className={styles.featureCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={styles.featureIcon}>
                  {typeof feature.icon === 'string' ? (
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      width={40}
                      height={40}
                    />
                  ) : (
                    <Icon className={styles.featureIconsInner} fontSize="large" aria-label={feature.title} sx={{ color: 'var(--primary-yellow)' }} />
                  )}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>


      <section className={styles.founderSection}>
        <motion.div
          className={styles.founderContent}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className={styles.founderImageWrapper}>
            <Image
              src={founderMessage.image}
              alt={founderMessage.name}
              fill
              className={styles.founderImage}
            />
          </div>
          <div className={styles.founderMessage}>
            <h2 className={styles.sectionTitle}>Message from Our Founder</h2>
            <p className={styles.messageText}>{founderMessage.message}</p>
            <div className={styles.founderInfo}>
              <h3>{founderMessage.name}</h3>
              <p>{founderMessage.position}</p>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default About;