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
      SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    },
    icon: "./assets/images/icon.png",
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
