import { Metadata } from "next";
import ARBookReader from "@/components/ar/arbookreader";

interface Props {
  params: {
    bookId: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `AR Book | Ditvi Play School`,
    description: "Experience interactive augmented reality learning with our AR books",
    openGraph: {
      title: `AR Book | Ditvi Play School`,
      description: "Interactive AR book experience",
      url: `https://ditvi-playschool.com/ar-books/${params.bookId}`,
      type: "website",
    },
  };
}

export default function ARBookPage({ params }: Props) {
  return <ARBookReader bookId={params.bookId} />;
}
