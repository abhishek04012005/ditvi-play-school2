'use client';
import { Metadata } from 'next';
import Awards from '@/components/spotlight/spotlight';

// export const metadata: Metadata = {
//     title: 'Spotlight - Ditvi Play School',
//     description: 'Celebrating our outstanding students and their remarkable achievements',
// };

export default function SpotlightPage() {
    return (
        <Awards isHomePage={false} />
    );
}