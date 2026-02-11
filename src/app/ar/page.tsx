import fs from 'fs';
import path from 'path';
import ArSlider from '@/components/ar/ArSlider';
import HeadingTitle from '@/components/heading/headingtitle';

interface ImageData {
  src: string;
  name: string;
  description: string;
}

export default function ArPage() {
  const dir = path.join(process.cwd(), 'public', 'assets', 'ar-alphabates');
  let images: ImageData[] = [];
  try {
    const files = fs
      .readdirSync(dir)
      .filter((f) => /\.(png|jpe?g|webp|svg)$/i.test(f));
    
    images = files.map((filename, index) => ({
      src: `/assets/ar-alphabates/${filename}`,
      name: filename.replace(/\.[^/.]+$/, '').replace(/-|_/g, ' '),
      description: `Learn about ${filename.replace(/\.[^/.]+$/, '').replace(/-|_/g, ' ')} in 3D with our interactive AR experience`,
    }));
  } catch (e) {
    images = [];
  }

 

  return (
    <main
      style={{
        padding: 'clamp(1rem, 5vw, 2rem)',
        maxWidth: 1100,
        margin: '0 auto',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '1.5rem',
      }}
    >
      <div style={{ marginTop: '6rem' }}>
        <HeadingTitle 
          text="AR Alphabets & Images" 
          className=""
        />
      </div>
      <p style={{ color: '#666', fontSize: '1rem', textAlign: 'center', marginTop: '-1rem' }}>
        Explore interactive 3D models with Augmented Reality
      </p>

      {images.length > 0 ? (
        <ArSlider images={images} />
      ) : (
        <p style={{ textAlign: 'center', color: '#666' }}>
          No AR images found in /public/assets/ar-alphabates.
        </p>
      )}
    </main>
  );
}
