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
    title: guide.title,
    image: guide.image,
    category: guide.category,
    tags: Array.isArray(guide.tags) ? guide.tags : [],
    help_tags: Array.isArray(guide.help_tags) ? guide.help_tags : [],
    relation: guide.relation,
    visible: guide.visible,
    content: parseContent(guide.content),
  };
};
