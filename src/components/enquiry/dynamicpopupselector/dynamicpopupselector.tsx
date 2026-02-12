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
        setPopupControl(data.data);
        setError(null);
        console.log('[SUCCESS] Popup control fetched:', {
          type: data.data.active_popup_type,
          messagePopupId: data.data.message_popup_id,
          delay: data.data.enquiry_popup_delay_ms,
          fullData: data.data
        });

        // Debug message popup specific data
        if (data.data.active_popup_type === 'message') {
          console.log('[POPUP] Message popup is active. ID:', data.data.message_popup_id);
          if (!data.data.message_popup_id) {
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
      console.log('[CONFIG] You need to set a message popup in PopupManagement dashboard');
      return null;
    }
    
    console.log('[RENDER] Rendering MessagePopupComponent with ID:', popupControl.message_popup_id);
    return <MessagePopupComponent messagePopupId={popupControl.message_popup_id} />;
  }

  console.log('[NONE] Popup type is "none" - showing nothing');
  return null;
}
