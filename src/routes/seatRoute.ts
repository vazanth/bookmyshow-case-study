import { FastifyInstance } from 'fastify';
import {
  createSeatsForShowTime,
  removeExpSeatsStart,
  fetchSeatsForShowTime,
  removeExpSeatsStop,
} from '@/controller/seatController';
import { seatBodySchema, seatParamSchema } from '@/schema/seatSchema';
import { cronSchema } from '@/schema/commonSchema';

const seatRoute = async (app: FastifyInstance) => {
  app
    .post(
      '/',
      { preHandler: [app.authenticate, app.restrictTo('admin')], schema: { body: seatBodySchema } },
      createSeatsForShowTime,
    )
    .get(
      '/:show_time_id',
      {
        schema: { params: seatParamSchema },
      },
      fetchSeatsForShowTime,
    );

  app.post(
    '/remove-expired-seats/start',
    {
      preHandler: [app.authenticate, app.restrictTo('admin')],
      schema: { body: cronSchema },
    },
    removeExpSeatsStart,
  );

  app.get(
    '/remove-expired-seats/stop',
    {
      preHandler: [app.authenticate, app.restrictTo('admin')],
    },
    removeExpSeatsStop,
  );
};

export default seatRoute;
