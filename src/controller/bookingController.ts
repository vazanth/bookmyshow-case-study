import { FastifyReply, FastifyRequest } from 'fastify';
import DBRepository from '@/repository/DBRepository';
import AppResponse from '@/helpers/AppResponse';
import { commonResponseMessages } from '@/constants';
import { BookingRequestBody, PaymentRequestBody } from '@/types/booking';
import { UserMap } from '@/types';

const dbRepo = new DBRepository();

export const initiateBooking = async (request: FastifyRequest, reply: FastifyReply) => {
  const { show_time_id, seat_no, no_of_tickets } = request.body as BookingRequestBody;

  const { user_id } = request.user as UserMap;

  const cache = request.app.cacheRepository;

  // const params = [user_id, no_of_tickets, seat_no, show_time_id];

  try {
    await dbRepo.initBooking({ show_time_id, seat_no, no_of_tickets, user_id, cache });
    // await dbRepo.executeStoredProcedure('InitBooking', params);
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

    const { booking_id, ...rest } = request.body as PaymentRequestBody;

    const paymentIntent = await stripe.paymentIntents.create(rest);

    if (paymentIntent.id) {
      await dbRepo.updateRows({
        tableName: 'bookings',
        values: {
          payment_intent: paymentIntent.id,
        },
        conditions: {
          booking_id,
        },
      });
    }
    reply.send(
      new AppResponse(commonResponseMessages.CREATED_SUCCESSFULLY, {
        client_secret: paymentIntent.client_secret,
      }),
    );
  } catch (error) {
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};

export const paymentCompletion = async (request: FastifyRequest, reply: FastifyReply) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const event: any = request.body;

  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      await dbRepo.updateRows({
        tableName: 'bookings',
        values: {
          is_completed: true,
        },
        conditions: {
          payment_intent: paymentIntent.id,
        },
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      reply.send(new AppResponse(error.message));
    } else {
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  }
};
