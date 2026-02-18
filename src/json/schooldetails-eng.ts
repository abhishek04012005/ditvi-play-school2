import { SchoolDetails } from '@/types/schooldetails-types';
import LogoImage from '../../public/assets/logo/logo.png'

export const schoolDetailsEng: SchoolDetails = {
    name: "Moon's World Play School",
    logo: LogoImage,
    session: "2026-27",
    admissionAuthority: "Shashi Sharma",
    website: "www.anksquare.com",
    contact: {
        phone: "+91 9263767441",
        email: "admission@anksquare.com",
        whatsapp: "+919263767441",
        website: "www.anksquarekidsschool.com"
    },
    address: {
        street: "Moon's World Play School, Boring Road",
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
    ],
    feeStructure: {
        programs: [
            {
                name: "Toddlers",
                ageGroup: "Ages 2–3",
                icon: "👶",
                img: "/assets/programs/toddler.jpg",
                monthlyFee: "₹8,500",
                annualFee: "₹1,02,000",
                registrationFee: "₹2,000",
                description: "Sensory play & bonding with certified caregivers",
                includes: [
                    "Daily play-based learning activities",
                    "Snacks & meals included",
                    "Diaper changing & basic care",
                    "Monthly progress reports",
                    "Parent-teacher meetings",
                    "Outdoor play time",
                ],
                additionalCharges: [
                    { name: "Extra class (per month)", price: "₹500" },
                    { name: "Special workshop", price: "₹1,000" },
                    { name: "Field trips", price: "₹2,000–₹3,000" },
                ],
            },
            {
                name: "Nursery",
                ageGroup: "Ages 3–4",
                icon: "🧒",
                img: "/assets/programs/nursery.jpg",
                monthlyFee: "₹10,000",
                annualFee: "₹1,20,000",
                registrationFee: "₹2,000",
                description: "Foundation learning & routine building",
                includes: [
                    "Structured daily routines",
                    "Alphabet & number introduction",
                    "Art, crafts & creative activities",
                    "Story time & music sessions",
                    "Snacks & lunch included",
                    "Playground access",
                    "Monthly assessments",
                ],
                additionalCharges: [
                    { name: "Extra class (per month)", price: "₹600" },
                    { name: "Art supplies kit", price: "₹1,500" },
                    { name: "Educational games", price: "₹500–₹1,000" },
                ],
            },
            {
                name: "Pre-Kindergarten",
                ageGroup: "Ages 4–5",
                icon: "BOOKS",
                img: "/assets/programs/prekg.jpg",
                monthlyFee: "₹12,000",
                annualFee: "₹1,44,000",
                registrationFee: "₹2,500",
                description: "Pre-academics & literacy foundation",
                includes: [
                    "Phonics & pre-reading program",
                    "Basic mathematics & number skills",
                    "STEM exploration activities",
                    "Art, music & physical education",
                    "Lunch & healthy snacks",
                    "Bi-weekly skills assessment",
                    "Parent-teacher conferences",
                ],
                additionalCharges: [
                    { name: "Advanced STEM kit", price: "₹1,500–₹2,000" },
                    { name: "Special classes (per month)", price: "₹700" },
                    { name: "School events & excursions", price: "₹2,500–₹4,000" },
                ],
            },
            {
                name: "Kindergarten",
                ageGroup: "Ages 5–6",
                icon: "🎓",
                img: "/assets/programs/kg.jpg",
                monthlyFee: "₹14,000",
                annualFee: "₹1,68,000",
                registrationFee: "₹3,000",
                description: "School readiness & academic skills",
                includes: [
                    "English, Math & Science curriculum",
                    "Reading & writing program",
                    "Problem-solving activities",
                    "Computer basics introduction",
                    "Sports & physical activities",
                    "Creative projects & competitions",
                    "Monthly progress tracking",
                    "School readiness preparation",
                ],
                additionalCharges: [
                    { name: "Tech classes (per month)", price: "₹800" },
                    { name: "Competitive exam prep", price: "₹1,000–₹1,500" },
                    { name: "Annual day & events", price: "₹5,000–₹7,000" },
                ],
            },
        ],
        paymentTerms: [
            { term: "Monthly", description: "Pay monthly fees", icon: "📅" },
            { term: "Quarterly", description: "3-month advance (5% discount)", icon: "📊" },
            { term: "Semi-Annual", description: "6-month advance (8% discount)", icon: "💰" },
            { term: "Annual", description: "Full year upfront (12% discount)", icon: "PREMIUM" },
        ],
        policies: [
            "Registration fee is non-refundable",
            "One month notice required for withdrawal",
            "Fee increase annually (April)",
            "Late fee: ₹500 per day after due date",
            "Sibling discount: 10% on second child",
            "Multiple year enrollment discount available",
        ],
    }
};

export default schoolDetailsEng;
