'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';
import NotificationsOffOutlinedIcon from '@mui/icons-material/NotificationsOffOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from './popupmanagement.module.css';
import Toast from '@/custom/toast/toast';

interface PopupControl {
  id: string;
  active_popup_type: 'enquiry' | 'message' | 'none';
  message_popup_id?: string;
  enquiry_popup_delay_ms: number;
  is_enquiry_popup_enabled: boolean;
  updated_at: string;
}

interface MessagePopup {
  id: string;
  title: string;
  message: string;
  button_text?: string;
  button_link?: string;
  is_active: boolean;
  is_show_on_home_page: boolean;
  background_color: string;
  text_color: string;
  button_color: string;
  image_url?: string;
  created_at: string;
}

export default function PopupManagement() {
  const [popupControl, setPopupControl] = useState<PopupControl | null>(null);
  const [messagePopups, setMessagePopups] = useState<MessagePopup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showForm, setShowForm] = useState(false);
  const [editingPopup, setEditingPopup] = useState<MessagePopup | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    button_text: '',
    button_link: '',
    background_color: '#ffffff',
    text_color: '#000000',
    button_color: '#6a4c93',
    image_url: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [controlRes, messagesRes] = await Promise.all([
        fetch('/api/admin/popup-control'),
        fetch('/api/admin/message-popup'),
      ]);

      const controlData = await controlRes.json();
      const messagesData = await messagesRes.json();

      if (controlData.success) {
        setPopupControl(controlData.data);
      }
      if (messagesData.success) {
        setMessagePopups(messagesData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setToastType('error');
      setToastMessage('Failed to load popup settings');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePopupTypeChange = async (type: 'enquiry' | 'message' | 'none') => {
    if (!popupControl) return;

    try {
      let updateData: any = {
        ...popupControl,
        active_popup_type: type,
      };

      // If switching to message type, auto-select first active message popup
      if (type === 'message') {
        if (messagePopups.length === 0) {
          setToastType('error');
          setToastMessage('Please create a message popup first');
          setShowToast(true);
          return;
        }

        // Find first active popup, or first popup overall
        const activePopup = messagePopups.find(p => p.is_active) || messagePopups[0];
        if (!activePopup) {
          setToastType('error');
          setToastMessage('No message popups available');
          setShowToast(true);
          return;
        }

        updateData.message_popup_id = activePopup.id;
        console.log('📨 Auto-selected message popup:', activePopup.id, activePopup.title);
      }

      const res = await fetch('/api/admin/popup-control', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (data.success) {
        setPopupControl(data.data);
        setToastType('success');
        setToastMessage(`Popup type changed to ${type}`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error updating popup type:', error);
      setToastType('error');
      setToastMessage('Failed to update popup settings');
    }
    setShowToast(true);
  };

  const handleDelayChange = async (delay: number) => {
    if (!popupControl) return;

    try {
      const res = await fetch('/api/admin/popup-control', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...popupControl,
          enquiry_popup_delay_ms: delay,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPopupControl(data.data);
        setToastType('success');
        setToastMessage('Delay updated successfully');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setToastType('error');
      setToastMessage('Failed to update delay');
    }
    setShowToast(true);
  };

  const handleMessagePopupToggle = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/message-popup/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });

      const data = await res.json();
      if (data.success) {
        setMessagePopups(
          messagePopups.map((popup) =>
            popup.id === id ? { ...popup, is_active: !isActive } : popup
          )
        );
        setToastType('success');
        setToastMessage('Message popup status updated');
      }
    } catch (error) {
      setToastType('error');
      setToastMessage('Failed to update message popup');
    }
    setShowToast(true);
  };

  const handleDeleteMessagePopup = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message popup?')) return;

    try {
      const res = await fetch(`/api/admin/message-popup/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (data.success) {
        setMessagePopups(messagePopups.filter((popup) => popup.id !== id));
        setToastType('success');
        setToastMessage('Message popup deleted successfully');
        
        // If the deleted popup was active, reset popup type to none
        if (popupControl?.message_popup_id === id) {
          handlePopupTypeChange('none');
        }
      } else {
        throw new Error(data.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting popup:', error);
      setToastType('error');
      setToastMessage('Failed to delete message popup');
    }
    setShowToast(true);
  };

  const handleSaveMessagePopup = async () => {
    if (!formData.title || !formData.message) {
      setToastType('error');
      setToastMessage('Please fill in title and message');
      setShowToast(true);
      return;
    }

    try {
      const url = editingPopup
        ? `/api/admin/message-popup/${editingPopup.id}`
        : '/api/admin/message-popup';
      const method = editingPopup ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        if (editingPopup) {
          setMessagePopups(
            messagePopups.map((popup) =>
              popup.id === editingPopup.id ? data.data : popup
            )
          );
        } else {
          setMessagePopups([data.data, ...messagePopups]);
        }
        setToastType('success');
        setToastMessage(
          editingPopup ? 'Message popup updated' : 'Message popup created'
        );
        resetForm();
      }
    } catch (error) {
      setToastType('error');
      setToastMessage('Failed to save message popup');
    }
    setShowToast(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      button_text: '',
      button_link: '',
      background_color: '#ffffff',
      text_color: '#000000',
      button_color: '#6a4c93',
      image_url: '',
    });
    setEditingPopup(null);
    setShowForm(false);
  };

  const handleEditPopup = (popup: MessagePopup) => {
    setEditingPopup(popup);
    setFormData({
      title: popup.title,
      message: popup.message,
      button_text: popup.button_text || '',
      button_link: popup.button_link || '',
      background_color: popup.background_color,
      text_color: popup.text_color,
      button_color: popup.button_color,
      image_url: popup.image_url || '',
    });
    setShowForm(true);
  };

  if (loading) {
    return <div className={styles.loading}>Loading popup settings...</div>;
  }

  return (
    <div className={styles.container}>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Popup Type Selection */}
      <motion.div
        className={styles.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className={styles.sectionTitle}>🎯 Popup Type Selection</h2>
        <p className={styles.sectionDescription}>
          Choose which popup should appear on the homepage
        </p>

        <div className={styles.popupTypeGrid}>
          {/* Enquiry Popup Option */}
          <motion.button
            className={`${styles.popupTypeCard} ${
              popupControl?.active_popup_type === 'enquiry' ? styles.active : ''
            }`}
            onClick={() => handlePopupTypeChange('enquiry')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MailOutlinedIcon className={styles.cardIcon} />
            <h3>Enquiry Popup</h3>
            <p>Show enquiry form popup</p>
            {popupControl?.active_popup_type === 'enquiry' && (
              <div className={styles.activeBadge}>Active</div>
            )}
          </motion.button>

          {/* Message Popup Option */}
          <motion.button
            className={`${styles.popupTypeCard} ${
              popupControl?.active_popup_type === 'message' ? styles.active : ''
            }`}
            onClick={() => handlePopupTypeChange('message')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MessageOutlinedIcon className={styles.cardIcon} />
            <h3>Message Popup</h3>
            <p>Show custom message popup</p>
            {popupControl?.active_popup_type === 'message' && (
              <div className={styles.activeBadge}>Active</div>
            )}
          </motion.button>

          {/* No Popup Option */}
          <motion.button
            className={`${styles.popupTypeCard} ${
              popupControl?.active_popup_type === 'none' ? styles.active : ''
            }`}
            onClick={() => handlePopupTypeChange('none')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <NotificationsOffOutlinedIcon className={styles.cardIcon} />
            <h3>Hide All</h3>
            <p>Don't show any popup</p>
            {popupControl?.active_popup_type === 'none' && (
              <div className={styles.activeBadge}>Active</div>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Enquiry Popup Settings */}
      <motion.div
        className={styles.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className={styles.sectionTitle}>⏱️ Enquiry Popup Settings</h2>
        <div className={styles.settingItem}>
          <label>Delay before showing (milliseconds):</label>
          <input
            type="number"
            value={popupControl?.enquiry_popup_delay_ms || 5000}
            onChange={(e) => handleDelayChange(parseInt(e.target.value))}
            min="0"
            step="1000"
            className={styles.input}
          />
          <small>
            Current: {((popupControl?.enquiry_popup_delay_ms || 5000) / 1000).toFixed(1)}
            seconds
          </small>
        </div>
      </motion.div>

      {/* Message Popups Management */}
      <motion.div
        className={styles.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>📨 Message Popups</h2>
            <p className={styles.sectionDescription}>
              Create and manage custom message popups
            </p>
          </div>
          <motion.button
            className={styles.createBtn}
            onClick={() => {
              setEditingPopup(null);
              setShowForm(true);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AddIcon /> Create New
          </motion.button>
        </div>

        {/* Message Popup Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              className={styles.formOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
            >
              <motion.div
                className={styles.formModal}
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.formHeader}>
                  <h3>
                    {editingPopup ? 'Edit Message Popup' : 'Create Message Popup'}
                  </h3>
                  <button onClick={resetForm} className={styles.closeBtn}>
                    <CloseIcon />
                  </button>
                </div>

                <div className={styles.formBody}>
                  <div className={styles.formGroup}>
                    <label>Title *</label>
                    <input
                      type="text"
                      placeholder="Popup title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Message *</label>
                    <textarea
                      placeholder="Popup message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className={styles.textarea}
                      rows={4}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Button Text</label>
                      <input
                        type="text"
                        placeholder="Button text"
                        value={formData.button_text}
                        onChange={(e) =>
                          setFormData({ ...formData, button_text: e.target.value })
                        }
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Button Link</label>
                      <input
                        type="text"
                        placeholder="Button URL"
                        value={formData.button_link}
                        onChange={(e) =>
                          setFormData({ ...formData, button_link: e.target.value })
                        }
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Background Color</label>
                      <input
                        type="color"
                        value={formData.background_color}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            background_color: e.target.value,
                          })
                        }
                        className={styles.colorInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Text Color</label>
                      <input
                        type="color"
                        value={formData.text_color}
                        onChange={(e) =>
                          setFormData({ ...formData, text_color: e.target.value })
                        }
                        className={styles.colorInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Button Color</label>
                      <input
                        type="color"
                        value={formData.button_color}
                        onChange={(e) =>
                          setFormData({ ...formData, button_color: e.target.value })
                        }
                        className={styles.colorInput}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Image URL</label>
                    <input
                      type="text"
                      placeholder="Optional image URL"
                      value={formData.image_url}
                      onChange={(e) =>
                        setFormData({ ...formData, image_url: e.target.value })
                      }
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formFooter}>
                  <button onClick={resetForm} className={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button onClick={handleSaveMessagePopup} className={styles.saveBtn}>
                    <SaveIcon /> Save
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Popups List */}
        {messagePopups.length > 0 ? (
          <div className={styles.popupsList}>
            {messagePopups.map((popup, index) => (
              <motion.div
                key={popup.id}
                className={styles.popupCard}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className={styles.popupCardTop}>
                  <div className={styles.popupInfo}>
                    <h4>{popup.title}</h4>
                    <p className={styles.popupMessage}>{popup.message}</p>
                  </div>
                  <div
                    className={styles.popupBgPreview}
                    style={{ backgroundColor: popup.background_color }}
                  />
                </div>

                <div className={styles.popupCardActions}>
                  <label className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={popup.is_active}
                      onChange={() =>
                        handleMessagePopupToggle(popup.id, popup.is_active)
                      }
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                  <button
                    onClick={() => handleEditPopup(popup)}
                    className={styles.editBtn}
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleDeleteMessagePopup(popup.id)}
                    className={styles.deleteBtn}
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <MessageOutlinedIcon />
            <p>No message popups created yet. Create one to get started!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
