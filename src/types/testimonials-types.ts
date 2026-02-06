import { StaticImageData } from 'next/image';

export interface TestimonialItem {
  id: number;
  name: string;
  role: string;
  image: string | StaticImageData;
  quote: string;
  rating: number;
}
