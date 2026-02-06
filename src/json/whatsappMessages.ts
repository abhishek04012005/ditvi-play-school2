import schoolDetailsEng from './schooldetails-eng';

const whatsappMessages = {
    enquiry: {
        new: `Thank you for enquiring about our programs at ${schoolDetailsEng.name} School. We will contact you soon with more information. 😊`,
        contacted: `We appreciate your interest in our school. Our admission team is reviewing your application and will be in touch shortly. 🙏`,
        enrolled: (program: string) => `Congratulations! 🎉 You have been successfully enrolled in our program for ${program}. We look forward to welcoming your child!`,
        cancelled: `Thank you for your interest in ${schoolDetailsEng.name} School. Feel free to reach out to us in the future if you'd like to learn more about our programs.`,
    },
    admission: {
        'In Review': `Thank you for submitting your application to ${schoolDetailsEng.name} School. We are reviewing your documents and will contact you soon. 📋`,
        'Reviewed': `Great news! Your application has been reviewed. Our admission team will be in touch with the next steps. 👍`,
        'Interview Scheduled': `Congratulations! 🎉 Your interview has been scheduled at ${schoolDetailsEng.name} School. Please check your email for details and timings.`,
        'Confirmed': `Excellent! 🎊 Your admission to ${schoolDetailsEng.name} School has been confirmed. We look forward to welcoming your child!`,
        'Rejected': `Thank you for your interest in ${schoolDetailsEng.name} School. We encourage you to connect with us for future opportunities.`,
        'Under Correction': `We need some clarifications on your application. Please check your email for details and resubmit the required corrections. ✏️`,
    },
    contact: `Thank you for reaching out to ${schoolDetailsEng.name} School! We have received your message and will get back to you as soon as possible. 📧`,
};

export default whatsappMessages;
