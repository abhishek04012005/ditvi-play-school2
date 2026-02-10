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
    feeStructure?: {
        programs: {
            name: string;
            ageGroup: string;
            icon: string;
            img: string;
            monthlyFee: string;
            annualFee: string;
            registrationFee: string;
            description: string;
            includes: string[];
            additionalCharges: {
                name: string;
                price: string;
            }[];
        }[];
        paymentTerms: {
            term: string;
            description: string;
            icon: string;
        }[];
        policies: string[];
    };
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
    ],
    feeStructure: {
        programs: [
            {
                name: "शिशु समूह",
                ageGroup: "आयु 2–3",
                icon: "👶",
                img: "/assets/programs/toddler.jpg",
                monthlyFee: "₹8,500",
                annualFee: "₹1,02,000",
                registrationFee: "₹2,000",
                description: "संवेदनशील खेल और प्रमाणित देखभालकर्ताओं के साथ बंधन",
                includes: [
                    "दैनिक खेल आधारित सीखने की गतिविधियाँ",
                    "नाश्ता और भोजन शामिल",
                    "डायपर परिवर्तन और बुनियादी देखभाल",
                    "मासिक प्रगति रिपोर्ट",
                    "अभिभावक-शिक्षक बैठकें",
                    "बाहरी खेल का समय",
                ],
                additionalCharges: [
                    { name: "अतिरिक्त कक्षा (प्रति माह)", price: "₹500" },
                    { name: "विशेष कार्यशाला", price: "₹1,000" },
                    { name: "फील्ड ट्रिप", price: "₹2,000–₹3,000" },
                ],
            },
            {
                name: "नर्सरी",
                ageGroup: "आयु 3–4",
                icon: "🧒",
                img: "/assets/programs/nursery.jpg",
                monthlyFee: "₹10,000",
                annualFee: "₹1,20,000",
                registrationFee: "₹2,000",
                description: "नींव सीखना और दिनचर्या निर्माण",
                includes: [
                    "संरचित दैनिक दिनचर्या",
                    "वर्णमाला और संख्या परिचय",
                    "कला, शिल्प और रचनात्मक गतिविधियाँ",
                    "कहानी समय और संगीत सत्र",
                    "नाश्ता और दोपहर का भोजन शामिल",
                    "खेल के मैदान तक पहुंच",
                    "मासिक मूल्यांकन",
                ],
                additionalCharges: [
                    { name: "अतिरिक्त कक्षा (प्रति माह)", price: "₹600" },
                    { name: "कला आपूर्ति किट", price: "₹1,500" },
                    { name: "शैक्षणिक खेल", price: "₹500–₹1,000" },
                ],
            },
            {
                name: "प्री-किंडरगार्टन",
                ageGroup: "आयु 4–5",
                icon: "📚",
                img: "/assets/programs/prekg.jpg",
                monthlyFee: "₹12,000",
                annualFee: "₹1,44,000",
                registrationFee: "₹2,500",
                description: "पूर्व-शिक्षाविदों और साक्षरता की नींव",
                includes: [
                    "फोनिक्स और पूर्व-पढ़ने का कार्यक्रम",
                    "बुनियादी गणित और संख्या कौशल",
                    "STEM अन्वेषण गतिविधियाँ",
                    "कला, संगीत और शारीरिक शिक्षा",
                    "दोपहर का भोजन और स्वस्थ नाश्ता",
                    "द्वि-साप्ताहिक कौशल मूल्यांकन",
                    "अभिभावक-शिक्षक सम्मेलन",
                ],
                additionalCharges: [
                    { name: "उन्नत STEM किट", price: "₹1,500–₹2,000" },
                    { name: "विशेष कक्षाएं (प्रति माह)", price: "₹700" },
                    { name: "स्कूल कार्यक्रम और भ्रमण", price: "₹2,500–₹4,000" },
                ],
            },
            {
                name: "किंडरगार्टन",
                ageGroup: "आयु 5–6",
                icon: "🎓",
                img: "/assets/programs/kg.jpg",
                monthlyFee: "₹14,000",
                annualFee: "₹1,68,000",
                registrationFee: "₹3,000",
                description: "स्कूल की तैयारी और शैक्षणिक कौशल",
                includes: [
                    "अंग्रेजी, गणित और विज्ञान पाठ्यक्रम",
                    "पढ़ने और लिखने का कार्यक्रम",
                    "समस्या समाधान गतिविधियाँ",
                    "कंप्यूटर बेसिक्स परिचय",
                    "खेल और शारीरिक गतिविधियाँ",
                    "रचनात्मक परियोजनाएं और प्रतियोगिताएं",
                    "मासिक प्रगति ट्रैकिंग",
                    "स्कूल की तैयारी की तैयारी",
                ],
                additionalCharges: [
                    { name: "टेक कक्षाएं (प्रति माह)", price: "₹800" },
                    { name: "प्रतिस्पर्धी परीक्षा की तैयारी", price: "₹1,000–₹1,500" },
                    { name: "वार्षिक दिवस और कार्यक्रम", price: "₹5,000–₹7,000" },
                ],
            },
        ],
        paymentTerms: [
            { term: "मासिक", description: "मासिक शुल्क का भुगतान करें", icon: "📅" },
            { term: "त्रैमासिक", description: "3 महीने की अग्रिम (5% छूट)", icon: "📊" },
            { term: "अर्धवार्षिक", description: "6 महीने की अग्रिम (8% छूट)", icon: "💰" },
            { term: "वार्षिक", description: "पूरा साल अग्रिम (12% छूट)", icon: "⭐" },
        ],
        policies: [
            "पंजीकरण शुल्क गैर-वापसी योग्य है",
            "निकासी के लिए एक महीने की सूचना आवश्यक है",
            "वार्षिक शुल्क वृद्धि (अप्रैल)",
            "देरी शुल्क: ₹500 प्रति दिन देय तारीख के बाद",
            "भाई-बहन की छूट: दूसरे बच्चे पर 10%",
            "एकाधिक वर्ष नामांकन छूट उपलब्ध है",
        ],
    }
};

export default schoolDetailsHi;
