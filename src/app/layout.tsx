import type { Metadata } from 'next';
import './globals.css';
import RootLayoutClient from './layout-client';

export const metadata: Metadata = {
  title: 'Ditvi Play School',
  description: 'Best Play School in Your City',
  keywords: 'play school, nursery, kindergarten, preschool',
  authors: [{ name: 'Ditvi Play School' }],
  openGraph: {
    title: 'Ditvi Play School',
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
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}