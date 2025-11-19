import About from "@/components/about/about";
import Awards from "@/components/awards/awards";
import Contact from "@/components/contact/contact";
import EnquiryPopup from "@/components/enquiry/enquirypopup/enquirypopup";
import Gallery from "@/components/gallery/gallery";
import Hero from "@/components/hero/hero";
import InstagramHashtag from "@/components/instagramhashtag/instagramhashtag";
import Program from "@/components/program/program";
import Testimonials from "@/components/testimonials/testimonials";
import { galleryItems, instagramVideos, normalVideos, youtubeVideos } from '@/json/gallery';

export default function Home() {
  return (
    <div>
      {/* <Awards /> */}
      <EnquiryPopup delay={3000} />
      <Hero />
      <About />
      <Program />
      <Awards isHomePage={true} />
      <Gallery
        items={galleryItems}
        youtubeVideos={[]}
        instagramVideos={[]}
        normalVideos={[]}
        isHomePage={true}
      />
      <Testimonials />
      <Contact />
      <InstagramHashtag />
    </div>
  );
}
