import { NextRequest, NextResponse } from 'next/server';
import {
  generateAdmissionNumber,
  createAdmissionFolder,
  uploadAdmissionDocument,
  moveFileToFolder,
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
 * - father_name, mother_name, parent_mobile_number, parent_email (optional)
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
    const child_blood_group = (formData.get('child_blood_group') as string) || undefined;
    const category = (formData.get('category') as string) || undefined;

    // Extract parent details
    const father_name = formData.get('father_name') as string;
    const mother_name = (formData.get('mother_name') as string);
    const parent_address = formData.get('parent_address') as string;
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

  // Extract links uploaded from client (uploaded on-select)
  const photoUrlFromClient = (formData.get('photo_url') as string) || undefined;
  const birthCertUrlFromClient = (formData.get('birth_certificate_url') as string) || undefined;
  const aadharUrlFromClient = (formData.get('aadhar_card_url') as string) || undefined;
  const idProofUrlFromClient = (formData.get('parent_id_proof_url') as string) || undefined;

  // Extract file IDs (if client uploaded to Drive and returned IDs)
  const photoFileIdFromClient = (formData.get('photo_file_id') as string) || undefined;
  const birthCertFileIdFromClient = (formData.get('birth_certificate_file_id') as string) || undefined;
  const aadharFileIdFromClient = (formData.get('aadhar_card_file_id') as string) || undefined;
  const idProofFileIdFromClient = (formData.get('parent_id_proof_file_id') as string) || undefined;

    // Validate required fields (documents are optional)
    const errors: string[] = [];
    if (!child_name?.trim()) errors.push('Child name is required');
    if (!child_dob) errors.push('Child DOB is required');
    if (!child_gender) errors.push('Child gender is required');
    if (!father_name?.trim()) errors.push('Father name is required');
    if (!mother_name?.trim()) errors.push('Mother name is required');
    if (!parent_address?.trim()) errors.push('Parent address is required');
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

      // Determine if any raw files were posted (fallback) or client provided file IDs
      const hasRawFiles = Boolean(photoFile || birthCertificateFile || aadharCardFile || parentIdProofFile);
      const hasClientFileIds = Boolean(photoFileIdFromClient || birthCertFileIdFromClient || aadharFileIdFromClient || idProofFileIdFromClient);

      let folderId: string | null = null;

      // Step 2: Create folder in Google Drive if server will upload files or if client uploaded files and we need to organize them
      if (hasRawFiles || hasClientFileIds) {
        console.log('Step 2: Creating Google Drive folder...');
        folderId = await createAdmissionFolder(admissionNumber);
      } else {
        console.log('No files to upload or organize on server; skipping Drive folder creation');
      }

      // Step 3: Upload all documents (optional server-side upload)
      console.log('Step 3: Uploading documents (server-side if any)...');
      
      let photoUrl: string | null = null;
      let birthCertUrl: string | null = null;
      let aadharUrl: string | null = null;
      let idProofUrl: string | null = null;

      const uploadPromises: Promise<void>[] = [];

      if (photoFile && folderId) {
        uploadPromises.push(
          photoFile.arrayBuffer().then((buffer) =>
            uploadAdmissionDocument(
              Buffer.from(buffer),
              photoFile.name,
              admissionNumber,
              'photo',
              folderId as string
            )
          ).then((url) => {
            photoUrl = url;
          })
        );
      }

      if (birthCertificateFile && folderId) {
        uploadPromises.push(
          birthCertificateFile.arrayBuffer().then((buffer) =>
            uploadAdmissionDocument(
              Buffer.from(buffer),
              birthCertificateFile.name,
              admissionNumber,
              'birth_certificate',
              folderId as string
            )
          ).then((url) => {
            birthCertUrl = url;
          })
        );
      }

      if (aadharCardFile && folderId) {
        uploadPromises.push(
          aadharCardFile.arrayBuffer().then((buffer) =>
            uploadAdmissionDocument(
              Buffer.from(buffer),
              aadharCardFile.name,
              admissionNumber,
              'aadhar_card',
              folderId as string
            )
          ).then((url) => {
            aadharUrl = url;
          })
        );
      }

      if (parentIdProofFile && folderId) {
        uploadPromises.push(
          parentIdProofFile.arrayBuffer().then((buffer) =>
            uploadAdmissionDocument(
              Buffer.from(buffer),
              parentIdProofFile.name,
              admissionNumber,
              'parent_id_proof',
              folderId as string
            )
          ).then((url) => {
            idProofUrl = url;
          })
        );
      }

      // Wait for all available server-side uploads
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      // If client provided file IDs (uploaded earlier), move those files into the newly created folder and rename them
      if (folderId && hasClientFileIds) {
        console.log('Organizing client-uploaded files into admission folder...');

        const clientMovePromises: Promise<void>[] = [];

        if (photoFileIdFromClient) {
          clientMovePromises.push(
            moveFileToFolder(photoFileIdFromClient, `${admissionNumber}_photo`, folderId).then((url) => {
              photoUrl = url;
            })
          );
        }

        if (birthCertFileIdFromClient) {
          clientMovePromises.push(
            moveFileToFolder(birthCertFileIdFromClient, `${admissionNumber}_birth_certificate`, folderId).then((url) => {
              birthCertUrl = url;
            })
          );
        }

        if (aadharFileIdFromClient) {
          clientMovePromises.push(
            moveFileToFolder(aadharFileIdFromClient, `${admissionNumber}_aadhar_card`, folderId).then((url) => {
              aadharUrl = url;
            })
          );
        }

        if (idProofFileIdFromClient) {
          clientMovePromises.push(
            moveFileToFolder(idProofFileIdFromClient, `${admissionNumber}_parent_id_proof`, folderId).then((url) => {
              idProofUrl = url;
            })
          );
        }

        if (clientMovePromises.length > 0) {
          await Promise.all(clientMovePromises);
        }
      }

      // Step 4: Save to database
      console.log('Step 4: Saving to database...');

      // Prefer client-provided links (uploaded on-select). Fall back to any server-uploaded URLs.
      const finalPhotoUrl = photoUrlFromClient || photoUrl || null;
      const finalBirthCertUrl = birthCertUrlFromClient || birthCertUrl || null;
      const finalAadharUrl = aadharUrlFromClient || aadharUrl || null;
      const finalIdProofUrl = idProofUrlFromClient || idProofUrl || null;

      const admissionRecord = await saveAdmissionToDatabase({
        admission_number: admissionNumber,
        child_name,
        child_dob,
        child_gender,
        child_place_of_birth: child_place_of_birth || '',
        child_blood_group,
        category,
        father_name,
        mother_name,
        parent_address,
        parent_mobile_number,
        parent_email,
        program_name,
        previous_school,
        photo_url: finalPhotoUrl,
        birth_certificate_url: finalBirthCertUrl,
        aadhar_card_url: finalAadharUrl,
        parent_id_proof_url: finalIdProofUrl,
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
