// Mock expo modules
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve({
    execSync: jest.fn(),
    runAsync: jest.fn(() => Promise.resolve({ lastInsertRowId: 1 })),
    getFirstAsync: jest.fn(() => Promise.resolve(null)),
    getAllAsync: jest.fn(() => Promise.resolve([])),
  })),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(() => Promise.resolve({ uri: 'mock-uri' })),
  printAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-barcode-scanner', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  hasTorchOn: true,
  Constants: {
    BarCodeType: ['qr', 'pdf417', 'aztec', 'codabar', 'code39', 'code93', 'code128', 'ean13', 'ean8', 'itf14', 'upc_e', 'upc_a'],
  },
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithOtp: jest.fn(() => Promise.resolve({ error: null })),
      verifyOtp: jest.fn(() => Promise.resolve({ 
        data: { 
          user: { id: '1', email: 'test@example.com' }, 
          session: { access_token: 'token', refresh_token: 'refresh' } 
        }, 
        error: null 
      })),
      refreshSession: jest.fn(() => Promise.resolve({ 
        data: { 
          user: { id: '1', email: 'test@example.com' }, 
          session: { access_token: 'token', refresh_token: 'refresh' } 
        }, 
        error: null 
      })),
      signOut: jest.fn(() => Promise.resolve()),
      setSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        gte: jest.fn(() => ({
          neq: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      upsert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
}));

// Mock React Native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
  };
});

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date) => date.toISOString()),
  differenceInMinutes: jest.fn((a, b) => Math.abs(a.getTime() - b.getTime()) / (1000 * 60)),
  parseISO: jest.fn((date) => new Date(date)),
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
