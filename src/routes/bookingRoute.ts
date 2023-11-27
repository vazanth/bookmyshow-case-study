import { FastifyInstance } from 'fastify';
import { initiateBooking, createPayment, paymentCompletion } from '@/controller/bookingController';
import { bookingBodySchema } from '@/schema/bookingSchema';

const bookingRoute = async (app: FastifyInstance) => {
  app.post(
    '/',
    { preHandler: [app.authenticate], schema: { body: bookingBodySchema } },
    initiateBooking,
  );
  app.post('/create-payment-intent', createPayment);

  app.post('/webhook', paymentCompletion);
};

export default bookingRoute;
