import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * PUT /api/admission/[admissionId]/corrections
 * 
 * Update admission data during correction workflow
 * User can edit all fields except phone number and admission number
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ admissionId: string }> }
) {
  try {
    const { admissionId } = await params;

    if (!admissionId) {
      return NextResponse.json(
        { error: 'Admission ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();

    console.log(`📝 Update data received:`, updateData);

    // Remove fields that cannot be edited
    delete updateData.admission_number;
    delete updateData.parent_mobile_number;
    delete updateData.id;

    console.log(`📝 Update data after cleaning:`, updateData);

    // Get current record to verify status
    const { data: currentRecord, error: fetchError } = await supabase
      .from('admission')
      .select('admission_status')
      .eq('id', admissionId)
      .single();

    if (fetchError || !currentRecord) {
      return NextResponse.json(
        { error: 'Admission record not found' },
        { status: 404 }
      );
    }

    // Allow editing only if status is "Under Correction"
    if (currentRecord.admission_status !== 'Under Correction') {
      return NextResponse.json(
        { error: 'Editing is only allowed when status is "Under Correction"' },
        { status: 403 }
      );
    }

    // Update the admission record
    const { data, error } = await supabase
      .from('admission')
      .update(updateData)
      .eq('id', admissionId)
      .select();

    if (error) {
      console.error(`❌ Error updating admission ${admissionId}:`, error);
      return NextResponse.json(
        { error: 'Failed to update admission' },
        { status: 500 }
      );
    }

    console.log(`✅ Admission ${admissionId} updated successfully:`, data);

    return NextResponse.json(
      { success: true, data, message: 'Admission updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in corrections route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
