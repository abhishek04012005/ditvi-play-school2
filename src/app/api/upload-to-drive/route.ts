import { NextRequest, NextResponse } from 'next/server';
import { uploadUserPhotoToDrive } from '@/lib/googleDrive';

/**
 * POST /api/upload-to-drive
 * 
 * Uploads a user's photo to Google Drive using OAuth2.0
 * Expects a FormData with:
 * - name: string - User's name
 * - photo: File - Photo file
 * - email (optional): string - User's email
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the FormData from request
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string | undefined;
    const photoFile = formData.get('photo') as File;
    
    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    if (!photoFile) {
      return NextResponse.json(
        { error: 'Photo file is required' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(photoFile.type)) {
      return NextResponse.json(
        { error: 'Only image files are allowed (JPEG, PNG, GIF, WebP)' },
        { status: 400 }
      );
    }
    
    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (photoFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }
    
    // Convert File to Buffer
    const arrayBuffer = await photoFile.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    
    // Upload to Google Drive
    console.log(`Starting upload for user: ${name}`);
    
    const uploadResult = await uploadUserPhotoToDrive(
      { name, email },
      photoFile.name,
      fileBuffer,
      photoFile.type
    );
    
    console.log('Upload successful:', uploadResult);
    
    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'File uploaded successfully to Google Drive',
        data: {
          fileId: uploadResult.fileId,
          fileName: uploadResult.fileName,
          driveLink: uploadResult.webViewLink,
          userName: name,
          uploadTime: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in upload API:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Failed to refresh access token')) {
        return NextResponse.json(
          { error: 'Google Drive authentication failed. Please check your credentials.' },
          { status: 401 }
        );
      }
      if (error.message.includes('Invalid')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to upload file to Google Drive' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload-to-drive
 * Health check endpoint to verify API is working
 */
export async function GET() {
  return NextResponse.json({
    message: 'Google Drive Upload API is running',
    endpoint: 'POST /api/upload-to-drive',
    expected_fields: ['name', 'photo', 'email (optional)'],
  });
}
