import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chamapamoja.app',
  appName: 'Chama Pamoja App',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#7c3aed',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#ffffff'
    },
    StatusBar: {
      backgroundColor: '#7c3aed',
      style: 'LIGHT'
    }
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
