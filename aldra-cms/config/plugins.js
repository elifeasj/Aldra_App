module.exports = ({ env }) => {
  throw new Error('⛔ plugins.js test error');
};
  const bucket = env('SUPABASE_BUCKET');
  const endpoint = env('SUPABASE_S3_ENDPOINT');

  console.log('🟢 plugins.js LOADED!');
  console.log('📍 Endpoint:', endpoint);
  console.log('🪣 Bucket:', bucket);

  return {
    upload: {
      config: {
        provider: '@strapi/provider-upload-aws-s3',
        providerOptions: {
          accessKeyId: env('SUPABASE_S3_KEY'),
          secretAccessKey: env('SUPABASE_S3_SECRET'),
          region: 'eu-central-1',
          params: {
            Bucket: bucket,
          },
          endpoint: endpoint,
          s3ForcePathStyle: true,
          signatureVersion: 'v4',
        },
      },
    },
  };
