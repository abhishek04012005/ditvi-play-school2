import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/admission/verify-phone
 * 
 * Verify phone number for correction workflow
 * Validates that the provided phone number matches the admission record
 */
export async function POST(request: NextRequest) {
  try {
    const { admission_number, phone_number } = await request.json();

    if (!admission_number || !phone_number) {
      return NextResponse.json(
        { error: 'Admission number and phone number are required' },
        { status: 400 }
      );
    }

    // Validate phone number format (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone_number.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Phone number must be 10 digits' },
        { status: 400 }
      );
    }

    // Query the admission record
    const { data, error } = await supabase
      .from('admission')
      .select('id, parent_mobile_number, admission_status')
      .eq('admission_number', admission_number)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Admission record not found' },
        { status: 404 }
      );
    }

    // Check if status is "Under Correction"
    if (data.admission_status !== 'Under Correction') {
      return NextResponse.json(
        { error: 'Admission is not under correction' },
        { status: 403 }
      );
    }

    // Extract last 4 digits from stored phone number and input phone number
    const storedLast4 = data.parent_mobile_number.slice(-4);
    const inputLast4 = phone_number.replace(/\D/g, '').slice(-4);

    if (storedLast4 !== inputLast4) {
      return NextResponse.json(
        { error: 'Phone number verification failed' },
        { status: 401 }
      );
    }

    // Verification successful
    return NextResponse.json(
      { success: true, message: 'Phone verification successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying phone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
