import { Guide } from '../types/guides';

export const mapGuideData = (guide: any): Guide => {
  const attributes = guide.attributes || {};
  const imageUrl = attributes.image?.data?.attributes?.url;

  return {
    id: guide.id,
    title: attributes.title || 'Uden titel',
    category: attributes.category?.data?.attributes?.title || 'Ukategoriseret',
    image: imageUrl
      ? `https://aldra-cms.up.railway.app${imageUrl}`
      : 'https://aldra-cms.up.railway.app/uploads/image2.png',
    tags: attributes.tags || [],
    relation: attributes.relation || '',
    help_tags: attributes.help_tags || [],
    visible: attributes.visible ?? true,
    content: attributes.content || '',
  };
};

