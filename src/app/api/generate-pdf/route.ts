import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  let browser = null;
  
  try {
    const { html, fileName } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    console.log('Launching Puppeteer browser...');
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const page = await browser.newPage();

    // Set viewport for A4 size
    await page.setViewport({
      width: 900,
      height: 1200,
      deviceScaleFactor: 2,
    });

    console.log('Setting page content...');
    
    // Set content and wait for all resources
    await page.setContent(html, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 60000,
    });

    console.log('Waiting for images to load...');
    
    // Wait for images to be fully loaded and rendered
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const images = document.querySelectorAll('img');
        let loadedCount = 0;
        
        if (images.length === 0) {
          resolve();
          return;
        }

        images.forEach((img: HTMLImageElement) => {
          if (img.complete) {
            loadedCount++;
            if (loadedCount === images.length) {
              resolve();
            }
          } else {
            img.onload = () => {
              loadedCount++;
              if (loadedCount === images.length) {
                resolve();
              }
            };
            img.onerror = () => {
              loadedCount++;
              if (loadedCount === images.length) {
                resolve();
              }
            };
          }
        });
        
        // Fallback timeout
        setTimeout(resolve, 3000);
      });
    });

    console.log('All images loaded, generating PDF...');

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    });

    await browser.close();
    browser = null;

    console.log('PDF generated, size:', pdfBuffer.length);

    // Return PDF as response
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName || 'brochure.pdf'}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Error closing browser:', e);
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
