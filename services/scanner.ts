import { Platform } from 'react-native';

// Conditional import for barcode scanner
let BarCodeScanner: any = null;
try {
  BarCodeScanner = require('expo-barcode-scanner').BarCodeScanner;
} catch (error) {
  console.warn('Barcode scanner not available:', error);
}

export type ScannerMode = 'HID' | 'CAMERA';

export interface ScanResult {
  data: string;
  type: string;
}

export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    if (!BarCodeScanner) {
      console.warn('Barcode scanner not available');
      return false;
    }
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

export const hasCameraPermission = async (): Promise<boolean> => {
  try {
    if (!BarCodeScanner) {
      return false;
    }
    const { status } = await BarCodeScanner.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking camera permission:', error);
    return false;
  }
};

export const isCameraAvailable = (): boolean => {
  return BarCodeScanner ? BarCodeScanner.hasTorchOn : false;
};

export const getSupportedBarCodeTypes = (): string[] => {
  return BarCodeScanner ? BarCodeScanner.Constants.BarCodeType : [];
};

export const validateBarcode = (data: string, type: string): boolean => {
  // Basic validation - can be extended based on requirements
  if (!data || data.trim().length === 0) {
    return false;
  }
  
  // Check if it's a valid barcode type
  const supportedTypes = getSupportedBarCodeTypes();
  if (!supportedTypes.includes(type)) {
    return false;
  }
  
  return true;
};

export const formatBarcodeData = (data: string): string => {
  // Remove any whitespace and convert to uppercase
  return data.trim().toUpperCase();
};

export const isHIDMode = (mode: ScannerMode): boolean => {
  return mode === 'HID';
};

export const isCameraMode = (mode: ScannerMode): boolean => {
  return mode === 'CAMERA';
};

export const getScannerCapabilities = () => {
  return {
    hasCamera: isCameraAvailable(),
    supportedTypes: getSupportedBarCodeTypes(),
    platform: Platform.OS,
  };
};
