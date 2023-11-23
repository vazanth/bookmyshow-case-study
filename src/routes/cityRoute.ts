import { FastifyInstance } from 'fastify';
import { createCities, deleteCities, fetchCities, updateCities } from '@/controller/cityController';
import { cityBodySchema, cityParamSchema } from '@/schema/citySchema';
import { paginateSchema } from '@/schema/commonSchema';

const cityRoute = async (app: FastifyInstance) => {
  app
    .post(
      '/',
      { preHandler: [app.authenticate, app.restrictTo('admin')], schema: { body: cityBodySchema } },
      createCities,
    )
    .get(
      '/',
      {
        schema: { querystring: paginateSchema },
      },
      fetchCities,
    );

  app
    .patch(
      '/:city_id',
      {
        preHandler: [app.authenticate, app.restrictTo('admin')],
        schema: { body: cityBodySchema, params: cityParamSchema },
      },
      updateCities,
    )
    .delete(
      '/:city_id',
      {
        preHandler: [app.authenticate, app.restrictTo('admin')],
        schema: { params: cityParamSchema },
      },
      deleteCities,
    );
};

export default cityRoute;
