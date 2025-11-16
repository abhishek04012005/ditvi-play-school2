"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import styles from '../contact/contact.module.css';
import HeadingTitle from '@/components/heading/headingtitle';

// Helper function to convert Google Drive URL to proper preview/download URL
const getGoogleDriveURL = (url: string, type: 'image' | 'pdf' | 'document') => {
  if (!url) return url;
  
  // Extract file ID from various Google Drive URL formats
  let fileId = '';
  
  if (url.includes('id=')) {
    // Format: https://drive.google.com/uc?export=download&id=FILE_ID
    fileId = url.split('id=')[1]?.split('&')[0];
  } else if (url.includes('/d/')) {
    // Format: https://drive.google.com/file/d/FILE_ID/view
    fileId = url.split('/d/')[1]?.split('/')[0];
  } else if (url.includes('drive.google.com')) {
    // Try to extract from webViewLink format
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) fileId = match[1];
  }
  
  if (!fileId) return url; // Return original if we can't parse
  
  // Return appropriate URL based on type
  if (type === 'image') {
    // Use our proxy API to avoid CORS issues
    return `/api/proxy-drive-file?id=${fileId}&type=view`;
  } else if (type === 'pdf') {
    // For PDFs, use preview mode
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

const STATUS_OPTIONS = [
  'In Review',
  'Reviewed',
  'Interview Scheduled',
  'Confirmed',
  'Rejected',
];

interface Admission {
  id: string;
  child_name: string;
  child_dob: string;
  child_gender: string;
  child_place_of_birth: string;
  parent_name: string;
  parent_mobile_number: string;
  program_name: string;
  previous_school: string;
  status: string;
  notes?: string;
  created_at: string;
  photo_url?: string | null;
  birth_certificate_url?: string | null;
  aadhar_card_url?: string | null;
  parent_id_proof_url?: string | null;
}

export default function AdminAdmission() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [noteText, setNoteText] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [notesUpdating, setNotesUpdating] = useState(false);
  const [previewModal, setPreviewModal] = useState<{ url: string; type: 'image' | 'pdf' | 'document'; name: string } | null>(null);

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admission')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAdmissions(data || []);
    } catch (error) {
      toast.error('Failed to fetch admissions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setStatusUpdating(true);
    try {
      const { error } = await supabase
        .from('admission')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      toast.success('Status updated');
      fetchAdmissions();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleNotesSave = async (id: string) => {
    setNotesUpdating(true);
    try {
      const { error } = await supabase
        .from('admission')
        .update({ notes: noteText })
        .eq('id', id);
      if (error) throw error;
      toast.success('Notes saved');
      fetchAdmissions();
      setSelectedAdmission(null);
      setNoteText('');
    } catch (error) {
      toast.error('Failed to save notes');
    } finally {
      setNotesUpdating(false);
    }
  };


  return (
    <div className={styles.dashboardWrapper}>
      <HeadingTitle text="Admission Dashboard" />

      {/* Status Cards - "In Review" counted as "New" */}
      <div className={styles.statusCardsSection}>
        {STATUS_OPTIONS.map((status) => {
          const count = status === 'In Review' 
            ? admissions.filter((a) => a.status === 'In Review' || a.status === 'New').length
            : admissions.filter((a) => a.status === status).length;
          return (
            <div key={status} className={styles.statusCard}>
              <div className={styles.statusCardContent}>
                <div className={styles.statusCardHeader}>
                  <div className={styles.statusCardIcon} style={{ backgroundColor: '#f3e8ff', color: '#6a4c93' }}>
                    {status}
                  </div>
                </div>
                <div className={styles.statusCardBody}>
                  <div className={styles.statusCardCount}>{count}</div>
                  <p className={styles.statusCardLabel}>{status}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.dashboard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Child Name</th>
                <th>Parent Name</th>
                <th>Program</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className={styles.loading}>Loading admissions...</td>
                </tr>
              ) : admissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.noResults}>No admissions found</td>
                </tr>
              ) : (
                admissions.map((adm) => (
                  <tr key={adm.id}>
                    <td>{adm.child_name}</td>
                    <td>{adm.parent_name}</td>
                    <td>{adm.program_name}</td>
                    <td>
                      <span className={`${styles.status} ${styles[adm.status === 'In Review' ? 'new' : adm.status?.toLowerCase() || 'new']}`}>
                        {adm.status === 'In Review' ? 'New' : adm.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`${styles.notesBtn} ${adm.notes ? styles.hasNotes : ''}`}
                        onClick={() => { setSelectedAdmission(adm); setNoteText(adm.notes || ''); }}
                        title={adm.notes ? adm.notes : 'Add note'}
                      >
                        📝
                        {adm.notes && <span className={styles.notesIndicator}></span>}
                      </button>
                    </td>
                    <td>
                      <button style={{ color: '#6a4c93', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setSelectedAdmission(adm)}>View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admission Details Modal */}
      {selectedAdmission && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Admission Details</h2>
                <p>{selectedAdmission.child_name} • {selectedAdmission.parent_name}</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedAdmission(null)} aria-label="Close">✖</button>
            </div>
            <div className={styles.modalContent}>
              <div><b>Child Name:</b> {selectedAdmission.child_name}</div>
              <div><b>DOB:</b> {selectedAdmission.child_dob}</div>
              <div><b>Gender:</b> {selectedAdmission.child_gender}</div>
              <div><b>Place of Birth:</b> {selectedAdmission.child_place_of_birth}</div>
              <div><b>Parent Name:</b> {selectedAdmission.parent_name}</div>
              <div><b>Mobile:</b> {selectedAdmission.parent_mobile_number}</div>
              <div><b>Program:</b> {selectedAdmission.program_name}</div>
              <div><b>Previous School:</b> {selectedAdmission.previous_school}</div>
              <div><b>Status:</b> {selectedAdmission.status}</div>
              <div><b>Notes:</b> {selectedAdmission.notes || '—'}
                <button className={styles.notesBtn} style={{ marginLeft: 8 }} onClick={() => setNoteText(selectedAdmission.notes || '')}>Edit</button>
              </div>
              <div style={{ marginTop: 10 }}>
                <b>Documents:</b>
                <ul style={{ marginTop: 6 }}>
                  {['photo_url', 'birth_certificate_url', 'aadhar_card_url', 'parent_id_proof_url'].map((field) => {
                    const docUrl = selectedAdmission[field as keyof Admission] as string;
                    const docName = field.replace('_url', '').replace('_', ' ').replace('parent id proof', "Parent's ID Proof").replace('aadhar card', 'Aadhar Card').replace('birth certificate', 'Birth Certificate').replace('photo', 'Photo');
                    const isImage = ['photo_url'].includes(field);
                    return docUrl ? (
                      <li key={field} style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button onClick={() => setPreviewModal({ url: docUrl, type: isImage ? 'image' : 'pdf', name: docName })} style={{ color: '#6a4c93', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>View</button>
                        <a href={docUrl} download style={{ color: '#6a4c93', textDecoration: 'underline', cursor: 'pointer' }}>Download</a>
                        <span style={{ fontSize: 12, color: '#999' }}>{docName}</span>
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
              {noteText !== (selectedAdmission.notes || '') && (
                <div style={{ marginTop: 18 }}>
                  <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={3} className={styles.noteTextarea} />
                  <button onClick={() => handleNotesSave(selectedAdmission.id)} disabled={notesUpdating} className={styles.saveBtn} style={{ marginTop: 8 }}>Save Notes</button>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setSelectedAdmission(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewModal && (
        <div className={styles.modalOverlay} onClick={() => setPreviewModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Document Preview</h2>
                <p>{previewModal.name}</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setPreviewModal(null)} aria-label="Close">✖</button>
            </div>
            <div className={styles.modalContent} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, overflow: 'auto' }}>
              {previewModal.type === 'image' ? (
                <img 
                  src={getGoogleDriveURL(previewModal.url, 'image')} 
                  alt={previewModal.name} 
                  style={{ maxWidth: '100%', maxHeight: 500, borderRadius: 8, objectFit: 'contain' }}
                  onError={(e) => {
                    console.error('Image load error:', e);
                    toast.error('Failed to load image preview. Use Download button instead.');
                  }}
                  onLoad={() => console.log('Image loaded successfully')}
                />
              ) : previewModal.type === 'pdf' ? (
                <iframe 
                  src={getGoogleDriveURL(previewModal.url, 'pdf')} 
                  title="PDF Preview" 
                  style={{ width: '100%', height: 500, border: 'none', borderRadius: 8 }}
                  onError={() => toast.error('Failed to load PDF')}
                />
              ) : (
                <div><p>Unable to preview this document type.</p></div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <a href={getGoogleDriveURL(previewModal.url, 'document')} download target="_blank" rel="noopener noreferrer" style={{ color: '#6a4c93', textDecoration: 'underline', cursor: 'pointer' }}>Download</a>
              <button className={styles.cancelBtn} onClick={() => setPreviewModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
