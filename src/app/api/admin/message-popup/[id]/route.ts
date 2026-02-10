import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// PUT update message popup
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { data, error } = await supabase
      .from('message_popup')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
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
      message: 'Message popup updated successfully',
      data,
    });
  } catch (error) {
    console.error('Error updating message popup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update message popup' },
      { status: 500 }
    );
  }
}

// DELETE message popup
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('message_popup')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message popup deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting message popup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete message popup' },
      { status: 500 }
    );
  }
}
