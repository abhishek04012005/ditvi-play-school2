import { StaticImageData } from 'next/image';
import LogoImage from '../../public/assets/logo/logo.png'

export interface SchoolDetailsHi {
    name: string;
    logo: string | StaticImageData;
    session: string;
    admissionAuthority?: string;
    website: string;
    contact: {
        phone: string;
        email: string;
        whatsapp: string;
    };
    address: {
        street: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
    };
    socialMedia: {
        instagram: string;
        x: string;
        facebook: string;
        youtube: string;
        linkedin: string;
    };
    mapUrl: string;
    director: {
        name: string;
        designation: string;
    };
    programs: {
        name: string;
        icon?: string;
        description?: string;
    }[];
}

export const schoolDetailsHi: SchoolDetailsHi = {
    name: "अपोलो किड्स",
    logo: LogoImage,
    session: "2026-27",
    admissionAuthority: "शाशी शर्मा",
    website: "www.apollokids.com",
    contact: {
        phone: "+91 9263767441",
        email: "admission@apollokids.com",
        whatsapp: "+919263767441"
    },
    address: {
        street: "अपोलो किड्स प्ले स्कूल, बोरिंग रोड",
        city: "पटना",
        state: "बिहार",
        pincode: "800013",
        country: "भारत"
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
        name: "अभिनव शर्मा",
        designation: "संस्थापक और निदेशक"
    },
    programs: [
        {
            name: "प्ले ग्रुप",
            description: "आयु: 1.5 - 2.5 वर्ष"
        },
        {
            name: "नर्सरी",
            description: "आयु: 2.5 - 3.5 वर्ष"
        },
        {
            name: "जूनियर केजी",
            description: "आयु: 3.5 - 4.5 वर्ष"
        },
        {
            name: "सीनियर केजी",
            description: "आयु: 4.5 - 5.5 वर्ष"
        }
    ]
};

export default schoolDetailsHi;
