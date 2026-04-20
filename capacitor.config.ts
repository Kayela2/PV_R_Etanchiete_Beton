import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smac.pv',
  appName: 'PV-DE-RECEPTION-SUPPORT-BETON-ETANCHEITE ',
  webDir: 'dist',
  plugins: {
    Camera: {
      permissions: ["camera", "photos"],
    },
  },

};

export default config;
