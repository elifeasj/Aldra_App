/**
 * guide controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::guide.guide', ({ strapi }) => ({
  async matchGuides(ctx) {
    try {
        const guides = await strapi.entityService.findMany('api::guide.guide', {
          populate: ['image'],
          filters: {
            visible: true,
          },
          fields: ['title', 'relation', 'content'],
        });

      ctx.send({ guides });
    } catch (err) {
      ctx.throw(500, err);
    }
  }
}));
