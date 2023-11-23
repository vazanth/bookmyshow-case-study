/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { commonResponseMessages } from '@/constants';
import { env } from '@/envConfig';
import AppResponse from '@/helpers/AppResponse';
import * as jwt from 'jsonwebtoken';
import db from '@/database/db';
import { CustomRequest, UserMap } from '@/types';

const { JWT_SECRET_KEY } = env;

export const decorateFastifyInstance = (app: FastifyInstance): void => {
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request?.headers?.authorization?.startsWith('Bearer')) {
        return reply.send(new AppResponse(commonResponseMessages.NOT_LOGGED_IN));
      }
      const [, token] = request.headers.authorization.split(' ');

      // verify token signature
      if (JWT_SECRET_KEY) {
        const decodeToken = jwt.verify(token, JWT_SECRET_KEY) as jwt.JwtPayload;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentUser: any = await (
          await db.getConnection()
        ).execute('SELECT user_id, name, email, city_id, role FROM users where user_id = ?', [
          decodeToken?.user_id,
        ]);

        if (!currentUser) {
          return reply.send(new AppResponse(commonResponseMessages.NOT_FOUND));
        }

        // eslint-disable-next-line prefer-destructuring
        request.user = currentUser[0][0];
      }
    } catch (error) {
      return reply.send(new AppResponse(commonResponseMessages.INVALID_TOKEN));
    }
  });
  app.decorate('restrictTo', (role: string) => {
    return async (request: FastifyRequest & CustomRequest, reply: FastifyReply) => {
      const userDetails: UserMap = request.user;
      if (role !== userDetails.role) {
        return reply.send(new AppResponse(commonResponseMessages.NOT_AUTHORIZED));
      }
    };
  });
};
