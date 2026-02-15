'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import styles from './messagepopup.module.css';

interface MessagePopupData {
  id: string;
  title: string;
  message: string;
  button_text?: string;
  button_link?: string;
  background_color: string;
  text_color: string;
  button_color: string;
  image_url?: string;
}

export default function MessagePopupComponent({ messagePopupId }: { messagePopupId: string }) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState<MessagePopupData | null>(null);
  const [popupDismissed, setPopupDismissed] = useState(false);
  const fetchInProgressRef = useRef(false);

  useEffect(() => {
    console.log('[INFO] MessagePopupComponent mounted/updated with ID:', messagePopupId);
    
    if (messagePopupId && !popupDismissed) {
      fetchMessagePopup(messagePopupId);
    } else if (popupDismissed) {
      console.log('[INFO] Popup was dismissed, skipping fetch');
    }
  }, [messagePopupId, popupDismissed]);

  const fetchMessagePopup = async (id: string) => {
    // Prevent duplicate fetches
    if (fetchInProgressRef.current) {
      console.log('[WARN] Fetch already in progress, skipping');
      return;
    }

    fetchInProgressRef.current = true;

    try {
      console.log('[FETCH] Fetching message popup with ID:', id);
      const res = await fetch(`/api/admin/message-popup?id=${id}`, {
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      console.log('[MSG] Message popup response:', {
        success: data.success,
        hasData: !!data.data,
        isActive: data.data?.is_active,
        title: data.data?.title,
        colors: {
          background: data.data?.background_color,
          text: data.data?.text_color,
          button: data.data?.button_color,
        }
      });

      if (data.success && data.data && data.data.is_active) {
        setPopupData(data.data);
        
        // Show popup with delay
        setTimeout(() => {
          console.log('[SHOW] Showing popup');
          setShowPopup(true);
        }, 300);
      } else {
        // If popup is not found or not active, hide it
        console.log('[WARN] Popup not active or not found');
        setShowPopup(false);
        setPopupData(null);
      }
    } catch (error) {
      console.error('❌ Error fetching message popup:', error);
      setShowPopup(false);
      setPopupData(null);
    } finally {
      fetchInProgressRef.current = false;
    }
  };

  const handleClose = () => {
    console.log('[CLOSE] Closing popup');
    setShowPopup(false);
    setPopupDismissed(true);
  };

  const handleButtonClick = () => {
    if (popupData?.button_link) {
      window.open(popupData.button_link, '_blank');
    }
    handleClose();
  };

  if (!popupData) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          className={styles.popupOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleClose}
        >
          <motion.div
            className={styles.popupContainer}
            style={{ backgroundColor: popupData.background_color }}
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <motion.button
              className={styles.closeBtn}
              onClick={handleClose}
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Close popup"
              style={{ color: popupData.text_color }}
            >
              <CloseIcon />
            </motion.button>

            {/* Image if available */}
            {popupData.image_url && (
              <motion.img
                src={popupData.image_url}
                alt={popupData.title}
                className={styles.popupImage}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              />
            )}

            {/* Content */}
            <motion.div
              className={styles.popupContent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2
                className={styles.popupTitle}
                style={{ color: popupData.text_color }}
              >
                {popupData.title}
              </h2>
              <p
                className={styles.popupMessage}
                style={{ color: popupData.text_color }}
              >
                {popupData.message}
              </p>
            </motion.div>

            {/* Actions */}
            <motion.div
              className={styles.popupActions}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={handleClose}
                className={styles.dismissBtn}
                style={{
                  color: popupData.text_color,
                  borderColor: popupData.text_color,
                }}
              >
                Dismiss
              </button>
              {popupData.button_text && (
                <button
                  onClick={handleButtonClick}
                  className={styles.actionBtn}
                  style={{
                    backgroundColor: popupData.button_color || '#6a4c93',
                    color: (popupData.button_color === '#ffbf00' || popupData.button_color === '#ffc926') ? '#000000' : '#ffffff'
                  }}
                >
                  {popupData.button_text}
                </button>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
