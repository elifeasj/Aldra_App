module.exports = ({ env }) => {
  console.log('AccessKey:', env('STRAPI_SUPABASE_S3_KEY'));
  console.log('SecretKey:', env('STRAPI_SUPABASE_S3_SECRET'));
  console.log('Bucket:', env('STRAPI_SUPABASE_BUCKET'));
  console.log('Endpoint:', env('STRAPI_SUPABASE_S3_ENDPOINT'));
  
  return {
    upload: {
      config: {
        provider: '@strapi/provider-upload-aws-s3',
        providerOptions: {
          s3Options: {
            credentials: {
              accessKeyId: env('STRAPI_SUPABASE_S3_KEY'),
              secretAccessKey: env('STRAPI_SUPABASE_S3_SECRET'),
            },
            region: env('STRAPI_SUPABASE_REGION'),
            endpoint: env('STRAPI_SUPABASE_S3_ENDPOINT'),
            forcePathStyle: true,
            signatureVersion: 'v4',
          },
          params: {
            Bucket: env('STRAPI_SUPABASE_BUCKET'),
            ACL: 'public-read',
          },
          baseUrl: env('STRAPI_SUPABASE_BASE_URL'),
        },
      },
    },
  };
};
