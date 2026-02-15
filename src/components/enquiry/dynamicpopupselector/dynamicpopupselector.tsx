'use client';
import { useState, useEffect } from 'react';
import EnquiryPopup from '@/components/enquiry/enquirypopup/enquirypopup';
import MessagePopupComponent from '@/components/enquiry/messagepopup/messagepopup';

interface PopupControl {
  active_popup_type: 'enquiry' | 'message' | 'none';
  message_popup_id?: string;
  enquiry_popup_delay_ms: number;
}

export default function DynamicPopupSelector() {
  const [popupControl, setPopupControl] = useState<PopupControl | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch immediately on mount
    const initialFetch = async () => {
      await fetchPopupControl();
    };
    
    initialFetch();
    
    // Refresh popup control every 2 seconds to detect admin changes
    const interval = setInterval(fetchPopupControl, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchPopupControl = async () => {
    try {
      const res = await fetch('/api/admin/popup-control', {
        cache: 'no-store'
      });
      
      if (!res.ok) {
        console.warn(`⚠️ API returned status ${res.status}`);
        // Set default state instead of throwing
        setPopupControl({
          active_popup_type: 'none',
          enquiry_popup_delay_ms: 1000
        });
        setLoading(false);
        return;
      }
      
      const data = await res.json();

      if (data.success && data.data) {
        let popupControlData = data.data;

        // Validate: if message type is selected, ensure message_popup_id exists
        if (popupControlData.active_popup_type === 'message' && !popupControlData.message_popup_id) {
          console.warn('⚠️ MESSAGE POPUP TYPE IS SELECTED BUT NO message_popup_id SET! Reverting to "none"');
          // Auto-fix: revert to 'none' to prevent display issues
          try {
            const fixRes = await fetch('/api/admin/popup-control', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...popupControlData,
                active_popup_type: 'none',
                message_popup_id: null,
              }),
            });
            const fixData = await fixRes.json();
            if (fixData.success) {
              popupControlData = fixData.data;
              console.log('✅ Auto-fixed popup type to "none"');
            }
          } catch (fixError) {
            console.error('Error auto-fixing popup type:', fixError);
          }
        }

        setPopupControl(popupControlData);
        setError(null);
        console.log('[SUCCESS] Popup control fetched:', {
          type: popupControlData.active_popup_type,
          messagePopupId: popupControlData.message_popup_id,
          delay: popupControlData.enquiry_popup_delay_ms,
          fullData: popupControlData
        });

        // Debug message popup specific data
        if (popupControlData.active_popup_type === 'message') {
          console.log('[POPUP] Message popup is active. ID:', popupControlData.message_popup_id);
          if (!popupControlData.message_popup_id) {
            console.warn('⚠️ MESSAGE POPUP TYPE IS SELECTED BUT NO message_popup_id SET!');
          }
        }
      } else {
        console.warn('⚠️ No popup control data:', data);
        setError(data.error || 'No popup control data');
        // Set default state
        setPopupControl({
          active_popup_type: 'none',
          enquiry_popup_delay_ms: 1000
        });
      }
    } catch (error) {
      console.error('❌ Error fetching popup control:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      // Set default state on error
      setPopupControl({
        active_popup_type: 'none',
        enquiry_popup_delay_ms: 1000
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything while first load is happening
  if (loading && !popupControl) {
    console.log('[LOAD] DynamicPopupSelector initial loading...');
    return null;
  }

  // If still no data after loading, show nothing
  if (!popupControl) {
    console.warn('⚠️ No popup control data available');
    return null;
  }

  console.log('[RENDER] DynamicPopupSelector rendering with type:', popupControl.active_popup_type);

  // Show appropriate popup based on active_popup_type
  if (popupControl.active_popup_type === 'enquiry') {
    console.log('[POPUP] Rendering EnquiryPopup with delay:', popupControl.enquiry_popup_delay_ms);
    return <EnquiryPopup delay={popupControl.enquiry_popup_delay_ms || 1000} />;
  }

  if (popupControl.active_popup_type === 'message') {
    console.log('[MSG] Message type detected. message_popup_id:', popupControl.message_popup_id);
    
    if (!popupControl.message_popup_id) {
      console.error('❌ MESSAGE POPUP IS SELECTED BUT NO message_popup_id PROVIDED!');
      console.log('[CONFIG] Please set a valid message popup in PopupManagement dashboard');
      console.log('[AUTO-FIX] Attempting to auto-fix by setting popup type to "none"...');
      // Return nothing - the auto-fix in fetchPopupControl will handle this
      return null;
    }
    
    console.log('[RENDER] Rendering MessagePopupComponent with ID:', popupControl.message_popup_id);
    return <MessagePopupComponent messagePopupId={popupControl.message_popup_id} />;
  }

  console.log('[NONE] Popup type is "none" - showing nothing');
  return null;
}
