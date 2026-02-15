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
    console.log('[API] popup-control PUT received:', body);
    
    const { active_popup_type, message_popup_id, enquiry_popup_delay_ms, is_enquiry_popup_enabled } = body;

    // First, get the ID of the popup_control record
    const { data: existingRecord, error: fetchError } = await supabase
      .from('popup_control')
      .select('id')
      .single();

    if (fetchError || !existingRecord) {
      console.error('[API] Error fetching popup_control ID:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Popup control record not found' },
        { status: 404 }
      );
    }

    console.log('[API] Updating popup_control with ID:', existingRecord.id);

    // Now update the record
    const { data, error } = await supabase
      .from('popup_control')
      .update({
        active_popup_type,
        message_popup_id: message_popup_id || null,
        enquiry_popup_delay_ms: enquiry_popup_delay_ms || 1000,
        is_enquiry_popup_enabled: is_enquiry_popup_enabled !== undefined ? is_enquiry_popup_enabled : true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingRecord.id)
      .select()
      .single();

    if (error) {
      console.error('[API] Error updating popup_control:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.log('[API] Popup control updated successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'Popup settings updated successfully',
      data,
    });
  } catch (error) {
    console.error('[API] Error updating popup settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update popup settings' },
      { status: 500 }
    );
  }
}
