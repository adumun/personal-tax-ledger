import { deflateSync } from 'node:zlib';

const COLORS = Object.freeze({
  background: [27, 34, 44, 255],
  accent: [53, 199, 167, 255],
  foreground: [248, 250, 252, 255],
  muted: [148, 163, 184, 255]
});

const GLYPHS = Object.freeze({
  P: [
    '11110',
    '10001',
    '10001',
    '11110',
    '10000',
    '10000',
    '10000'
  ],
  T: [
    '11111',
    '00100',
    '00100',
    '00100',
    '00100',
    '00100',
    '00100'
  ],
  L: [
    '10000',
    '10000',
    '10000',
    '10000',
    '10000',
    '10000',
    '11111'
  ]
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function setPixel(pixels, width, x, y, rgba) {
  if (x < 0 || y < 0 || x >= width || y * width * 4 >= pixels.length) return;
  const offset = (y * width + x) * 4;
  pixels[offset] = rgba[0];
  pixels[offset + 1] = rgba[1];
  pixels[offset + 2] = rgba[2];
  pixels[offset + 3] = rgba[3];
}

function fillRect(pixels, width, height, x, y, rectWidth, rectHeight, rgba) {
  const startX = Math.max(0, Math.floor(x));
  const startY = Math.max(0, Math.floor(y));
  const endX = Math.min(width, Math.ceil(x + rectWidth));
  const endY = Math.min(height, Math.ceil(y + rectHeight));
  for (let py = startY; py < endY; py += 1) {
    for (let px = startX; px < endX; px += 1) {
      setPixel(pixels, width, px, py, rgba);
    }
  }
}

function drawGlyph(pixels, width, height, glyph, x, y, scale, rgba) {
  for (let row = 0; row < glyph.length; row += 1) {
    for (let col = 0; col < glyph[row].length; col += 1) {
      if (glyph[row][col] === '1') {
        fillRect(pixels, width, height, x + col * scale, y + row * scale, scale, scale, rgba);
      }
    }
  }
}

function drawMonogram(pixels, width, height, boxX, boxY, boxWidth, boxHeight) {
  const scale = Math.max(1, Math.floor(Math.min(boxHeight / 9, boxWidth / 20)));
  const glyphWidth = 5 * scale;
  const spacing = 2 * scale;
  const totalWidth = glyphWidth * 3 + spacing * 2;
  const totalHeight = 7 * scale;
  let x = Math.floor(boxX + (boxWidth - totalWidth) / 2);
  const y = Math.floor(boxY + (boxHeight - totalHeight) / 2);

  for (const letter of ['P', 'T', 'L']) {
    drawGlyph(pixels, width, height, GLYPHS[letter], x, y, scale, COLORS.foreground);
    x += glyphWidth + spacing;
  }
}

function drawLedgerMark(pixels, width, height, x, y, size) {
  fillRect(pixels, width, height, x, y, size, size, COLORS.accent);

  const inset = Math.max(2, Math.floor(size * 0.16));
  const pageX = x + inset;
  const pageY = y + inset;
  const pageWidth = size - inset * 2;
  const pageHeight = size - inset * 2;
  fillRect(pixels, width, height, pageX, pageY, pageWidth, pageHeight, COLORS.foreground);

  const spine = Math.max(1, Math.floor(size * 0.075));
  fillRect(pixels, width, height, pageX, pageY, spine, pageHeight, COLORS.background);

  const lineX = pageX + spine + Math.max(2, Math.floor(size * 0.08));
  const lineWidth = Math.max(2, pageWidth - spine - Math.floor(size * 0.16));
  const lineHeight = Math.max(1, Math.floor(size * 0.055));
  const firstY = pageY + Math.floor(pageHeight * 0.24);
  const gap = Math.max(2, Math.floor(pageHeight * 0.21));
  for (let i = 0; i < 3; i += 1) {
    fillRect(pixels, width, height, lineX, firstY + gap * i, lineWidth, lineHeight, i === 2 ? COLORS.accent : COLORS.background);
  }
}

function encodePng(width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const rows = [];
  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0;
    pixels.copy(row, 1, y * width * 4, (y + 1) * width * 4);
    rows.push(row);
  }

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(Buffer.concat(rows))),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

export function createBrandedPng(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 16 || height < 16) {
    throw new Error(`Dimensiones MSIX inválidas: ${width}x${height}.`);
  }

  const pixels = Buffer.alloc(width * height * 4);
  fillRect(pixels, width, height, 0, 0, width, height, COLORS.background);

  if (width >= height * 1.5) {
    const markSize = Math.floor(height * 0.68);
    const markX = Math.floor(height * 0.16);
    const markY = Math.floor((height - markSize) / 2);
    drawLedgerMark(pixels, width, height, markX, markY, markSize);

    const monogramX = markX + markSize + Math.floor(height * 0.14);
    const monogramWidth = width - monogramX - Math.floor(height * 0.12);
    drawMonogram(pixels, width, height, monogramX, Math.floor(height * 0.15), monogramWidth, Math.floor(height * 0.52));

    const ruleY = Math.floor(height * 0.74);
    fillRect(pixels, width, height, monogramX, ruleY, Math.max(1, monogramWidth), Math.max(2, Math.floor(height * 0.045)), COLORS.accent);
    fillRect(pixels, width, height, monogramX, ruleY + Math.floor(height * 0.10), Math.max(1, monogramWidth * 0.68), Math.max(1, Math.floor(height * 0.025)), COLORS.muted);
  } else {
    const margin = Math.max(3, Math.floor(Math.min(width, height) * 0.10));
    const markSize = Math.floor(Math.min(width, height) * 0.48);
    const markX = Math.floor((width - markSize) / 2);
    const markY = margin;
    drawLedgerMark(pixels, width, height, markX, markY, markSize);
    drawMonogram(pixels, width, height, margin, Math.floor(height * 0.60), width - margin * 2, height - Math.floor(height * 0.60) - margin);
  }

  return encodePng(width, height, pixels);
}

export function brandedAssetPalette() {
  return Object.values(COLORS).map(color => [...color]);
}

export const MSIX_BRAND_ASSET_VERSION = 'ptl-ledger-monogram-v1';
