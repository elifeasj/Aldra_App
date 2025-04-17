export interface Guide {
  id: number;
  title: string;
  image: string;
  category: string;
  tags: string[];
  relation: string;
  help_tags: string[];
  visible: boolean;
  content?: string;
}

export interface UserProfileAnswers {
  id: string;
  user_id: number;
  relation_to_person: string;
  diagnosed_dementia_type: string;
  experience_level: string;
  main_challenges: string[];
  help_needs: string[];
  completed_at: string;
}

export default {
  async matchGuides(ctx: any) {
    try {
      const guides = await strapi.entityService.findMany('api::guide.guide', {
        populate: ['category', 'image', 'tags', 'help_tags'] as any,
        filters: {
          visible: true,
        },
      });

      ctx.send({ guides });
    } catch (err) {
      ctx.throw(500, err);
    }
  },
};
