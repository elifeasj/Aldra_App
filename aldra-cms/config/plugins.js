module.exports = ({ env }) => {
  const uploadConfig = {
    provider: '@strapi/provider-upload-aws-s3',
    providerOptions: {
      accessKeyId: env('SUPABASE_S3_KEY'),
      secretAccessKey: env('SUPABASE_S3_SECRET'),
      region: 'eu-central-1',
      params: {
        Bucket: env('SUPABASE_BUCKET'),
      },
      endpoint: env('SUPABASE_S3_ENDPOINT'),
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
