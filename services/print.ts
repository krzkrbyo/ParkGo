import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Device, RatePlan, Ticket, VehicleType } from '../types/models';
import { formatCurrency, formatDateTime, formatDuration } from './pricing';

export const generateTicketHTML = (
  ticket: Ticket,
  vehicleType: VehicleType,
  ratePlan: RatePlan,
  device: Device,
  isExit: boolean = false
): string => {
  const ticketType = isExit ? 'SALIDA' : 'ENTRADA';
  const currentTime = isExit ? ticket.exit_time! : ticket.entry_time;
  
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
      
      ${ticket.barcode ? `
      <div class="barcode">
        <div>Barcode: ${ticket.barcode}</div>
        <div class="qr-placeholder">[QR Code]</div>
      </div>
      ` : ''}
      
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
