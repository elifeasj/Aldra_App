import { Guide } from '../types/guides';

function parseContent(content: any[]): string {
  if (!Array.isArray(content)) return '';
  return content
    .map((block) => block?.children?.map((c: any) => c.text).join(' '))
    .join('\n\n');
}

export const mapGuideData = (guide: any): Guide => {
  return {
    id: guide.id,
    title: guide.title || 'Uden titel',
    image: guide.image?.url
    ? `https://qqmhshgabgopbnauuhhk.supabase.co/storage/v1/object/public/strapi-media/${guide.image.url}`
    : 'https://aldra-cms.up.railway.app/uploads/aldralogo_24c7c4af6a.png',
  
    category: typeof guide.category === 'string'
      ? guide.category
      : guide.category?.title || 'Ukategoriseret',
    tags: Array.isArray(guide.tags) ? guide.tags : [],
    help_tags: Array.isArray(guide.help_tags) ? guide.help_tags : [],
    relation: guide.relation || 'Ukendt',
    visible: guide.visible ?? true,
    content: parseContent(guide.content),
  };
};
