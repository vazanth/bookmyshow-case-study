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

  try {
    await dbRepo.initBooking({ show_time_id, seat_no, no_of_tickets, user_id });
    reply.send(new AppResponse(commonResponseMessages.CREATED_SUCCESSFULLY));
  } catch (error) {
    if (error instanceof Error) {
      reply.send(new AppResponse(error.message));
    } else {
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  }
};
