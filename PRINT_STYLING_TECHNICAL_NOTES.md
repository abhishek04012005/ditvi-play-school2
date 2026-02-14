/* Print-Friendly CSS Classes and Utilities */
/* This file documents the print behavior and can be extended with additional utilities */

/**
 * PRINT BEHAVIOR SUMMARY:
 * ========================
 * 
 * When printing from the Admin Admission Dashboard:
 * 1. The layout automatically switches to desktop/website view
 * 2. All responsive mobile styles are overridden
 * 3. Content is formatted for A4 paper
 * 4. Unnecessary elements are hidden
 * 5. Colors and contrast are optimized for printing
 */

/* ==================== PRINT UTILITY CLASSES ==================== */

/* Use these classes to control print behavior for specific elements */

/**
 * .print-hide - Hide element when printing
 * @media print { display: none !important; }
 */

/**
 * .print-show - Show element only when printing (hidden normally)
 * @media print { display: block !important; }
 */

/**
 * .print-page-break - Add page break before this element
 * @media print { page-break-before: always; }
 */

/**
 * .print-page-break-after - Add page break after this element
 * @media print { page-break-after: always; }
 */

/**
 * .print-avoid-break - Prevent this element from breaking across pages
 * @media print { page-break-inside: avoid; }
 */

/* ==================== PRINT CONFIGURATION ==================== */

/**
 * PAPER SIZE: A4 (210mm × 297mm)
 * MARGINS: 0.5cm all sides
 * ORIENTATION: Portrait (default)
 * 
 * To print landscape, users should:
 * 1. Open print dialog (Ctrl+P or Cmd+P)
 * 2. Select "Landscape" in print settings
 * 3. Click Print
 */

/* ==================== ELEMENTS AUTOMATICALLY HIDDEN WHEN PRINTING ==================== */

/**
 * The following elements are hidden via @media print in globals.css:
 * 
 * Navigation Elements:
 * - Navigation bars
 * - Sidebars
 * - Breadcrumbs
 * 
 * Interactive Elements:
 * - Modals and dialogs
 * - Buttons (except form buttons if needed)
 * - Input fields
 * - Dropdowns
 * 
 * Visual Effects:
 * - Gradients
 * - Box shadows
 * - Text shadows
 * - Animations
 * - Transitions
 */

/* ==================== PRINT-FRIENDLY COLORS ==================== */

/**
 * When printing:
 * - Background is always WHITE
 * - Text is always BLACK
 * - Links are BLUE (#0066cc)
 * - Borders are preserved for table structure
 * 
 * Color adjustments are applied with:
 * -webkit-print-color-adjust: exact
 * print-color-adjust: exact
 * color-adjust: exact
 */

/* ==================== ADMISSION DASHBOARD PRINT LAYOUT ==================== */

/**
 * STATUS CARDS SECTION
 * - Displays in 4-column grid (desktop layout)
 * - Shows summary counts
 * - Maintains consistent styling
 * - Page break avoided to keep together
 */

/**
 * ADMISSION TABLE SECTION
 * - Full width table layout
 * - All columns visible
 * - Proper borders and headers
 * - Font size optimized for A4 (11pt)
 * - Row height minimized for space efficiency
 * - Even rows have light gray background for readability
 */

/**
 * PAGINATION AND FILTERS
 * - Hidden when printing
 * - Only the current displayed data is printed
 * - Search/filter results are printed as-is
 */

/* ==================== PDF ADMISSION FORM PRINT ==================== */

/**
 * The PDF admission form has dedicated print styling:
 * - Single A4 page per admission
 * - School header with logo
 * - Student photo included
 * - Parent details
 * - Signature areas
 * - Form number and date footer
 * 
 * File: src/components/admissionpdftemplate/admissionpdftemplate.module.css
 */

/* ==================== PAGE BREAK STRATEGY ==================== */

/**
 * Large datasets are automatically paginated:
 * 
 * 1. Status cards kept together (no page break within)
 * 2. Table rows don't break mid-row
 * 3. Headings stay with their content
 * 4. Page margins are preserved (0.5cm)
 * 5. Minimum margins prevent content cutoff
 * 
 * If content spans multiple pages:
 * - Table headers repeat on each page (browser dependent)
 * - Content flows naturally to next page
 * - Page numbers added by browser/printer (optional)
 */

/* ==================== BROWSER DIFFERENCES ==================== */

/**
 * Chrome/Chromium:
 * ✓ Best print support
 * ✓ Colors print accurately
 * ✓ Table headers repeat
 * ✓ Excellent @media print support
 * 
 * Firefox:
 * ✓ Good print support
 * ✓ Table headers repeat
 * ✓ Colors mostly accurate
 * ✓ May need margin adjustment
 * 
 * Safari:
 * ✓ Good print support
 * ✓ Reliable layout
 * ~ Color reproduction may vary
 * ~ May need orientation adjustment
 * 
 * Mobile Browsers:
 * ✓ Chrome Mobile: Excellent
 * ✓ Safari Mobile: Good
 * ~ Layout may need zoom adjustment
 * ~ Orientation should be checked
 */

/* ==================== USER INSTRUCTIONS ==================== */

/**
 * PRINT FROM DESKTOP:
 * 1. Press Ctrl+P (Windows) or Cmd+P (Mac)
 * 2. Select your printer
 * 3. Check "Print background graphics" for colors
 * 4. Set margins to "Minimal" for more content
 * 5. Click Print
 * 
 * PRINT FROM MOBILE:
 * 1. Tap Menu (⋯) or Share button
 * 2. Select "Print" or "Print to PDF"
 * 3. Choose printer or save location
 * 4. The dashboard will display in desktop layout
 * 5. Confirm and print
 * 
 * PRINT TO PDF (RECOMMENDED):
 * 1. Open print dialog
 * 2. Select "Save as PDF" instead of printer
 * 3. Choose save location
 * 4. PDF will be created with desktop layout preserved
 * 5. Great for archiving and sharing
 */

/* ==================== TROUBLESHOOTING PRINT ISSUES ==================== */

/**
 * ISSUE: Content appears too small
 * SOLUTION: In print preview, increase zoom to 110-120%
 * 
 * ISSUE: Content is cut off on sides
 * SOLUTION: In print settings, change margins from "Normal" to "Minimal"
 * 
 * ISSUE: Colors don't print
 * SOLUTION: Check "Print background graphics" in print settings
 * 
 * ISSUE: Tables look wrong
 * SOLUTION: Ensure orientation is set to Portrait (default)
 * 
 * ISSUE: Multiple pages with large gaps
 * SOLUTION: Adjust margins or zoom in print settings
 * 
 * ISSUE: Page headers/footers interfere
 * SOLUTION: Uncheck "Headers and footers" in print settings
 */

/* ==================== PERFORMANCE NOTES ==================== */

/**
 * Print styles use:
 * - No JavaScript required (pure CSS)
 * - Minimal performance impact
 * - No additional HTTP requests
 * - Integrated into globals.css (single file)
 * 
 * Print preview is fast and responsive
 * Even with large datasets, printing is efficient
 */

/* ==================== FUTURE ENHANCEMENTS ==================== */

/**
 * Potential improvements:
 * - Custom print button with preview modal
 * - Selectable columns to print
 * - Date range selection for printing
 * - Print templates with custom headers
 * - Export to Excel/CSV for printing
 * - Print styling for dark mode (if implemented)
 * - Multi-language print optimization
 */

