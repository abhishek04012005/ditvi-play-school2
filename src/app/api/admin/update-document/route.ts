import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { id, is_public } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('downloads')
      .update({ is_public })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error('Update document error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to update document';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
