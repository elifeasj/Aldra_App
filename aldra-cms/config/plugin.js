module.exports = ({ env }) => ({
    upload: {
      config: {
        provider: '@strapi/provider-upload-aws-s3',
        providerOptions: {
          s3Options: {
            accessKeyId: env('AWS_ACCESS_KEY_ID'),
            secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
            region: env('AWS_REGION'),
            endpoint: env('AWS_ENDPOINT'),
            s3ForcePathStyle: env.bool('AWS_S3_FORCE_PATH_STYLE', true),
          },
          params: {
            Bucket: env('AWS_BUCKET'),
          },
        },
      },
    },
  }); 
  