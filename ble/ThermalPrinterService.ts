import { BleManager, Characteristic, Device } from 'react-native-ble-plx';
import { generateQRCommand, generateTicketCommand, QRConfig } from './ESCPos';

export interface PrinterDevice {
  id: string;
  name: string;
  rssi: number;
  device: Device;
}

export interface PrintResult {
  success: boolean;
  error?: string;
}

class ThermalPrinterService {
  private bleManager: BleManager;
  private connectedDevice: Device | null = null;
  private writeCharacteristic: Characteristic | null = null;
  private isConnected = false;

  constructor() {
    this.bleManager = new BleManager();
  }

  /**
   * Scan for available Bluetooth devices
   */
  async scanForDevices(timeoutMs: number = 10000): Promise<PrinterDevice[]> {
    try {
      const devices: PrinterDevice[] = [];
      
      const subscription = this.bleManager.startDeviceScan(
        null, // Scan for all devices
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            console.error('BLE Scan error:', error);
            return;
          }

          if (device && device.name) {
            // Filter for thermal printers (common names)
            const printerNames = [
              'SAT', 'AF330', 'POS', 'Printer', 'Thermal',
              'ESC/POS', 'Receipt', 'Ticket'
            ];
            
            const isPrinter = printerNames.some(name => 
              device.name?.toLowerCase().includes(name.toLowerCase())
            );

            if (isPrinter) {
              devices.push({
                id: device.id,
                name: device.name,
                rssi: device.rssi || 0,
                device: device,
              });
            }
          }
        }
      );

      // Stop scanning after timeout
      setTimeout(() => {
        this.bleManager.stopDeviceScan();
      }, timeoutMs);

      // Wait for scan to complete
      await new Promise(resolve => setTimeout(resolve, timeoutMs + 1000));

      return devices.sort((a, b) => b.rssi - a.rssi); // Sort by signal strength
    } catch (error) {
      console.error('Error scanning for devices:', error);
      throw error;
    }
  }

  /**
   * Connect to a specific device
   */
  async connectToDevice(deviceId: string): Promise<boolean> {
    try {
      const device = await this.bleManager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      
      this.connectedDevice = device;
      
      // Find the write characteristic (common UUIDs for thermal printers)
      const services = await device.services();
      for (const service of services) {
        const characteristics = await service.characteristics();
        for (const characteristic of characteristics) {
          if (characteristic.isWritableWithResponse || characteristic.isWritableWithoutResponse) {
            this.writeCharacteristic = characteristic;
            break;
          }
        }
        if (this.writeCharacteristic) break;
      }

      if (!this.writeCharacteristic) {
        throw new Error('No writable characteristic found');
      }

      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Error connecting to device:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Disconnect from current device
   */
  async disconnect(): Promise<void> {
    try {
      if (this.connectedDevice) {
        await this.connectedDevice.cancelConnection();
      }
      this.connectedDevice = null;
      this.writeCharacteristic = null;
      this.isConnected = false;
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }

  /**
   * Check if currently connected
   */
  isDeviceConnected(): boolean {
    return this.isConnected && this.connectedDevice !== null;
  }

  /**
   * Send raw bytes to printer
   */
  async sendBytes(bytes: Uint8Array): Promise<PrintResult> {
    try {
      if (!this.isConnected || !this.writeCharacteristic) {
        throw new Error('Not connected to printer');
      }

      // Split large data into chunks (BLE has MTU limits)
      const chunkSize = 20; // Conservative chunk size
      const chunks = [];
      
      for (let i = 0; i < bytes.length; i += chunkSize) {
        chunks.push(bytes.slice(i, i + chunkSize));
      }

      // Send each chunk
      for (const chunk of chunks) {
        await this.writeCharacteristic.writeWithoutResponse(
          Buffer.from(chunk).toString('base64')
        );
        
        // Small delay between chunks
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending bytes:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Print QR Code
   */
  async printQR(config: QRConfig): Promise<PrintResult> {
    try {
      const qrCommand = generateQRCommand(config);
      return await this.sendBytes(qrCommand);
    } catch (error) {
      console.error('Error printing QR:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Print ticket with QR
   */
  async printTicket(
    ticketData: {
      id: string;
      plate: string;
      entryTime: string;
      businessName: string;
      location: string;
    },
    qrConfig?: Partial<QRConfig>
  ): Promise<PrintResult> {
    try {
      const ticketCommand = generateTicketCommand(ticketData, qrConfig);
      return await this.sendBytes(ticketCommand);
    } catch (error) {
      console.error('Error printing ticket:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Test print (simple text)
   */
  async testPrint(): Promise<PrintResult> {
    try {
      const testCommand = new Uint8Array([
        0x1B, 0x40, // Initialize
        0x1B, 0x61, 0x01, // Center align
        0x1B, 0x45, 0x01, // Bold on
        ...Array.from(new TextEncoder().encode('TEST PRINT')),
        0x0A, 0x0A, // New lines
        0x1B, 0x45, 0x00, // Bold off
        ...Array.from(new TextEncoder().encode('Printer is working!')),
        0x0A, 0x0A, 0x0A,
        0x1D, 0x56, 0x42, 0x00, // Cut
      ]);

      return await this.sendBytes(testCommand);
    } catch (error) {
      console.error('Error in test print:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Export singleton instance
export const thermalPrinterService = new ThermalPrinterService();
