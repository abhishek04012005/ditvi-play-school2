import React from 'react';
import ARBookPrintPreview from '@/components/ar/arBookPrintPreview';

interface PageProps {
    params: {
        bookId: string;
    };
}

const ARBookDetailPrintPage: React.FC<PageProps> = ({ params }) => {
    return <ARBookPrintPreview bookId={params.bookId} />;
};

export default ARBookDetailPrintPage;
