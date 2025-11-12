import About from "@/components/about/about";
import Contact from "@/components/contact/contact";
import Gallery from "@/components/gallery/gallery";
import Hero from "@/components/hero/hero";
import Program from "@/components/program/program";
import StarOfWeek from "@/components/staroftheweek/staroftheweek";
import Testimonials from "@/components/testimonials/testimonials";
import { galleryItems, instagramVideos, normalVideos, youtubeVideos } from '@/json/gallery';

export default function Home() {
  return (
    <div>
      <StarOfWeek />
      <Hero />
      <About />
      <StarOfWeek asSection />
      <Program />
      <Testimonials />
         <Gallery 
                items={galleryItems}
                youtubeVideos={[]}
                instagramVideos={[]}
                normalVideos={[]}
                isHomePage={true}
            />
      <Contact />
    </div>
  );
}
