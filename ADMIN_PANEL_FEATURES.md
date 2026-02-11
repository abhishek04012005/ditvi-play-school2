# Admin Panel - Complete Feature Analysis

**Last Updated:** February 10, 2026  
**Application:** Ank Square Play School - Admin Management System  
**Tech Stack:** Next.js 13.5+, React, Supabase, Material-UI, Framer Motion

---

## Table of Contents
1. [Authentication & User Management](#1-authentication--user-management)
2. [Dashboard Overview](#2-dashboard-overview)
3. [Admission Management](#3-admission-management)
4. [Enquiry Management](#4-enquiry-management)
5. [Contact Management](#5-contact-management)
6. [Receipt Management](#6-receipt-management)
7. [Document & Download Management](#7-document--download-management)
8. [Spotlight/Featured Content](#8-spotlightfeatured-content)
9. [Change Password](#9-change-password)
10. [Navigation & UI](#10-navigation--ui)

---

## 1. Authentication & User Management

### 1.1 Admin Login System
**File:** `src/admin/login/login.tsx`  
**Component:** `AdminLogin`

#### Features:
- **Username & Password Authentication**
  - Secure login with SHA-256 password hashing using salt
  - Form validation for username and password
  - Error handling for invalid credentials
  
- **UI Components:**
  - Username input field with icon
  - Password input field with show/hide toggle
  - Eye/EyeSlash icons for password visibility
  - Submit button with loading state
  - Toast notifications for errors

- **Security Features:**
  - Password encryption using SHA-256 with salt
  - User active status verification
  - Session management via Supabase
  - Automatic redirect on successful login
  - Loader/spinner during authentication

- **Error Handling:**
  - Invalid credentials error
  - Inactive user account notification
  - Security configuration error handling
  - Network error handling

---

### 1.2 Manage Users
**File:** `src/admin/manageuser/manageuser.tsx`  
**Component:** `ManageUser`

#### Features:
- **User List Management**
  - Display all registered users in a table
  - Search functionality by username
  - User status: Active/Inactive
  - Role-based access control
  - Creation date tracking

- **User CRUD Operations:**
  - **Create New User**
    - Username input
    - Role selection (dropdown)
    - Password generation
    - Password visibility toggle
    - Form validation
    - Modal popup interface
  
  - **Edit User**
    - Modify user role
    - Update active status
    - Inline editing capabilities
  
  - **Delete User**
    - Remove user from system
    - Confirmation dialog
    - Role restriction (only admins can delete)

- **Password Management:**
  - **Reset Password Feature**
    - Modal dialog for password reset
    - New password input
    - Confirm password input
    - Password visibility toggle
    - Password validation (match check)
    - Clear error handling
  
  - **Generate Random Password**
    - System generates secure passwords for new users
    - Display generated password to admin
    - Copy to clipboard option

- **Role-Based Features:**
  - Admin role verification
  - Only admins can create/delete users
  - Different permission levels

- **UI/UX Elements:**
  - Search bar with filtering
  - User table with pagination
  - Modal dialogs for create/edit/delete
  - Animated transitions (Framer Motion)
  - Toast notifications for all actions
  - Loader during API calls

- **Database Operations:**
  - Fetch all users from Supabase
  - Fetch roles from Supabase
  - Create new user record
  - Update user status/role
  - Delete user record
  - Hash password before storage

---

## 2. Dashboard Overview

**File:** `src/admin/dashboard/dashboard.tsx`  
**Component:** `Dashboard`

#### Features:
- **Navigation Tabs:**
  - Admission Management
  - Enquiry Management
  - Contact Management
  - Receipt Management
  - Download Management
  - Document Dashboard

- **Dashboard Statistics:**
  - Total admissions count
  - Total enquiries count
  - Total contacts count
  - Status-wise breakdown

- **Quick Access Links:**
  - Navigation buttons to each section
  - Icon-based visual navigation
  - Responsive layout

---

## 3. Admission Management

**File:** `src/admin/dashboard/admission/admission.tsx`  
**Component:** `Admission`

### 3.1 Admission List View

#### Features:
- **Data Display:**
  - Admission number (unique identifier)
  - Child name
  - Parent name
  - Contact phone
  - Program enrolled
  - Admission status
  - Admission source
  - Created date

- **Status Management:**
  - **Status Types:**
    - 🟡 In Review - Initial status
    - ✅ Reviewed - Admin reviewed
    - 📅 Interview Scheduled - Interview pending
    - ✔️ Confirmed - Admitted
    - ❌ Rejected - Application rejected
    - 🔧 Under Correction - Awaiting document correction

  - **Status Update:**
    - Click on status to change
    - Modal popup with status options
    - Confirmation before saving
    - Toast notification on success
    - Automatic status history tracking

- **Search & Filtering:**
  - Search by admission number
  - Search by child name
  - Search by parent name
  - Search by phone number
  - Real-time search as you type
  - Case-insensitive search

- **Sorting:**
  - Sort by admission date (newest/oldest)
  - Sort by child name (A-Z / Z-A)
  - Sort by parent name (A-Z / Z-A)
  - Sort by status
  - Column header click to toggle sort
  - Visual sort indicators (↑/↓)

- **Pagination:**
  - Items per page options: 20, 50, 100
  - Previous/Next buttons
  - Current page indicator
  - Jump to page functionality
  - Total count display

### 3.2 Admission Source Icons
**Admission Source Display with Material-UI Icons:**

| Source | Icon | Color | Display |
|--------|------|-------|---------|
| Enquiry | PhoneOutlined | Default | 📞 |
| Social Media | SmartphoneOutlined | Default | 📱 |
| Web | LanguageOutlined | Default | 🌐 |
| Offline | BusinessOutlined | Default | 🏢 |

### 3.3 Admission Details Modal

#### Features:
- **Detailed Information Display:**
  - Full child information (name, DOB, gender, blood group, place of birth)
  - Full parent information (names, address, contact, email)
  - Program details
  - Previous school information
  - Document uploads (birth certificate, aadhar card, parent ID proof)
  - Photo upload preview

- **Document Management:**
  - Display uploaded documents
  - Download document links
  - View document in modal
  - Delete document option

- **Interactive Features:**
  - Tabbed interface (Info, Documents, Notes)
  - Smooth animations (Framer Motion)
  - Copy to clipboard for phone numbers
  - Email links (mailto)
  - WhatsApp quick contact button (removed from view section)

### 3.4 Action Buttons in Details View

#### Available Actions:
1. **Download Button**
   - Icon: DownloadOutlined
   - Opens download data modal
   - Download as CSV/Excel
   - Multiple export formats

2. **Edit Button**
   - Icon: EditOutlined
   - Navigates to edit admission form
   - Pre-fills all existing data
   - Allows updating all fields
   - Primary color styling (#6a4c93)

3. **SMS/WhatsApp Brochure Buttons**
   - **SMS Button**
     - Icon: MessageOutlined (orange #f59e0b)
     - Sends brochure via SMS
     - Pre-defined message
     - Phone number auto-filled
   
   - **WhatsApp Button** (removed from view section as per request)
     - Icon: WhatsApp (green #25d366)
     - Sends brochure via WhatsApp
     - Pre-formatted message
     - Opens WhatsApp directly

4. **School Brochure Button**
   - Icon: AssignmentOutlined (primary #6a4c93)
   - Opens brochure PDF
   - Downloadable brochure

5. **Fee Structure Button**
   - Icon: AttachMoneyOutlined (primary #6a4c93)
   - Opens fee structure document
   - Links to fee-structure page

### 3.5 Notes/Remarks System

#### Features:
- **Add Notes:**
  - Text input field with edit icon
  - Add note button
  - Notes appear in chronological order
  - Each note shows timestamp
  - Shows who added the note (userName)

- **View Notes:**
  - Notes displayed in modal or expandable section
  - Full note history
  - Each note with timestamp

- **Edit Notes:**
  - Update existing notes
  - Modify note content
  - Update timestamp automatically

- **Delete Notes:**
  - Remove notes from record
  - Confirmation before deletion

### 3.6 Brochure Popup Modal

#### Features:
- **Brochure Selection:**
  - School Brochure button (AssignmentOutlined icon - primary color)
  - Fee Structure button (AttachMoneyOutlined icon - primary color)

- **Personalized Brochure Display:**
  - Shows student name: "Welcome [Child Name]"
  - Admission/Enquiry number
  - Program information
  - Full brochure template with:
    - School information
    - Program details
    - Fee structure
    - Teacher information
    - Facilities
    - Contact information

- **Brochure Actions:**
  - Download as PDF
  - Print option
  - Share via email

### 3.7 Status Cards Summary

#### Displays:
- Total Admissions
- In Review Count
- Reviewed Count
- Interview Scheduled Count
- Confirmed Count
- Rejected Count
- Under Correction Count

Each card shows:
- Count number
- Status label
- Relevant icon
- Color-coded background
- Click to filter by status

---

## 4. Enquiry Management

**File:** `src/admin/dashboard/enquiry/enquiry.tsx`  
**Component:** `Enquiry`

### 4.1 Enquiry List View

#### Features:
- **Data Display:**
  - Enquiry number (unique)
  - Parent name
  - Child name
  - Contact phone
  - Program interested in
  - Enquiry status
  - Created date

- **Status Management:**
  - **Status Types:**
    - 🆕 New - Initial enquiry
    - 📞 Contacted - First contact made
    - ✅ Enrolled - Converted to admission
    - ❌ Cancelled - Enquiry cancelled

  - **Status Update:**
    - Click status to change
    - Modal with status options
    - Confirmation required
    - Toast notification

- **Search & Filtering:**
  - Search by enquiry number
  - Search by child name
  - Search by parent name
  - Search by phone
  - Real-time search

- **Sorting:**
  - Sort by date
  - Sort by name
  - Sort by status
  - Ascending/descending
  - Visual sort indicators

- **Pagination:**
  - 20, 50, 100 items per page
  - Previous/Next navigation
  - Current page info
  - Total count

### 4.2 Enquiry Details Modal

#### Features:
- **Information Display:**
  - Full parent and child details
  - Phone number with copy option
  - Program interest
  - Source of enquiry
  - Date of enquiry

- **Action Buttons:**
  - **Phone Button**
    - Direct phone call option
    - Click to call functionality

  - **SMS Button**
    - Send SMS to parent
    - Pre-defined messages
    - Number auto-filled

  - **WhatsApp Button**
    - Send WhatsApp message
    - Pre-formatted templates
    - Opens WhatsApp directly

  - **Download Button**
    - Export enquiry data
    - CSV/Excel format

  - **Brochure Buttons**
    - School Brochure (AssignmentOutlined - primary color)
    - Fee Structure (AttachMoneyOutlined - primary color)

### 4.3 Notes System for Enquiries
- Add/Edit/Delete notes
- Timestamp for each note
- Admin name tracking
- Full note history

### 4.4 Enquiry Status Cards
- New enquiries count
- Contacted count
- Enrolled count
- Cancelled count
- Color-coded cards
- Click to filter

### 4.5 WhatsApp Message Templates
**Dynamic Message Generation Based on Status:**

- **New Status:** Welcome message + Brochure offer
- **Contacted Status:** Follow-up message + Program details
- **Enrolled Status:** Confirmation message + Next steps
- **Cancelled Status:** Feedback request message

Messages are pulled from `whatsappMessages.enquiry` JSON

---

## 5. Contact Management

**File:** `src/admin/dashboard/contact/contact.tsx`  
**Component:** `Contact`

### 5.1 Contact Messages List View

#### Features:
- **Data Display:**
  - Contact name
  - Email address
  - Phone number
  - Message preview
  - Contact status
  - Date received

- **Status Management:**
  - **Status Types:**
    - 🆕 New - Unread message
    - ✅ Replied - Response sent
    - ✔️ Resolved - Issue resolved
    - 📁 Archived - Archived message

  - **Status Update:**
    - Click to change status
    - Modal popup with options
    - Instant update
    - Toast confirmation

- **Search & Filtering:**
  - Search by name
  - Search by email
  - Search by phone
  - Real-time filtering

- **Sorting:**
  - Sort by date
  - Sort by name
  - Sort by status
  - Ascending/descending options

- **Pagination:**
  - 20, 50, 100 items per page
  - Navigation buttons
  - Current page display

### 5.2 Contact Details Modal

#### Features:
- **Full Message Display:**
  - Sender name
  - Email address
  - Phone number
  - Full message body
  - Date/time received

- **Action Buttons:**
  - **Phone Button**
    - Call contact directly
    - Click-to-call

  - **Email Button**
    - Send reply email
    - Opens email client
    - Pre-filled recipient

  - **WhatsApp Button** (removed from view section)
    - Send message via WhatsApp
    - Direct conversation

  - **Download Button**
    - Export contact info
    - CSV format

### 5.3 Contact Notes System
- Add notes about the contact
- Edit existing notes
- Delete notes
- Timestamp tracking
- Admin name tracking

### 5.4 Status Cards for Contacts
- Total contacts count
- New messages count
- Replied count
- Resolved count
- Archived count

---

## 6. Receipt Management

**File:** `src/admin/dashboard/receipt/receipt.tsx`  
**Component:** `Receipt`

#### Features:
- **Receipt List Display:**
  - Receipt number
  - Student name
  - Amount paid
  - Payment method
  - Payment date
  - Program
  - Status

- **Receipt Search:**
  - Search by receipt number
  - Search by student name
  - Search by amount

- **Receipt Details:**
  - Full payment information
  - Student details
  - Payment confirmation
  - PDF download option

- **Receipt Actions:**
  - Download receipt as PDF
  - Print receipt
  - Email receipt to parent
  - Generate new receipt

- **Receipt Sorting:**
  - Sort by date
  - Sort by amount
  - Sort by status

---

## 7. Document & Download Management

**File:** `src/admin/dashboard/download/DownloadData.tsx`  
**Component:** `DownloadModal`

### 7.1 Download Modal Features

#### Features:
- **Data Export Options:**
  - Export as CSV
  - Export as Excel (.xlsx)
  - Export as JSON

- **Selective Data Export:**
  - Choose which columns to export
  - Filter by date range
  - Filter by status
  - Filter by program

- **Export Contents:**
  - Full record data
  - All searchable fields
  - All display fields
  - Metadata (timestamps, etc.)

- **File Generation:**
  - Real-time file creation
  - Download to device
  - Formatted for spreadsheet applications
  - Proper column headers

### 7.2 Document Dashboard
**File:** `src/admin/dashboard/document-dashboard/`

#### Features:
- **Document Upload Management**
- **Document Verification**
- **Document Status Tracking**

---

## 8. Spotlight/Featured Content

**File:** `src/admin/spotlight/spotlight.tsx`  
**Component:** `Spotlight`

### 8.1 Spotlight Management

#### Features:
- **Featured Content Management:**
  - Add/Edit featured items
  - Image uploads
  - Title and description
  - Order/position management
  - Active/inactive toggle

- **Image Management:**
  - Image upload from device
  - Image preview
  - Crop/resize options
  - Compression options
  - Delete image

- **Content Organization:**
  - Drag-and-drop reordering
  - Organize by category
  - Set display order
  - Visibility control

### 8.2 Print Card Feature
**File:** `src/admin/spotlight/printcard/`

#### Features:
- **Student ID Card Printing**
- **Customizable Card Design**
- **Print-friendly Layout**

---

## 9. Change Password

**File:** `src/admin/changepassword/`  
**Component:** `ChangePassword`

#### Features:
- **Current Password Verification:**
  - Enter current password
  - Validation against stored password
  - Error if incorrect

- **New Password Entry:**
  - New password input
  - Confirm password input
  - Password visibility toggle
  - Password strength indicator
  - Validation rules:
    - Minimum 8 characters
    - Mix of uppercase/lowercase
    - Include numbers and symbols

- **Password Update:**
  - SHA-256 encryption with salt
  - Secure storage in database
  - Session update
  - Toast confirmation

- **Security:**
  - Password hashing before storage
  - Verification of current password
  - Secure transmission

---

## 10. Navigation & UI

### 10.1 Admin Navbar
**File:** `src/admin/navbar/`  
**Component:** `Navbar`

#### Features:
- **Navigation Links:**
  - Dashboard
  - Admissions
  - Enquiries
  - Contacts
  - Receipts
  - Downloads
  - Documents
  - Spotlight
  - Manage Users
  - Change Password
  - Logout

- **User Info Display:**
  - Current username
  - Current role
  - User avatar
  - Active status indicator

- **Mobile Responsive:**
  - Hamburger menu on mobile
  - Collapsible navigation
  - Touch-friendly buttons

- **Search Bar:**
  - Global search across all sections
  - Quick navigation

- **Settings Menu:**
  - Profile settings
  - Preferences
  - Help/Support
  - Logout button

### 10.2 Common UI Components

#### Animations:
- **Framer Motion:**
  - Smooth page transitions
  - Modal animations
  - Button hover effects
  - List item animations

#### Icons:
- **Material-UI Icons:**
  - PhoneOutlined
  - SmartphoneOutlined
  - LanguageOutlined
  - BusinessOutlined
  - AssignmentOutlined (primary #6a4c93)
  - AttachMoneyOutlined (primary #6a4c93)
  - MessageOutlined (orange #f59e0b)
  - WhatsApp (green #25d366)
  - SearchOutlined
  - SortOutlined
  - EditOutlined
  - DeleteOutlined
  - DownloadOutlined
  - VisibilityOutlined
  - AccessTimeOutlined
  - CheckCircleOutlined
  - And many more...

#### Toast Notifications:
- Success messages (green)
- Error messages (red)
- Info messages (blue)
- Warning messages (yellow)
- Auto-dismiss timing
- Manual dismiss option

#### Loaders:
- Circular progress spinner
- Page loading state
- Data fetch loader
- Button loading state

#### Modals:
- Status change modal
- Confirm delete modal
- Add note modal
- Edit form modal
- Details view modal
- Brochure preview modal

---

## 11. Brochure Integration

### 11.1 Personalized Brochure
**File:** `src/components/brochure/brochureTemplate.tsx`

#### Features:
- **Dynamic Welcome Message:**
  - "Welcome [Student Name], We appreciate you."
  - Admission No: [Number] OR Enquiry No: [Number]
  - Program: [Program Name]

- **Personalization:**
  - Student name integration
  - Program-specific information
  - Admission/Enquiry number display
  - Bilingual support (English/Hindi)

- **Brochure Sections:**
  - Welcome message (with student info)
  - Program overview
  - Fee structure
  - Facilities
  - Teacher information
  - Contact details
  - Testimonials

- **Download Options:**
  - PDF download
  - Print option
  - Share via email

---

## 12. Database Schema Integration

### Tables Used:
1. **admissions** - Admission records
2. **enquiries** - Enquiry records
3. **contacts** - Contact form submissions
4. **receipts** - Payment receipts
5. **users** - Admin users
6. **roles** - User roles
7. **documents** - Uploaded documents

### Key Fields Tracked:
- Timestamps (created_at, updated_at)
- Status fields
- Notes/remarks
- Document URLs
- User information
- Contact details
- Program preferences

---

## 13. Features Summary Table

| Feature | Module | Status | Icons | Export |
|---------|--------|--------|-------|--------|
| Admission Management | Dashboard | ✅ | MUI | CSV/Excel |
| Enquiry Management | Dashboard | ✅ | MUI | CSV/Excel |
| Contact Management | Dashboard | ✅ | MUI | CSV/Excel |
| Receipt Management | Dashboard | ✅ | MUI | CSV/Excel |
| User Management | Settings | ✅ | React Icons | - |
| Change Password | Settings | ✅ | React Icons | - |
| Notes/Remarks | All Modules | ✅ | MUI | - |
| Status Updates | All Modules | ✅ | MUI | - |
| SMS Integration | Enquiry/Contact | ✅ | MUI | - |
| WhatsApp Integration | Enquiry/Contact | ✅ | MUI | - |
| Brochure Download | Admission | ✅ | MUI | PDF |
| Document Upload | All Modules | ✅ | MUI | - |
| Search & Filter | All Modules | ✅ | MUI | - |
| Sorting | All Modules | ✅ | MUI | - |
| Pagination | All Modules | ✅ | MUI | - |
| Role-Based Access | All | ✅ | - | - |
| Password Encryption | Auth | ✅ | - | - |

---

## 14. Security Features

1. **Authentication:**
   - Username/password login
   - SHA-256 password hashing with salt
   - Active user status verification

2. **Authorization:**
   - Role-based access control
   - Admin-only features
   - User permission checking

3. **Data Protection:**
   - Encrypted passwords
   - Secure API calls via Supabase
   - User data privacy

4. **Session Management:**
   - Session tracking
   - Login requirement for all pages
   - Logout functionality

---

## 15. Performance Features

1. **Pagination:**
   - Reduced data load per page
   - 20/50/100 items per page options

2. **Search & Filter:**
   - Client-side filtering for faster results
   - Debounced search input

3. **Caching:**
   - Supabase real-time subscriptions
   - Efficient data fetching

4. **Animation:**
   - Smooth transitions with Framer Motion
   - Non-blocking animations

---

## 16. Accessibility Features

1. **Keyboard Navigation:**
   - Tab through form fields
   - Enter to submit forms
   - Escape to close modals

2. **Visual Indicators:**
   - Color-coded status
   - Icon labels
   - Clear typography

3. **Mobile Responsive:**
   - Mobile menu navigation
   - Touch-friendly buttons
   - Responsive layout

---

## 17. Integration Points

1. **Email Integration:**
   - Send emails via contact forms
   - Email notifications

2. **SMS Integration:**
   - Send SMS via API
   - Message templates

3. **WhatsApp Integration:**
   - Send WhatsApp messages
   - Message templates
   - Direct conversation links

4. **PDF Generation:**
   - Generate brochure PDFs
   - Generate receipt PDFs
   - Download capability

5. **File Export:**
   - CSV export
   - Excel export
   - JSON export

---

## 18. User Types & Permissions

### Admin User:
- ✅ Create/Edit/Delete admissions
- ✅ Create/Edit/Delete enquiries
- ✅ Create/Edit/Delete contacts
- ✅ Create/Edit/Delete receipts
- ✅ Create/Edit/Delete users
- ✅ Change password
- ✅ Manage spotlight
- ✅ Export data
- ✅ Send SMS/WhatsApp

### Staff User:
- ✅ View admissions
- ✅ View enquiries
- ✅ View contacts
- ✅ Add notes
- ✅ Send SMS/WhatsApp
- ✅ Change password
- ❌ Delete records
- ❌ Manage users

---

## 19. Recent Updates & Improvements

1. **Icon Standardization (February 2026):**
   - Migrated from emojis to Material-UI icons
   - Consistent color scheme (#6a4c93 primary)
   - Orange SMS icon (#f59e0b)
   - Green WhatsApp icon (#25d366)

2. **UI Cleanup:**
   - Removed WhatsApp from view sections
   - Fixed edit button styling
   - Primary color for brochure/fee buttons

3. **Personalization:**
   - Brochure welcome messages with student names
   - Dynamic admission/enquiry number display
   - Bilingual support

---

## 20. API Endpoints Used

All operations communicate with Supabase:

- `admissions` table CRUD
- `enquiries` table CRUD
- `contacts` table CRUD
- `receipts` table CRUD
- `users` table CRUD
- `roles` table READ
- `documents` table CRUD

---

**Document Status:** ✅ Complete  
**Last Reviewed:** February 10, 2026  
**Created By:** GitHub Copilot  
**Version:** 1.0
