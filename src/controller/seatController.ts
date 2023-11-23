import { FastifyReply, FastifyRequest } from 'fastify';
import schedule from 'node-schedule';
import DBRepository from '@/repository/DBRepository';
import AppResponse from '@/helpers/AppResponse';
import { commonResponseMessages } from '@/constants';
import { SeatBody, SeatParams } from '@/types/seat';
import { CronBody } from '@/types';

const dbRepo = new DBRepository();

let scheduledTask: schedule.Job | null = null;

/**
 * @description
 * Fetchs the created seats within our database for a show_time
 *
 * @sql
 * SELECT show_time_id, actual_seat_no FROM seats WHERE show_time_id = ? ORDER BY actual_seat_no;
 */
export const fetchSeatsForShowTime = async (request: FastifyRequest, reply: FastifyReply) => {
  const { show_time_id } = request.params as SeatParams;

  try {
    const result = await dbRepo.fetchRows(
      {
        tableName: 'seats',
        conditions: 'show_time_id=?',
        orderBy: 'actual_seat_no',
        limit: undefined,
        offset: undefined,
        columns: ['show_time_id', 'actual_seat_no'],
      },
      [show_time_id],
    );

    reply.send(new AppResponse(commonResponseMessages.FETCHED_SUCCESSFULLY, result));
  } catch (error) {
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * @description
 * Handles seat creation within our database for a show time, restricted for admin users.
 *
 * @sql
 * INSERT INTO `seats` (`show_time_id`, `row_letter`, `seat_number`) VALUES (?, ?, ?)
 */
export const createSeatsForShowTime = async (request: FastifyRequest, reply: FastifyReply) => {
  const { show_time_id, seat_number, row_letter } = request.body as SeatBody;

  try {
    await dbRepo.insertRows({
      tableName: 'seats',
      values: {
        show_time_id,
        seat_number,
        row_letter,
      },
    });
    reply.send(new AppResponse(commonResponseMessages.CREATED_SUCCESSFULLY));
  } catch (error) {
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * @description
 * creates a scheduler for removing exired seats from seat table, based on show_time table
 *
 * @procedure
 * RemoveExpiredSeatsProcedure()
 */
export const removeExpSeatsStart = async (request: FastifyRequest, reply: FastifyReply) => {
  const { hour } = request.body as CronBody;

  if (!scheduledTask) {
    // Schedule the task to run every minute
    scheduledTask = schedule.scheduleJob(`* ${hour} * * *`, async () => {
      await dbRepo.executeStoredProcedure('RemoveExpiredSeatsProcedure');
    });
    reply.send(new AppResponse(commonResponseMessages.SCHEDULE_STARTED));
  } else {
    reply.send(new AppResponse(commonResponseMessages.SCHEDULE_AL_RUNNING));
  }
};

/**
 * @description
 * stops the scheduler for removing exired seats
 *
 * @procedure
 * RemoveExpiredSeatsProcedure()
 */
export const removeExpSeatsStop = async (request: FastifyRequest, reply: FastifyReply) => {
  if (scheduledTask) {
    // Cancel the scheduled task
    scheduledTask.cancel();
    scheduledTask = null;
    reply.send(new AppResponse(commonResponseMessages.SCHEDULE_STOPPED));
  } else {
    reply.send(new AppResponse(commonResponseMessages.SCHEDULE_AL_STOPPED));
  }
};
