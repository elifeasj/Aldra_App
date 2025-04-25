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

  console.log('🟢 plugins.js LOADED!');
  console.log('📦 Upload provider:', uploadConfig.provider);
  console.log('📍 S3 Endpoint:', uploadConfig.providerOptions.endpoint);
  console.log('🪣 Bucket:', uploadConfig.providerOptions.params.Bucket);

  return {
    upload: {
      config: uploadConfig,
    },
  };
};
