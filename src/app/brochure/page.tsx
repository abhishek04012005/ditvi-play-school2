"use client"

import React from 'react'
import styles from './brochure.module.css'
import generatePdf from '../../lib/generatePdf'

const TESTIMONIALS = [
  { name: 'Parent A', text: 'Warm staff and great learning environment.', avatar: '/assets/testimonial/1.jpg' },
  { name: 'Parent B', text: 'My child loves the activities and teachers.', avatar: '/assets/testimonial/2.png' },
  { name: 'Parent C', text: 'Excellent communication and care.', avatar: '/assets/testimonial/3.png' },
]

const PROGRAMS = [
  { 
    title: 'Toddlers', 
    desc: 'Ages 2–3: sensory play & bonding', 
    img: '/assets/programs/toddler.jpg',
    icon: '👶',
    focus: ['Sensory exploration', 'Language development', 'Social bonding'],
    activities: 'Play, singing, messy play, outdoor time',
  },
  { 
    title: 'Nursery', 
    desc: 'Ages 3–4: foundation learning & routines', 
    img: '/assets/programs/nursery.jpg',
    icon: '🧒',
    focus: ['Letter & number recognition', 'Fine motor skills', 'Friendship building'],
    activities: 'Art, crafts, storytelling, music & movement',
  },
  { 
    title: 'Pre-K', 
    desc: 'Ages 4–5: literacy & pre-academics', 
    img: '/assets/programs/prekg.jpg',
    icon: '📚',
    focus: ['Pre-reading & writing', 'Math basics', 'Critical thinking'],
    activities: 'Phonics, projects, STEM exploration, drama',
  },
  { 
    title: 'Kindergarten', 
    desc: 'Ages 5–6: readiness & skills', 
    img: '/assets/programs/kg.jpg',
    icon: '🎓',
    focus: ['School readiness', 'Independence', 'Academic foundations'],
    activities: 'Reading, writing, problem-solving, collaboration',
  },
]

const EVENTS = [
  { title: 'Independence Day', img: '/assets/gallery/independenceday.png' },
  { title: 'Teacher\'s Day', img: '/assets/gallery/teacherday.png' },
  { title: 'Holi Celebration', img: '/assets/gallery/holi.png' },
  { title: 'Diwali Festival', img: '/assets/gallery/diwali.png' },
]

const HIGHLIGHTS = [
  { icon: '🏫', title: 'Safe & Secure', text: 'CCTV monitored, trained staff 24/7' },
  { icon: '👨‍🏫', title: 'Expert Teachers', text: 'Certified with 5+ years experience' },
  { icon: '🎨', title: 'Creative Arts', text: 'Art, music, dance & storytelling' },
  { icon: '📚', title: 'Literacy', text: 'Daily phonics & reading time' },
]

const SCHOOL_STATS = [
  { label: 'Years of Excellence', value: '15+' },
  { label: 'Happy Families', value: '500+' },
  { label: 'Dedicated Staff', value: '50+' },
  { label: 'Alumni Success Rate', value: '98%' },
]

const SCHOOL_VALUES = [
  { icon: '💚', value: 'Compassion', desc: 'Nurturing warm relationships' },
  { icon: '🌟', value: 'Excellence', desc: 'Highest standards in education' },
  { icon: '🤝', value: 'Community', desc: 'Building strong families' },
  { icon: '🎯', value: 'Growth', desc: 'Fostering all-round development' },
]

const FOUNDER_MESSAGE = {
  name: 'Ms. Priya Sharma',
  title: 'Founder & Director',
  image: '/assets/about/director.jpg',
  message: 'With over 15 years of experience in early childhood education, I founded Ditvi with a simple belief: every child deserves a space where they can be their authentic selves, explore freely, and grow holistically. Our team is dedicated to creating that nurturing environment where learning becomes a joyful journey.',
}

export default function BrochurePage() {
  async function handleDownload() {
    try {
      await generatePdf('pdf-content', 'ditvi-brochure.pdf')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('PDF generation failed', err)
      alert('PDF generation failed. Check console for details.')
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.actionRow}>
        <h2 className={styles.title}>Brochure — Print / Download</h2>
        <button className={styles.downloadBtn} onClick={handleDownload}>Download 4-page PDF</button>
      </div>

      <div id="pdf-content" className={styles.pdfWrapper}>
        {/* Page 1: Cover with School Introduction & Image Gallery */}
        <article className={styles.pdfPage}>
          {/* Header */}
          <div className={styles.coverTop}>
            <img src="/assets/logo/logo.png" alt="School logo" className={styles.logo} />
            <div>
              <h1 className={styles.coverTitle}>Ditvi Play School</h1>
              <p className={styles.coverSubtitle}>Nurturing Curiosity, Creativity & Confidence</p>
            </div>
          </div>

          {/* Hero Gallery Grid */}
          <div className={styles.heroGalleryGrid}>
            <div className={styles.heroLarge}>
              <img src="/assets/hero/1.jpg" alt="Learning moments" />
              <div className={styles.galleryOverlay}>
                <h2>Where Learning Comes Alive</h2>
              </div>
            </div>
            <div className={styles.heroSmall}>
              <img src="/assets/hero/2.jpg" alt="Happy kids" />
            </div>
            <div className={styles.heroSmall}>
              <img src="/assets/hero/3.jpg" alt="Playtime" />
            </div>
          </div>

          {/* Extra thumbnails from hero / programs / gallery to enrich the cover */}
          <div className={styles.heroThumbs}>
            <div className={styles.heroThumb}><img src="/assets/programs/toddler.jpg" alt="Toddlers" /></div>
            <div className={styles.heroThumb}><img src="/assets/programs/nursery.jpg" alt="Nursery" /></div>
            <div className={styles.heroThumb}><img src="/assets/gallery/independenceday.png" alt="Independence Day" /></div>
            <div className={styles.heroThumb}><img src="/assets/gallery/diwali.png" alt="Diwali Festival" /></div>
          </div>

          {/* Mission & Values in Single Row */}
          <div className={styles.introContent}>
            <div className={styles.missionBox}>
              <h3>Our Mission</h3>
              <p>Creating a nurturing environment where every child discovers the joy of learning and grows into confident, curious individuals.</p>
            </div>

            <div className={styles.valuesBoxRow}>
              {SCHOOL_VALUES.map((val) => (
                <div key={val.value} className={styles.smallValueCard}>
                  <span>{val.icon}</span>
                  <h4>{val.value}</h4>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* Page 2: About Us & Founder Message */}
        <article className={styles.pdfPage}>
          <h2 className={styles.sectionTitle}>About Ditvi Play School</h2>
          
          <div className={styles.aboutContainer}>
            <div className={styles.aboutText}>
              <h3>Our Story</h3>
              <p>Ditvi Play School was founded on the principle that early childhood is a crucial stage of human development. We believe in creating a warm, inclusive environment where children feel safe, valued, and inspired to learn through play.</p>
              
              <p>Our comprehensive approach to early childhood education combines:</p>
              <ul className={styles.aboutList}>
                <li>Play-based learning activities that spark curiosity</li>
                <li>Certified teachers with specialized training</li>
                <li>Individualized attention and assessment</li>
                <li>Strong parent-school partnership</li>
              </ul>

              <h3 style={{ marginTop: '1rem' }}>Our Facilities</h3>
              <p>Our state-of-the-art campus features bright, safe classrooms, interactive learning spaces, outdoor play areas, and age-appropriate resources designed to encourage exploration and growth.</p>
            </div>

            <div className={styles.founderBox}>
              <img src={FOUNDER_MESSAGE.image} alt={FOUNDER_MESSAGE.name} className={styles.founderImage} />
              <h3>Message from Our Founder</h3>
              <p style={{ fontStyle: 'italic', lineHeight: 1.6, fontSize: '0.9rem' }}>"{FOUNDER_MESSAGE.message}"</p>
              <div style={{ marginTop: '0.8rem', borderTop: '2px solid var(--primary-yellow)', paddingTop: '0.6rem' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{FOUNDER_MESSAGE.name}</p>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--muted)' }}>{FOUNDER_MESSAGE.title}</p>
              </div>
            </div>
          </div>
        </article>

        {/* Page 3: Programs Showcase */}
        <article className={styles.pdfPage}>
          <h2 className={styles.sectionTitle}>Our Programs</h2>
          <p className={styles.sectionDesc}>
            Age-appropriate learning experiences tailored for every stage of early childhood development. Each program is designed to nurture curiosity, foster independence, and build strong foundations.
          </p>
          <div className={styles.programsGrid}>
            {PROGRAMS.map((p) => (
              <div key={p.title} className={styles.programCard}>
                <div className={styles.programHeader}>
                  <img src={p.img} alt={p.title} className={styles.programImage} />
                  <div className={styles.programIconBadge}>{p.icon}</div>
                </div>
                <h3>{p.title}</h3>
                <p className={styles.programDesc}>{p.desc}</p>
                
                <div className={styles.programContent}>
                  <div className={styles.focusArea}>
                    <h4>Learning Focus:</h4>
                    <ul>
                      {p.focus.map((f) => <li key={f}>{f}</li>)}
                    </ul>
                  </div>
                  <div className={styles.activities}>
                    <h4>🎯 Daily Activities:</h4>
                    <p>{p.activities}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.programsFooter}>
            <div className={styles.footerHighlight}>
              <h3>Why Our Programs Work</h3>
              <div className={styles.footerGrid}>
                <div className={styles.footerItem}>
                  <span className={styles.footerIcon}>✨</span>
                  <p><strong>Play-Based</strong> — Learning through exploration and discovery</p>
                </div>
                <div className={styles.footerItem}>
                  <span className={styles.footerIcon}>👥</span>
                  <p><strong>Small Groups</strong> — Personalized attention for each child</p>
                </div>
                <div className={styles.footerItem}>
                  <span className={styles.footerIcon}>📈</span>
                  <p><strong>Progress Tracking</strong> — Regular assessments & parent updates</p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Page 4: Gallery, Testimonials & Contact */}
        <article className={styles.pdfPage}>
          <h2 className={styles.sectionTitle}>Our Community</h2>
          
          {/* Gallery Section */}
          <div className={styles.gallerySection}>
            <h3>School Events & Celebrations</h3>
            <div className={styles.eventsGrid}>
              {EVENTS.map((e) => (
                <div key={e.title} className={styles.eventCard}>
                  <img src={e.img} alt={e.title} className={styles.eventImage} />
                  <h4>{e.title}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials Section */}
          <div className={styles.testimonialsSection}>
            <h3>What Parents Say</h3>
            <div className={styles.testimonialsContainer}>
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className={styles.testimonialCard}>
                  <img src={t.avatar} alt={t.name} className={styles.testimonialAvatar} />
                  <p className={styles.testimonialText}>"{t.text}"</p>
                  <p className={styles.testimonialName}>— {t.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className={styles.ctaFooter}>
            <h3>Ready to Join Us?</h3>
            <p>Schedule a campus tour and discover the Ditvi difference.</p>
            <div className={styles.contactInfo}>
              <div>📞 <strong>Phone:</strong> (555) 123-4567</div>
              <div>✉️ <strong>Email:</strong> admissions@ditvi.school</div>
              <div>📍 <strong>Address:</strong> 123 Main Street, Your City</div>
            </div>
            <p className={styles.copyright}>© {new Date().getFullYear()} Ditvi Play School. All rights reserved.</p>
          </div>
        </article>
      </div>
    </main>
  )
}
