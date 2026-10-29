import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function generateThermalReceiptPdf(
  element: HTMLElement,
  orderId: string,
  paperWidth: '58mm' | '80mm' = '80mm'
): Promise<void> {
  const widthMm = paperWidth === '58mm' ? 58 : 80;

  // Render element to canvas with high DPI for crisp receipt fonts & barcodes
  const canvas = await html2canvas(element, {
    scale: 3, // 3x scale for crisp 300DPI thermal print look
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidthPx = canvas.width;
  const imgHeightPx = canvas.height;

  // Calculate proportional height in millimeters
  const heightMm = (imgHeightPx / imgWidthPx) * widthMm;

  // Initialize jsPDF with exact custom thermal paper roll dimensions
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [widthMm, Math.max(heightMm, 50)],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm);
  const cleanId = orderId.replace(/[^a-zA-Z0-9_-]/g, '');
  pdf.save(`receipt-${cleanId || 'order'}-${paperWidth}.pdf`);
}
