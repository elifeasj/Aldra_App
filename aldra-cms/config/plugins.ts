export default ({ env }) => ({
    upload: {
      config: {
        provider: '@strapi/provider-upload-aws-s3',
        providerOptions: {
          accessKeyId: env('AWS_ACCESS_KEY_ID'),
          secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
          region: env('AWS_REGION'),
          params: {
            Bucket: env('AWS_BUCKET'),
          },
          endpoint: env('AWS_ENDPOINT'),
          s3ForcePathStyle: env.bool('AWS_S3_FORCE_PATH_STYLE', true),
        },
      },
    },
  });
  