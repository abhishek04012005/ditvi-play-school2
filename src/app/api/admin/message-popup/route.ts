import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET all message popups or specific by id
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      // Get specific popup by id
      const { data, error } = await supabase
        .from('message_popup')
        .select('*')
        .eq('id', id)
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
    } else {
      // Get all popups
      const { data, error } = await supabase
        .from('message_popup')
        .select('*')
        .order('created_at', { ascending: false });

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
    }
  } catch (error) {
    console.error('Error fetching message popups:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch message popups' },
      { status: 500 }
    );
  }
}

// POST create new message popup
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      message,
      button_text,
      button_link,
      is_active,
      is_show_on_home_page,
      background_color,
      text_color,
      button_color,
      image_url,
    } = body;

    const { data, error } = await supabase
      .from('message_popup')
      .insert([
        {
          title,
          message,
          button_text,
          button_link,
          is_active: is_active !== false,
          is_show_on_home_page: is_show_on_home_page !== false,
          background_color: background_color || '#ffffff',
          text_color: text_color || '#000000',
          button_color: button_color || '#6a4c93',
          image_url,
        },
      ])
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
      message: 'Message popup created successfully',
      data,
    });
  } catch (error) {
    console.error('Error creating message popup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create message popup' },
      { status: 500 }
    );
  }
}
