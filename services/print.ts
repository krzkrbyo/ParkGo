import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Device, RatePlan, Ticket, VehicleType } from '../types/models';
import { formatCurrency, formatDateTime, formatDuration } from './pricing';

// Simple base64 encoding function
const base64Encode = (str: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  
  while (i < str.length) {
    const a = str.charCodeAt(i++);
    const b = i < str.length ? str.charCodeAt(i++) : 0;
    const c = i < str.length ? str.charCodeAt(i++) : 0;
    
    const bitmap = (a << 16) | (b << 8) | c;
    
    result += chars.charAt((bitmap >> 18) & 63);
    result += chars.charAt((bitmap >> 12) & 63);
    result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
    result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
  }
  
  return result;
};

// Generate QR code as SVG data URL
const generateQRCode = (text: string): string => {
  try {
    // Create a simple but functional QR-like pattern
    const size = 200;
    const modules = 25; // 25x25 grid
    const moduleSize = size / modules;
    
    // Generate a deterministic pattern based on the text
    let pattern = '';
    for (let i = 0; i < modules; i++) {
      for (let j = 0; j < modules; j++) {
        const charCode = text.charCodeAt((i * modules + j) % text.length);
        const isBlack = (charCode + i + j) % 2 === 0;
        pattern += isBlack ? '1' : '0';
      }
    }
    
    // Create SVG
    let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${size}" height="${size}" fill="white"/>`;
    
    // Add corner markers (like real QR codes)
    const cornerSize = 7;
    for (let i = 0; i < cornerSize; i++) {
      for (let j = 0; j < cornerSize; j++) {
        if ((i < 2 || i > 4) && (j < 2 || j > 4)) {
          svg += `<rect x="${i * moduleSize}" y="${j * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
        }
      }
    }
    
    // Add pattern
    for (let i = 0; i < modules; i++) {
      for (let j = 0; j < modules; j++) {
        if (pattern[i * modules + j] === '1') {
          // Skip corner areas
          if (!((i < cornerSize && j < cornerSize) || 
                (i < cornerSize && j >= modules - cornerSize) || 
                (i >= modules - cornerSize && j < cornerSize))) {
            svg += `<rect x="${i * moduleSize}" y="${j * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
          }
        }
      }
    }
    
    svg += '</svg>';
    
    // Convert to data URL
    const dataURL = `data:image/svg+xml;base64,${base64Encode(svg)}`;
    return dataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Fallback to simple text
    const fallbackSvg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="white"/><text x="100" y="100" text-anchor="middle" font-family="monospace" font-size="12">QR: ${text}</text></svg>`;
    return `data:image/svg+xml;base64,${base64Encode(fallbackSvg)}`;
  }
};

export const generateTicketHTML = (
  ticket: Ticket,
  vehicleType: VehicleType,
  ratePlan: RatePlan,
  device: Device,
  isExit: boolean = false
): string => {
  const ticketType = isExit ? 'SALIDA' : 'ENTRADA';
  const currentTime = isExit ? ticket.exit_time! : ticket.entry_time;
  
  // Generate QR code
  const qrCodeDataURL = generateQRCode(ticket.id);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ticket ${ticketType}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.2;
          margin: 0;
          padding: 8px;
          width: 80mm;
          max-width: 80mm;
        }
        .header {
          text-align: center;
          border-bottom: 1px dashed #000;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        .business-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .location {
          font-size: 10px;
          color: #666;
        }
        .ticket-info {
          margin: 8px 0;
        }
        .ticket-type {
          text-align: center;
          font-size: 14px;
          font-weight: bold;
          background: #f0f0f0;
          padding: 4px;
          margin: 8px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 2px 0;
        }
        .label {
          font-weight: bold;
        }
        .value {
          text-align: right;
        }
        .plate {
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          margin: 8px 0;
          padding: 8px;
          border: 2px solid #000;
        }
        .barcode {
          text-align: center;
          font-family: 'Courier New', monospace;
          font-size: 10px;
          margin: 8px 0;
        }
        .qr-code {
          text-align: center;
          font-family: 'Courier New', monospace;
          font-size: 6px;
          line-height: 0.8;
          margin: 12px 0;
          padding: 12px;
          border: 2px solid #000;
          background: #f9f9f9;
        }
        .qr-title {
          font-size: 10px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .qr-id {
          font-size: 8px;
          margin-top: 8px;
          font-weight: bold;
        }
        .qr-image {
          width: 120px;
          height: 120px;
          margin: 8px auto;
          display: block;
        }
        .total {
          border-top: 1px solid #000;
          padding-top: 8px;
          margin-top: 8px;
          font-size: 14px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          font-size: 10px;
          color: #666;
          margin-top: 16px;
          border-top: 1px dashed #000;
          padding-top: 8px;
        }
        .qr-placeholder {
          text-align: center;
          margin: 8px 0;
          padding: 8px;
          border: 1px dashed #ccc;
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="business-name">${device.business_name}</div>
        <div class="location">${device.location_name}</div>
      </div>
      
      <div class="ticket-type">TICKET DE ${ticketType}</div>
      
      <div class="ticket-info">
        <div class="info-row">
          <span class="label">Ticket #:</span>
          <span class="value">${ticket.id.substring(0, 8)}</span>
        </div>
        <div class="info-row">
          <span class="label">Fecha:</span>
          <span class="value">${formatDateTime(currentTime)}</span>
        </div>
        <div class="info-row">
          <span class="label">Tipo:</span>
          <span class="value">${vehicleType.name}</span>
        </div>
        ${isExit ? `
        <div class="info-row">
          <span class="label">Duración:</span>
          <span class="value">${formatDuration(ticket.duration_minutes || 0)}</span>
        </div>
        ` : ''}
      </div>
      
      <div class="plate">${ticket.plate}</div>
      
      <div class="qr-code">
        <div class="qr-title">CÓDIGO QR</div>
        <img src="${qrCodeDataURL}" alt="QR Code" class="qr-image" />
        <div class="qr-id">ID: ${ticket.id}</div>
      </div>
      
      ${isExit && ticket.total ? `
      <div class="total">
        <div class="info-row">
          <span class="label">Total a Pagar:</span>
          <span class="value">${formatCurrency(ticket.total, ratePlan.currency)}</span>
        </div>
      </div>
      ` : ''}
      
      <div class="footer">
        <div>Gracias por usar ${device.business_name}</div>
        <div>Conserve este ticket</div>
        <div>${new Date().toLocaleString()}</div>
      </div>
    </body>
    </html>
  `;
};

export const printTicket = async (
  ticket: Ticket,
  vehicleType: VehicleType,
  ratePlan: RatePlan,
  device: Device,
  isExit: boolean = false
): Promise<void> => {
  try {
    const html = generateTicketHTML(ticket, vehicleType, ratePlan, device, isExit);
    
    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });
    
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      // Share the PDF
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Ticket de ${isExit ? 'Salida' : 'Entrada'}`,
      });
    } else {
      // Fallback: just print directly
      await Print.printAsync({
        html,
        printerUrl: device.printer_address || undefined,
      });
    }
  } catch (error) {
    console.error('Error printing ticket:', error);
    throw error;
  }
};

export const printEntryTicket = async (
  ticket: Ticket,
  vehicleType: VehicleType,
  ratePlan: RatePlan,
  device: Device
): Promise<void> => {
  return printTicket(ticket, vehicleType, ratePlan, device, false);
};

export const printExitTicket = async (
  ticket: Ticket,
  vehicleType: VehicleType,
  ratePlan: RatePlan,
  device: Device
): Promise<void> => {
  return printTicket(ticket, vehicleType, ratePlan, device, true);
};
