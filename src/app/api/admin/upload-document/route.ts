import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToGoogleDrive } from '@/lib/googleDrive';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const details = (formData.get('details') as string) || '';
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Basic validation: max 20MB
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size must be less than 20MB' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Google Drive
    let uploadResult;
    try {
      uploadResult = await uploadFileToGoogleDrive(file.name, buffer, file.type);
    } catch (driveError) {
      console.error('Google Drive upload error:', driveError);
      return NextResponse.json(
        { error: 'Failed to upload file to Google Drive. Please check your Google Drive configuration.' },
        { status: 500 }
      );
    }

    // Store record in downloads table
    const { data, error } = await supabase
      .from('downloads')
      .insert([{
        details,
        uploaded_at: new Date().toISOString(),
        url: uploadResult.webViewLink,
        drive_file_id: uploadResult.fileId,
        file_size: file.size,
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to save record to database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error('Upload document error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to upload document';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
