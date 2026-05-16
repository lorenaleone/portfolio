import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, RGB } from 'pdf-lib';
import { VoucherFull } from './types';

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 48;

export async function generateVoucherPDF(voucher: VoucherFull): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Voucher - ${voucher.customerName}`);
  pdfDoc.setAuthor(voucher.agency.name);
  pdfDoc.setSubject('Voucher de Passeio');
  pdfDoc.setCreator('Lumina Vouchers');

  const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);

  const fonts = {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    oblique: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
  };

  const brand = hexToRgb(voucher.agency.brandColor);
  const brandLight = lighten(brand, 0.92);
  const gray900 = rgb(0.11, 0.13, 0.16);
  const gray600 = rgb(0.4, 0.45, 0.51);
  const gray300 = rgb(0.83, 0.85, 0.88);
  const white = rgb(1, 1, 1);

  await drawHeader(page, voucher, fonts, brand, white);
  await drawVoucherBadge(page, fonts, brand, brandLight);

  let y = A4_HEIGHT - 240;

  y = drawCustomerSection(page, voucher, fonts, y, gray900, gray600, brand);
  y -= 24;

  y = drawTripSection(page, voucher, fonts, y, gray900, gray600, brand, gray300);
  y -= 24;

  if (voucher.notes) {
    y = drawNotesSection(page, voucher, fonts, y, gray900, gray600, brandLight);
    y -= 24;
  }

  if (voucher.price !== undefined && voucher.price > 0) {
    drawPriceSection(page, voucher, fonts, y, brand, white);
  }

  drawFooter(page, voucher, fonts, gray600, gray300, brand);

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}

// ─── Sections ──────────────────────────────────────────────────────

async function drawHeader(
  page: PDFPage,
  voucher: VoucherFull,
  fonts: { regular: PDFFont; bold: PDFFont; oblique: PDFFont },
  brand: RGB,
  white: RGB
) {
  page.drawRectangle({
    x: 0,
    y: A4_HEIGHT - 140,
    width: A4_WIDTH,
    height: 140,
    color: brand,
  });

  page.drawRectangle({
    x: 0,
    y: A4_HEIGHT - 144,
    width: A4_WIDTH,
    height: 4,
    color: darken(brand, 0.85),
  });

  const agencyName = voucher.agency.name || 'Sua Agência';
  const nameSize = agencyName.length > 24 ? 22 : 28;

  page.drawText(agencyName.toUpperCase(), {
    x: MARGIN,
    y: A4_HEIGHT - 75,
    size: nameSize,
    font: fonts.bold,
    color: white,
  });

  page.drawText('VOUCHER DE PASSEIO', {
    x: MARGIN,
    y: A4_HEIGHT - 105,
    size: 11,
    font: fonts.regular,
    color: rgb(1, 1, 1),
    opacity: 0.85,
  });

  if (voucher.agency.whatsappNumber) {
    const text = voucher.agency.whatsappNumber;
    const textWidth = fonts.regular.widthOfTextAtSize(text, 10);
    page.drawText(text, {
      x: A4_WIDTH - MARGIN - textWidth,
      y: A4_HEIGHT - 105,
      size: 10,
      font: fonts.regular,
      color: white,
      opacity: 0.9,
    });
  }
}

async function drawVoucherBadge(
  page: PDFPage,
  fonts: { regular: PDFFont; bold: PDFFont },
  brand: RGB,
  brandLight: RGB
) {
  const badgeY = A4_HEIGHT - 180;
  const badgeText = '✓ CONFIRMADO';
  const badgeWidth = fonts.bold.widthOfTextAtSize(badgeText, 10) + 24;

  page.drawRectangle({
    x: MARGIN,
    y: badgeY - 8,
    width: badgeWidth,
    height: 24,
    color: brandLight,
    borderColor: brand,
    borderWidth: 1,
  });

  page.drawText(badgeText, {
    x: MARGIN + 12,
    y: badgeY,
    size: 10,
    font: fonts.bold,
    color: brand,
  });
}

function drawCustomerSection(
  page: PDFPage,
  voucher: VoucherFull,
  fonts: { regular: PDFFont; bold: PDFFont },
  y: number,
  gray900: RGB,
  gray600: RGB,
  brand: RGB
): number {
  page.drawText('CLIENTE', {
    x: MARGIN,
    y,
    size: 9,
    font: fonts.bold,
    color: gray600,
  });

  page.drawText(voucher.customerName, {
    x: MARGIN,
    y: y - 24,
    size: 22,
    font: fonts.bold,
    color: gray900,
  });

  return y - 50;
}

function drawTripSection(
  page: PDFPage,
  voucher: VoucherFull,
  fonts: { regular: PDFFont; bold: PDFFont },
  y: number,
  gray900: RGB,
  gray600: RGB,
  brand: RGB,
  gray300: RGB
): number {
  page.drawLine({
    start: { x: MARGIN, y: y + 8 },
    end: { x: A4_WIDTH - MARGIN, y: y + 8 },
    thickness: 1,
    color: gray300,
  });

  drawField(page, fonts, 'DESTINO', voucher.destination, MARGIN, y - 12, gray600, gray900, 18);
  y -= 56;

  const col1X = MARGIN;
  const col2X = MARGIN + (A4_WIDTH - MARGIN * 2) / 2;

  drawField(
    page,
    fonts,
    'DATA',
    formatDate(voucher.date),
    col1X,
    y,
    gray600,
    brand,
    14
  );

  if (voucher.time) {
    drawField(page, fonts, 'HORÁRIO', voucher.time, col2X, y, gray600, brand, 14);
  }

  y -= 50;

  if (voucher.pickupLocation) {
    drawField(
      page,
      fonts,
      'LOCAL DE SAÍDA',
      voucher.pickupLocation,
      col1X,
      y,
      gray600,
      gray900,
      13
    );
  }

  drawField(
    page,
    fonts,
    'PASSAGEIROS',
    String(voucher.passengers),
    col2X,
    y,
    gray600,
    gray900,
    13
  );

  return y - 32;
}

function drawNotesSection(
  page: PDFPage,
  voucher: VoucherFull,
  fonts: { regular: PDFFont; bold: PDFFont },
  y: number,
  gray900: RGB,
  gray600: RGB,
  brandLight: RGB
): number {
  const contentWidth = A4_WIDTH - MARGIN * 2;
  const lines = wrapText(voucher.notes || '', fonts.regular, 11, contentWidth - 24);
  const boxHeight = 32 + lines.length * 16;

  page.drawRectangle({
    x: MARGIN,
    y: y - boxHeight,
    width: contentWidth,
    height: boxHeight,
    color: brandLight,
  });

  page.drawText('OBSERVAÇÕES', {
    x: MARGIN + 12,
    y: y - 18,
    size: 9,
    font: fonts.bold,
    color: gray600,
  });

  lines.forEach((line, i) => {
    page.drawText(line, {
      x: MARGIN + 12,
      y: y - 38 - i * 16,
      size: 11,
      font: fonts.regular,
      color: gray900,
    });
  });

  return y - boxHeight - 8;
}

function drawPriceSection(
  page: PDFPage,
  voucher: VoucherFull,
  fonts: { regular: PDFFont; bold: PDFFont },
  y: number,
  brand: RGB,
  white: RGB
) {
  const contentWidth = A4_WIDTH - MARGIN * 2;
  const boxHeight = 56;

  page.drawRectangle({
    x: MARGIN,
    y: y - boxHeight,
    width: contentWidth,
    height: boxHeight,
    color: brand,
  });

  page.drawText('VALOR TOTAL', {
    x: MARGIN + 20,
    y: y - 24,
    size: 10,
    font: fonts.regular,
    color: white,
    opacity: 0.85,
  });

  const priceText = formatCurrency(voucher.price!);
  const priceWidth = fonts.bold.widthOfTextAtSize(priceText, 24);

  page.drawText(priceText, {
    x: A4_WIDTH - MARGIN - 20 - priceWidth,
    y: y - 38,
    size: 24,
    font: fonts.bold,
    color: white,
  });
}

function drawFooter(
  page: PDFPage,
  voucher: VoucherFull,
  fonts: { regular: PDFFont; bold: PDFFont; oblique: PDFFont },
  gray600: RGB,
  gray300: RGB,
  brand: RGB
) {
  const contentWidth = A4_WIDTH - MARGIN * 2;

  if (voucher.agency.footerText) {
    const lines = wrapText(voucher.agency.footerText, fonts.oblique, 11, contentWidth);
    lines.forEach((line, i) => {
      const w = fonts.oblique.widthOfTextAtSize(line, 11);
      page.drawText(line, {
        x: (A4_WIDTH - w) / 2,
        y: 100 - i * 16,
        size: 11,
        font: fonts.oblique,
        color: gray600,
      });
    });
  }

  page.drawLine({
    start: { x: MARGIN, y: 56 },
    end: { x: A4_WIDTH - MARGIN, y: 56 },
    thickness: 1,
    color: gray300,
  });

  const generatedText = `Gerado em ${formatDateTime(voucher.generatedAt)}`;
  page.drawText(generatedText, {
    x: MARGIN,
    y: 38,
    size: 8,
    font: fonts.regular,
    color: gray600,
  });

  const idText = `ID: ${voucher.id}`;
  const idWidth = fonts.regular.widthOfTextAtSize(idText, 8);
  page.drawText(idText, {
    x: A4_WIDTH - MARGIN - idWidth,
    y: 38,
    size: 8,
    font: fonts.regular,
    color: gray600,
  });

  const brandingText = '✨ Gerado com Lumina Vouchers';
  const brandingWidth = fonts.bold.widthOfTextAtSize(brandingText, 8);
  page.drawText(brandingText, {
    x: (A4_WIDTH - brandingWidth) / 2,
    y: 20,
    size: 8,
    font: fonts.bold,
    color: brand,
  });
}

// ─── Helpers ───────────────────────────────────────────────────────

function drawField(
  page: PDFPage,
  fonts: { regular: PDFFont; bold: PDFFont },
  label: string,
  value: string,
  x: number,
  y: number,
  labelColor: RGB,
  valueColor: RGB,
  valueSize: number
) {
  page.drawText(label, {
    x,
    y,
    size: 9,
    font: fonts.bold,
    color: labelColor,
  });

  page.drawText(value, {
    x,
    y: y - 22,
    size: valueSize,
    font: fonts.bold,
    color: valueColor,
  });
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  if (isNaN(r) || isNaN(g) || isNaN(b)) return rgb(0.15, 0.39, 0.93);
  return rgb(r, g, b);
}

function lighten(color: RGB, amount: number): RGB {
  return rgb(
    color.red + (1 - color.red) * amount,
    color.green + (1 - color.green) * amount,
    color.blue + (1 - color.blue) * amount
  );
}

function darken(color: RGB, amount: number): RGB {
  return rgb(color.red * amount, color.green * amount, color.blue * amount);
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}
