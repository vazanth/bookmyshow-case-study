import { FastifyReply, FastifyRequest } from 'fastify';
import DBRepository from '@/repository/DBRepository';
import AppResponse from '@/helpers/AppResponse';
import {
  DateRange,
  MovieQueryParam,
  MoviesReqBody,
  PaginationParam,
  TitleQueryParam,
} from '@/types';
import { TTL_EXPIRATION, commonResponseMessages } from '@/constants';

const dbRepo = new DBRepository();
/**
 * @description
 * Handles movies creation within our database, restricted for admin users.
 *
 * @sql
 * INSERT INTO movies (movie_name, language) VALUES (?, ?)
 */
export const createMovies = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { movie_name, language } = request.body as MoviesReqBody;

    await dbRepo.insertRows({
      tableName: 'movies',
      values: {
        movie_name,
        language,
      },
    });

    reply.send(new AppResponse(commonResponseMessages.CREATED_SUCCESSFULLY));
  } catch (error) {
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * @description
 * Fetchs the created movies within our database
 * limit and offset available for pagination and restricted for admin users.
 *
 * @sql
 * SELECT movie_id, movie_name, language FROM movies order by movie_id limit ${limit} offset ${offset}
 */
export const fetchMovies = async (request: FastifyRequest, reply: FastifyReply) => {
  const { limit, offset } = request.query as PaginationParam;

  try {
    const result = await dbRepo.fetchRows({
      tableName: 'movies',
      conditions: undefined,
      orderBy: 'movie_id',
      limit,
      offset,
      columns: ['movie_id', 'movie_name', 'language'],
    });

    reply.send(new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, result));
  } catch (error) {
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * @description
 * Updates the created movies within our database and restricted for admin users.
 *
 * @sql
 * UPDATE movies SET movie_name = ?, language = ? WHERE movie_id = ?;
 */
export const updateMovies = async (request: FastifyRequest, reply: FastifyReply) => {
  const { language, movie_name } = request.body as MoviesReqBody;

  const { movie_id } = request.params as MovieQueryParam;

  try {
    await dbRepo.updateRows({
      tableName: 'movies',
      values: {
        movie_name,
        language,
      },
      conditions: {
        movie_id,
      },
    });

    reply.send(new AppResponse(commonResponseMessages.UPDATED_SUCCESSFULLY));
  } catch (error) {
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * @description
 * deletes the created movies within our database and restricted for admin users.
 *
 * @sql
 * DELETE FROM movies WHERE movie_id = ?;
 */
export const deleteMovies = async (request: FastifyRequest, reply: FastifyReply) => {
  const { movie_id } = request.params as MovieQueryParam;

  try {
    await dbRepo.deleteRows({
      tableName: 'movies',
      conditions: {
        movie_id,
      },
    });
    reply.send(new AppResponse(commonResponseMessages.DELETED_SUCCESSFULLY));
  } catch (error) {
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * @description
 * Fetches all the theaters where a particular movie is running along with show time
 */
export const getAllTheatersForMovie = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { title } = request.query as TitleQueryParam;

    const { from_date, to_date } = request.body as DateRange;

    const query = `SELECT m.movie_name, t.theater_name, s.screen_name, st.date, st.start_time FROM movies m
    INNER JOIN show_time st
    ON st.movie_id = m.movie_id
    INNER JOIN theaters t
    ON t.theater_id = st.theater_id
    INNER JOIN screens s
    ON st.screen_id = s.screen_id 
    where m.movie_name like ? AND st.date BETWEEN ? AND ?;`;

    const movieList = await dbRepo.fetchComplexRows(query, [`%${title}%`, from_date, to_date]);

    const cache = request.app.cacheRepository;

    if (!movieList) {
      reply.send(new AppResponse(commonResponseMessages.NOT_FOUND));
      return;
    }

    await cache?.set(`theater_list_for_movie/${title}`, movieList, TTL_EXPIRATION.ONE_DAY);

    reply.send(new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, movieList));
  } catch (error) {
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * @description
 * Fetches the information of a movie
 */
export const fetchMovieInfo = async (request: FastifyRequest, reply: FastifyReply) => {
  const { movie_id } = request.params as MovieQueryParam;

  try {
    const query = `SELECT m.movie_name, m.language, mi.director, mi.certificate, mi.genere, mi.release_date, mi.format, mi.description FROM movie_info mi inner join movies m on m.movie_id = mi.movie_id where m.movie_id = ?;`;

    const movieInfo = await dbRepo.fetchComplexRows(query, [movie_id]);

    const cache = request.app.cacheRepository;

    if (!movieInfo) {
      reply.send(new AppResponse(commonResponseMessages.NOT_FOUND));
      return;
    }

    await cache?.set(`movie_info/${movie_id}`, movieInfo, TTL_EXPIRATION.SEVEN_DAYS);

    reply.send(new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, movieInfo));
  } catch (error) {
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};
