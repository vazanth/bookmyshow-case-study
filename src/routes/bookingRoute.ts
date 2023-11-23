import { FastifyInstance } from 'fastify';
import { initiateBooking } from '@/controller/bookingController';
import { bookingBodySchema } from '@/schema/bookingSchema';

const bookingRoute = async (app: FastifyInstance) => {
  app.post(
    '/',
    { preHandler: [app.authenticate], schema: { body: bookingBodySchema } },
    initiateBooking,
  );
};

export default bookingRoute;
