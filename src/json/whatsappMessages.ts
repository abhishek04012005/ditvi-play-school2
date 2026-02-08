import schoolDetailsEng from './schooldetails-eng';

const whatsappMessages = {
    enquiry: {
        new: (childName: string, enquiryNumber: string) => `Thank you for enquiring about our programs at ${schoolDetailsEng.name} School for ${childName}. Your Enquiry #: ${enquiryNumber}. We will contact you soon with more information. 😊`,
        contacted: (childName: string, enquiryNumber: string) => `We appreciate your interest in our school for ${childName}. Your Enquiry #: ${enquiryNumber}. Our admission team is reviewing your application and will be in touch shortly. 🙏`,
        enrolled: (childName: string, program: string, enquiryNumber: string) => `Congratulations! 🎉 ${childName} has been successfully enrolled in our program for ${program}. Your Enquiry #: ${enquiryNumber}. We look forward to welcoming your child!`,
        cancelled: (childName: string, enquiryNumber: string) => `Thank you for your interest in ${schoolDetailsEng.name} School for ${childName}. Your Enquiry #: ${enquiryNumber}. Feel free to reach out to us in the future if you'd like to learn more about our programs.`,
    },
    admission: {
        'In Review': (childName: string, admissionNumber: string) => `Thank you for submitting the application for ${childName} to ${schoolDetailsEng.name} School. Your Admission #: ${admissionNumber}. We are reviewing your documents and will contact you soon. 📋`,
        'Reviewed': (childName: string, admissionNumber: string) => `Great news! The application for ${childName} has been reviewed. Your Admission #: ${admissionNumber}. Our admission team will be in touch with the next steps. 👍`,
        'Interview Scheduled': (childName: string, admissionNumber: string) => `Congratulations! 🎉 The interview for ${childName} has been scheduled at ${schoolDetailsEng.name} School. Your Admission #: ${admissionNumber}. Please check your email for details and timings.`,
        'Confirmed': (childName: string, admissionNumber: string) => `Congratulation! 🎊 The admission of ${childName} to ${schoolDetailsEng.name} School has been confirmed. Your Admission #: ${admissionNumber}. We look forward to welcoming your child!`,
        'Rejected': (childName: string, admissionNumber: string) => `Thank you for your interest in ${schoolDetailsEng.name} School for ${childName}. Your Admission #: ${admissionNumber}. We encourage you to connect with us for future opportunities.`,
        'Under Correction': (childName: string, admissionNumber: string) => `We need some clarifications on the application for ${childName}. Your Admission #: ${admissionNumber}. Please check your email for details and resubmit the required corrections. ✏️`,
    },
    contact: `Thank you for reaching out to ${schoolDetailsEng.name} School! We have received your message and will get back to you as soon as possible. 📧`,
};

export default whatsappMessages;
