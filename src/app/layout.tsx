import type { Metadata } from 'next';
import './globals.css';
import RootLayoutClient from './layout-client';

export const metadata: Metadata = {
  title: 'Ank Square Play School',
  description: 'Best Play School in Your City',
  keywords: 'play school, nursery, kindergarten, preschool',
  authors: [{ name: 'Ank Square Play School' }],
  openGraph: {
    title: 'Ank Square Play School',
    description: 'Best Play School in Your City',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Best Play School in Your City" />
        <meta httpEquiv="Content-Language" content="en-US,hi-IN" />
      </head>
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}