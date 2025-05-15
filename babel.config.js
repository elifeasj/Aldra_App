module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./'],
        alias: {
          '@': './app',
          '@/components': './components',
          '@/hooks': './hooks',
          '@/constants': './constants',
        }
      }],
      'react-native-reanimated/plugin',
    ]    
  };
};
