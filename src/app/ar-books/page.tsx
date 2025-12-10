import { Metadata } from "next";
import ARBooks from "@/components/ar/arbooks";

export const metadata: Metadata = {
  title: "AR Books Library | Ditvi Play School",
  description: "Interactive AR books with 3D models and immersive learning experience for kids aged 2-6 years",
  openGraph: {
    title: "AR Books Library | Ditvi Play School",
    description: "Explore our collection of interactive AR books",
    url: "https://ditvi-playschool.com/ar-books",
    type: "website",
  },
};

export default function ARBooksPage() {
  return <ARBooks />;
}
