// @ts-ignore
import qrcode from './qrcode-generator.js';

export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export class QRCode {
  public readonly size: number;
  private qr: any;

  constructor(text: string, errorCorrection: QrErrorCorrectionLevel = 'M') {
    // 0 = auto typeNumber detection (chooses smallest valid version conforming to ISO/IEC 18004)
    this.qr = qrcode(0, errorCorrection);
    this.qr.addData(text);
    this.qr.make();
    this.size = this.qr.getModuleCount();
  }

  public isDark(row: number, col: number): boolean {
    return this.qr.isDark(row, col);
  }

  public toSvg(size = 210, margin = 4, fgColor = '#000000', bgColor = '#ffffff'): string {
    const totalCells = this.size + margin * 2;
    const cellSize = size / totalCells;

    let path = '';
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.isDark(r, c)) {
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
