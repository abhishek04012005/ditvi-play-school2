export interface SchoolDetails {
    name: string;
    logo: string | any;
    session: string;
    admissionAuthority?: string;
    website: string;
    contact: {
        phone: string;
        email: string;
        whatsapp: string;
        website: string;
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
