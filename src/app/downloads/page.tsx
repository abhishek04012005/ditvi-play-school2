'use client';
import { useEffect, useState } from 'react';
import styles from './downloads.module.css';
import Loader from '@/custom/loader/loader';

export default function DownloadsPage(){
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{fetchList()},[]);

  const fetchList = async ()=>{
    try{
      setLoading(true);
      const res = await fetch('/api/public/downloads');
      const json = await res.json();
      if (json?.success) setDocs(json.data || []);
    }catch(err){console.error(err)}finally{setLoading(false)}
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Downloads</h1>
      <p className={styles.pageSubtitle}>School documents and brochures available for download</p>
      {loading ? <Loader isVisible={true} message="Loading..." fullScreen={false} /> : (
        <div className={styles.grid}>
          {docs.map(d => (
            <div key={d.id} className={styles.card}>
              <div className={styles.title}>{d.details}</div>
              <div className={styles.date}>{new Date(d.uploaded_at).toLocaleDateString()}</div>
              <div className={styles.actions}>
                <a href={d.url} target="_blank" rel="noreferrer" className={styles.link}>View</a>
                <a href={d.url} download className={styles.link}>Download</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
