import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

/**
 * POST /api/admission/upload-file
 *
 * Accepts a multipart FormData with:
 * - file: File
 * - field: string (the field name e.g. photo, birth_certificate)
 *
 * Uploads the file to Google Drive (no specific folder) and sets permission to anyone with link.
 * Returns { success: true, data: { fileId, fileName, webViewLink, downloadUrl } }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    const field = (formData.get('field') as string) || 'file';

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

    // Create a timestamped filename to avoid collisions
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const timestampedName = `${Date.now()}-${file.name}`;

    // Determine mime type
    const mimeType = file.type || 'application/octet-stream';

    const stream = Readable.from(buffer);

    const response = await drive.files.create({
      requestBody: {
        name: timestampedName,
      },
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
          fileName: response.data.name || timestampedName,
          webViewLink,
          downloadUrl,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/admission/upload-file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Admission file upload endpoint' });
}
