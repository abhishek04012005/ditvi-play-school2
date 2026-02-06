import { SchoolDetails } from '@/types/schooldetails-types';
import LogoImage from '../../public/assets/logo/logo.png'

export const schoolDetailsEng: SchoolDetails = {
    name: "Anksquare Kids",
    logo: LogoImage,
    session: "2026-27",
    admissionAuthority: "Shashi Sharma",
    website: "www.apollokids.com",
    contact: {
        phone: "+91 9263767441",
        email: "admission@apollokids.com",
        whatsapp: "+919263767441"
    },
    address: {
        street: "Anksquare Kids Play School, Boring Road",
        city: "Patna",
        state: "Bihar",
        pincode: "800013",
        country: "India"
    },
    socialMedia: {
        instagram: "https://instagram.com/ditviplayschool",
        x: "https://twitter.com/ditviplayschool",
        facebook: "https://facebook.com/ditviplayschool",
        youtube: "https://youtube.com/ditviplayschool",
        linkedin: "https://linkedin.com/company/ditviplayschool"
    },
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1798.8125982562576!2d85.11420595816308!3d25.617367899602417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ed5828b506080f%3A0xfc77d50513e2f25c!2sBoring%20Rd%2C%20Patna%2C%20Bihar!5e0!3m2!1sen!2sin!4v1762709402325!5m2!1sen!2sin",
    director: {
        name: "Abhinav Sharma",
        designation: "Founder & Director"
    },
    programs: [
        {
            name: "Play Group",
            description: "Age: 1.5 - 2.5 years"
        },
        {
            name: "Nursery",
            description: "Age: 2.5 - 3.5 years"
        },
        {
            name: "Junior KG",
            description: "Age: 3.5 - 4.5 years"
        },
        {
            name: "Senior KG",
            description: "Age: 4.5 - 5.5 years"
        }
    ]
};

export default schoolDetailsEng;
