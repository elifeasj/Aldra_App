module.exports = ({ env }) => {
  const uploadConfig = {
    provider: '@strapi/provider-upload-aws-s3',
    providerOptions: {
      accessKeyId: env('STRAPI_SUPABASE_S3_KEY'),
      secretAccessKey: env('STRAPI_SUPABASE_S3_SECRET'),
      region: 'eu-central-1',
      params: {
        Bucket: env('STRAPI_SUPABASE_BUCKET'),
      },
      endpoint: env('STRAPI_SUPABASE_S3_ENDPOINT'),
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    },
  };

  // Log efter config er defineret ✅
  console.log('🟢 plugins.js LOADED!');
  console.log('✅ Upload config:', JSON.stringify(uploadConfig, null, 2));

  return {
    upload: {
      config: uploadConfig,
    },
  };
};
