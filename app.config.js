import 'dotenv/config';

export default {
  name: "aldraapp",
  slug: "aldraapp",
  version: "1.0.0",
  runtimeVersion: "1.0.0",
  orientation: "portrait",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: false,
  jsEngine: "jsc",
  plugins: ["expo-font", "expo-router", "expo-notifications"],
  experiments: {
    typedRoutes: true
  },
  extra: {
    SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  },
  eas: {
    projectId: "353b4f0f-2aa3-4f8c-9ed4-e5c59de58a5e"
  },
  install: {
    exclude: ["ws"]
  },
  icon: "./assets/images/aldra_icon.png",
  android: {
    package: "com.effyo.aldraapp",
    adaptiveIcon: {
      backgroundColor: "#ffffff"
    }
  },
  ios: {
    bundleIdentifier: "com.effyo.aldraapp",
    supportsTablet: true,
    deploymentTarget: "15.1",
    jsEngine: "jsc",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSCameraUsageDescription: "Denne app har brug for adgang til dit kamera for at tage billeder og optage videoer.",
      NSMicrophoneUsageDescription: "Denne app har brug for adgang til din mikrofon til at optage lyd i videoer.",
      NSPhotoLibraryUsageDescription: "Denne app har brug for adgang til dit fotobibliotek for at vælge billeder og videoer."
    }
  },
  web: {
    bundler: "metro",
    favicon: "./assets/images/aldra_icon.png"
  },
  plugins: [
    "expo-font",
    "expo-router",
    "expo-web-browser"
  ]
};