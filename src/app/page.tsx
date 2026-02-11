import { Metadata } from "next";
import About from "@/components/about/about";
import Awards from "@/components/spotlight/spotlight";
import Contact from "@/components/contact/contact";
import DynamicPopupSelector from "@/components/enquiry/dynamicpopupselector/dynamicpopupselector";
import Gallery from "@/components/gallery/gallery";
import Hero from "@/components/hero/hero";
import Program from "@/components/program/program";
import Testimonials from "@/components/testimonials/testimonials";

export const metadata: Metadata = {
  title: "Home | Ank Square Play School",
  description: "Welcome to Ank Square Play School - Best Play School in Your City",
  openGraph: {
    title: "Home | Ank Square Play School",
    description: "Welcome to Ank Square Play School",
    url: "https://anksquare-playschool.com",
    type: "website",
  },
};

export default function Home() {
  return (
    <div>
      <DynamicPopupSelector />
      <Hero />
      <About />
      <Program />
      <Awards isHomePage={true} />
      <Gallery
        isHomePage={true}
      />
      <Testimonials />
      <Contact />
    </div>
  );
}
