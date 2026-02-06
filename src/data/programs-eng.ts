import { ProgramItem } from '@/types/programs-types';
import ToddlerProgramImage from '../../public/assets/programs/toddler.jpg'
import NurseryProgramImage from '../../public/assets/programs/nursery.jpg'
import PreKGProgramImage from '../../public/assets/programs/prekg.jpg'
import KGProgramImage from '../../public/assets/programs/kg.jpg'

export const programsEng: ProgramItem[] = [
    {
        title: "Play Group",
        ageGroup: "1.5 - 2.5 Years",
        description: "Exploratory play-based learning environment for toddlers to develop motor skills, social interaction, and early language development through age-appropriate activities.",
        features: [
            "Sensory Exploration",
            "Music & Movement",
            "Fine Motor Activities",
            "Social Interaction",
        ],
        image: ToddlerProgramImage,
        schedule: "2-3 hours daily",
        color: "var(--primary-yellow)"
    },
    {
        title: "Nursery",
        ageGroup: "2.5 - 3.5 Years",
        description: "Structured yet flexible curriculum focusing on cognitive development, language skills, and independence. Includes art, music, and outdoor play.",
        features: [
            "Language Development",
            "Creative Arts & Crafts",
            "Outdoor Exploration",
            "Early Numeracy",
        ],
        image: NurseryProgramImage,
        schedule: "3-4 hours daily",
        color: "var(--primary-yellow)"
    },
    {
        title: "Junior Kindergarten",
        ageGroup: "3.5 - 4.5 Years",
        description: "Pre-academic foundation program that builds focus, collaboration, and early academic skills through interactive learning and play-based activities.",
        features: [
            "Pre-Reading & Writing",
            "Number Recognition",
            "Scientific Exploration",
            "Teamwork & Cooperation",
        ],
        image: PreKGProgramImage,
        schedule: "4-5 hours daily",
        color: "var(--primary-yellow)"
    },
    {
        title: "Senior Kindergarten",
        ageGroup: "4.5 - 5.5 Years",
        description: "Focused readiness curriculum that builds confidence, independence, and foundational academic skills for a smooth transition to kindergarten.",
        features: [
            "Advanced Pre-Reading & Phonics",
            "Early Math Concepts & Problem Solving",
            "Structured Classroom Routines",
            "Emotional Regulation & Peer Skills",
        ],
        image: KGProgramImage,
        schedule: "5-6 hours daily",
        color: "var(--primary-yellow)"
    }
];

export default programsEng;
