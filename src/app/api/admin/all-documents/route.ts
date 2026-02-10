import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('downloads')
      .select('id, details, uploaded_at, url, drive_file_id, file_size, is_public')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch documents:', error);
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error('Admin documents error:', err);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}
