export default {
  register() {
    console.log('✨ Strapi is registering plugins...');
  },

  bootstrap({ strapi }) {
    console.log('🚀 Strapi is bootstrapping...');

    const uploadConfig = strapi.config.get('plugin.upload.config');

    console.log('✅ Upload config loaded at runtime:', JSON.stringify(uploadConfig, null, 2));
  },
};
