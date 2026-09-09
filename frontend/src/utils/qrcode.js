/**
 * Pure JavaScript QR Code Generator (Zero external dependencies)
 * Generates standard 2D QR matrix for URLs and text strings.
 */

// Galois Field GF(256) tables for Reed-Solomon polynomial arithmetic
const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);

(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_EXP[i + 255] = x;
    GF256_LOG[x] = i;
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
  }
})();

function gfMul(x, y) {
  if (x === 0 || y === 0) return 0;
  return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
}

function rsGenPoly(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], GF256_EXP[i]);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data, eccCount) {
  const genPoly = rsGenPoly(eccCount);
  const res = new Uint8Array(data.length + eccCount);
  res.set(data);

  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < genPoly.length; j++) {
        res[i + j] ^= gfMul(genPoly[j], coef);
      }
    }
  }
  return res.slice(data.length);
}

// QR Table: [version, dataCapacityBytes, totalCodewords, eccCodewords] (ECC Level M)
const QR_SPECS = [
  { version: 1, size: 21, dataCap: 16, totalBytes: 26, eccBytes: 10, align: [] },
  { version: 2, size: 25, dataCap: 28, totalBytes: 44, eccBytes: 16, align: [6, 18] },
  { version: 3, size: 29, dataCap: 44, totalBytes: 70, eccBytes: 26, align: [6, 22] },
  { version: 4, size: 33, dataCap: 64, totalBytes: 100, eccBytes: 36, align: [6, 26] },
  { version: 5, size: 37, dataCap: 86, totalBytes: 134, eccBytes: 48, align: [6, 30] },
  { version: 6, size: 41, dataCap: 108, totalBytes: 172, eccBytes: 64, align: [6, 34] },
  { version: 7, size: 45, dataCap: 124, totalBytes: 196, eccBytes: 72, align: [6, 22, 38] },
  { version: 8, size: 49, dataCap: 154, totalBytes: 242, eccBytes: 88, align: [6, 24, 42] }
];

export function generateQRCodeMatrix(text) {
  const utf8 = new TextEncoder().encode(text);
  const dataLen = utf8.length;

  let spec = QR_SPECS.find(s => s.dataCap >= dataLen + 3);
  if (!spec) {
    spec = QR_SPECS[QR_SPECS.length - 1];
  }

  const { version, size, dataCap, totalBytes, eccBytes, align } = spec;

  // Build data bits: Mode (0100 = 8-bit byte), Count, Data
  const bits = [];
  function pushBits(val, len) {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }

  pushBits(0b0100, 4); // Byte mode
  pushBits(dataLen, version <= 9 ? 8 : 16);
  for (let b of utf8) {
    pushBits(b, 8);
  }

  // Terminator & padding to byte boundary
  const padBits = Math.min(4, dataCap * 8 - bits.length);
  for (let i = 0; i < padBits; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const dataBytes = new Uint8Array(dataCap);
  for (let i = 0; i < bits.length; i += 8) {
    let byteVal = 0;
    for (let j = 0; j < 8; j++) byteVal = (byteVal << 1) | bits[i + j];
    dataBytes[i / 8] = byteVal;
  }

  // Pad bytes 0xEC, 0x11
  let padIdx = bits.length / 8;
  const padWords = [0xec, 0x11];
  while (padIdx < dataCap) {
    dataBytes[padIdx] = padWords[(padIdx - (bits.length / 8)) % 2];
    padIdx++;
  }

  // Generate ECC bytes
  const ecc = rsEncode(dataBytes, eccBytes);
  const finalCodewords = new Uint8Array(totalBytes);
  finalCodewords.set(dataBytes, 0);
  finalCodewords.set(ecc, dataBytes.length);

  // Initialize size x size matrix (-1 = unassigned)
  const matrix = Array.from({ length: size }, () => new Int8Array(size).fill(-1));
  const reserved = Array.from({ length: size }, () => new Uint8Array(size));

  function setFinder(r, c) {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const row = r + dr;
        const col = c + dc;
        if (row >= 0 && row < size && col >= 0 && col < size) {
          reserved[row][col] = 1;
          const isOuter = (dr === -1 || dr === 7 || dc === -1 || dc === 7);
          if (isOuter) {
            matrix[row][col] = 0;
          } else {
            const isBorder = (dr === 0 || dr === 6 || dc === 0 || dc === 6);
            const isInner = (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
            matrix[row][col] = (isBorder || isInner) ? 1 : 0;
          }
        }
      }
    }
  }

  // 1. Finder patterns (Top-Left, Top-Right, Bottom-Left)
  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  // 2. Alignment patterns
  for (let r of align) {
    for (let c of align) {
      if (reserved[r][c]) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const row = r + dr;
          const col = c + dc;
          reserved[row][col] = 1;
          const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
          const isCenter = dr === 0 && dc === 0;
          matrix[row][col] = (isBorder || isCenter) ? 1 : 0;
        }
      }
    }
  }

  // 3. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!reserved[6][i]) {
      reserved[6][i] = 1;
      matrix[6][i] = (i % 2 === 0) ? 1 : 0;
    }
    if (!reserved[i][6]) {
      reserved[i][6] = 1;
      matrix[i][6] = (i % 2 === 0) ? 1 : 0;
    }
  }

  // Dark module
  matrix[4 * version + 9][8] = 1;
  reserved[4 * version + 9][8] = 1;

  // Format info reserve
  for (let i = 0; i <= 8; i++) {
    reserved[8][i] = 1;
    reserved[i][8] = 1;
    reserved[8][size - 1 - i] = 1;
    reserved[size - 1 - i][8] = 1;
  }

  // 4. Place Data Codewords (zigzag bottom-right to top-left)
  const allBits = [];
  for (let byte of finalCodewords) {
    for (let b = 7; b >= 0; b--) allBits.push((byte >> b) & 1);
  }

  let bitIdx = 0;
  let up = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // Skip vertical timing column
    const rows = up
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (let row of rows) {
      for (let c of [col, col - 1]) {
        if (!reserved[row][c]) {
          const bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
          // Apply Standard Mask Pattern 0: (row + col) % 2 === 0
          const mask = (row + c) % 2 === 0 ? 1 : 0;
          matrix[row][c] = bit ^ mask;
        }
      }
    }
    up = !up;
  }

  // 5. Format info for Mask 0 and ECC Level M (BCH format bits: 0x5412)
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  for (let i = 0; i < 6; i++) matrix[8][i] = formatBits[i];
  matrix[8][7] = formatBits[6];
  matrix[8][8] = formatBits[7];
  matrix[7][8] = formatBits[8];
  for (let i = 9; i < 15; i++) matrix[14 - i][8] = formatBits[i];

  for (let i = 0; i < 8; i++) matrix[size - 1 - i][8] = formatBits[i];
  for (let i = 8; i < 15; i++) matrix[8][size - 15 + i] = formatBits[i];

  return matrix;
}
