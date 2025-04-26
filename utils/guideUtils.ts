import { STRAPI_URL } from '../config/api';
import { Guide } from '../types/guides';

export const mapGuideData = (data: any): Guide => ({
  id: data.id,
  title: data.attributes?.title || data.title || '',
  slug: data.attributes?.slug || data.slug || '',
  content: data.attributes?.content || data.content || '',
  image: data.attributes?.image?.url 
    ? `${STRAPI_URL}${data.attributes.image.url}` 
    : (data.image?.url ? `${STRAPI_URL}${data.image.url}` : ''),
  category: data.attributes?.category || data.category || '',
  tags: (data.attributes?.tags?.data || data.tags?.data || []).map((tag: any) => tag.attributes.name),
  help_tags: (data.attributes?.help_tags?.data || data.help_tags?.data || []).map((tag: any) => tag.attributes.name),
});
