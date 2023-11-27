import { FastifyReply, FastifyRequest } from 'fastify';
import DBRepository from '@/repository/DBRepository';
import AppResponse from '@/helpers/AppResponse';
import { commonResponseMessages } from '@/constants';
import { BookingRequestBody } from '@/types/booking';
import { UserMap } from '@/types';

const dbRepo = new DBRepository();

export const initiateBooking = async (request: FastifyRequest, reply: FastifyReply) => {
  const { show_time_id, seat_no, no_of_tickets } = request.body as BookingRequestBody;

  const { user_id } = request.user as UserMap;

  const cache = request.app.cacheRepository;

  try {
    await dbRepo.initBooking({ show_time_id, seat_no, no_of_tickets, user_id, cache });
    reply.send(new AppResponse(commonResponseMessages.CREATED_SUCCESSFULLY));
  } catch (error) {
    if (error instanceof Error) {
      reply.send(new AppResponse(error.message));
    } else {
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  }
};

export const createPayment = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { stripe } = request;

    const payload = request.body;

    const paymentIntent = await stripe.paymentIntents.create(payload);
    reply.send(
      new AppResponse(commonResponseMessages.CREATED_SUCCESSFULLY, {
        client_secret: paymentIntent.client_secret,
      }),
    );
  } catch (error) {
    console.log('err', error);
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};

export const paymentCompletion = async (request: FastifyRequest, reply: FastifyReply) => {
  const payload = request.body;
  const sig = request.headers['stripe-signature'];
  const { stripe } = request;

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_KEY || '');
  } catch (error) {
    if (error instanceof Error) {
      reply.send(new AppResponse(error.message));
    } else {
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    // Update your MySQL table based on paymentIntent information
    console.log('PaymentIntent was successful!', paymentIntent);
  }
};
