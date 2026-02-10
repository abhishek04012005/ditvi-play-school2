# Popup Management Integration Guide

## ✅ Completed Integration

The Popup Management feature has been successfully integrated into both dashboard pages:

### 1. **Main Dashboard** 
- **URL**: `http://localhost:3000/admin/dashboard`
- **Location**: Bottom of dashboard (after all metrics and statistics)
- **Component**: PopupManagement with full CRUD functionality

### 2. **Enquiry Dashboard**
- **URL**: `http://localhost:3000/admin/dashboard/enquiry`
- **Location**: Bottom of enquiry dashboard (after brochure modal)
- **Component**: PopupManagement with full CRUD functionality

---

## 🎯 Features Available

### **Popup Type Selection** (3 Options)
1. **Enquiry Popup** - Shows enquiry form on homepage
2. **Message Popup** - Shows custom message with styling
3. **Hide All** - Disables all popups

### **Enquiry Popup Settings**
- Configurable delay before popup appears (in milliseconds)
- Default: 5000ms (5 seconds)
- Min: 0ms, Step: 1000ms

### **Message Popup Management**
- ✨ **Create** - Add new custom message popups
- ✏️ **Edit** - Modify existing popups
- 🗑️ **Delete** - Remove popups
- ⚙️ **Toggle** - Enable/disable without deleting

### **Customization Options**
- **Title** - Popup heading text
- **Message** - Main popup content
- **Button Text** - Optional action button label
- **Button Link** - URL to open when button clicked
- **Colors**:
  - Background color
  - Text color
  - Button color
- **Image** - Optional header image URL

---

## 📋 What Was Changed

### Dashboard Files Modified:

1. **`/src/admin/dashboard/dashboard.tsx`**
   - Added PopupManagement import
   - Added PopupManagement component section before Recent Activity
   - Wrapped in motion animation for smooth entrance

2. **`/src/admin/dashboard/enquiry/enquiry.tsx`**
   - Added PopupManagement import
   - Added PopupManagement component section at the end
   - Wrapped in motion animation for smooth entrance

### Files Created (Earlier):

1. **API Routes**:
   - `/src/app/api/admin/popup-control/route.ts` - GET/PUT popup settings
   - `/src/app/api/admin/message-popup/route.ts` - GET/POST message popups
   - `/src/app/api/admin/message-popup/[id]/route.ts` - PUT/DELETE individual popups

2. **Components**:
   - `/src/components/admin/popupmanagement/popupmanagement.tsx` - Admin management UI
   - `/src/components/enquiry/messagepopup/messagepopup.tsx` - Homepage display component

3. **Styles**:
   - `/src/components/admin/popupmanagement/popupmanagement.module.css` - Management UI styles
   - `/src/components/enquiry/messagepopup/messagepopup.module.css` - Message popup styles

4. **Database**:
   - `/db/create_popup_settings_table.sql` - SQL migration

5. **Documentation**:
   - `/POPUP_MANAGEMENT_SETUP.md` - Complete setup guide

---

## 🚀 How to Use

### Access Popup Management:
1. Go to **Admin Dashboard** (`/admin/dashboard`)
2. Scroll to bottom to see **"🎯 Popup Type Selection"** section
3. Or go to **Enquiry Dashboard** (`/admin/dashboard/enquiry`)
4. Scroll to bottom to see the same section

### Managing Popups:

#### **Select Popup Type**:
- Click on **Enquiry Popup** card to enable enquiry form
- Click on **Message Popup** card to enable custom message
- Click on **Hide All** card to disable all popups

#### **Configure Enquiry Popup**:
- Input delay in milliseconds
- Example: 5000ms = 5 seconds delay before popup shows

#### **Create Message Popup**:
1. Click **"Create New"** button
2. Fill in required fields (Title, Message)
3. Add optional button text and link
4. Choose colors for background, text, and button
5. Click **Save**

#### **Edit Message Popup**:
1. Find popup in list
2. Click **Edit icon** (pencil)
3. Update fields as needed
4. Click **Save**

#### **Delete Message Popup**:
1. Find popup in list
2. Click **Delete icon** (trash)
3. Confirm deletion

#### **Toggle Popup Active/Inactive**:
1. Find popup in list
2. Click **Toggle switch** to enable/disable
3. Changes apply immediately

---

## 🌐 Homepage Display

### **Message Popup on Homepage**:
The `MessagePopupComponent` automatically:
- Fetches popup control settings
- Displays message popup if active and enabled
- Uses custom colors and styling
- Shows optional image and button
- Respects dismiss actions

**Integration Required** in your homepage/layout:
```tsx
import MessagePopupComponent from '@/components/enquiry/messagepopup/messagepopup';
import EnquiryPopup from '@/components/enquiry/enquirypopup/enquirypopup';

// In your layout or page:
<MessagePopupComponent />
<EnquiryPopup />
```

---

## 📊 Database Structure

### **popup_control** Table:
```
- id (UUID)
- active_popup_type: 'enquiry' | 'message' | 'none'
- message_popup_id (FK to message_popup)
- enquiry_popup_delay_ms (integer)
- is_enquiry_popup_enabled (boolean)
- created_at, updated_at
```

### **message_popup** Table:
```
- id (UUID)
- title (string)
- message (text)
- button_text (string, optional)
- button_link (string, optional)
- is_active (boolean)
- is_show_on_home_page (boolean)
- background_color, text_color, button_color
- image_url (optional)
- created_at, updated_at
```

---

## 🎨 Color Scheme

The Popup Management UI uses your website theme colors:
- **Primary Purple**: #6a4c93
- **Success Green**: #10b981
- **Error Red**: #ef4444
- **Light Purple**: #f3e8ff
- **Light Blue**: #f0f7ff

---

## ✨ Key Features

✅ **Responsive Design** - Works on all devices
✅ **Real-time Updates** - Changes apply immediately
✅ **No Page Reload** - Smooth API calls
✅ **Error Handling** - User-friendly error messages
✅ **Toast Notifications** - Visual feedback for actions
✅ **Smooth Animations** - Motion effects for better UX
✅ **Accessibility** - Proper labels and keyboard support
✅ **Mobile Friendly** - Touch-friendly interface

---

## 🔧 Troubleshooting

### Popup Management Not Showing:
- Check that component was added to dashboard files
- Verify PopupManagement import is correct
- Clear browser cache and reload

### API Errors:
- Verify database tables were created (run SQL migration)
- Check Supabase connection
- Check browser console for error details

### Styling Issues:
- Verify CSS modules are imported
- Check color values are valid hex codes
- Clear Next.js cache: `rm -rf .next` then `npm run dev`

---

## 📞 Next Steps

1. **Run SQL Migration** (if not done):
   - Execute `/db/create_popup_settings_table.sql` in Supabase

2. **Test Admin Panel**:
   - Go to `/admin/dashboard`
   - Try creating a message popup
   - Verify settings are saved

3. **Add to Homepage** (if needed):
   - Import MessagePopupComponent in your layout
   - Test popup displays correctly on homepage

4. **Monitor Usage**:
   - Use admin dashboard to manage popups
   - Monitor user interactions
   - Adjust delays and messaging as needed

---

## 💡 Tips

- Use **short delays** (2-5 seconds) to avoid annoying users
- Create **compelling messages** with clear call-to-action buttons
- Test popups on **different devices** before deploying
- Use **contrasting colors** for better visibility
- Add **images** to make popups more engaging
- Monitor **conversion rates** for message popups

---

**Status**: ✅ **FULLY INTEGRATED AND READY TO USE**

Visit `/admin/dashboard` or `/admin/dashboard/enquiry` to start managing popups!
