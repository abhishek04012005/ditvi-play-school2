import { Metadata } from "next";
import About from "@/components/about/about";
import Awards from "@/components/awards/awards";
import Contact from "@/components/contact/contact";
import EnquiryPopup from "@/components/enquiry/enquirypopup/enquirypopup";
import Gallery from "@/components/gallery/gallery";
import Hero from "@/components/hero/hero";
import Program from "@/components/program/program";
import Testimonials from "@/components/testimonials/testimonials";
import { galleryItems } from "@/json/gallery";

export const metadata: Metadata = {
  title: "Home | Ditvi Play School",
  description: "Welcome to Ditvi Play School - Best Play School in Your City",
  openGraph: {
    title: "Home | Ditvi Play School",
    description: "Welcome to Ditvi Play School",
    url: "https://ditvi-playschool.com",
    type: "website",
  },
};

export default function Home() {
  return (
    <div>
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
    </div>
  );
}
