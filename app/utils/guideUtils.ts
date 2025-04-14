import { Guide } from '../../types/guides'; // juster hvis nødvendigt

export const mapGuideData = (raw: any): Guide => ({
  id: raw.id,
  title: raw.attributes.title,
  image: raw.attributes.image?.data?.attributes?.url
    ? `https://aldra-cms.up.railway.app${raw.attributes.image.data.attributes.url}`
    : 'https://aldra-cms.up.railway.app/uploads/default_guide_image.png',
  category: raw.attributes.category || 'Ukendt kategori',
  relation: raw.attributes.relation || '',
  tags: raw.attributes.tags || [],
  help_tags: raw.attributes.help_tags || [],
  visible: raw.attributes.visible ?? true,
  content: raw.attributes.content || '',
});