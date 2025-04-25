/**
 * guide controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::guide.guide', ({ strapi }) => ({
  async matchGuides(ctx) {
    try {
      const guides = await strapi.entityService.findMany('api::guide.guide', {
        populate: ['category', 'image', 'tags', 'help_tags', 'content'],
        filters: {
          visible: true,
        },
      });

      ctx.send({ guides });
    } catch (err) {
      ctx.throw(500, err);
    }
  }
}));
