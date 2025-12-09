# AR Book Print Template - Documentation

## Overview

The AR Book Print Template system provides a complete solution for printing branded, interactive AR books with school branding, QR codes, and scan markers. The system generates professional-quality printable documents that combine the school's identity with educational content.

## Features

### 1. **Branded Front Cover**
- School logo and name prominently displayed
- Book title, description, and metadata
- Category badge with modern design
- AR QR code for digital access
- Professional gradient backgrounds
- Print-ready layout

### 2. **AR Scan Page**
- Dedicated page for AR marker image
- Step-by-step instructions for scanning
- Device compatibility information
- Contact information footer
- High-contrast design for easy scanning

### 3. **Content Pages**
- Each book page with custom layout
- Page number badges
- Image containers with optimal sizing
- Description areas for educational content
- Interactive elements information
- Audio and AR model indicators

### 4. **Design System Integration**
- Uses CSS variables from `globals.css`
- Consistent color palette:
  - Primary Purple: `var(--primary-purple)` (#6a4c93)
  - Secondary Purple: `var(--secondary-purple)` (#8662b0)
  - Yellow Accent: `var(--primary-yellow)` (#ffbf00)
  - Text Gray: `var(--text-gray)` (#666666)
- Responsive typography
- Professional spacing and alignment

## Files Created

### Components

#### `src/components/ar/arBookPrintTemplate.tsx`
Main template component that generates the printable layout.

**Props:**
```typescript
interface ARBookPrintTemplateProps {
    book: ARBook;              // Book data from AR data structure
    qrCodeUrl?: string;        // QR code image URL
    arScanImageUrl?: string;   // AR scan marker image URL
}
```

**Usage:**
```tsx
<ARBookPrintTemplate 
    book={selectedBook}
    qrCodeUrl="/assets/qr-code.png"
    arScanImageUrl="/assets/ar-marker.png"
/>
```

#### `src/components/ar/arBookPrintPreview.tsx`
Preview and control page for the print template with print/download functionality.

**Features:**
- Print button with native browser print dialog
- PDF download capability
- Printing instructions and tips
- Page information display
- Responsive preview layout

#### `src/components/ar/arBookPrintTemplate.module.css`
Complete styling for print template with:
- Print-optimized CSS
- Page structure and sizing
- Screen display styles
- Responsive breakpoints

#### `src/components/ar/arBookPrintPreview.module.css`
Styling for the preview interface with:
- Header with action buttons
- Instruction cards
- Info boxes
- Print-specific styling

### Routes

#### `src/app/ar-books/print/page.tsx`
Default print preview page (shows first book).

**URL:** `/ar-books/print`

#### `src/app/ar-books/[bookId]/print/page.tsx`
Print preview page for specific book.

**URL:** `/ar-books/{bookId}/print`

## Integration with Reader

### Added to `arbookreader.tsx`
- Print button in header actions
- Links to `/ar-books/{bookId}/print`
- Seamless navigation from reader to print template

## Data Structure

The template uses the existing AR Book data structure:

```typescript
interface ARBook {
    id: string;
    title: string;
    description: string;
    coverImage: string;
    category: string;
    ageGroup: string;
    pages: ARBookPage[];
    authorName: string;
    publishedDate: string;
    isFeatured: boolean;
    views: number;
    rating: number;
}

interface ARBookPage {
    id: string;
    pageNumber: number;
    title: string;
    description: string;
    imageUrl: string;
    arModelUrl?: string;
    audioUrl?: string;
    interactiveElements?: ARInteractiveElement[];
}
```

School details are sourced from `src/json/schooldetails.ts`:

```typescript
{
    name: "Apollo Kids",
    logo: LogoImage,
    contact: {
        phone: string,
        email: string,
        whatsapp: string
    },
    address: {
        street: string,
        city: string,
        state: string,
        pincode: string,
        country: string
    }
}
```

## Page Structure

Each printed document contains:

1. **Front Cover Page**
   - School branding section
   - Book cover image
   - Book metadata (age group, author, pages, rating)
   - AR QR code with instructions
   - School copyright footer

2. **AR Scan Page**
   - AR marker image (full page)
   - Detailed scanning instructions
   - Device compatibility tips
   - Contact information

3. **Content Pages** (1 page per book page)
   - Page number and title
   - Full-size content image
   - Description text
   - Interactive elements list
   - AR/Audio indicators
   - Page footer with book title

## Printing Instructions

### Recommended Settings
- **Format:** A4 or Letter size (portrait)
- **Color:** Full color
- **Quality:** High (300 DPI recommended)
- **Paper:** Glossy or matte finish (80-90 GSM)
- **Orientation:** Portrait
- **Margins:** Allow printer margins (usually 0.5 inches)

### Front Cover
- Print on high-quality glossy paper
- Laminate for durability (optional)
- Trim to exact size for professional appearance

### AR Scan Page
- Print on high-quality paper
- Consider laminating for protection
- Ensure good contrast for QR code scanning
- Keep color consistent for better AR recognition

### Content Pages
- Print on regular paper (80 GSM)
- Full color recommended
- Number pages for easy binding

### Post-Printing
1. Trim pages to consistent size
2. Bind pages using:
   - Staples
   - Spiral binding
   - Perfect binding
   - Saddle stitching
3. Consider laminating AR scan page for durability

## CSS Classes Reference

### Front Cover Classes
- `.frontCover` - Main front cover container
- `.brandingSection` - School branding area
- `.schoolLogo` - Logo image
- `.schoolName` - School name heading
- `.coverContent` - Main cover content
- `.bookCoverSection` - Book cover image container
- `.metaInfo` - Metadata grid
- `.bottomSection` - AR QR and instructions
- `.arSection` - QR code and instructions layout

### AR Scan Page Classes
- `.arScanPage` - Main container
- `.arPageHeader` - Page header
- `.arImageContainer` - AR marker image container
- `.arPageInstructions` - Instructions grid
- `.contactInfo` - Contact information section

### Content Page Classes
- `.contentPage` - Main content container
- `.pageHeader` - Page title section
- `.pageNumberBadge` - Page number indicator
- `.pageContent` - Main content area
- `.pageImageContainer` - Content image
- `.interactiveInfo` - Interactive elements info
- `.arDetails` - AR model information
- `.audioDetails` - Audio information

## Responsive Behavior

### Screen Display (>768px)
- Pages displayed with shadows
- Full-width preview
- Side-by-side instructions
- Hover effects on buttons

### Mobile Display (<768px)
- Single-column layout
- Stacked instructions
- Touch-friendly buttons
- Adjusted margins and padding

### Print View
- Print-optimized sizing
- Page break handling
- No shadows or decorative elements
- Optimized for paper output

## Browser Compatibility

- **Chrome/Edge:** Full support
- **Firefox:** Full support
- **Safari:** Full support
- **Mobile browsers:** Preview support (print may vary)

## Customization

### Change School Branding
Edit `src/json/schooldetails.ts`:
```typescript
export const schoolDetails: SchoolDetails = {
    name: "Your School Name",
    logo: YourLogo,
    contact: { /* ... */ },
    // ...
}
```

### Modify Colors
Colors are defined in `src/app/globals.css`:
```css
:root {
    --primary-purple: #6a4c93;
    --secondary-purple: #8662b0;
    --primary-yellow: #ffbf00;
    --white: #ffffff;
    --black: #333333;
    --text-gray: #666666;
    /* ... */
}
```

### Adjust Page Size
In `arBookPrintTemplate.module.css`:
```css
.page {
    width: 100%;
    aspect-ratio: 8.5 / 11; /* Change for different paper sizes */
}
```

## Features & Benefits

✅ **Professional Branding** - School logo and colors throughout
✅ **QR Integration** - Scan to access digital content
✅ **AR Markers** - Dedicated scan page for AR experiences
✅ **Print-Ready** - Optimized for commercial and home printing
✅ **Responsive** - Works on all screen sizes
✅ **Data-Driven** - Automatically generates from book data
✅ **Design System** - Uses brand colors consistently
✅ **Educational** - Clear instructions for all users
✅ **Flexible** - Easy to customize and extend

## Future Enhancements

- [ ] PDF export with server-side generation
- [ ] Custom watermarks
- [ ] Multi-language support
- [ ] ISBN and barcode generation
- [ ] Advanced binding options
- [ ] Print-to-order integration
- [ ] Digital copy alongside print
- [ ] Custom page sizes

## Troubleshooting

### Print Quality Issues
- Check printer color settings
- Ensure high-quality paper
- Verify image resolution (300 DPI minimum)
- Print a test page first

### QR Code Not Scanning
- Print at high quality
- Ensure adequate white space around code
- Use high-contrast paper
- Test with multiple devices

### AR Marker Issues
- Laminate for better durability
- Keep surface clean and flat
- Ensure good lighting when scanning
- Check app permissions for camera

## Support

For issues or customization requests:
1. Check this documentation
2. Review component code comments
3. Test with different printing settings
4. Verify data structure is correct

---

**Version:** 1.0  
**Last Updated:** December 2024  
**Author:** Ditvi Team
