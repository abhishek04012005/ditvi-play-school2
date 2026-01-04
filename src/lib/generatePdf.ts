export default async function generatePdf(elementId: string, fileName = 'ditvi-brochure.pdf') {
  const el = document.getElementById(elementId)
  if (!el) throw new Error('Element not found: ' + elementId)

  // dynamic import so SSR doesn't try to load it
  const html2pdf = await import('html2pdf.js')

  const opt = {
    margin: 0,
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 3, useCORS: true, logging: false, windowHeight: 2800, windowWidth: 2100 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
    pagebreak: { mode: 'css', before: '.pdfPage' },
  }

  // html2pdf returns a function default; call it with element
  // @ts-ignore
  html2pdf.default().set(opt).from(el).save()
}
