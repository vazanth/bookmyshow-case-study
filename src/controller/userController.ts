import { FastifyRequest, FastifyReply } from 'fastify';
import * as argon2 from 'argon2';
import DBRepository from '@/repository/DBRepository';
import AppResponse from '@/helpers/AppResponse';
import { UserRequestBody } from '@/types';
import { commonResponseMessages } from '@/constants';

const dbRepo = new DBRepository();

/**
 * @description
 * Handles the sign-up process for a user.
 *
 * @sql
 * INSERT INTO users (name, email, mobile, password, city_id, role)
 * VALUES (?,?,?,?,?,?)
 */

export const signUp = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { name, email, password, mobile, city_id, role } = request.body as UserRequestBody;

    const hashedPassword = await argon2.hash(password);

    dbRepo.insertRows({
      tableName: 'users',
      values: {
        name,
        email,
        password: hashedPassword,
        mobile,
        city_id,
        role,
      },
    });

    reply.send(new AppResponse(commonResponseMessages.REGISTERED_SUCCESSFULLY));
  } catch (error) {
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * @description
 * Handles the sign-in process for a user abd generates token for private api's.
 *
 * @sql
 * SELECT user_id, password, name, email, mobile, city_id, role FROM users where email = ?
 */

export const signIn = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { email, password } = request.body as UserRequestBody;

    const result = await dbRepo.fetchRows(
      {
        tableName: 'users',
        conditions: 'email=?',
        orderBy: undefined,
        limit: undefined,
        offset: undefined,
        columns: ['user_id', 'password', 'name', 'email', 'mobile', 'city_id', 'role'],
      },
      [email],
    );
    if (!result) {
      reply.send(new AppResponse(commonResponseMessages.AUTH_INCORRECT));
      return;
    }

    const isPasswordMatch = await argon2.verify(result[0]?.password, password);
    if (!isPasswordMatch) {
      reply.send(new AppResponse(commonResponseMessages.AUTH_INCORRECT));
    }

    const token = request.jwt.sign(result[0]);

    const { password: _, ...rest } = result[0];

    const successResponse = new AppResponse(commonResponseMessages.CREATED_SUCCESSFULLY, {
      ...rest,
      token,
    });

    reply.send(successResponse);
  } catch (error) {
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};
