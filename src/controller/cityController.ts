import { FastifyReply, FastifyRequest } from 'fastify';
import DBRepository from '@/repository/DBRepository';
import AppResponse from '@/helpers/AppResponse';
import { CityParams, CityRequestBody, PaginationParam } from '@/types';
import { commonResponseMessages } from '@/constants';

const dbRepo = new DBRepository();

/**
 * @description
 * Handles city creation within our database, restricted for admin users.
 *
 * @sql
 * INSERT INTO cities (city_name) VALUES (?)
 */
export const createCities = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { city_name } = request.body as CityRequestBody;

    await dbRepo.insertRows({
      tableName: 'cities',
      values: {
        city_name,
      },
    });

    reply.send(new AppResponse(commonResponseMessages.CREATED_SUCCESSFULLY));
  } catch (error) {
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * @description
 * Fetchs the created cities within our database
 * limit and offset available for pagination and restricted for admin users.
 *
 * @sql
 * SELECT city_id, city_name FROM cities order by city_id limit ${limit} offset ${offset}
 */
export const fetchCities = async (request: FastifyRequest, reply: FastifyReply) => {
  const { limit, offset } = request.query as PaginationParam;

  try {
    const result = await dbRepo.fetchRows({
      tableName: 'cities',
      conditions: undefined,
      orderBy: 'city_id',
      limit,
      offset,
      columns: ['city_id, city_name'],
    });

    reply.send(new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, result));
  } catch (error) {
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * @description
 * Updates the created cities within our database and restricted for admin users.
 *
 * @sql
 * UPDATE cities SET city_name = ? WHERE city_id = ?;
 */
export const updateCities = async (request: FastifyRequest, reply: FastifyReply) => {
  const { city_name } = request.body as CityRequestBody;

  const { city_id } = request.params as CityParams;

  try {
    await dbRepo.updateRows({
      tableName: 'cities',
      values: {
        city_name,
      },
      conditions: {
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
 * deletes the created cities within our database and restricted for admin users.
 *
 * @sql
 * DELETE FROM cities WHERE city_id = ?;
 */
export const deleteCities = async (request: FastifyRequest, reply: FastifyReply) => {
  const { city_id } = request.params as CityParams;

  try {
    await dbRepo.deleteRows({
      tableName: 'cities',
      conditions: {
        city_id,
      },
    });

    reply.send(new AppResponse(commonResponseMessages.DELETED_SUCCESSFULLY));
  } catch (error) {
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};
