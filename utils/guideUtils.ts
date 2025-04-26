import { STRAPI_URL } from '../config/api';
import { Guide } from '../types/guides';

export const mapGuideData = (data: any): Guide => ({
  id: data.id,
  title: data.title || '',
  slug: data.slug || '',
  content: data.content || '',
  image: data.image?.url ? STRAPI_URL + data.image.url : '',
  category: data.category || '',
  tags: data.tags?.data?.map((tag: any) => tag.attributes.name) || [],
  help_tags: data.help_tags?.data?.map((tag: any) => tag.attributes.name) || [],
});

