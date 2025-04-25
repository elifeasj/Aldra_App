module.exports = ({ env }) => ({
    upload: {
      config: {
        provider: '@strapi/provider-upload-aws-s3',
        providerOptions: {
          s3Options: {
            accessKeyId: env('STRAPI_SUPABASE_S3_KEY'),
            secretAccessKey: env('STRAPI_SUPABASE_S3_SECRET'),
            region: env('STRAPI_SUPABASE_REGION'),
            endpoint: env('STRAPI_SUPABASE_S3_ENDPOINT'),
            s3ForcePathStyle: true,
            signatureVersion: 'v4',
          },
          params: {
            Bucket: env('STRAPI_SUPABASE_BUCKET'),
          },
        },
      },
    },
  });