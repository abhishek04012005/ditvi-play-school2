# Popup Management System Setup Guide

## Overview
Complete popup management system with options to show enquiry popup, message popup, or hide all popups on the homepage.

## Database Setup

### 1. Run SQL Migration
Execute the SQL commands in `/db/create_popup_settings_table.sql`:

```sql
-- Create popup_control table (main control table)
-- Create message_popup table (for custom messages)
-- Create popup_settings table (for popup configuration)
```

This creates three tables:
- **popup_control**: Main control table for active popup type
- **message_popup**: Stores custom message popup content
- **popup_settings**: Configuration for popup settings

### 2. API Endpoints Created

#### Popup Control Endpoints
- `GET /api/admin/popup-control` - Fetch current popup settings
- `PUT /api/admin/popup-control` - Update popup settings

#### Message Popup Endpoints
- `GET /api/admin/message-popup` - Get all message popups
- `POST /api/admin/message-popup` - Create new message popup
- `PUT /api/admin/message-popup/[id]` - Update message popup
- `DELETE /api/admin/message-popup/[id]` - Delete message popup

## Components Created

### 1. PopupManagement Component
**Location**: `/src/components/admin/popupmanagement/popupmanagement.tsx`

Features:
- Three popup type selection cards (Enquiry, Message, None)
- Enquiry popup delay configuration
- Message popup CRUD operations
- Live preview and styling options
- Toggle switches for activation

### 2. MessagePopup Component
**Location**: `/src/components/enquiry/messagepopup/messagepopup.tsx`

Features:
- Displays custom message popups on homepage
- Customizable colors and styling
- Optional image support
- Button with custom link
- Automatic hiding/dismissal

### 3. EnquiryPopup Component
**Update**: `/src/components/enquiry/enquirypopup/enquirypopup.tsx`

Existing component - works with popup control system

## Integration Steps

### Step 1: Add PopupManagement to Dashboard
Update your admin dashboard to include the PopupManagement component:

```tsx
import PopupManagement from '@/components/admin/popupmanagement/popupmanagement';

// In your dashboard component:
<PopupManagement />
```

### Step 2: Add MessagePopup to Homepage
Update your homepage layout to include the MessagePopup component:

```tsx
import MessagePopupComponent from '@/components/enquiry/messagepopup/messagepopup';
import EnquiryPopup from '@/components/enquiry/enquirypopup/enquirypopup';

// In your layout.tsx or page.tsx:
<MessagePopupComponent />
<EnquiryPopup />
```

### Step 3: Update EnquiryPopup (Optional)
If you want the enquiry popup to respect the popup control settings:

Update `/src/components/enquiry/enquirypopup/enquirypopup.tsx`:

```tsx
useEffect(() => {
  const fetchPopupControl = async () => {
    try {
      const res = await fetch('/api/admin/popup-control');
      const data = await res.json();
      
      if (data.success) {
        const control = data.data;
        // Only show enquiry popup if it's the active type
        if (control.active_popup_type === 'enquiry') {
          setDelay(control.enquiry_popup_delay_ms);
          setCanShow(true);
        } else {
          setCanShow(false);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  fetchPopupControl();
}, []);
```

## User Guide

### Managing Popups (Admin Dashboard)

1. **Navigate to Popup Management section** in admin dashboard
2. **Select Popup Type**:
   - **Enquiry Popup**: Shows the enquiry form popup
   - **Message Popup**: Shows custom message popup
   - **Hide All**: Disables all popups

3. **Configure Enquiry Popup**:
   - Set delay before showing (in milliseconds)
   - Default: 5000ms (5 seconds)

4. **Create Message Popup**:
   - Click "Create New" button
   - Fill in title, message, colors
   - Optional: Add button text, link, and image
   - Save to activate

5. **Manage Message Popups**:
   - **Toggle**: Enable/disable without deleting
   - **Edit**: Modify popup content and styling
   - **Delete**: Remove permanently

## Features

### Popup Control
- **Enquiry Popup**: Shows form for enquiries with customizable delay
- **Message Popup**: Shows custom message with styling options
- **Hide All**: Prevents any popups from showing

### Message Popup Customization
- **Colors**: Custom background, text, and button colors
- **Image**: Optional header image
- **Button**: Optional action button with custom link
- **Visibility**: Toggle on/off without deleting

### Smart Display
- Popups respect active type setting
- Message popup shows only if active and enabled
- Enquiry popup shows only if set as active type
- Configurable delays for better UX

## Database Queries

### Check Current Popup Control
```sql
SELECT * FROM popup_control;
```

### Get All Message Popups
```sql
SELECT * FROM message_popup WHERE is_active = true;
```

### Update Active Popup Type
```sql
UPDATE popup_control 
SET active_popup_type = 'message' 
WHERE id = (SELECT id FROM popup_control LIMIT 1);
```

### Get Currently Active Message Popup
```sql
SELECT mp.* FROM message_popup mp
JOIN popup_control pc ON pc.message_popup_id = mp.id
WHERE pc.active_popup_type = 'message' AND mp.is_active = true;
```

### Delete Inactive Message Popups
```sql
DELETE FROM message_popup 
WHERE is_active = false AND created_at < NOW() - INTERVAL '30 days';
```

## Styling

Both components use CSS Modules:
- `/src/components/admin/popupmanagement/popupmanagement.module.css`
- `/src/components/enquiry/messagepopup/messagepopup.module.css`

Colors match website theme:
- Primary Purple: #6a4c93
- Success Green: #10b981
- Error Red: #ef4444
- Light Purple: #f3e8ff

## Tips & Best Practices

1. **Mobile Friendly**: All popups are responsive
2. **Accessibility**: Proper ARIA labels and keyboard support
3. **Performance**: Popups load asynchronously
4. **User Experience**: Configurable delays prevent jarring appearance
5. **Testing**: Test popups with all active types before deploying

## Troubleshooting

### Popup Not Showing
- Check popup_control active_popup_type setting
- Verify message_popup is marked is_active = true
- Check browser console for errors

### Styling Issues
- Verify color values are valid hex codes
- Check CSS modules are imported correctly
- Clear browser cache

### Database Issues
- Verify tables exist: `\dt` in psql
- Check popup_control has default record
- Ensure Supabase connection is active

## Support

For issues or questions:
1. Check database tables and values
2. Review browser console for JavaScript errors
3. Verify API endpoints are responding
4. Check Supabase connection status
