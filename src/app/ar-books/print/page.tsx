import React from 'react';
import ARBookPrintPreview from '@/components/ar/arBookPrintPreview';

interface PageProps {
    params: {
        bookId?: string;
    };
}

const ARBookPrintPage: React.FC<PageProps> = ({ params }) => {
    return <ARBookPrintPreview bookId={params?.bookId} />;
};

export default ARBookPrintPage;
