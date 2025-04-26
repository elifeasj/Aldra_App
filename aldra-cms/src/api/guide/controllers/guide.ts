import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::guide.guide', ({ strapi }) => ({
  async matchGuides(ctx) {
    try {
      const { user_id } = ctx.request.body;

      if (!user_id) {
        return ctx.badRequest('Missing user_id');
      }

      // Find brugerens profil-svar
      const userAnswer = await strapi.db.query('user_profile_answers').findOne({
        where: { user_id },
      });

      if (!userAnswer) {
        return ctx.badRequest('User profile answers not found');
      }

      const { relation_to_person, main_challenges } = userAnswer;

      // Find guides baseret på relation og main challenges
      const guides = await strapi.entityService.findMany('api::guide.guide', {
        populate: ['image'],
        filters: {
          relation: relation_to_person,
          visible: true,
          $or: main_challenges?.map((tag: string) => ({
            tags: { $contains: tag }
          })) || [],
        },
      });

      ctx.send({ guides });
    } catch (err) {
      ctx.throw(500, err);
    }
  }
}));
