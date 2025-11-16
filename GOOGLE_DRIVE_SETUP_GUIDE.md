# Google Drive OAuth2.0 Upload - Setup Guide

## 📋 Overview
This prototype allows users to upload photos to Google Drive using OAuth2.0 authentication with refresh tokens. The refresh token is stored in environment variables and automatically generates new access tokens as needed.

---

## 🚀 Quick Setup Steps

### Step 1: Get Google Cloud Credentials

#### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create a new project"
3. Enter project name (e.g., "PlaySchool Drive Upload")
4. Click "Create"

#### 1.2 Enable Google Drive API
1. In the Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Drive API"
3. Click on it and press "Enable"

#### 1.3 Create OAuth2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth Client ID"
3. Choose application type: **"Web application"**
4. Add authorized redirect URI:
   - `http://localhost:3000/api/auth/callback` (for local development)
   - `https://yourdomain.com/api/auth/callback` (for production)
5. Click "Create"
6. Copy and save:
   - **Client ID**
   - **Client Secret**

---

### Step 2: Generate Refresh Token

#### Option A: Using Google OAuth Playground (Easiest for Prototype)

1. Go to [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. In the settings (top right), check "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. On the left side:
   - In "Step 1", paste this scope: `https://www.googleapis.com/auth/drive`
   - Click "Authorize APIs"
5. You'll be redirected to Google login - sign in and grant permission
6. In "Step 2", click "Exchange authorization code for tokens"
7. **Copy the "Refresh token"** from the response

#### Option B: Using Node.js Script (For Production)

Create a file `generate-refresh-token.js`:
```javascript
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'http://localhost:3000/api/auth/callback'
);

// Generate the authorization URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/drive'],
});

console.log('Visit this URL:', authUrl);

// After user authorizes, exchange the code for refresh token
// (Implement callback handler)
```

---

### Step 3: Configure Environment Variables

1. Open `.env` file in your project root
2. Add/Update these variables:

```env
# Google Drive OAuth2.0 Credentials
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REFRESH_TOKEN=1//your-refresh-token-here
```

**Important:**
- ✅ These are server-side only (not exposed to frontend)
- ✅ Keep `.env` in `.gitignore`
- ✅ Never commit credentials to Git

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── upload-to-drive/
│   │       └── route.ts          # API endpoint for file upload
│   └── google-drive-upload/
│       └── page.tsx              # Demo page
├── components/
│   └── googledriveupload/
│       ├── googledriveupload.tsx  # React component
│       └── googledriveupload.module.css
└── lib/
    └── googleDrive.ts            # OAuth2.0 utility functions
```

---

## 🔧 How It Works

### Token Lifecycle

```
1. Server starts → Reads refresh token from .env
                 ↓
2. User submits form
                 ↓
3. API receives file upload
                 ↓
4. Server calls getAccessToken()
   - Sends refresh token to Google
   - Receives new access token (valid 1 hour)
                 ↓
5. Use access token to upload to Google Drive
                 ↓
6. File uploaded successfully ✅
                 ↓
7. Next upload? Go to step 2
   (Old access token expired? Get new one with refresh token)
```

### File Upload Flow

```
Frontend Form
    ↓
  User enters name & selects photo
    ↓
  Click "Upload to Google Drive"
    ↓
  Send FormData to /api/upload-to-drive
    ↓
Backend API Route
    ↓
  Validate inputs (name, photo)
    ↓
  Get fresh access token using refresh token
    ↓
  Upload to Google Drive API
    ↓
  Return file ID & link
    ↓
Frontend
    ↓
  Show success toast
    ↓
  Display file in list with link to Google Drive
```

---

## 📚 Key Files Explained

### 1. `src/lib/googleDrive.ts`
**Purpose:** OAuth2.0 authentication and Google Drive operations

**Key Functions:**
- `initializeGoogleAuth()` - Sets refresh token for auth
- `getAccessToken()` - Gets new access token using refresh token ⭐
- `uploadFileToGoogleDrive()` - Uploads file to Drive
- `uploadUserPhotoToDrive()` - User-specific upload
- `getFileInfo()` - Get file metadata
- `deleteFileFromDrive()` - Delete files

**How Refresh Token is Used:**
```typescript
export const getAccessToken = async (): Promise<string> => {
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials.access_token; // Fresh token, valid 1 hour
};
```

### 2. `src/app/api/upload-to-drive/route.ts`
**Purpose:** HTTP endpoint for file uploads

**Handles:**
- File validation (type, size)
- User data validation
- Calls `uploadUserPhotoToDrive()`
- Error handling
- JSON response with file info

### 3. `src/components/googledriveupload/googledriveupload.tsx`
**Purpose:** React form component

**Features:**
- Name input
- Photo file upload with preview
- Form validation
- Loading state
- Success/error toasts
- Display uploaded files list
- Links to Google Drive

---

## 🧪 Testing the Prototype

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Add credentials to `.env`:**
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REFRESH_TOKEN=your-refresh-token
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Access the form:**
   - Open `http://localhost:3000/google-drive-upload`

5. **Test upload:**
   - Enter your name
   - Select a photo
   - Click "Upload to Google Drive"
   - Check your Google Drive for the file ✅

### Verify in Google Drive

1. Go to [Google Drive](https://drive.google.com)
2. Look for uploaded files with timestamps (e.g., `1699887654321-photo.jpg`)
3. You should see all uploaded photos there

---

## 🔄 Token Refresh Mechanism

### How Refresh Token Works

**Access Token Lifecycle:**
- Generated: `2024-01-15 10:00:00 UTC`
- Expires: `2024-01-15 11:00:00 UTC` (1 hour later)
- When expired: Use refresh token to get new one
- New token: `2024-01-15 11:00:00 UTC`
- Expires: `2024-01-15 12:00:00 UTC`

**Refresh Token Lifecycle:**
- Valid for: **6 months of inactivity** OR **until revoked**
- If 6 months pass without using it: expires
- User can revoke: Google Account Settings → Apps & Services → "Ditvi Play School"
- If revoked: User must re-authorize

**In Code:**
```typescript
// Every time we need to upload:
const accessToken = await getAccessToken(); // Uses refresh token if needed
// This automatically handles token refresh
```

---

## 🚨 Troubleshooting

### Issue: "Failed to refresh access token"
**Cause:** Invalid/expired refresh token

**Solution:**
1. Regenerate refresh token using OAuth Playground
2. Update `.env` with new token

### Issue: "GOOGLE_CLIENT_ID is undefined"
**Cause:** `.env` file not loaded

**Solution:**
1. Verify `.env` file exists in project root
2. Restart dev server: `npm run dev`
3. Check variable names match exactly

### Issue: "File uploaded but not visible in Drive"
**Cause:** Uploaded to different Google account

**Solution:**
1. Verify you're logged in to same Google account
2. Check Drive's shared files (might be shared with a service account)
3. Check Drive search for filename

### Issue: "401 Unauthorized"
**Cause:** Access token or refresh token invalid

**Solution:**
1. Check `.env` credentials are correct
2. Regenerate refresh token
3. Verify credentials weren't modified

---

## 🔐 Security Best Practices

### ✅ DO:
- Store refresh token in `.env` (server-side only)
- Use HTTPS in production
- Add rate limiting to API
- Validate file types and sizes
- Log uploads for audit trail

### ❌ DON'T:
- Expose credentials in frontend code
- Commit `.env` to Git
- Use service account for user uploads (quota issues)
- Store access tokens in database
- Send refresh token to frontend

---

## 📊 File Upload Limits

- **Max file size:** 10 MB (configurable in API)
- **Allowed types:** JPG, PNG, GIF, WebP
- **Google Drive quota:** User's plan (15 GB free)
- **Rate limit:** Google Drive API limits apply

---

## 🎯 Next Steps

### To Add to Production:
1. Set up real Google Cloud credentials
2. Configure redirect URI for your domain
3. Add database to store upload metadata
4. Implement user authentication
5. Add folder organization (by user/date)
6. Set up monitoring/logging

### To Enhance:
1. Multiple file upload
2. Drag-and-drop upload
3. Progress bar for uploads
4. Retry on failure
5. Batch uploads
6. File management (delete, rename)
7. Share files with others
8. Email notifications

---

## 📞 Resources

- [Google Drive API Docs](https://developers.google.com/drive/api)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [googleapis npm package](https://www.npmjs.com/package/googleapis)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

## ✅ Checklist

- [ ] Created Google Cloud Project
- [ ] Enabled Google Drive API
- [ ] Generated OAuth2.0 credentials
- [ ] Generated refresh token
- [ ] Added credentials to `.env`
- [ ] Tested form upload
- [ ] Verified files in Google Drive
- [ ] Ready for production deployment

---

**Happy uploading! 🚀**
