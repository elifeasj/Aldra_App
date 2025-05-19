module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./'],
        alias: {
          '@': './',
          '@/app': './app',
          '@/components': './components',
          '@/config': './config',
          '@/firebase': './firebase',
        }        
      }],
      'react-native-reanimated/plugin',
    ]    
  };
};
