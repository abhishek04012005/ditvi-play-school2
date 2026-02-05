import { supabase } from './supabase';
import { initializeGoogleAuth, getAccessToken } from './googleDrive';
import { google } from 'googleapis';
import { Readable } from 'stream';

/**
 * Admission Utility Functions
 * Handles: admission number generation, folder creation, file uploads, database operations
 */

/**
 * Generate unique admission number
 * Format: ADM-YYYY-NNNNN (e.g., ADM-2024-00001)
 * 
 * @returns {Promise<string>} Unique admission number
 */
export const generateAdmissionNumber = async (): Promise<string> => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Get the last admission number for this year
    const { data, error } = await supabase
      .from('admission')
      .select('admission_number')
      .like('admission_number', `ADM-${currentYear}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last admission number:', error);
      throw error;
    }

    // Extract the sequence number
    let nextSequence = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].admission_number;
      const sequencePart = parseInt(lastNumber.split('-')[2]);
      nextSequence = sequencePart + 1;
    }

    // Format: ADM-2024-00001
    const admissionNumber = `ADM-${currentYear}-${String(nextSequence).padStart(5, '0')}`;
    
    console.log(`Generated admission number: ${admissionNumber}`);
    return admissionNumber;
  } catch (error) {
    console.error('Error generating admission number:', error);
    throw new Error('Failed to generate admission number');
  }
};

/**
 * Create a folder for admission in Google Drive
 * 
 * @param admissionNumber - The admission number (used as folder name)
 * @param parentFolderId - Optional: Parent folder ID
 * @returns {Promise<string>} Google Drive Folder ID
 */
export const createAdmissionFolder = async (
  admissionNumber: string,
  parentFolderId?: string
): Promise<string> => {
  try {
    initializeGoogleAuth();
    
    // Create OAuth2 client properly
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    // Set credentials correctly
    auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const drive = google.drive({ version: 'v3', auth });

    // Create folder metadata
    const fileMetadata: any = {
      name: admissionNumber,
      mimeType: 'application/vnd.google-apps.folder',
    };

    // If parent folder specified, add it
    if (parentFolderId) {
      fileMetadata.parents = [parentFolderId];
    }

    // Create folder
    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });

    const folderId = response.data.id;
    
    if (!folderId) {
      throw new Error('No folder ID returned from Google Drive');
    }

    console.log(`Created Google Drive folder: ${admissionNumber} (ID: ${folderId})`);
    return folderId;
  } catch (error) {
    console.error('Error creating admission folder:', error);
    throw error;
  }
};

/**
 * Upload admission document to Google Drive
 * 
 * @param fileBuffer - File content as Buffer
 * @param fileName - Original file name
 * @param admissionNumber - For naming: ADM-2024-001_document_type.ext
 * @param documentType - Type of document (photo, birth_certificate, etc)
 * @param folderId - Google Drive folder ID to upload to
 * @returns {Promise<string>} File URL in Google Drive
 */
export const uploadAdmissionDocument = async (
  fileBuffer: Buffer,
  fileName: string,
  admissionNumber: string,
  documentType: string,
  folderId: string
): Promise<string> => {
  try {
    initializeGoogleAuth();
    
    // Create OAuth2 client properly
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    // Set credentials correctly
    auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const drive = google.drive({ version: 'v3', auth });

    // Extract file extension
    const ext = fileName.split('.').pop();
    
    // Rename file: ADM-2024-001_document_type.ext
    const renamedFileName = `${admissionNumber}_${documentType}.${ext}`;

    // Get MIME type
    const mimeTypeMap: { [key: string]: string } = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      pdf: 'application/pdf',
      gif: 'image/gif',
    };
    const mimeType = mimeTypeMap[ext?.toLowerCase() || ''] || 'application/octet-stream';

    // File metadata
    const fileMetadata: any = {
      name: renamedFileName,
      parents: [folderId],
    };

    // Convert buffer to stream
    const stream = Readable.from(fileBuffer);

    // Upload file
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType: mimeType,
        body: stream,
      },
      fields: 'id, webViewLink',
    });

    const fileId = response.data.id;
    const webViewLink = response.data.webViewLink;

    if (!fileId) {
      throw new Error('Failed to upload file to Google Drive');
    }

    // Set file permissions to make it accessible
    try {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
      console.log(`Set file permissions for: ${renamedFileName}`);
    } catch (permError) {
      console.warn(`Warning: Could not set file permissions:`, permError);
    }

    // Generate direct download URL (works for files shared with "anyone")
    // Format: https://drive.google.com/uc?export=download&id=FILE_ID
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    console.log(`Uploaded admission document: ${renamedFileName} (ID: ${fileId})`);
    
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading admission document:', error);
    throw error;
  }
};

/**
 * Move an existing Drive file into a folder and rename it
 * Returns a direct download URL for the moved file
 */
export const moveFileToFolder = async (
  fileId: string,
  newName: string,
  folderId: string
): Promise<string> => {
  try {
    initializeGoogleAuth();

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    const drive = google.drive({ version: 'v3', auth });

    // Get current parents
    const meta = await drive.files.get({ fileId, fields: 'parents,name' });
    const currentParents = (meta.data.parents || []).join(',');

    // derive extension from existing name if possible
    const existingName = meta.data.name || '';
    const ext = existingName.includes('.') ? existingName.split('.').pop() : '';
    const finalName = ext ? `${newName}.${ext}` : newName;

    // Update file: rename and move into folder
    await drive.files.update({
      fileId,
      addParents: folderId,
      removeParents: currentParents || undefined,
      requestBody: {
        name: finalName,
      },
      fields: 'id, name',
    });

    // Ensure permission is set (reader-anyone)
    try {
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (permErr) {
      // non-fatal
      console.warn('Could not set permission on moved file:', permErr);
    }

    // Return download URL
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    return downloadUrl;
  } catch (error) {
    console.error('Error moving file to folder:', error);
    throw error;
  }
};

/**
 * Save admission record to database
 * 
 * @param admissionData - Complete admission data including all URLs
 * @returns {Promise<any>} Created admission record
 */
export const saveAdmissionToDatabase = async (admissionData: {
  admission_number: string;
  child_name: string;
  child_dob: string;
  child_gender: string;
  child_place_of_birth: string;
  child_blood_group?: string;
  father_name: string;
  mother_name: string;
  parent_address: string;
  parent_mobile_number: string;
  parent_email?: string;
  program_name: string;
  previous_school?: string;
  photo_url?: string | null;
  birth_certificate_url?: string | null;
  aadhar_card_url?: string | null;
  parent_id_proof_url?: string | null;
  google_drive_folder_id?: string | null;
}): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('admission')
      .insert([{
        ...admissionData,
        admission_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving admission to database:', error);
      throw error;
    }

    console.log(`Admission saved to database: ${admissionData.admission_number}`);
    return data;
  } catch (error) {
    console.error('Error in saveAdmissionToDatabase:', error);
    throw error;
  }
};

/**
 * Get admission record by admission number
 * 
 * @param admissionNumber - The admission number
 * @returns {Promise<any>} Admission record or null
 */
export const getAdmissionByNumber = async (admissionNumber: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('admission')
      .select('*')
      .eq('admission_number', admissionNumber)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching admission:', error);
    throw error;
  }
};

/**
 * Get all admissions (for admin dashboard)
 * 
 * @param filters - Optional filters (status, etc)
 * @returns {Promise<any[]>} Array of admission records
 */
export const getAllAdmissions = async (filters?: {
  status?: string;
  program?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<any[]> => {
  try {
    let query = supabase.from('admission').select('*');

    if (filters?.status) {
      query = query.eq('admission_status', filters.status);
    }

    if (filters?.program) {
      query = query.eq('program_name', filters.program);
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching admissions:', error);
    throw error;
  }
};

/**
 * Update admission status (for admin)
 * 
 * @param admissionNumber - The admission number
 * @param status - New status (approved, rejected, confirmed)
 * @param remarks - Admin remarks
 * @returns {Promise<any>} Updated record
 */
export const updateAdmissionStatus = async (
  admissionNumber: string,
  status: 'approved' | 'rejected' | 'confirmed',
  remarks?: string
): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('admission')
      .update({
        admission_status: status,
        admin_remarks: remarks || null,
        updated_at: new Date().toISOString(),
      })
      .eq('admission_number', admissionNumber)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log(`Updated admission status: ${admissionNumber} → ${status}`);
    return data;
  } catch (error) {
    console.error('Error updating admission status:', error);
    throw error;
  }
};

/**
 * Delete admission and associated Google Drive files
 * 
 * @param admissionNumber - The admission number
 * @returns {Promise<boolean>} Success flag
 */
export const deleteAdmission = async (admissionNumber: string): Promise<boolean> => {
  try {
    // Get admission to find folder ID
    const admission = await getAdmissionByNumber(admissionNumber);
    
    if (!admission) {
      throw new Error('Admission not found');
    }

    // TODO: Delete folder from Google Drive (optional)
    // For now, just delete from database
    
    const { error } = await supabase
      .from('admission')
      .delete()
      .eq('admission_number', admissionNumber);

    if (error) {
      throw error;
    }

    console.log(`Deleted admission: ${admissionNumber}`);
    return true;
  } catch (error) {
    console.error('Error deleting admission:', error);
    throw error;
  }
};