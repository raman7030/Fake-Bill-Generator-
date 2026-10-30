import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.raman.billgenerator',
  appName: 'Fake Bill Generator',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    backgroundColor: '#ffffff',
  },
};

export default config;
