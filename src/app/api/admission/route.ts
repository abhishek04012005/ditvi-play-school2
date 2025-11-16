import { NextRequest, NextResponse } from 'next/server';
import {
  generateAdmissionNumber,
  createAdmissionFolder,
  uploadAdmissionDocument,
  saveAdmissionToDatabase,
} from '@/lib/admission';

/**
 * POST /api/admission
 * 
 * Handles admission form submission
 * - Generates admission number
 * - Creates Google Drive folder
 * - Uploads all documents
 * - Saves to database
 * 
 * Expects FormData with:
 * - child_name, child_dob, child_gender, child_place_of_birth
 * - parent_name, parent_mobile_number, parent_email (optional)
 * - program_name, previous_school (optional)
 * - photo, birth_certificate, aadhar_card, parent_id_proof (files)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Processing admission form submission...');

    // Parse FormData
    const formData = await request.formData();

    // Extract child details
    const child_name = formData.get('child_name') as string;
    const child_dob = formData.get('child_dob') as string;
    const child_gender = formData.get('child_gender') as string;
    const child_place_of_birth = formData.get('child_place_of_birth') as string;

    // Extract parent details
    const parent_name = formData.get('parent_name') as string;
    const parent_mobile_number = formData.get('parent_mobile_number') as string;
    const parent_email = (formData.get('parent_email') as string) || undefined;

    // Extract academic details
    const program_name = formData.get('program_name') as string;
    const previous_school = (formData.get('previous_school') as string) || undefined;

    // Extract files
    const photoFile = formData.get('photo') as File;
    const birthCertificateFile = formData.get('birth_certificate') as File;
    const aadharCardFile = formData.get('aadhar_card') as File;
    const parentIdProofFile = formData.get('parent_id_proof') as File;

    // Validate required fields (documents are optional)
    const errors: string[] = [];
    if (!child_name?.trim()) errors.push('Child name is required');
    if (!child_dob) errors.push('Child DOB is required');
    if (!child_gender) errors.push('Child gender is required');
    if (!parent_name?.trim()) errors.push('Parent name is required');
    if (!parent_mobile_number?.trim()) errors.push('Parent mobile number is required');
    if (!program_name) errors.push('Program name is required');
    // Note: All document files are now optional

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 });
    }

    console.log('Form validation passed');

    try {
      // Step 1: Generate unique admission number
      console.log('Step 1: Generating admission number...');
      const admissionNumber = await generateAdmissionNumber();

      // Step 2: Create folder in Google Drive
      console.log('Step 2: Creating Google Drive folder...');
      const folderId = await createAdmissionFolder(admissionNumber);

      // Step 3: Upload all documents (optional)
      console.log('Step 3: Uploading documents...');
      
      let photoUrl: string | null = null;
      let birthCertUrl: string | null = null;
      let aadharUrl: string | null = null;
      let idProofUrl: string | null = null;

      const uploadPromises = [];

      if (photoFile) {
        uploadPromises.push(
          photoFile.arrayBuffer().then((buffer) =>
            uploadAdmissionDocument(
              Buffer.from(buffer),
              photoFile.name,
              admissionNumber,
              'photo',
              folderId
            )
          ).then((url) => {
            photoUrl = url;
          })
        );
      }

      if (birthCertificateFile) {
        uploadPromises.push(
          birthCertificateFile.arrayBuffer().then((buffer) =>
            uploadAdmissionDocument(
              Buffer.from(buffer),
              birthCertificateFile.name,
              admissionNumber,
              'birth_certificate',
              folderId
            )
          ).then((url) => {
            birthCertUrl = url;
          })
        );
      }

      if (aadharCardFile) {
        uploadPromises.push(
          aadharCardFile.arrayBuffer().then((buffer) =>
            uploadAdmissionDocument(
              Buffer.from(buffer),
              aadharCardFile.name,
              admissionNumber,
              'aadhar_card',
              folderId
            )
          ).then((url) => {
            aadharUrl = url;
          })
        );
      }

      if (parentIdProofFile) {
        uploadPromises.push(
          parentIdProofFile.arrayBuffer().then((buffer) =>
            uploadAdmissionDocument(
              Buffer.from(buffer),
              parentIdProofFile.name,
              admissionNumber,
              'parent_id_proof',
              folderId
            )
          ).then((url) => {
            idProofUrl = url;
          })
        );
      }

      // Wait for all available uploads
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      // Step 4: Save to database
      console.log('Step 4: Saving to database...');
      const admissionRecord = await saveAdmissionToDatabase({
        admission_number: admissionNumber,
        child_name,
        child_dob,
        child_gender,
        child_place_of_birth: child_place_of_birth || '',
        parent_name,
        parent_mobile_number,
        parent_email,
        program_name,
        previous_school,
        photo_url: photoUrl,
        birth_certificate_url: birthCertUrl,
        aadhar_card_url: aadharUrl,
        parent_id_proof_url: idProofUrl,
        google_drive_folder_id: folderId,
      });

      console.log('Admission successfully created:', admissionNumber);

      return NextResponse.json(
        {
          success: true,
          message: 'Admission submitted successfully!',
          data: {
            admission_number: admissionNumber,
            child_name,
            parent_mobile_number,
            program_name,
            admission_status: 'pending',
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error in admission processing:', error);

      if (error instanceof Error) {
        return NextResponse.json(
          { error: `Processing error: ${error.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to process admission' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in admission API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admission
 * Get all admissions (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for admin
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const program = searchParams.get('program');

    const { getAllAdmissions } = await import('@/lib/admission');

    const admissions = await getAllAdmissions({
      status: status || undefined,
      program: program || undefined,
    });

    return NextResponse.json({
      success: true,
      data: admissions,
      total: admissions.length,
    });
  } catch (error) {
    console.error('Error fetching admissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admissions' },
      { status: 500 }
    );
  }
}
