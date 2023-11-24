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
  // Routes for app data maintenance
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

  // Routes for end customers
  app.post(
    '/theaters/search',
    {
      schema: {
        querystring: titleQuerySchema,
        body: DateRangeSchema,
      },
      preHandler: [app.checkCache('theater_list_for_movie')],
    },
    getAllTheatersForMovie,
  );

  // fetch the movie information
  app.get(
    '/:movie_id/info',
    { schema: { params: movieParamSchema }, preHandler: [app.checkCache('movie_info')] },
    fetchMovieInfo,
  );
};

export default movieRoute;
