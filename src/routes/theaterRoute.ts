import { FastifyInstance } from 'fastify';
import {
  getAllTheaters,
  createTheaters,
  getAllMoviesInTheater,
  updateTheaters,
  deleteTheaters,
} from '@/controller/theaterController';
import { getTheatersSchema, theaterParamSchema, theaterBodySchema } from '@/schema/theaterSchema';
import { DateRangeSchema, titleQuerySchema } from '@/schema/commonSchema';

const theaterRoute = async (app: FastifyInstance) => {
  app
    .get(
      '/',
      {
        schema: { querystring: getTheatersSchema },
      },
      getAllTheaters,
    )
    .post(
      '/',
      {
        preHandler: [app.authenticate, app.restrictTo('admin')],
        schema: { body: theaterBodySchema },
      },
      createTheaters,
    );
  app
    .patch(
      '/:theater_id',
      {
        preHandler: [app.authenticate, app.restrictTo('admin')],
        schema: { body: theaterBodySchema, params: theaterParamSchema },
      },
      updateTheaters,
    )
    .delete(
      '/:theater_id',
      {
        preHandler: [app.authenticate, app.restrictTo('admin')],
        schema: { params: theaterParamSchema },
      },
      deleteTheaters,
    );
  app.post(
    '/movies/search',
    { schema: { querystring: titleQuerySchema, body: DateRangeSchema } },
    getAllMoviesInTheater,
  );
};

export default theaterRoute;
