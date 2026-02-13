# SEO Implementation Guide - Code Changes

## Part 1: Schema Markup Implementation

### Step 1: Update app/layout.tsx with LocalBusiness Schema

```tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Play School in Patna | Ank Square Kids | Nursery & Preschool',
  description: 'Ank Square Kids - Leading play school in Patna offering quality education for kids ages 1.5-5.5. Programs include Play Group, Nursery, JKG, SKG. Affordable fees, certified staff. Apply now!',
  keywords: 'play school Patna, nursery school, preschool, kindergarten, daycare, best playschool, early childhood education',
  authors: [{ name: 'Ank Square Play School' }],
  canonical: 'https://anksquare-playschool.com',
  
  openGraph: {
    title: 'Best Play School in Patna | Ank Square Kids',
    description: 'Quality preschool & nursery education in Patna. Expert teachers, safe environment, modern facilities.',
    url: 'https://anksquare-playschool.com',
    type: 'website',
    siteName: 'Ank Square Kids',
    images: [
      {
        url: 'https://anksquare-playschool.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ank Square Play School',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Best Play School in Patna',
    description: 'Quality education for kids 1.5-5.5 years',
    image: 'https://anksquare-playschool.com/twitter-image.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': 'https://anksquare-playschool.com/#organization',
    name: 'Ank Square Kids Play School',
    description: 'Premium play school and preschool in Patna offering quality early childhood education',
    url: 'https://anksquare-playschool.com',
    logo: 'https://anksquare-playschool.com/logo.png',
    image: 'https://anksquare-playschool.com/hero-image.jpg',
    
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Boring Road',
      addressLocality: 'Patna',
      addressRegion: 'Bihar',
      postalCode: '800013',
      addressCountry: 'IN',
    },
    
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        telephone: '+91-9263767441',
        email: 'admission@anksquare.com',
        availableLanguage: ['en', 'hi'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'WhatsApp Support',
        telephone: '+91-9263767441',
      },
    ],
    
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '25.617368',
      longitude: '85.114206',
    },
    
    founder: {
      '@type': 'Person',
      name: 'Abhinav Sharma',
      jobTitle: 'Founder & Director',
    },
    
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
    
    sameAs: [
      'https://instagram.com/ditviplayschool',
      'https://www.facebook.com/ditviplayschool',
      'https://www.youtube.com/@ditviplayschool',
    ],
    
    educationalProgramType: [
      'Play Group',
      'Nursery',
      'Junior Kindergarten',
      'Senior Kindergarten',
    ],
    
    priceRange: '₹8,500 - ₹14,000',
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

---

### Step 2: Create robots.txt

**File: `public/robots.txt`**

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /private
Disallow: /*.json$
Allow: /api/public

# Specific crawl rate for large files
User-agent: Googlebot
Crawl-delay: 0

# Fast crawl for Googlebot
User-agent: Bingbot
Crawl-delay: 1

# Sitemap location
Sitemap: https://anksquare-playschool.com/sitemap.xml
Sitemap: https://anksquare-playschool.com/sitemap-hi.xml
```

---

### Step 3: Create sitemap.xml generator

**File: `src/app/sitemap.ts`**

```ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://anksquare-playschool.com';

  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/programs`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/fee-structure`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/admission-form`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/admission-status`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/downloads`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/spotlight`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/ar`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/brochure`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    // Add Hindi versions with hreflang
    {
      url: `${baseUrl}/hi/programs`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/hi/admission-form`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  return routes;
}
```

---

## Part 2: Page-Specific Metadata

### app/programs/page.tsx

```tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Play School Programs | Play Group to Senior KG | Ank Square',
  description: 'Explore our age-specific programs from Play Group (1.5-2.5) to Senior KG (4.5-5.5). Quality curriculum designed by child development experts. Enroll today!',
  keywords: 'play group, nursery, junior kindergarten, senior kg, preschool programs, early childhood education',
  canonical: 'https://anksquare-playschool.com/programs',
};

// Add schema markup in your component
export default function Programs() {
  const programSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'EducationalOccupationalProgram',
        position: 1,
        name: 'Play Group',
        description: 'Age 1.5 to 2.5 years - Foundation for social and motor skills',
        provider: {
          '@type': 'EducationalOrganization',
          name: 'Ank Square Kids',
        },
        educationalLevel: 'Pre-K',
        teaches: ['Social Skills', 'Motor Development', 'Language Skills', 'Creative Play'],
        price: '8500',
        priceCurrency: 'INR',
      },
      {
        '@type': 'EducationalOccupationalProgram',
        position: 2,
        name: 'Nursery',
        description: 'Age 2.5 to 3.5 years - Developing independence and academic readiness',
        provider: {
          '@type': 'EducationalOrganization',
          name: 'Ank Square Kids',
        },
        educationalLevel: 'Pre-K',
        teaches: ['Reading Basics', 'Math Fundamentals', 'Social Skills', 'Motor Skills'],
        price: '10000',
        priceCurrency: 'INR',
      },
      {
        '@type': 'EducationalOccupationalProgram',
        position: 3,
        name: 'Junior Kindergarten',
        description: 'Age 3.5 to 4.5 years - Academic foundation with play-based learning',
        provider: {
          '@type': 'EducationalOrganization',
          name: 'Ank Square Kids',
        },
        educationalLevel: 'K',
        teaches: ['Phonics', 'Number Recognition', 'Science Basics', 'Social Studies'],
        price: '12000',
        priceCurrency: 'INR',
      },
      {
        '@type': 'EducationalOccupationalProgram',
        position: 4,
        name: 'Senior Kindergarten',
        description: 'Age 4.5 to 5.5 years - School readiness preparation',
        provider: {
          '@type': 'EducationalOrganization',
          name: 'Ank Square Kids',
        },
        educationalLevel: 'K',
        teaches: ['Writing', 'Mathematics', 'English Language Arts', 'Critical Thinking'],
        price: '14000',
        priceCurrency: 'INR',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(programSchema) }}
      />
      {/* Your page content */}
    </>
  );
}
```

---

### app/fee-structure/page.tsx

```tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Playschool Fee Structure | Affordable Pricing | Ank Square',
  description: 'Transparent fee structure for all programs. Play Group ₹8,500 to Senior KG ₹14,000 monthly. Check discounts, payment terms, and registration fees.',
  keywords: 'playschool fees, admission charges, fee structure, monthly fees, registration fees',
  canonical: 'https://anksquare-playschool.com/fee-structure',
};

export default function FeeStructure() {
  const priceSchema = {
    '@context': 'https://schema.org',
    '@type': 'PriceSpecification',
    priceCurrency: 'INR',
    price: '8500',
    eligibleRegion: 'IN',
    availability: 'https://schema.org/InStock',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(priceSchema) }}
      />
      {/* Your page content */}
    </>
  );
}
```

---

### app/contact/page.tsx

```tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Ank Square Play School | Get In Touch | Visit Us',
  description: 'Contact Ank Square for admission queries, campus visits, or information. Phone: +91-9263767441 | Email: admission@anksquare.com | Boring Road, Patna, Bihar',
  keywords: 'contact playschool, admission contact, campus visit, playschool enquiry',
  canonical: 'https://anksquare-playschool.com/contact',
};

export default function Contact() {
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    mainEntity: {
      '@type': 'LocalBusiness',
      name: 'Ank Square Kids',
      image: 'https://anksquare-playschool.com/logo.png',
      description: 'Play school and preschool in Patna',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Boring Road',
        addressLocality: 'Patna',
        addressRegion: 'Bihar',
        postalCode: '800013',
        addressCountry: 'IN',
      },
      telephone: '+91-9263767441',
      email: 'admission@anksquare.com',
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '16:00',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      {/* Your page content */}
    </>
  );
}
```

---

## Part 3: Image Optimization Component

**File: `src/components/common/OptimizedImage.tsx`**

```tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  title?: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
}

export default function OptimizedImage({
  src,
  alt,
  title,
  width,
  height,
  priority = false,
  className = '',
  objectFit = 'cover',
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      title={title || alt}
      width={width}
      height={height}
      priority={priority}
      quality={75}
      loading={priority ? 'eager' : 'lazy'}
      className={className}
      style={{
        objectFit,
        objectPosition: 'center',
      }}
    />
  );
}
```

---

## Part 4: Breadcrumb Schema Component

**File: `src/components/common/Breadcrumb.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  path: string;
}

export default function Breadcrumb() {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', path: '/' },
    ];

    const pathMap: Record<string, string> = {
      programs: 'Programs',
      'fee-structure': 'Fee Structure',
      'admission-form': 'Admission Form',
      'admission-status': 'Admission Status',
      contact: 'Contact',
      gallery: 'Gallery',
      about: 'About',
      downloads: 'Downloads',
      spotlight: 'Spotlight',
      ar: 'AR Books',
    };

    let currentPath = '';
    paths.forEach((path) => {
      currentPath += `/${path}`;
      breadcrumbs.push({
        label: pathMap[path] || path.charAt(0).toUpperCase() + path.slice(1),
        path: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `https://anksquare-playschool.com${item.path}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <nav className="breadcrumb" aria-label="Breadcrumb">
        {breadcrumbs.map((item, index) => (
          <span key={item.path}>
            {index > 0 && <span className="separator"> / </span>}
            {index === breadcrumbs.length - 1 ? (
              <span aria-current="page">{item.label}</span>
            ) : (
              <Link href={item.path}>{item.label}</Link>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
```

---

## Part 5: Alt Text Guidelines

### Image Alt Text Examples

```
Logo Images:
"Ank Square Kids Play School logo"

Program Images:
"Play Group children learning with educational toys at Ank Square Kids"
"Nursery classroom with colorful learning materials"
"Junior Kindergarten students in outdoor play area"

Facility Images:
"Safe indoor play area with age-appropriate equipment"
"Outdoor garden and play area at Ank Square Kids"
"Classroom with modern educational resources"
"Library corner with children's books"

Staff Photos:
"Ms. [Name], certified Montessori teacher at Ank Square Kids"
"School director [Name] with students in classroom"

Activity Photos:
"Children participating in creative art activity"
"Students learning through play-based curriculum"
"Annual sports day event at Ank Square Kids"

Gallery Images:
"Students celebrating [Event Name] at Ank Square Play School"
"Classroom decoration for [Occasion]"

Hero Section:
"Welcome to Ank Square Kids - Leading play school in Patna"
"Happy children learning and playing at our preschool"
```

---

## Part 6: FAQ Schema for Homepage

**File: `src/components/home/FAQ.tsx`**

```tsx
export default function FAQ() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the admission process at Ank Square?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The admission process is simple: 1) Online Application - Fill the form and submit, 2) Application Review - Our team reviews your application, 3) Campus Visit/Interview - Meet our staff and see facilities, 4) Confirmation - Receive admission letter',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the monthly fees for different programs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Play Group: ₹8,500/month | Nursery: ₹10,000/month | Junior KG: ₹12,000/month | Senior KG: ₹14,000/month. All fees include meals, activities, and educational materials.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is your teacher-to-student ratio?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We maintain a 1:10-12 teacher-to-student ratio as per national standards to ensure individual attention and safety.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you offer half-day programs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we offer both full-day (9 AM - 4 PM) and half-day (9 AM - 1 PM) programs for flexibility.',
        },
      },
      {
        '@type': 'Question',
        name: 'What activities are included in the curriculum?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our curriculum includes: Play-based learning, Art & Craft, Music & Dance, Physical activities, Outdoor play, Language development, Math basics, Science exploration, and Social skill building.',
        },
      },
    ],
  };

  return (
    <section className="faq-section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Your FAQ content */}
    </section>
  );
}
```

---

## Part 7: hreflang for Hindi Pages

**File: `src/app/layout.tsx` (Add to metadata)**

```tsx
alternates: {
  languages: {
    'en': 'https://anksquare-playschool.com',
    'hi': 'https://anksquare-playschool.com/hi',
  },
}
```

---

## Implementation Checklist

- [ ] Update metadata in all pages
- [ ] Add LocalBusiness schema to layout
- [ ] Create robots.txt in public folder
- [ ] Create sitemap.ts file
- [ ] Add schema markup to programs page
- [ ] Add schema markup to fee structure page
- [ ] Add schema markup to contact page
- [ ] Create breadcrumb component
- [ ] Replace all images with OptimizedImage component
- [ ] Add alt text to all images
- [ ] Add FAQ schema to homepage
- [ ] Add hreflang tags for translations
- [ ] Test all schemas with Google Structured Data Testing Tool
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google My Business profile
- [ ] Monitor rankings and traffic

---

*This guide provides code-ready implementations for all critical SEO improvements.*
