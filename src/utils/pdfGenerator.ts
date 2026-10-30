import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { isNativeMobile, shareOrSaveReceiptFile } from './mobileNative';

export async function generateThermalReceiptPdfBlob(
  element: HTMLElement,
  orderId: string,
  paperWidth: '58mm' | '80mm' = '80mm'
): Promise<{ blob: Blob; filename: string }> {
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
  const cleanId = orderId.replace(/[^a-zA-Z0-9_-]/g, '') || 'order';
  const filename = `receipt-${cleanId}-${paperWidth}.pdf`;
  const blob = pdf.output('blob');

  return { blob, filename };
}

export async function generateThermalReceiptPdf(
  element: HTMLElement,
  orderId: string,
  paperWidth: '58mm' | '80mm' = '80mm'
): Promise<void> {
  const { blob, filename } = await generateThermalReceiptPdfBlob(element, orderId, paperWidth);

  if (isNativeMobile()) {
    await shareOrSaveReceiptFile({
      blob,
      filename,
      title: `Thermal Receipt ${orderId}`,
      text: `Receipt for Order ${orderId}`,
    });
  } else {
    // Web browser direct download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
}
