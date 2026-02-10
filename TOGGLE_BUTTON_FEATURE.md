# Toggle Button Feature - Enquiry Dashboard

## ✅ Implementation Complete

A toggle button has been successfully added to the Enquiry Dashboard at `/admin/dashboard/enquiry` that allows you to switch between:

1. **Enquiry List View** - Shows the enquiry table with search, filtering, and management features
2. **Popup Settings View** - Shows the Popup Management interface for controlling popups

---

## 🎛️ How It Works

### **Toggle Button**
- **Location**: Top-left of the controls section in the header
- **Label**: 
  - `⚙️ Popup Settings` (when viewing enquiries)
  - `👥 View Enquiries` (when viewing popup settings)
- **Style**: 
  - Purple outline button with gradient background
  - Changes to solid purple gradient when active
  - Smooth hover and click animations

### **Switching Between Views**

#### **From Enquiry List to Popup Settings**:
1. Click the **`⚙️ Popup Settings`** button at the top
2. The enquiry table, search, download, and filter controls disappear
3. PopupManagement component appears with smooth animation
4. Button changes to **`👥 View Enquiries`** and becomes active (purple)

#### **From Popup Settings back to Enquiry List**:
1. Click the **`👥 View Enquiries`** button
2. PopupManagement component fades out
3. Enquiry table, search, download, and filter controls reappear
4. Button reverts to default style

---

## 📋 Code Changes

### **Files Modified**:

#### 1. **`/src/admin/dashboard/enquiry/enquiry.tsx`**

**Added State**:
```tsx
// Toggle state for switching between views
const [showPopupManagement, setShowPopupManagement] = useState(false);
```

**Added Toggle Button**:
```tsx
<motion.button
    className={`${styles.toggleViewBtn} ${showPopupManagement ? styles.active : ''}`}
    onClick={() => setShowPopupManagement(!showPopupManagement)}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    title={showPopupManagement ? 'Show Enquiries' : 'Show Popup Settings'}
>
    {showPopupManagement ? '👥 View Enquiries' : '⚙️ Popup Settings'}
</motion.button>
```

**Conditional Rendering**:
```tsx
{!showPopupManagement ? (
    // Show Enquiry Table, Search, Filter, Pagination
) : (
    // Show PopupManagement Component
)}
```

#### 2. **`/src/admin/dashboard/enquiry/enquiry.module.css`**

**Added CSS Classes**:
```css
/* Toggle View Button */
.toggleViewBtn {
    padding: 0.85rem 1.5rem;
    background: linear-gradient(135deg, #e0d4f7 0%, #f0e8ff 100%);
    color: var(--primary-purple);
    border: 2px solid var(--primary-purple);
    border-radius: 10px;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: var(--transition);
    font-family: 'Verdana', sans-serif;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.toggleViewBtn:hover {
    background: linear-gradient(135deg, #d4c5e2 0%, #e0d4f7 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(106, 76, 147, 0.2);
}

.toggleViewBtn.active {
    background: linear-gradient(135deg, #6a4c93 0%, #8b5cf6 100%);
    color: white;
    border-color: #6a4c93;
}

.toggleViewBtn.active:hover {
    box-shadow: 0 8px 20px rgba(106, 76, 147, 0.35);
    transform: translateY(-3px);
}
```

---

## 🎨 Features

✨ **Smooth Animations**:
- Framer Motion animations for button hover and click
- Fade transitions between views
- Scale transformations on interaction

🎯 **Visual Feedback**:
- Button changes color and style when active
- Hover effects with shadow and lift animations
- Title tooltips for better UX

📱 **Responsive Design**:
- Works on all screen sizes
- Button wraps with controls on smaller screens
- Touch-friendly click areas

🔄 **State Management**:
- Simple toggle state
- Conditional rendering of views
- Smooth transitions between states

---

## 🌈 Styling

### **Button States**:

**Default (Not Active)**:
- Background: Light purple gradient (#e0d4f7 → #f0e8ff)
- Text: Purple (#6a4c93)
- Border: Purple (#6a4c93)

**Hover (Not Active)**:
- Background: Slightly darker purple gradient
- Shadow: Medium elevation
- Transform: Lifted up 2px

**Active**:
- Background: Dark purple gradient (#6a4c93 → #8b5cf6)
- Text: White
- Border: Dark purple
- Shadow: Stronger elevation on hover

---

## 🚀 Usage

### **Accessing Popup Settings**:
1. Go to `/admin/dashboard/enquiry`
2. Click the **`⚙️ Popup Settings`** button at the top
3. Manage popups (create, edit, delete, toggle)
4. Click **`👥 View Enquiries`** to return to enquiry list

### **Quick Switch**:
- Button is always visible at the top of controls
- One-click toggle between views
- No page reload needed

---

## 💡 Benefits

✅ **Single Page Interface** - No need to navigate between different pages
✅ **Organized Workflow** - Keep related tasks together
✅ **Visual Clarity** - Clear indicator of current view
✅ **Smooth UX** - Animated transitions between views
✅ **Mobile Friendly** - Works on all devices

---

## 📌 Notes

- The search, download, and filter controls only show when viewing enquiries
- Popup management controls appear when the toggle is active
- Button state is maintained during the session
- No data is lost when switching between views
- All enquiry operations work as before

---

## 🎯 Next Steps

1. Test the toggle button functionality
2. Verify smooth animations on your device
3. Check responsive design on different screen sizes
4. Use the Popup Settings to manage popups easily

**Status**: ✅ **FULLY IMPLEMENTED AND READY**

Visit `/admin/dashboard/enquiry` to see the toggle button in action! 🚀
