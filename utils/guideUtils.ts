import { Guide } from '../types/guides';

export const mapGuideData = (guide: any): Guide => {
  const parsedContent =
    Array.isArray(guide.content)
      ? guide.content
          .map((block: { children: { text: string }[] }) =>
            block.children?.map((c: { text: string }) => c.text).join(' ')
          )
          .join('\n\n')
      : '';

  return {
    id: guide.id,
    title: guide.title || 'Uden titel',
    category: guide.category || 'Ukategoriseret',
    image: guide.image?.url
      ? `https://aldra-cms.up.railway.app${guide.image.url}`
      : 'https://aldra-cms.up.railway.app/uploads/fallback_guide_image.jpg',
    tags: guide.tags || [],
    relation: guide.relation || '',
    help_tags: guide.help_tags || [],
    visible: guide.visible ?? true,
    content: parsedContent,
  };
};
