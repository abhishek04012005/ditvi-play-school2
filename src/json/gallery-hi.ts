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

// गैलरी आइटम
export const galleryItems: GalleryItem[] = [
    {
        id: '1',
        title: 'होली का जश्न',
        description: 'रंगों का जीवंत त्योहार जो छात्रों में खुशी और एकता फैलाता है',
        image: HoliImage
    },
    {
        id: '2',
        title: 'दिवाली की खुशियां',
        description: 'दिलों और हॉल को रोशनी, हंसी और सांस्कृतिक प्रदर्शनों से सजाता है',
        image: DiwaliImage
    },
    {
        id: '3',
        title: 'स्वतंत्रता दिवस परेड',
        description: 'राष्ट्रगान, ध्वज फहराने और छात्र-नेतृत्व वाले कार्यक्रमों के साथ राष्ट्रीय गौरव का प्रदर्शन',
        image: IndependenceDayImage
    },
    {
        id: '4',
        title: 'शिक्षक दिवस सम्मान',
        description: 'अपने शिक्षकों को दिल से संदेश और मंच प्रदर्शन के साथ सम्मानित करना',
        image: TeacherDayImage
    },
    {
        id: '5',
        title: 'पर्यावरण दिवस अभियान',
        description: 'हरित पहल और पर्यावरण-अनुकूल गतिविधियों के माध्यम से जागरूकता फैलाना',
        image: EnvironmentDayImage
    }
];

// YouTube वीडियो
export const youtubeVideos: YouTubeVideo[] = [
    {
        id: 'yt-1',
        title: 'वार्षिक दिवस समारोह 2024',
        description: 'वार्षिक समारोह कार्यक्रम में हमारे अद्भुत छात्रों का प्रदर्शन देखें',
        videoId: 'ViAoI0Oh63U',
    },
    {
        id: 'yt-2',
        title: 'खेल दिवस की हाइलाइट्स',
        description: 'हमारे खेल दिवस कार्यक्रम के रोमांचक पल',
        videoId: 'MLUg3jEQCqs',
    },
    {
        id: 'yt-3',
        title: 'स्कूल का दौरा',
        description: 'हमारी आधुनिक स्कूल सुविधाओं का दौरा',
        videoId: 'woPopvZbp8s',
    },
    {
        id: 'yt-4',
        title: 'विज्ञान मेला 2024',
        description: 'छात्र अपनी नवोन्मेषी विज्ञान परियोजनाओं का प्रदर्शन करते हैं',
        videoId: '1dIOy6_iIoo',
    },
];

// Instagram वीडियो
export const instagramVideos: InstagramVideo[] = [
    {
        id: 'ig-1',
        title: 'कक्षा की गतिविधियां',
        description: 'देखें कि आज हमारे छात्र क्या सीख रहे हैं',
        embedUrl: '<iframe src="https://www.instagram.com/p/DQwvy3DEjPu/embed" width="320" height="500"></iframe>',
        thumbnail: '/assets/gallery/instagrampreview/1.png'
    },
   
    {
        id: 'ig-2',
        title: 'छात्र उपलब्धियां',
        description: 'हमारे छात्रों की उपलब्धियों का जश्न मनाना',
        embedUrl: '<iframe src="https://www.instagram.com/p/DO_CoavEil4/embed" width="320" height="500"></iframe>',
        thumbnail: '/assets/gallery/instagrampreview/2.png'
    },
    {
        id: 'ig-3',
        title: 'स्कूल के कार्यक्रम',
        description: 'हमारे स्कूल के कार्यक्रमों से अद्भुत पल',
        embedUrl: '<iframe src="https://www.instagram.com/p/DN995eEEr4G/embed" width="320" height="500"></iframe>',
        thumbnail: '/assets/gallery/instagrampreview/3.png'
    },
];

// सामान्य वीडियो
export const normalVideos: NormalVideo[] = [
    {
        id: 'vid-1',
        title: 'हमारे स्कूल में आपका स्वागत है',
        description: 'हमारे स्कूल समुदाय में आपका गर्मजोशी भरा स्वागत',
        videoUrl: '/assets/gallery/video/1.mp4',
        thumbnail: '/assets/gallery/video/preview/1.png'
    },
    {
        id: 'vid-2',
        title: 'सीखने की यात्रा',
        description: 'बाल विकास के प्रति हमारा समग्र दृष्टिकोण',
        videoUrl: '/assets/gallery/video/2.mp4',
        thumbnail: '/assets/gallery/video/preview/2.png'
    },
    {
        id: 'vid-3',
        title: 'छात्रों की गवाहियां',
        description: 'हमारे छात्रों और माता-पिता की सुनें',
        videoUrl: '/assets/gallery/video/3.mp4',
        thumbnail: '/assets/gallery/video/preview/3.png'
    }
];
