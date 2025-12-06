'use client';
import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import styles from './document-dashboard.module.css';
import dashboardStyles from '@/admin/dashboard/dashboard.module.css';
import Loader from '@/custom/loader/loader';

export default function DocumentDashboardPage() {
  const [details, setDetails] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    const r = localStorage.getItem('adminRoleId');
    if (r) setRoleId(parseInt(r, 10));
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canManage = roleId === 0 || roleId === 1;

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/public/downloads');
      const json = await res.json();
      if (json?.success) setDocuments(json.data || []);
      else setDocuments([]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('details', details);
      fd.append('file', file);

      const res = await fetch('/api/admin/upload-document', { method: 'POST', body: fd });
      const json = await res.json();
      if (json?.success) {
        toast.success('Uploaded successfully');
        setDetails('');
        setFile(null);
        await fetchDocuments();
      } else {
        console.error(json);
        toast.error(json?.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doc: any) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/delete-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: doc.id, drive_file_id: doc.drive_file_id }),
      });
      const json = await res.json();
      if (json?.success) {
        toast.success('Deleted');
        await fetchDocuments();
      } else {
        toast.error(json?.error || 'Delete failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = documents.length;
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const recent = documents.filter((d) => new Date(d.uploaded_at).getTime() >= weekAgo).length;
    const lastUploaded = documents[0]?.uploaded_at || null;
    return { total, recent, lastUploaded };
  }, [documents]);

  if (!canManage) {
    return <Loader isVisible={true} fullScreen={true} message="Checking permissions..." />;
  }

  return (
    <div className={dashboardStyles.dashboard}>
      <div className={dashboardStyles.headerSection}>
        <div className={dashboardStyles.headerContent}>
          <div>
            <h1 className={dashboardStyles.pageTitle}>Document Dashboard</h1>
            <p className={dashboardStyles.pageSubtitle}>Upload and manage school documents (brochures, fee structure, etc.)</p>
          </div>
          <div className={dashboardStyles.headerControls}>
            <button className={dashboardStyles.rangeBtn} onClick={() => fetchDocuments()}>Refresh</button>
          </div>
        </div>
      </div>

      <div className={dashboardStyles.statsGrid}>
        <div className={dashboardStyles.statCardWrapper}>
          <div className={dashboardStyles.statCardInner}>
            <div className={dashboardStyles.statCardContent}>
              <div className={dashboardStyles.statCardTop}>
                <div>
                  <div className={dashboardStyles.statCardTitle}>Total Documents</div>
                  <div className={dashboardStyles.statCardValue}>{stats.total}</div>
                </div>
                <div className={dashboardStyles.statCardIcon}>📁</div>
              </div>
            </div>
          </div>
        </div>

        <div className={dashboardStyles.statCardWrapper}>
          <div className={dashboardStyles.statCardInner}>
            <div className={dashboardStyles.statCardContent}>
              <div className={dashboardStyles.statCardTop}>
                <div>
                  <div className={dashboardStyles.statCardTitle}>Uploaded (7d)</div>
                  <div className={dashboardStyles.statCardValue}>{stats.recent}</div>
                </div>
                <div className={dashboardStyles.statCardIcon}>🕒</div>
              </div>
            </div>
          </div>
        </div>

        <div className={dashboardStyles.statCardWrapper}>
          <div className={dashboardStyles.statCardInner}>
            <div className={dashboardStyles.statCardContent}>
              <div className={dashboardStyles.statCardTop}>
                <div>
                  <div className={dashboardStyles.statCardTitle}>Last Uploaded</div>
                  <div className={dashboardStyles.statCardValue}>{stats.lastUploaded ? new Date(stats.lastUploaded).toLocaleString() : 'N/A'}</div>
                </div>
                <div className={dashboardStyles.statCardIcon}>📌</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={dashboardStyles.analyticsGrid}>
        <div className={dashboardStyles.analyticsCard} style={{ gridColumn: '1 / -1' }}>
          <div className={dashboardStyles.cardHeader}>
            <h3>Manage Documents</h3>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <input type="text" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Details (e.g. School Brochure)" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border-color, #e5e5e5)' }} />
            </div>
            <div>
              <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
            </div>
            <div>
              <button className={dashboardStyles.rangeBtn} onClick={(e) => handleUpload(e as any)} disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
            </div>
          </div>

          <div className={dashboardStyles.activitySection}>
            <div className={dashboardStyles.activityHeader}>
              <div className={dashboardStyles.activityTitle}><h2>Documents</h2></div>
            </div>

            {loading && documents.length === 0 ? (
              <Loader isVisible={true} message="Loading..." fullScreen={false} />
            ) : documents.length === 0 ? (
              <div>No documents uploaded yet.</div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {documents.map((d) => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, border: '1px solid var(--border-color,#e5e5e5)', background: 'var(--white,#fff)' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{d.details}</div>
                      <div style={{ color: 'var(--text-gray,#666)', fontSize: 13 }}>{new Date(d.uploaded_at).toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className={styles.viewBtn} onClick={() => setPreview({ url: d.url, name: d.details })}>View</button>
                      <a href={d.url} download className={styles.downloadBtn}>Download</a>
                      {canManage && <button className={styles.deleteBtn} onClick={() => handleDelete(d)}>Delete</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {preview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPreview(null)}>
          <div style={{ width: '80%', height: '80%', background: '#fff', borderRadius: 8, overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid var(--border-color,#e5e5e5)' }}>
              <div style={{ fontWeight: 700 }}>{preview.name}</div>
              <button onClick={() => setPreview(null)} style={{ background: 'none', border: 'none', fontSize: 18 }}>✕</button>
            </div>
            <iframe src={preview.url} style={{ width: '100%', height: 'calc(100% - 40px)', border: 'none' }} title={preview.name}></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
