'use strict';

module.exports = (plugin) => {
  const baseUrl = process.env.STRAPI_SUPABASE_BASE_URL;

  if (!baseUrl) {
    console.warn('STRAPI_SUPABASE_BASE_URL is not defined!');
    return plugin;
  }

  const originalGetUrl = plugin.services.upload.getUrl;

  plugin.services.upload.getUrl = (file) => {
    if (file.url.startsWith('http')) {
      return file.url;
    }

    return `${baseUrl}${file.url}`;
  };

  return plugin;
};
