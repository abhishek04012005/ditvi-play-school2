import { ProgramItem } from '@/types/programs-types';
import ToddlerProgramImage from '../../public/assets/programs/toddler.jpg'
import NurseryProgramImage from '../../public/assets/programs/nursery.jpg'
import PreKGProgramImage from '../../public/assets/programs/prekg.jpg'
import KGProgramImage from '../../public/assets/programs/kg.jpg'

export const programsHi: ProgramItem[] = [
    {
        title: "प्ले ग्रुप",
        ageGroup: "1.5 - 2.5 वर्ष",
        description: "बच्चों के लिए खोजपूर्ण खेल-आधारित सीखने का वातावरण जहां मोटर कौशल, सामाजिक संपर्क और प्रारंभिक भाषा विकास को प्रोत्साहित किया जाता है।",
        features: [
            "संवेदी अन्वेषण",
            "संगीत और गतिविधि",
            "बारीक मोटर गतिविधियां",
            "सामाजिक संपर्क",
        ],
        image: ToddlerProgramImage,
        schedule: "दैनिक 2-3 घंटे",
        color: "var(--primary-yellow)"
    },
    {
        title: "नर्सरी",
        ageGroup: "2.5 - 3.5 वर्ष",
        description: "संरचित लेकिन लचकदार पाठ्यक्रम जो संज्ञानात्मक विकास, भाषा कौशल और स्वतंत्रता पर केंद्रित है। कला, संगीत और बाहरी खेल शामिल हैं।",
        features: [
            "भाषा विकास",
            "रचनात्मक कला और शिल्प",
            "बाहरी अन्वेषण",
            "प्रारंभिक गणित",
        ],
        image: NurseryProgramImage,
        schedule: "दैनिक 3-4 घंटे",
        color: "var(--primary-yellow)"
    },
    {
        title: "जूनियर किंडरगार्टन",
        ageGroup: "3.5 - 4.5 वर्ष",
        description: "पूर्व-शैक्षणिक आधार प्रोग्राम जो एकाग्रता, सहयोग और प्रारंभिक शैक्षणिक कौशल को खेल-आधारित गतिविधियों के माध्यम से विकसित करता है।",
        features: [
            "प्रारंभिक पढ़ना और लिखना",
            "संख्या पहचान",
            "वैज्ञानिक अन्वेषण",
            "टीमवर्क और सहयोग",
        ],
        image: PreKGProgramImage,
        schedule: "दैनिक 4-5 घंटे",
        color: "var(--primary-yellow)"
    },
    {
        title: "सीनियर किंडरगार्टन",
        ageGroup: "4.5 - 5.5 वर्ष",
        description: "केंद्रित तैयारी पाठ्यक्रम जो बच्चों को आत्मविश्वास, स्वतंत्रता और किंडरगार्टन में सुचारू संक्रमण के लिए आवश्यक शैक्षणिक कौशल प्रदान करता है।",
        features: [
            "उन्नत पूर्व-पढ़ना और ध्वनि विज्ञान",
            "प्रारंभिक गणित अवधारणाएं और समस्या समाधान",
            "संरचित कक्षा दिनचर्या",
            "भावनात्मक नियंत्रण और साथी कौशल",
        ],
        image: KGProgramImage,
        schedule: "दैनिक 5-6 घंटे",
        color: "var(--primary-yellow)"
    }
];

export default programsHi;
