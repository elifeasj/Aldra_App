import { Guide } from '../types/guides';

export const mapGuideData = (guide: any): Guide => {
  console.log('➡️ mapGuideData input:', guide);
  const attributes = guide.attributes || {};
  const imageUrl = attributes.image?.data?.attributes?.url;

  const parsedContent =
    Array.isArray(attributes.content)
      ? attributes.content
          .map((block: { children: { text: string }[] }) =>
            block.children?.map((c: { text: string }) => c.text).join(' ')
          )
          .join('\n\n')
      : '';

  return {
    id: guide.id,
    title: attributes.title || 'Uden titel',
    category: attributes.category || 'Ukategoriseret',
    image: imageUrl
      ? `https://aldra-cms.up.railway.app${imageUrl}`
      : 'https://aldra-cms.up.railway.app/uploads/image2.png',
    tags: attributes.tags || [],
    relation: attributes.relation || '',
    help_tags: attributes.help_tags || [],
    visible: attributes.visible ?? true,
    content: parsedContent,
  };
};
