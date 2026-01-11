import { Metadata } from "next";
import ARBookViewer from "@/components/ar/arBookViewer";
import { arBooks } from "@/ar/data";

interface Props {
  params: {
    bookId: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = arBooks.find(b => b.id === params.bookId);
  
  return {
    title: `${book?.title || 'AR Book'} | Ditvi Play School`,
    description: book?.description || "Experience interactive augmented reality learning with our AR books",
    openGraph: {
      title: `${book?.title || 'AR Book'} | Ditvi Play School`,
      description: book?.description || "Interactive AR book experience",
      url: `https://ditvi-playschool.com/ar-books/${params.bookId}`,
      type: "website",
    },
  };
}

export default function ARBookPage({ params }: Props) {
  const book = arBooks.find(b => b.id === params.bookId);
  
  if (!book) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        gap: '1rem'
      }}>
        <h1>Book Not Found</h1>
        <p>The requested book could not be found.</p>
        <a href="/ar-books" style={{ 
          padding: '0.75rem 1.5rem', 
          background: 'linear-gradient(135deg, #6a4c93 0%, #8662b0 100%)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px'
        }}>
          Back to Books
        </a>
      </div>
    );
  }

  return <ARBookViewer book={book} />;
}
