import { google } from 'googleapis';
import { Readable } from 'stream';

/**
 * Google Drive Authentication & Upload Utility
 * Uses OAuth2.0 with Refresh Token for secure file uploads
 */

// Initialize OAuth2 client
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth2 credentials: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

/**
 * Set the refresh token for OAuth2 authentication
 * This allows us to get new access tokens without user re-authorization
 */
export const initializeGoogleAuth = () => {
  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error('GOOGLE_REFRESH_TOKEN environment variable is not set');
  }
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
};

/**
 * Get a fresh access token using the refresh token
 * Access tokens expire after 1 hour, so we get a new one each time
 * 
 * @returns {Promise<string>} Fresh access token
 */
export const getAccessToken = async (): Promise<string> => {
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    const newAccessToken = credentials.access_token;
    
    if (!newAccessToken) {
      throw new Error('Failed to get access token');
    }
    
    return newAccessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw new Error('Failed to refresh access token');
  }
};

/**
 * Upload a file to Google Drive
 * 
 * @param fileName - Name of the file to upload
 * @param fileBuffer - File content as Buffer
 * @param mimeType - MIME type of the file (e.g., 'image/jpeg')
 * @param folderId - Optional: Google Drive folder ID to upload to
 * @returns {Promise<{fileId: string; fileName: string; webViewLink: string}>} File details
 */
export const uploadFileToGoogleDrive = async (
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string = 'image/jpeg',
  folderId?: string
): Promise<{ fileId: string; fileName: string; webViewLink: string }> => {
  try {
    // Initialize auth if not already done
    initializeGoogleAuth();
    
    // Get fresh access token
    const accessToken = await getAccessToken();
    
    // Create Drive API instance with the access token
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // Set up file metadata
    const fileMetadata: any = {
      name: fileName,
      // Optionally specify folder
      ...(folderId && { parents: [folderId] }),
    };
    
    // Convert Buffer to Readable stream
    const stream = Readable.from(fileBuffer);
    
    // Create the file
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType: mimeType,
        body: stream,
      },
      fields: 'id, name, webViewLink', // Return these fields
    });
    
    const fileId = response.data.id;
    const webViewLink = response.data.webViewLink;
    
    if (!fileId) {
      throw new Error('No file ID returned from Google Drive');
    }
    
    console.log(`File uploaded successfully: ${fileName} (ID: ${fileId})`);
    
    // Make the file publicly readable so it can be downloaded by anyone with the link
    try {
      await drive.permissions.create({
        fileId: fileId as string,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (permErr) {
      console.warn('Failed to set public permission for file:', permErr);
      // proceed - the file was uploaded; permission failure shouldn't block the response
    }

    return {
      fileId,
      fileName: response.data.name || fileName,
      webViewLink: webViewLink || '',
    };
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw error;
  }
};

/**
 * Upload file with user metadata (name, email, etc.)
 * Creates a folder for each user if needed
 * 
 * @param userData - User information {name: string; email?: string}
 * @param fileName - Name of the file
 * @param fileBuffer - File content as Buffer
 * @param mimeType - MIME type
 * @returns File upload details
 */
export const uploadUserPhotoToDrive = async (
  userData: { name: string; email?: string },
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string = 'image/jpeg'
): Promise<{ fileId: string; fileName: string; webViewLink: string }> => {
  try {
    // For this prototype, we'll upload directly without user folders
    // In production, you might want to create user-specific folders
    
    const timestampedFileName = `${Date.now()}-${fileName}`;
    
    return await uploadFileToGoogleDrive(
      timestampedFileName,
      fileBuffer,
      mimeType
    );
  } catch (error) {
    console.error('Error uploading user photo:', error);
    throw error;
  }
};

/**
 * Get file information from Google Drive
 * 
 * @param fileId - Google Drive file ID
 * @returns File metadata
 */
export const getFileInfo = async (fileId: string) => {
  try {
    initializeGoogleAuth();
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, createdTime, webViewLink, size',
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  }
};

/**
 * Delete file from Google Drive
 * 
 * @param fileId - Google Drive file ID
 */
export const deleteFileFromDrive = async (fileId: string) => {
  try {
    initializeGoogleAuth();
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    await drive.files.delete({
      fileId,
    });
    
    console.log(`File deleted successfully: ${fileId}`);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Create or get a folder by name (admission number)
 * 
 * @param folderName - Name of the folder (admission number)
 * @param parentFolderId - Optional: parent folder ID
 * @returns Folder ID
 */
export const getOrCreateFolder = async (folderName: string, parentFolderId?: string): Promise<string> => {
  try {
    initializeGoogleAuth();
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // Search for existing folder
    const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const searchParams: any = { q: query, spaces: 'drive', fields: 'files(id, name)' };
    
    if (parentFolderId) {
      searchParams.q += ` and '${parentFolderId}' in parents`;
    }
    
    const searchResponse = await drive.files.list(searchParams);
    
    if (searchResponse.data.files && searchResponse.data.files.length > 0) {
      console.log(`Folder found: ${folderName} (ID: ${searchResponse.data.files[0].id})`);
      return searchResponse.data.files[0].id!;
    }
    
    // Create new folder if not found
    const folderMetadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    
    if (parentFolderId) {
      folderMetadata.parents = [parentFolderId];
    }
    
    const createResponse = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });
    
    const folderId = createResponse.data.id;
    console.log(`Folder created: ${folderName} (ID: ${folderId})`);
    return folderId!;
  } catch (error) {
    console.error('Error creating/getting folder:', error);
    throw error;
  }
};

/**
 * Move file to a specific folder
 * 
 * @param fileId - Google Drive file ID
 * @param folderId - Target folder ID
 */
export const moveFileToFolder = async (fileId: string, folderId: string): Promise<void> => {
  try {
    initializeGoogleAuth();
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // Get current parents
    const fileResponse = await drive.files.get({
      fileId,
      fields: 'parents',
    });
    
    const previousParents = fileResponse.data.parents?.join(',') || '';
    
    // Move file to new folder
    await drive.files.update({
      fileId,
      addParents: folderId,
      removeParents: previousParents,
      fields: 'id, parents',
    });
    
    console.log(`File moved successfully: ${fileId} to folder ${folderId}`);
  } catch (error) {
    console.error('Error moving file:', error);
    throw error;
  }
};

/**
 * List files in a folder by type (get document URLs for a specific field)
 * 
 * @param folderId - Google Drive folder ID
 * @param fileType - Type of file to search (e.g., 'photo', 'birth_certificate')
 * @returns Array of file IDs matching the pattern
 */
export const listFilesByTypeInFolder = async (folderId: string, fileType: string): Promise<string[]> => {
  try {
    initializeGoogleAuth();
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    const query = `'${folderId}' in parents and name contains '${fileType}' and trashed=false`;
    
    const response = await drive.files.list({
      q: query,
      spaces: 'drive',
      fields: 'files(id, name)',
    });
    
    return response.data.files?.map(file => file.id!).filter(Boolean) || [];
  } catch (error) {
    console.error('Error listing files in folder:', error);
    throw error;
  }
};

