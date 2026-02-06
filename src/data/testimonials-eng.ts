import { TestimonialItem } from '@/types/testimonials-types';
import Image1 from '../../public/assets/testimonial/1.jpg'
import Image2 from '../../public/assets/testimonial/2.png'
import Image3 from '../../public/assets/testimonial/3.png'
import Image4 from '../../public/assets/testimonial/4.png'
import Image5 from '../../public/assets/testimonial/5.png'

export const testimonialsEng: TestimonialItem[] = [
  {
    id: 1,
    name: 'Shivam Sharma',
    role: 'Parent of Rahul, Age 2',
    image: Image1,
    quote: `The progress Rahul has made since joining Anksquare Kids is incredible. He's more curious and confident every day.`,
    rating: 5
  },
  {
    id: 2,
    name: 'Ritika Kumari',
    role: 'Parent of Riya, Age 3',
    image: Image2,
    quote: `Riya absolutely loves going to Anksquare Kids. The playful learning approach keeps her engaged and happy.`,
    rating: 5
  },
  {
    id: 3,
    name: 'Akash Verma',
    role: 'Parent of Samarth, Age 2',
    image: Image3,
    quote: `Anksquare Kids has created a nurturing space where Samarth feels safe and excited to learn new things and explore.`,
    rating: 5
  },
  {
    id: 4,
    name: 'Neha Singh',
    role: 'Parent of Khushal, Age 4',
    image: Image4,
    quote: `The staff at Anksquare Kids are incredibly supportive. Khushal's communication skills have improved so much.`,
    rating: 5
  },
  {
    id: 5,
    name: 'Prerna Shah',
    role: 'Parent of Kiyansh, Age 4',
    image: Image5,
    quote: `We're thrilled with Kiyansh's development. Anksquare Kids blends fun and learning in the best way possible.`,
    rating: 5
  },
];

export default testimonialsEng;
