import { Guide } from '../types/guides'; // juster hvis nødvendigt

export const mapGuideData = (rawGuide: any): Guide => ({
  id: rawGuide.id,
  title: rawGuide.title || 'Uden titel',
  category: rawGuide.category || 'Ukategoriseret', // 👈 dette sikrer fallback
  image: rawGuide.image?.url 
    ? `https://aldra-cms.up.railway.app${rawGuide.image.url}` 
    : 'https://aldra-cms.up.railway.app/uploads/fallback_guide_image.jpg',
  tags: rawGuide.tags || [],
  relation: rawGuide.relation || '',
  help_tags: rawGuide.help_tags || [],
  visible: rawGuide.visible,
  content: rawGuide.content || '',
});
