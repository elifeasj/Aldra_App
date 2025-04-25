// plugins.ts
export default ({ env }) => {
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
  
    console.log('🟢 plugins.ts LOADED!');
    console.log('✅ Upload config (TS):', JSON.stringify(uploadConfig, null, 2));
  
    return {
      upload: {
        config: uploadConfig,
      },
    };
  };
  