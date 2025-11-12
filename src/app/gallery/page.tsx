'use client';
import Gallery from '@/components/gallery/gallery';
import { galleryItems, youtubeVideos, instagramVideos, normalVideos } from '@/json/gallery';

export default function GalleryPage() {
    return (
        <main>
            {/* Full Gallery with all sections */}
            <Gallery 
                items={galleryItems}
                youtubeVideos={youtubeVideos}
                instagramVideos={instagramVideos}
                normalVideos={normalVideos}
                isHomePage={false}
            />
        </main>
    );
}