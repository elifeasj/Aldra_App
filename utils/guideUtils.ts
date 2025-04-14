import { Guide } from '../types/guides'; // juster hvis nødvendigt


export const mapGuideData = (rawGuide: any): Guide => {
  const attr = rawGuide.attributes || {};

  return {
    id: rawGuide.id,
    title: attr.title || 'Uden titel',
    category: attr.category || 'Ukategoriseret',
    image: attr.image?.data?.attributes?.url
      ? `https://aldra-cms.up.railway.app${attr.image.data.attributes.url}`
      : 'https://aldra-cms.up.railway.app/uploads/fallback_guide_image.jpg',
    tags: attr.tags || [],
    relation: attr.relation || '',
    help_tags: attr.help_tags || [],
    visible: attr.visible ?? true,
    content: attr.content || '',
  };
};
