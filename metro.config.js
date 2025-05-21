const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  // Add your custom transformer configurations here
};

config.resolver = {
  ...config.resolver,
  // Add your custom resolver configurations here
};

module.exports = config;
