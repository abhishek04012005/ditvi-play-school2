import { TestimonialItem } from '@/types/testimonials-types';
import Image1 from '../../public/assets/testimonial/1.jpg'
import Image2 from '../../public/assets/testimonial/2.png'
import Image3 from '../../public/assets/testimonial/3.png'
import Image4 from '../../public/assets/testimonial/4.png'
import Image5 from '../../public/assets/testimonial/5.png'

export const testimonialsHi: TestimonialItem[] = [
  {
    id: 1,
    name: 'Shivam Sharma',
    role: 'राहुल के माता-पिता, आयु 2',
    image: Image1,
    quote: `अपोलो किड्स में शामिल होने के बाद से राहुल ने जो प्रगति की है वह अविश्वसनीय है। वह हर दिन अधिक जिज्ञासु और आत्मविश्वासी हो रहा है।`,
    rating: 5
  },
  {
    id: 2,
    name: 'Ritika Kumari',
    role: 'रिया की माता-पिता, आयु 3',
    image: Image2,
    quote: `रिया को अपोलो किड्स में जाना बिल्कुल पसंद है। खेल-खेल में सीखने का तरीका उसे जुड़े रखता है और खुश रखता है।`,
    rating: 5
  },
  {
    id: 3,
    name: 'Akash Verma',
    role: 'समर्थ के माता-पिता, आयु 2',
    image: Image3,
    quote: `अपोलो किड्स ने एक पोषणकारी स्थान बनाया है जहां समर्थ सुरक्षित महसूस करता है और नई चीजें सीखने और खोजने के लिए उत्साहित रहता है।`,
    rating: 5
  },
  {
    id: 4,
    name: 'Neha Singh',
    role: 'खुशाल के माता-पिता, आयु 4',
    image: Image4,
    quote: `अपोलो किड्स के स्टाफ असाधारण रूप से सहायक हैं। खुशाल के संचार कौशल में बहुत सुधार हुआ है।`,
    rating: 5
  },
  {
    id: 5,
    name: 'Prerna Shah',
    role: 'किंयश के माता-पिता, आयु 4',
    image: Image5,
    quote: `हम किंयश के विकास से बहुत खुश हैं। अपोलो किड्स ने मजे और सीखने को सबसे अच्छे तरीके से मिलाया है।`,
    rating: 5
  },
];

export default testimonialsHi;
