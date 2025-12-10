import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

/**
 * POST /api/admission/upload-file
 *
 * Accepts a multipart FormData with:
 * - file: File
 * - field: string (the field name e.g. photo_upload, birth_cert_upload, etc.)
 * - admissionNumber: string (e.g., ADM-2025-00049)
 *
 * Uploads the file to Google Drive in a folder named by admission number with proper naming.
 * Deletes old files with same field type before uploading new one.
 * File naming: ADM-2025-00049_field_type.extension
 * Returns { success: true, data: { fileId, fileName, webViewLink, downloadUrl } }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    // Handle both 'field' and 'field_name' parameters for flexibility
    const field = (formData.get('field_name') as string) || (formData.get('field') as string) || 'file';
    const admissionNumber = (formData.get('admissionNumber') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Prepare oauth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    // Refresh access token
    try {
      // @ts-ignore - google types for refreshAccessToken vary across versions
      await oauth2Client.refreshAccessToken();
    } catch (err) {
      console.error('Failed to refresh Google access token:', err);
      return NextResponse.json({ error: 'Google Drive authentication failed' }, { status: 401 });
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // If admission number is provided, get or create folder
    let folderId: string | undefined = undefined;
    if (admissionNumber) {
      try {
        // Search for existing folder with admission number
        const searchQuery = `name='${admissionNumber}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        const searchResponse = await drive.files.list({
          q: searchQuery,
          spaces: 'drive',
          fields: 'files(id, name)',
          pageSize: 1,
        });

        if (searchResponse.data.files && searchResponse.data.files.length > 0) {
          folderId = searchResponse.data.files[0].id || undefined;
          console.log(`✅ Using existing folder for admission ${admissionNumber}: ${folderId}`);
        } else {
          // Create new folder for this admission number
          const folderMetadata = {
            name: admissionNumber,
            mimeType: 'application/vnd.google-apps.folder',
          };

          try {
            const folderResponse = await drive.files.create({
              requestBody: folderMetadata,
              fields: 'id',
            });

            folderId = folderResponse.data.id || undefined;
            if (folderId) {
              console.log(`✅ Created new folder for admission ${admissionNumber}: ${folderId}`);
            } else {
              console.warn(`⚠️ Folder creation response missing ID for ${admissionNumber}`);
            }
          } catch (createErr) {
            console.error(`❌ Failed to create folder for ${admissionNumber}:`, createErr);
            throw new Error(`Could not create Google Drive folder for admission ${admissionNumber}`);
          }
        }
      } catch (folderErr) {
        console.error(`❌ Error managing folder for ${admissionNumber}:`, folderErr);
        throw folderErr;
      }
    }

    // Map field names to document types
    const fieldNameMap: { [key: string]: string } = {
      'photo_upload': 'photo',
      'birth_cert_upload': 'birth_certificate',
      'aadhar_upload': 'aadhar_card',
      'parent_id_upload': 'parent_id_proof',
    };

    const documentType = fieldNameMap[field] || field.replace('_upload', '');

    // Delete old file with same field type from the folder if exists
    if (folderId) {
      try {
        // Search for existing file with same field type in the folder
        const oldFileSearchQuery = `'${folderId}' in parents and name contains '${documentType}' and trashed=false`;
        const oldFileResponse = await drive.files.list({
          q: oldFileSearchQuery,
          spaces: 'drive',
          fields: 'files(id, name)',
          pageSize: 10,
        });

        if (oldFileResponse.data.files && oldFileResponse.data.files.length > 0) {
          // Delete all old files with same document type
          for (const oldFile of oldFileResponse.data.files) {
            try {
              await drive.files.delete({
                fileId: oldFile.id!,
              });
              console.log(`Deleted old file: ${oldFile.name} (${oldFile.id})`);
            } catch (deleteErr) {
              console.warn(`Could not delete file ${oldFile.id}:`, deleteErr);
            }
          }
        }
      } catch (searchErr) {
        console.warn('Error searching for old files:', searchErr);
        // Continue with upload even if search fails
      }
    }

    // Create properly named filename: ADM-2025-00049_aadhar_card.png
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get file extension
    const fileExtension = file.name.split('.').pop() || 'file';
    
    // Create proper filename
    const properFileName = admissionNumber 
      ? `${admissionNumber}_${documentType}.${fileExtension}`
      : `${Date.now()}_${documentType}.${fileExtension}`;

    console.log(`Uploading file with name: ${properFileName}`);

    // Determine mime type
    const mimeType = file.type || 'application/octet-stream';

    const stream = Readable.from(buffer);

    // Prepare file metadata with optional parent folder
    const fileMetadata: any = {
      name: properFileName,
    };

    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id, name, webViewLink',
    });

    const fileId = response.data.id as string | undefined;
    const webViewLink = response.data.webViewLink || '';

    if (!fileId) {
      throw new Error('Failed to upload file to Google Drive');
    }

    // Make file accessible by anyone with link
    try {
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (permErr) {
      console.warn('Could not set file permission:', permErr);
    }

    // Generate a direct download URL
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          fileId,
          fileName: properFileName,
          webViewLink,
          downloadUrl,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error in /api/admission/upload-file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Admission file upload endpoint' });
}
