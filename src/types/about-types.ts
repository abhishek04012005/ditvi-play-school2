import { StaticImageData } from 'next/image';

export interface AboutFeature {
  icon: any;
  title: string;
  description: string;
}

export interface FounderMessage {
  name: string;
  position: string;
  message: string;
  image: StaticImageData;
}
