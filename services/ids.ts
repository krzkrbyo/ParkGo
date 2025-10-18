import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'parkgo_device_id';

export const generateULID = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}${random}`.toUpperCase();
};

export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    
    if (!deviceId) {
      deviceId = generateULID();
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    // Fallback to a generated ID if SecureStore fails
    return generateULID();
  }
};

export const generateTicketId = (): string => {
  return generateULID();
};

export const generatePaymentId = (): string => {
  return generateULID();
};
