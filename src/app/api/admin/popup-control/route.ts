import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('popup_control')
      .select('*')
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching popup settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch popup settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { active_popup_type, message_popup_id, enquiry_popup_delay_ms, is_enquiry_popup_enabled } = body;

    const { data, error } = await supabase
      .from('popup_control')
      .update({
        active_popup_type,
        message_popup_id,
        enquiry_popup_delay_ms,
        is_enquiry_popup_enabled,
        updated_at: new Date().toISOString(),
      })
      .eq('id', (await supabase.from('popup_control').select('id').single()).data?.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Popup settings updated successfully',
      data,
    });
  } catch (error) {
    console.error('Error updating popup settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update popup settings' },
      { status: 500 }
    );
  }
}
