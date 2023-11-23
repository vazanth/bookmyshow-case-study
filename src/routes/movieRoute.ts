import { FastifyInstance } from 'fastify';
import {
  createMovies,
  deleteMovies,
  fetchMovies,
  updateMovies,
  getAllTheatersForMovie,
  fetchMovieInfo,
} from '@/controller/movieController';
import { movieBodySchema, movieParamSchema } from '@/schema/movieSchema';
import { DateRangeSchema, paginateSchema, titleQuerySchema } from '@/schema/commonSchema';

const movieRoute = async (app: FastifyInstance) => {
  app
    .post(
      '/',
      {
        preHandler: [app.authenticate, app.restrictTo('admin')],
        schema: { body: movieBodySchema },
      },
      createMovies,
    )
    .get(
      '/',
      {
        schema: { querystring: paginateSchema },
      },
      fetchMovies,
    );
  app.get('/:movie_id/info', { schema: { params: movieParamSchema } }, fetchMovieInfo);
  app
    .patch(
      '/:movie_id',
      {
        preHandler: [app.authenticate, app.restrictTo('admin')],
        schema: { body: movieBodySchema, params: movieParamSchema },
      },
      updateMovies,
    )
    .delete(
      '/:movie_id',
      {
        preHandler: [app.authenticate, app.restrictTo('admin')],
        schema: { params: movieParamSchema },
      },
      deleteMovies,
    );
  app.post(
    '/theaters/search',
    { schema: { querystring: titleQuerySchema, body: DateRangeSchema } },
    getAllTheatersForMovie,
  );
};

export default movieRoute;
