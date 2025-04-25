module.exports = ({ env }) => {
  console.log('🟢 Strapi loading plugins.js!');

  return {
    upload: {
      config: {
        provider: 'strapi-provider-upload-supabase',
        providerOptions: {
          apiUrl: env('SUPABASE_URL'),
          apiKey: env('SUPABASE_SERVICE_ROLE'),
          bucket: env('SUPABASE_BUCKET'),
        },
      },
    },
  };
};
