import { Guide } from '../types/guides';

export const mapGuideData = (guide: any): Guide => {
  console.log('👀 mapping guide:', JSON.stringify(guide, null, 2));

  return {
    id: guide.id,
    title: guide.title,
    image: guide.image,
    category: guide.category,
    tags: Array.isArray(guide.tags) ? guide.tags : [],
    help_tags: Array.isArray(guide.help_tags) ? guide.help_tags : [],
    relation: guide.relation,
    visible: guide.visible,
    // content: parseContent(guide.content),
  };
};
