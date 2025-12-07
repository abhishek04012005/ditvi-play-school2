import jsPDF from 'jspdf';
import { schoolDetails } from '@/json/schooldetails';

interface Admission {
  admission_number: any;
  id: string;
  child_first_name?: string;
  childFirstName?: string;
  child_name?: string;
  child_dob: string;
  child_gender: string;
  child_place_of_birth: string;
  child_blood_group?: string;
  parent_name?: string;
  parent_first_name?: string;
  parent_last_name?: string;
  parent_address?: string;
  parent_mobile_number?: string;
  parent_email?: string;
  program_name?: string;
  previous_school?: string;
  admission_status: string;
  remark?: string;
  created_at: string;
}

// ===== Helper: Age Group =====
function calculateAgeGroup(dob: string): string {
  if (!dob) return 'N/A';
  try {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 2) return 'Play Group (1.5-2.5 yrs)';
    if (age < 3) return 'Nursery (2.5-3.5 yrs)';
    if (age < 4) return 'Junior KG (3.5-4.5 yrs)';
    if (age < 5) return 'Senior KG (4.5-5.5 yrs)';
    return 'Above 5 years';
  } catch {
    return 'N/A';
  }
}

// ===== Helper: Format Date =====
function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

// ===== Helper: Convert Image to Base64 =====
async function imageToBase64(src: string): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve('');
        }
      };
      img.onerror = () => resolve('');
      img.src = src;
    } catch {
      resolve('');
    }
  });
}

// ===== Main PDF Generator =====
export const generateAdmissionPDF = async (admission: Admission, download = true) => {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8;
    const contentWidth = pageWidth - 2 * margin;
    let yPos = 8;

    // ===== Helper functions for names =====
    const getChildName = () =>
      admission.child_first_name || admission.childFirstName || admission.child_name || 'N/A';
    
    const getParentName = () => {
      const firstName = admission.parent_first_name || '';
      const lastName = admission.parent_last_name || '';
      return `${firstName} ${lastName}`.trim() || admission.parent_name || 'N/A';
    };

    // ===== Draw Header Function =====
    const drawHeader = async () => {
      yPos = 8;
      const logoSize = 18;

      // Add logo
      try {
        const logoSrc = typeof schoolDetails.logo === 'string'
          ? schoolDetails.logo
          : (schoolDetails.logo as any)?.src;
        
        if (logoSrc) {
          const base64Logo = await imageToBase64(logoSrc);
          if (base64Logo) {
            doc.addImage(base64Logo, 'PNG', margin, yPos, logoSize, logoSize);
          }
        }
      } catch (e) {
        console.warn('Logo load failed:', e);
      }

      // School name and details (centered)
      doc.setFontSize(16).setFont('helvetica', 'bold').setTextColor(106, 76, 147);
      doc.text(schoolDetails.name, pageWidth / 2, yPos + 2, { align: 'center' });

      doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor(80, 80, 80);
      doc.text(schoolDetails.address.street, pageWidth / 2, yPos + 7, { align: 'center' });

      const cityStatePin = `${schoolDetails.address.city}, ${schoolDetails.address.state} - ${schoolDetails.address.pincode}`;
      doc.text(cityStatePin, pageWidth / 2, yPos + 11, { align: 'center' });

      doc.setFontSize(8).setTextColor(100, 100, 100);
      doc.text(`Phone: ${schoolDetails.contact.phone} | Email: ${schoolDetails.contact.email}`, pageWidth / 2, yPos + 15, { align: 'center' });

      yPos = yPos + logoSize + 5;

      // Divider line
      doc.setDrawColor(106, 76, 147).setLineWidth(1.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;

      // Title
      doc.setFontSize(25).setFont('helvetica', 'bold').setTextColor(106, 76, 147);
      doc.text('ADMISSION FORM', pageWidth / 2, yPos, { align: 'center' });
      yPos += 3;

      doc.setLineWidth(1.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;
    };

    await drawHeader();

    // ===== Check Page Break =====
    const checkPageBreak = (needed: number = 20) => {
      if (yPos + needed > pageHeight - 15) {
        doc.addPage();
        yPos = 10;
      }
    };

    // ===== Draw Section Title =====
    const drawSectionTitle = (title: string) => {
      checkPageBreak(18);
      doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(106, 76, 147);
      doc.text(title, margin, yPos);
      yPos += 2;
      
      doc.setDrawColor(106, 76, 147).setLineWidth(1.2);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 3;
    };

    // ===== Draw Two Column Fields =====
    const drawTwoColumnFields = (label1: string, value1: string, label2: string, value2: string) => {
      const col1X = margin;
      const col2X = margin + contentWidth / 2 + 1;
      const colWidth = contentWidth / 2 - 3;
      const startY = yPos;

      // Column 1
      doc.setFontSize(9).setFont('helvetica', 'bold').setTextColor(0, 0, 0);
      doc.text(label1 + ':', col1X, yPos);
      
      doc.setFont('helvetica', 'normal').setTextColor(40, 40, 40).setFontSize(8.5);
      const value1Text = doc.splitTextToSize(value1 || 'N/A', colWidth - 20);
      doc.text(value1Text, col1X + 20, yPos);

      // Column 2
      doc.setFontSize(9).setFont('helvetica', 'bold').setTextColor(0, 0, 0);
      doc.text(label2 + ':', col2X, startY);
      
      doc.setFont('helvetica', 'normal').setTextColor(40, 40, 40).setFontSize(8.5);
      const value2Text = doc.splitTextToSize(value2 || 'N/A', colWidth - 20);
      doc.text(value2Text, col2X + 20, startY);

      yPos = startY + 7;
    };

    // ===== Draw Full Width Field =====
    const drawFullWidthField = (label: string, value: string) => {
      doc.setFontSize(9).setFont('helvetica', 'bold').setTextColor(0, 0, 0);
      doc.text(label + ':', margin, yPos);
      
      doc.setFont('helvetica', 'normal').setTextColor(40, 40, 40).setFontSize(8.5);
      const valueText = doc.splitTextToSize(value || 'N/A', contentWidth - 28);
      doc.text(valueText, margin + 24, yPos);
      
      const lines = valueText.length;
      yPos += Math.max(7, lines * 4);
    };

    // ===== Admission Number & Date =====
    checkPageBreak(15);
    const admNumberY = yPos;
    
    doc.setFontSize(9).setFont('helvetica', 'bold').setTextColor(0, 0, 0);
    doc.text('Admission Number:', margin, admNumberY);
    doc.setFont('helvetica', 'normal').setTextColor(40, 40, 40).setFontSize(8.5);
    doc.text(admission.admission_number?.toString() || 'N/A', margin + 30, admNumberY);

    const todayDate = formatDate(new Date().toISOString());
    doc.setFont('helvetica', 'bold').setTextColor(0, 0, 0).setFontSize(9);
    doc.text('Date of Application:', pageWidth / 2 + 5, admNumberY);
    doc.setFont('helvetica', 'normal').setTextColor(40, 40, 40).setFontSize(8.5);
    doc.text(todayDate, pageWidth / 2 + 55, admNumberY);
    yPos = admNumberY + 7;

    // ===== Child Information Section =====
    drawSectionTitle('1. CHILD INFORMATION');

    drawTwoColumnFields('Child Name', getChildName(), 'Date of Birth', formatDate(admission.child_dob));
    drawTwoColumnFields('Gender', admission.child_gender || 'N/A', 'Place of Birth', admission.child_place_of_birth || 'N/A');
    drawTwoColumnFields('Blood Group', admission.child_blood_group || 'N/A', 'Age Group', calculateAgeGroup(admission.child_dob));

    // ===== Parent Information Section =====
    drawSectionTitle('2. PARENT/GUARDIAN INFORMATION');

    drawFullWidthField('Parent/Guardian Name', getParentName());
    drawTwoColumnFields('Mobile Number', admission.parent_mobile_number || 'N/A', 'Email Address', admission.parent_email || 'N/A');
    drawFullWidthField('Complete Address', admission.parent_address || 'N/A');

    // ===== Program & Admission Details =====
    drawSectionTitle('3. PROGRAM & ADMISSION DETAILS');

    drawTwoColumnFields('Program Applied For', admission.program_name || 'N/A', 'Previous School', admission.previous_school || 'N/A');
    
    const statusY = yPos;
    doc.setFontSize(9).setFont('helvetica', 'bold').setTextColor(0, 0, 0);
    doc.text('Admission Status:', margin, statusY);
    doc.setFont('helvetica', 'normal').setTextColor(40, 40, 40).setFontSize(8.5);
    doc.text(admission.admission_status || 'N/A', margin + 40, statusY);
    yPos = statusY + 7;

    // ===== Signature Section =====
    checkPageBreak(50);
    yPos += 5;

    doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(106, 76, 147);
    doc.text('PARENT/GUARDIAN CONSENT & SIGNATURES', margin, yPos);
    yPos += 4;

    // Consent text
    doc.setFontSize(8).setFont('helvetica', 'normal').setTextColor(50, 50, 50);
    const consentText = `I hereby declare that the information provided in this admission form is true, correct and complete to the best of my knowledge. I understand the admission policies, fee structure, and code of conduct of ${schoolDetails.name} and hereby give my consent for admission.`;
    const wrappedConsentText = doc.splitTextToSize(consentText, contentWidth - 2);
    doc.text(wrappedConsentText, margin + 1, yPos);
    yPos += wrappedConsentText.length * 3.5 + 4;

    // Signature boxes
    const signatureBoxWidth = (contentWidth - 2) / 2;
    const signatureBoxHeight = 28;

    // Parent/Guardian Signature Box
    doc.setDrawColor(106, 76, 147).setLineWidth(0.8);
    doc.rect(margin, yPos, signatureBoxWidth, signatureBoxHeight);
    doc.setFontSize(8).setFont('helvetica', 'normal').setTextColor(80, 80, 80);
    doc.text('Parent/Guardian Signature', margin + 4, yPos + signatureBoxHeight - 4);
    doc.setFontSize(7).setTextColor(120, 120, 120);
    doc.text('Date: _______________', margin + 4, yPos + signatureBoxHeight - 1);

    // School Authority Box
    doc.setDrawColor(106, 76, 147).setLineWidth(0.8);
    doc.rect(margin + signatureBoxWidth + 2, yPos, signatureBoxWidth, signatureBoxHeight);
    doc.setFontSize(8).setFont('helvetica', 'normal').setTextColor(80, 80, 80);
    doc.text('School Authority Signature', margin + signatureBoxWidth + 6, yPos + signatureBoxHeight - 4);
    doc.setFontSize(7).setTextColor(120, 120, 120);
    doc.text('Date: _______________', margin + signatureBoxWidth + 6, yPos + signatureBoxHeight - 1);

    yPos += signatureBoxHeight + 5;

    // ===== Footer Section =====
    const footerY = pageHeight - 12;

    doc.setFontSize(8).setFont('helvetica', 'bold').setTextColor(106, 76, 147);
    doc.text(`Director: ${schoolDetails.director?.name || 'N/A'}`, pageWidth / 2, footerY, { align: 'center' });

    doc.setFontSize(7).setFont('helvetica', 'normal').setTextColor(100, 100, 100);
    doc.text(`Generated on: ${formatDate(new Date().toISOString())} | Document ID: ${admission.admission_number}`, pageWidth / 2, footerY + 4, { align: 'center' });

    doc.setFontSize(6.5).setTextColor(130, 130, 130);
    doc.text(`This is an official admission form of ${schoolDetails.name}`, pageWidth / 2, pageHeight - 3, { align: 'center' });

    // ===== Download or Preview =====
    if (download) {
      const fileName = `Admission_${getChildName().replace(/\s+/g, '_')}_${admission.admission_number}.pdf`;
      doc.save(fileName);
    } else {
      return doc;
    }
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
};

// ===== Preview Function (returns data URL) =====
export const generateAdmissionPDFPreview = async (admission: Admission): Promise<string> => {
  try {
    const doc = await generateAdmissionPDF(admission, false) as jsPDF;
    return doc.output('dataurlstring') as string;
  } catch (error) {
    console.error('PDF Preview Error:', error);
    throw error;
  }
};