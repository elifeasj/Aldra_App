const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (async () => {
  const config = getDefaultConfig(__dirname);
  // Custom configurations can be added here
  return config;
})();
