import { FastifyReply, FastifyRequest } from 'fastify';
import DBRepository from '@/repository/DBRepository';
import AppResponse from '@/helpers/AppResponse';
import {
  CityQueryParam,
  DateRange,
  TheaterIdParam,
  TheaterReqBody,
  TitleQueryParam,
} from '@/types';
import { TTL_EXPIRATION, commonResponseMessages } from '@/constants';

const dbRepo = new DBRepository();

/**
 * @description
 * Handles theater creation within our database, restricted for admin users.
 *
 * @sql
 * INSERT INTO theaters (theater_name, city_id, no_of_screens) VALUES (?, ?, ?)
 */
export const createTheaters = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { theater_name, city_id, no_of_screens } = request.body as TheaterReqBody;

    await dbRepo.insertRows({
      tableName: 'theaters',
      values: {
        theater_name,
        city_id,
        no_of_screens,
      },
    });

    reply.send(new AppResponse(commonResponseMessages.CREATED_SUCCESSFULLY));
  } catch (error) {
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * @description
 * Fetchs the created theaters within our database
 * limit and offset available for pagination and restricted for admin users.
 *
 * @sql
 * SELECT theater_id, theater_name, no_of_screens FROM theaters WHERE city_id=? order by theater_id limit ${limit} offset ${offset}
 */
export const getAllTheaters = async (request: FastifyRequest, reply: FastifyReply) => {
  const { city_id, limit, offset } = request.query as CityQueryParam;
  try {
    const theaterList = await dbRepo.fetchRows(
      {
        tableName: 'theaters',
        conditions: 'city_id=?',
        orderBy: 'theater_id',
        limit,
        offset,
        columns: ['theater_id', 'theater_name', 'no_of_screens'],
      },
      [city_id],
    );

    reply.send(new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, theaterList));
  } catch (error) {
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * @description
 * Updates the created theaters within our database and restricted for admin users.
 *
 * @sql
 * UPDATE theaters SET city_id = ?, theater_name = ?, no_of_screens = ? WHERE theater_id = ? AND city_id = ?;
 */
export const updateTheaters = async (request: FastifyRequest, reply: FastifyReply) => {
  const { city_id, theater_name, no_of_screens } = request.body as TheaterReqBody;

  const { theater_id } = request.params as TheaterIdParam;

  try {
    await dbRepo.updateRows({
      tableName: 'theaters',
      values: {
        city_id,
        theater_name,
        no_of_screens,
      },
      conditions: {
        theater_id,
        city_id,
      },
    });

    reply.send(new AppResponse(commonResponseMessages.UPDATED_SUCCESSFULLY));
  } catch (error) {
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * @description
 * deletes the created theaters within our database and restricted for admin users.
 *
 * @sql
 * DELETE FROM theaters WHERE theater_id = ?;
 */
export const deleteTheaters = async (request: FastifyRequest, reply: FastifyReply) => {
  const { theater_id } = request.params as TheaterIdParam;

  try {
    await dbRepo.deleteRows({
      tableName: 'theaters',
      conditions: {
        theater_id,
      },
    });

    reply.send(new AppResponse(commonResponseMessages.DELETED_SUCCESSFULLY));
  } catch (error) {
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * @description
 * Fetches all the Movies, in a particular theater and their show times
 */
export const getAllMoviesInTheater = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { title } = request.query as TitleQueryParam;

    const { from_date, to_date } = request.body as DateRange;

    const query = `SELECT 
    t.theater_name, s.screen_name, m.movie_name, m.language, mi.certificate, 
    mi.format, st.date, st.start_time
    FROM theaters t INNER JOIN show_time st on t.theater_id = st.theater_id
    INNER JOIN movies m ON st.movie_id = m.movie_id
    INNER JOIN movie_info mi ON mi.movie_id = m.movie_id
    INNER JOIN screens s ON s.screen_id=st.screen_id
    WHERE t.theater_name LIKE ? AND st.date BETWEEN ? AND ?`;

    const movieList = await dbRepo.fetchComplexRows(query, [`%${title}%`, from_date, to_date]);

    const cache = request.app.cacheRepository;

    if (!movieList) {
      reply.send(new AppResponse(commonResponseMessages.NOT_FOUND));
      return;
    }

    await cache?.set(`movie_list_for_theater/${title}`, movieList, TTL_EXPIRATION.ONE_DAY);

    reply.send(new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, movieList));
  } catch (error) {
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};
