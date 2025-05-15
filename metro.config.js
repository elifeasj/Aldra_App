const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@': './app',
  '@/components': './components',
  '@/hooks': './hooks',
  '@/constants': './constants',
};

module.exports = config;
