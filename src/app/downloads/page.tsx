'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArticleIcon from '@mui/icons-material/Article';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StorageIcon from '@mui/icons-material/Storage';
import styles from './downloads.module.css';
import Loader from '@/custom/loader/loader';
import HeadingTitle from '@/components/heading/headingtitle';
import en from '@/translations/en.json';
import hi from '@/translations/hi.json';

interface Document {
  id: string;
  details: string;
  url: string;
  drive_file_id: string;
  uploaded_at: string;
  file_size?: number;
  is_public?: boolean;
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '-';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export default function DownloadsPage(){
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  useEffect(()=>{fetchList()},[]);

  const translations = language === 'hi' ? hi : en;
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  const fetchList = async ()=>{
    try{
      setLoading(true);
      const res = await fetch('/api/public/downloads');
      const json = await res.json();
      if (json?.success) {
        const publicDocs = (json.data || []).filter((doc: Document) => doc.is_public);
        setDocs(publicDocs);
      }
    }catch(err){console.error(err)}finally{setLoading(false)}
  }

  const filteredDocs = docs.filter(d => 
    d.details.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());

  if (loading) {
    return <Loader isVisible={true} message={language === 'hi' ? 'दस्तावेज़ लोड हो रहे हैं...' : 'Loading Documents...'} fullScreen={true} />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className={styles.container}>
      {/* Decorative Header Background */}
      <div className={styles.headerBg}></div>


      {/* Hero Section */}
      <motion.div className={styles.heroSection} initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className={styles.heroContent}>
          <HeadingTitle text={language === 'hi' ? 'दस्तावेज़ डाउनलोड करें' : 'Download Documents'} />

        </div>
      </motion.div>

      {/* Search Section */}
      <motion.div className={styles.searchSection} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className={styles.searchWrapper}>
          <SearchIcon sx={{ position: 'absolute', left: '1.5rem', fontSize: '1.2rem', color: '#6a4c93', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder={language === 'hi' ? 'दस्तावेज़ खोजें...' : 'Search documents...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </motion.div>

      {/* Statistics */}
      {docs.length > 0 && (
        <motion.div className={styles.statsSection} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className={styles.statBox}>
            <div className={styles.statNumber}>{docs.length}</div>
            <div className={styles.statLabel}>{language === 'hi' ? 'कुल दस्तावेज़' : 'Total Documents'}</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statNumber}>{filteredDocs.length}</div>
            <div className={styles.statLabel}>{language === 'hi' ? 'परिणाम' : 'Results'}</div>
          </div>
        </motion.div>
      )}

      {/* Documents Grid */}
      <motion.div
        className={styles.grid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredDocs.length === 0 ? (
          <motion.div className={styles.noDocuments} variants={itemVariants}>
            <ArticleIcon sx={{ fontSize: '4rem', color: '#d4c5e2', marginBottom: '1.5rem', opacity: 0.6 }} />
            <h3>{docs.length === 0 ? (language === 'hi' ? 'कोई दस्तावेज़ उपलब्ध नहीं' : 'No documents available') : (language === 'hi' ? 'कोई मिलान नहीं' : 'No matching documents found')}</h3>
            <p>
              {docs.length === 0
                ? (language === 'hi' ? 'वर्तमान में कोई सार्वजनिक दस्तावेज़ डाउनलोड के लिए उपलब्ध नहीं है।' : 'There are currently no public documents available for download.')
                : (language === 'hi' ? 'कृपया अपनी खोज शर्तें समायोजित करें।' : 'Try adjusting your search terms.')}
            </p>
          </motion.div>
        ) : (
          filteredDocs.map((d, index) => {
            const isNew = new Date(d.uploaded_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
            return (
              <motion.div key={d.id} className={styles.card} variants={itemVariants} whileHover={{ y: -8 }}>
                {isNew && <div className={styles.newBadge}>{language === 'hi' ? 'नया' : 'New'}</div>}
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>
                    <ArticleIcon sx={{ fontSize: '1.5rem', color: '#6a4c93' }} />
                  </div>
                  <div className={styles.cardTitle}>{d.details}</div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.metaItem}>
                    <StorageIcon sx={{ fontSize: '1.1rem', flexShrink: 0 }} />
                    <span>{formatFileSize(d.file_size)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <AccessTimeIcon sx={{ fontSize: '1.1rem', flexShrink: 0 }} />
                    <span>
                      {new Date(d.uploaded_at).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <motion.a
                  href={d.url}
                  download
                  className={styles.downloadBtn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FileDownloadIcon sx={{ fontSize: '1rem' }} /> {language === 'hi' ? 'डाउनलोड करें' : 'Download'}
                </motion.a>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Footer Info */}
      {filteredDocs.length > 0 && (
        <motion.div className={styles.infoSection} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <p>
            {language === 'hi'
              ? `${filteredDocs.length} में से ${docs.length} दस्तावेज़ दिखा रहे हैं`
              : `Showing ${filteredDocs.length} of ${docs.length} documents`}
          </p>
        </motion.div>
      )}
    </div>
  )
}
