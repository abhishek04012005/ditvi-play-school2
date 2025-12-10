import { NextRequest, NextResponse } from 'next/server';
import { deleteFileFromDrive } from '@/lib/googleDrive';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, drive_file_id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Document id is required' }, { status: 400 });
    }

    // Delete from Google Drive if drive_file_id provided
    if (drive_file_id) {
      try {
        await deleteFileFromDrive(drive_file_id);
      } catch (err) {
        console.warn('Failed to delete file from drive:', err);
        // proceed to delete DB record even if drive deletion fails
      }
    }

    const { error } = await supabase
      .from('downloads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete download record:', error);
      return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Delete document error:', err);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
