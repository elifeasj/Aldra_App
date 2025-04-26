import { STRAPI_URL } from '../config/api';
import { Guide } from '../types/guides';

export const mapGuideData = (data: any): Guide => ({
  id: data.id,
  title: data.title || '',
  slug: data.slug || '',
  content: data.content || '',
  image: data.image?.url || '',
  category: data.category || '',
  tags: data.tags?.map((tag: any) => tag.name) || [],
  help_tags: data.help_tags?.map((tag: any) => tag.name) || [],
});
