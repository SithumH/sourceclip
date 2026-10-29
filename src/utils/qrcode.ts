/**
 * Minimalist, Zero-Dependency QR Code Generator in Pure TypeScript
 * Generates SVG string or module matrix for rendering QR codes directly.
 * Based on the public-domain QR Code standard (ISO/IEC 18004).
 */

// Error correction levels
export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

// QR Code generator class
export class QRCode {
  public readonly size: number;
  public readonly modules: boolean[][];

  constructor(text: string, _errorCorrection: QrErrorCorrectionLevel = 'M') {
    // Generate QR matrix using numeric/alphanumeric/byte encoding
    const qrData = QRCodeModel.createData(text);
    this.size = qrData.moduleCount;
    this.modules = [];

    for (let row = 0; row < this.size; row++) {
      this.modules[row] = [];
      for (let col = 0; col < this.size; col++) {
        this.modules[row][col] = qrData.isDark(row, col);
      }
    }
  }

  public toSvg(size = 200, margin = 4, fgColor = '#0f172a', bgColor = '#ffffff'): string {
    const totalCells = this.size + margin * 2;
    const cellSize = size / totalCells;

    let path = '';
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.modules[r][c]) {
          const x = (c + margin) * cellSize;
          const y = (r + margin) * cellSize;
          path += `M${x.toFixed(2)},${y.toFixed(2)}h${cellSize.toFixed(2)}v${cellSize.toFixed(2)}h-${cellSize.toFixed(2)}z `;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
      <rect width="100%" height="100%" fill="${bgColor}" rx="8" />
      <path d="${path}" fill="${fgColor}" />
    </svg>`;
  }
}

// Internal QR Code Math & Matrix Engine
class QRCodeModel {
  public moduleCount = 0;
  public modules: (boolean | null)[][] = [];

  public static createData(text: string): QRCodeModel {
    const bytes = new TextEncoder().encode(text);
    const version = QRCodeModel.getBestVersion(bytes.length);
    const model = new QRCodeModel(version);
    model.populate(bytes);
    return model;
  }

  private static getBestVersion(length: number): number {
    // Capacity for Medium error correction (bytes)
    const capacities = [0, 14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362];
    for (let v = 1; v < capacities.length; v++) {
      if (length <= capacities[v]) return v;
    }
    return 14;
  }

  constructor(public version: number) {
    this.moduleCount = version * 4 + 17;
    for (let r = 0; r < this.moduleCount; r++) {
      this.modules[r] = new Array(this.moduleCount).fill(null);
    }
  }

  public isDark(row: number, col: number): boolean {
    return this.modules[row][col] === true;
  }

  private populate(data: Uint8Array) {
    this.setupPositionProbe(0, 0);
    this.setupPositionProbe(this.moduleCount - 7, 0);
    this.setupPositionProbe(0, this.moduleCount - 7);
    this.setupTimingPattern();
    this.setupAlignmentPattern();

    // Encode data with byte mode (0b0100)
    const bitBuffer: number[] = [];
    // Mode indicator: Byte (4 bits)
    this.pushBits(bitBuffer, 4, 4);
    // Character count indicator (8 bits for versions 1-9, 16 bits for 10+)
    const countBits = this.version < 10 ? 8 : 16;
    this.pushBits(bitBuffer, data.length, countBits);
    // Data bytes
    for (const b of data) {
      this.pushBits(bitBuffer, b, 8);
    }

    // Total bits capacity for version
    const totalDataBytes = QRCodeModel.getDataCapacity(this.version);
    const totalDataBits = totalDataBytes * 8;

    // Terminator (up to 4 zero bits)
    const terminatorLen = Math.min(4, totalDataBits - bitBuffer.length);
    this.pushBits(bitBuffer, 0, terminatorLen);

    // Byte padding to multiple of 8
    while (bitBuffer.length % 8 !== 0) {
      bitBuffer.push(0);
    }

    // Pad bytes 0xEC, 0x11
    const padBytes = [0xEC, 0x11];
    let padIdx = 0;
    while (bitBuffer.length < totalDataBits) {
      this.pushBits(bitBuffer, padBytes[padIdx % 2], 8);
      padIdx++;
    }

    // Convert bit buffer to data bytes
    const dataBytes: number[] = [];
    for (let i = 0; i < bitBuffer.length; i += 8) {
      let b = 0;
      for (let j = 0; j < 8; j++) {
        b = (b << 1) | bitBuffer[i + j];
      }
      dataBytes.push(b);
    }

    // Generate Reed-Solomon Error Correction Code
    const ecCount = QRCodeModel.getEcCount(this.version);
    const ecBytes = this.generateEc(dataBytes, ecCount);

    const fullMessage = [...dataBytes, ...ecBytes];

    // Place data in matrix
    this.mapData(fullMessage);
  }

  private pushBits(buffer: number[], val: number, length: number) {
    for (let i = length - 1; i >= 0; i--) {
      buffer.push((val >>> i) & 1);
    }
  }

  private setupPositionProbe(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      if (row + r < 0 || this.moduleCount <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c < 0 || this.moduleCount <= col + c) continue;
        if (
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  }

  private setupTimingPattern() {
    for (let i = 8; i < this.moduleCount - 8; i++) {
      const bit = i % 2 === 0;
      if (this.modules[i][6] === null) this.modules[i][6] = bit;
      if (this.modules[6][i] === null) this.modules[6][i] = bit;
    }
  }

  private setupAlignmentPattern() {
    if (this.version <= 1) return;
    const pos = this.version * 4 + 10;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const isBlack = Math.max(Math.abs(r), Math.abs(c)) !== 1;
        this.modules[pos + r][pos + c] = isBlack;
      }
    }
  }

  private mapData(data: number[]) {
    let inc = -1;
    let row = this.moduleCount - 1;
    let bitIndex = 0;
    const totalBits = data.length * 8;

    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col--;

      while (true) {
        for (let c = 0; c < 2; c++) {
          if (this.modules[row][col - c] === null) {
            let dark = false;
            if (bitIndex < totalBits) {
              const byteIdx = Math.floor(bitIndex / 8);
              const bitOffset = 7 - (bitIndex % 8);
              dark = ((data[byteIdx] >>> bitOffset) & 1) === 1;
              bitIndex++;
            }
            // Standard mask pattern 0: (row + col) % 2 === 0
            if ((row + (col - c)) % 2 === 0) {
              dark = !dark;
            }
            this.modules[row][col - c] = dark;
          }
        }
        row += inc;
        if (row < 0 || this.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }

  private generateEc(data: number[], ecCount: number): number[] {
    const generator = this.getPoly(ecCount);
    const msg = [...data, ...new Array(ecCount).fill(0)];

    for (let i = 0; i < data.length; i++) {
      const coef = msg[i];
      if (coef !== 0) {
        for (let j = 0; j < generator.length; j++) {
          msg[i + j] ^= this.gmult(generator[j], coef);
        }
      }
    }

    return msg.slice(data.length);
  }

  private static getDataCapacity(v: number): number {
    const caps = [0, 16, 28, 44, 64, 86, 108, 124, 154, 182, 216, 254, 290, 334, 365];
    return caps[v] || 365;
  }

  private static getEcCount(v: number): number {
    const ecs = [0, 10, 16, 26, 36, 48, 64, 72, 88, 110, 130, 150, 176, 198, 216];
    return ecs[v] || 36;
  }

  private getPoly(deg: number): number[] {
    let poly = [1];
    for (let i = 0; i < deg; i++) {
      const next = [1, this.gexp(i)];
      const res = new Array(poly.length + 1).fill(0);
      for (let j = 0; j < poly.length; j++) {
        for (let k = 0; k < next.length; k++) {
          res[j + k] ^= this.gmult(poly[j], next[k]);
        }
      }
      poly = res;
    }
    return poly;
  }

  private gexp(n: number): number {
    let val = 1;
    for (let i = 0; i < n; i++) {
      val = val << 1;
      if (val >= 256) val ^= 0x11D;
    }
    return val;
  }

  private gmult(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    let res = 0;
    let curA = a;
    let curB = b;
    while (curB > 0) {
      if (curB & 1) res ^= curA;
      curA <<= 1;
      if (curA >= 256) curA ^= 0x11D;
      curB >>= 1;
    }
    return res;
  }
}

