'use client';
import Gallery from '@/components/gallery/gallery';

export default function GalleryPage() {
    return (
        <main>
            {/* Full Gallery with all sections */}
            <Gallery 
                isHomePage={false}
            />
        </main>
    );
}