import React from 'react';
import AZBookTemplate from '@/components/ar/azBookTemplate';
import { azAlphabetBook } from '@/data/azBooksData';

export default function AZBookPage() {
    return <AZBookTemplate bookData={azAlphabetBook} />;
}
