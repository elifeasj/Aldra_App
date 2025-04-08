import 'dotenv/config';

export default {
  expo: {
    name: "aldraapp",
    slug: "aldraapp",
    version: "1.0.0",
    runtimeVersion: "1.0.0",
    orientation: "portrait",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    updates: {
      url: "http://192.168.0.215:5001"
    },
    plugins: ["expo-font", "expo-router", "expo-notifications"],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {
        origin: false
      },
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
    },
    eas: {
      projectId: "353b4f0f-2aa3-4f8c-9ed4-e5c59de58a5e"
    },
    owner: "effyo",
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
        NSPhotoLibraryUsageDescription:
          "Denne app har brug for adgang til dit fotobibliotek for at uploade et profilbillede."
      }
    },
    web: {
      bundler: "metro",
      favicon: "./assets/images/favicon.png"
    }
  }
};
