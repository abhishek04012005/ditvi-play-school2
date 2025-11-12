import { StaticImageData } from 'next/image';
import HoliImage from '../../public/assets/gallery/holi.png'
import DiwaliImage from '../../public/assets/gallery/diwali.png'
import IndependenceDayImage from '../../public/assets/gallery/independenceday.png'
import TeacherDayImage from '../../public/assets/gallery/teacherday.png'
import EnvironmentDayImage from '../../public/assets/gallery/environmentday.jpg'

export interface GalleryItem {
    id: string;
    title: string;
    description: string;
    image: string | StaticImageData;
}

export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    videoId: string;
}

export interface InstagramVideo {
    id: string;
    title: string;
    description: string;
    embedUrl: string;
    thumbnail?: string;
}

export interface NormalVideo {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnail: string;
}

// Sample Gallery Items
export const galleryItems: GalleryItem[] = [
    {
        id: '1',
        title: 'Holi Celebration',
        description: 'A vibrant festival of colors spreading joy and unity among students',
        image: HoliImage
    },
    {
        id: '2',
        title: 'Diwali Festivities',
        description: 'Illuminating hearts and halls with lights, laughter, and cultural performances',
        image: DiwaliImage
    },
    {
        id: '3',
        title: 'Independence Day Parade',
        description: 'Patriotic pride on display with flag hoisting and student-led performances',
        image: IndependenceDayImage
    },
    {
        id: '4',
        title: 'Teacher’s Day Tribute',
        description: 'Honoring our mentors with heartfelt messages and stage performances',
        image: TeacherDayImage
    },
    {
        id: '5',
        title: 'Environment Day Drive',
        description: 'Spreading awareness through green initiatives and eco-friendly activities',
        image: EnvironmentDayImage
    }
];


// Sample YouTube Videos
export const youtubeVideos: YouTubeVideo[] = [
    {
        id: 'yt-1',
        title: 'Annual Day Celebration 2024',
        description: 'Watch our amazing students perform at the annual celebration event',
        videoId: 'ViAoI0Oh63U',
    },
    {
        id: 'yt-2',
        title: 'Sports Day Highlights',
        description: 'Exciting moments from our sports day event',
        videoId: 'MLUg3jEQCqs',
    },
    {
        id: 'yt-3',
        title: 'School Tour',
        description: 'Tour of our modern school facilities',
        videoId: 'woPopvZbp8s',
    },
    {
        id: 'yt-4',
        title: 'Science Fair 2024',
        description: 'Students showcase their innovative science projects',
        videoId: '1dIOy6_iIoo',
    },
];

// Sample Instagram Videos
export const instagramVideos: InstagramVideo[] = [
    {
        id: 'ig-1',
        title: 'Class Activities',
        description: 'Check out what our students are learning today',
        embedUrl: '<iframe src="https://www.instagram.com/p/DQwvy3DEjPu/embed" width="320" height="500"></iframe>',
        thumbnail: '/assets/gallery/instagrampreview/1.png'
    },
   
    {
        id: 'ig-2',
        title: 'Student Achievements',
        description: 'Celebrating our students accomplishments',
        embedUrl: '<iframe src="https://www.instagram.com/p/DO_CoavEil4/embed" width="320" height="500"></iframe>',
        thumbnail: '/assets/gallery/instagrampreview/2.png'
    },
    {
        id: 'ig-3',
        title: 'School Events',
        description: 'Amazing moments from our school events',
        embedUrl: '<iframe src="https://www.instagram.com/p/DN995eEEr4G/embed" width="320" height="500"></iframe>',
        thumbnail: '/assets/gallery/instagrampreview/3.png'
    },
];

// Sample Normal Videos
export const normalVideos: NormalVideo[] = [
    {
        id: 'vid-1',
        title: 'Welcome to Our School',
        description: 'A warm welcome to our school community',
        videoUrl: '/assets/gallery/video/1.mp4',
        thumbnail: '/assets/gallery/video/preview/1.png'
    },
    {
        id: 'vid-2',
        title: 'Learning Journey',
        description: 'Our approach to holistic child development',
        videoUrl: '/assets/gallery/video/2.mp4',
        thumbnail: '/assets/gallery/video/preview/2.png'
    },
    {
        id: 'vid-3',
        title: 'Student Testimonials',
        description: 'Hear from our students and parents',
        videoUrl: '/assets/gallery/video/3.mp4',
        thumbnail: '/assets/gallery/video/preview/3.png'
    }
];