/**
 * ESC/POS Commands for Thermal Printers
 * Compatible with SAT AF330 and similar thermal printers
 */

export const ESC = {
  // Initialize printer
  init: (): number[] => [0x1B, 0x40],
  
  // Text alignment
  alignLeft: (): number[] => [0x1B, 0x61, 0x00],
  alignCenter: (): number[] => [0x1B, 0x61, 0x01],
  alignRight: (): number[] => [0x1B, 0x61, 0x02],
  
  // QR Code commands
  qrModel: (model: number = 0x32): number[] => [
    0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, model, 0x00
  ],
  
  qrModuleSize: (size: number): number[] => {
    const moduleSize = Math.max(1, Math.min(16, size));
    return [0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, moduleSize];
  },
  
  qrECL: (level: 'L' | 'M' | 'Q' | 'H' = 'M'): number[] => {
    const eclMap = { L: 0x30, M: 0x31, Q: 0x32, H: 0x33 };
    return [0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, eclMap[level]];
  },
  
  qrStore: (data: string): number[] => {
    const encoder = new TextEncoder();
    const bytes = Array.from(encoder.encode(data));
    const length = bytes.length + 3;
    const pL = length & 0xFF;
    const pH = (length >> 8) & 0xFF;
    
    return [0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30, ...bytes];
  },
  
  qrPrint: (): number[] => [0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30],
  
  // Paper feed and cut
  feed: (lines: number = 3): number[] => {
    const feedLines = Math.max(0, Math.min(255, lines));
    return [0x1B, 0x64, feedLines];
  },
  
  cutPartial: (): number[] => [0x1D, 0x56, 0x42, 0x00],
  cutFull: (): number[] => [0x1D, 0x56, 0x00, 0x00],
  
  // Text formatting
  boldOn: (): number[] => [0x1B, 0x45, 0x01],
  boldOff: (): number[] => [0x1B, 0x45, 0x00],
  
  fontSize: (width: number = 1, height: number = 1): number[] => {
    const w = Math.max(0, Math.min(7, width - 1));
    const h = Math.max(0, Math.min(7, height - 1));
    return [0x1D, 0x21, (w << 4) | h];
  },
  
  // Build complete packet
  buildPacket: (...parts: number[][]): Uint8Array => {
    const flatArray = parts.flat();
    return new Uint8Array(flatArray);
  },
};

/**
 * QR Code printing configuration
 */
export interface QRConfig {
  value: string;
  moduleSize?: number;  // 1-16, default 6
  ecl?: 'L' | 'M' | 'Q' | 'H';  // Error correction level
  align?: 'left' | 'center' | 'right';
  feedAfter?: number;  // Lines to feed after printing
}

/**
 * Generate complete QR print command
 */
export function generateQRCommand(config: QRConfig): Uint8Array {
  const {
    value,
    moduleSize = 6,
    ecl = 'M',
    align = 'center',
    feedAfter = 4
  } = config;

  const commands = [
    ESC.init(),
    align === 'center' ? ESC.alignCenter() : 
    align === 'right' ? ESC.alignRight() : ESC.alignLeft(),
    ESC.qrModel(0x32),  // Model 2
    ESC.qrModuleSize(moduleSize),
    ESC.qrECL(ecl),
    ESC.qrStore(value),
    ESC.qrPrint(),
    ESC.feed(feedAfter),
  ];

  return ESC.buildPacket(...commands);
}

/**
 * Generate ticket print command with QR
 */
export function generateTicketCommand(
  ticketData: {
    id: string;
    plate: string;
    entryTime: string;
    businessName: string;
    location: string;
  },
  qrConfig?: Partial<QRConfig>
): Uint8Array {
  const {
    id,
    plate,
    entryTime,
    businessName,
    location
  } = ticketData;

  const qrValue = qrConfig?.value || id;
  const qrCommand = generateQRCommand({
    value: qrValue,
    moduleSize: qrConfig?.moduleSize || 6,
    ecl: qrConfig?.ecl || 'M',
    align: 'center',
    feedAfter: 2,
  });

  // Header text
  const headerCommands = [
    ESC.init(),
    ESC.alignCenter(),
    ESC.boldOn(),
    ESC.fontSize(2, 2),
    ...Array.from(new TextEncoder().encode(businessName)),
    0x0A, 0x0A,  // New lines
    ESC.fontSize(1, 1),
    ESC.boldOff(),
    ...Array.from(new TextEncoder().encode(location)),
    0x0A, 0x0A,
  ];

  // Ticket info
  const ticketInfoCommands = [
    ESC.alignLeft(),
    ESC.fontSize(1, 1),
    ...Array.from(new TextEncoder().encode(`Ticket: ${id}`)),
    0x0A,
    ...Array.from(new TextEncoder().encode(`Placa: ${plate}`)),
    0x0A,
    ...Array.from(new TextEncoder().encode(`Entrada: ${entryTime}`)),
    0x0A, 0x0A,
  ];

  // QR Code
  const qrCommands = Array.from(qrCommand);

  // Footer
  const footerCommands = [
    ESC.alignCenter(),
    ...Array.from(new TextEncoder().encode('Gracias por usar nuestro servicio')),
    0x0A, 0x0A,
    ESC.feed(3),
    ESC.cutPartial(),
  ];

  return ESC.buildPacket(
    headerCommands,
    ticketInfoCommands,
    qrCommands,
    footerCommands
  );
}
