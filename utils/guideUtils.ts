import { Guide } from '../types/guides';

export const mapGuideData = (guide: any): Guide => {
  console.log('🧪 Hele guide:', JSON.stringify(guide, null, 2)); // <- HER!
  const attributes = guide.attributes || {};
  const imageUrl = attributes.image?.data?.attributes?.url;

  return {
    id: guide.id,
    title: guide.title || 'Uden titel',
    category: guide.category || 'Ukategoriseret',
    image: guide.image || 'https://aldra-cms.up.railway.app/uploads/image2.png',
    tags: guide.tags || [],
    relation: guide.relation || '',
    help_tags: guide.help_tags || [],
    visible: guide.visible ?? true,
    content: guide.content || '',
  };
};
