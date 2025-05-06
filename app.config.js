import 'dotenv/config';

export default {
  expo: {
    name: "aldraapp",
    slug: "aldraapp",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    plugins: ["expo-font", "expo-router", "expo-notifications"],
    experiments: {
      typedRoutes: true
    },
    extra: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      eas: {
        projectId: "353b4f0f-2aa3-4f8c-9ed4-e5c59de58a5e"
      }
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
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSPhotoLibraryUsageDescription:
          "Denne app har brug for adgang til dit fotobibliotek for at uploade et profilbillede."
      }
    },
    web: {
      bundler: "metro",
      favicon: "./assets/images/aldra_icon.png"
    }
  }
};
