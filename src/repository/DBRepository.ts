/* eslint-disable @typescript-eslint/no-explicit-any */
// import { FindOptions, CreateOptions, UpdateOptions, DestroyOptions } from 'sequelize';
// import { Model, ModelCtor } from 'sequelize-typescript';

// class Repository<T extends Model> {
//   private model: ModelCtor<T>;

//   constructor(model: ModelCtor<T>) {
//     this.model = model;
//   }

//   async getById(id: number, options?: FindOptions): Promise<T | null> {
//     return this.model.findByPk(id, options);
//   }

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   async findOne(filter: FindOptions): Promise<T | null> {
//     return this.model.findOne(filter);
//   }

//   async getAll(options?: FindOptions): Promise<T[]> {
//     return this.model.findAll(options);
//   }

//   async create(data: Partial<T['_creationAttributes']>, options?: CreateOptions): Promise<T> {
//     return this.model.create(data as T['_creationAttributes'], options);
//   }

//   async update(id: number, data: Partial<T>, options?: UpdateOptions): Promise<T | null> {
//     const instance = await this.getById(id);
//     if (instance) {
//       await instance.update(data, options);
//       return instance;
//     }
//     return null;
//   }

//   async delete(id: number, options?: DestroyOptions): Promise<number> {
//     const result = await this.model.destroy({ where: { id }, ...options });
//     return result;
//   }
// }

// export { Repository };

/**
 * Discard above class
 */

import { TTL_EXPIRATION } from '@/constants';
import db from '@/database/db';
import {
  QueryOptions,
  InsertOptions,
  UpdateOptions,
  DeleteOptions,
  TransactBookingOptions,
} from '@/types';
import { FetchSeatMaster } from '@/types/seat';

class DBRepository {
  private database;

  constructor() {
    this.database = db;
  }

  async executeQuery(query: string, bindings?: any[], isProcedure: boolean = false): Promise<any> {
    try {
      const connection = await this.database.getConnection();
      if (isProcedure) {
        const [results] = await connection.query(`call ${query}()`);
        return results;
      }
      const [results] = await connection.execute(query, bindings);
      return results;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error executing query: ${error.message}`);
      }
      throw new Error('Something went wrong');
    }
  }

  async fetchRows(options: QueryOptions, bindings?: any[]): Promise<any[]> {
    const { tableName, conditions, orderBy, limit, offset, columns } = options;
    const columnsStr = columns ? columns.join(', ') : ['*'];
    const query = `SELECT ${columnsStr} FROM ${tableName}${
      conditions ? ` WHERE ${conditions}` : ''
    }${orderBy ? ` ORDER BY ${orderBy}` : ''}${limit ? ` LIMIT ${limit}` : ''}${
      offset ? ` OFFSET ${offset}` : ''
    }`;
    return this.executeQuery(query, bindings);
  }

  async fetchComplexRows(query: string, bindings?: any[]): Promise<any[]> {
    return this.executeQuery(query, bindings);
  }

  async insertRows(options: InsertOptions): Promise<any[]> {
    const { tableName, values } = options;
    const bindings = Object.values(values);
    const columns = Object.keys(values);
    const placeholders = columns.map(() => '?').join(', ');

    const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders});`;
    return this.executeQuery(query, bindings);
  }

  async updateRows(options: UpdateOptions): Promise<any[]> {
    const { tableName, values, conditions } = options;
    const setClause = Object.keys(values)
      .map((column) => `${column} = ?`)
      .join(', ');

    const whereClause = Object.keys(conditions)
      .map((column) => `${column} = ?`)
      .join(' AND ');

    const bindings = [...Object.values(values), ...Object.values(conditions)];
    const query = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause};`;
    return this.executeQuery(query, bindings);
  }

  async deleteRows(options: DeleteOptions): Promise<any[]> {
    const { tableName, conditions } = options;

    const whereClause = Object.keys(conditions)
      .map((column) => `${column} = ?`)
      .join(' AND ');

    const bindings = Object.values(conditions);
    const query = `DELETE FROM ${tableName} WHERE ${whereClause};`;

    return this.executeQuery(query, bindings);
  }

  async executeStoredProcedure(procedureName: string, params?: any[]) {
    if (params) {
      const placeholders = params.map(() => '?').join(', ');
      const query = `CALL ${procedureName}(${placeholders})`;
      return this.executeQuery(query, params);
    }
    return this.executeQuery(procedureName);
  }

  async initBooking(options: TransactBookingOptions) {
    const { user_id, no_of_tickets, seat_no, show_time_id, cache } = options;

    let cachedTicketPrice = await cache?.get(`ticket_price/${show_time_id}`);

    const seatMaster: FetchSeatMaster[] = await cache?.get(`seat_master/${show_time_id}`);

    const seatCount = seat_no
      .split(',')
      .every((value) => seatMaster.some((obj) => obj.actual_seat_no === value));
    const connection = await this.database.getConnection();

    try {
      await connection.beginTransaction();

      // verify if the seat exists -> could be cached

      // const placeholders = seat_no
      //   .split(',')
      //   .map(() => '?')
      //   .join(',');

      // const modified_seat_no = seat_no.split(',');

      // const [seatCount]: any = await connection.execute(
      //   `SELECT COUNT(*) as count FROM seats WHERE actual_seat_no in (${placeholders}) AND show_time_id = ?`,
      //   [...modified_seat_no, show_time_id],
      // );

      const [bookedSeats]: any = await connection.execute(
        'SELECT seat_no FROM bookings WHERE show_time_id = ?',
        [show_time_id],
      );

      // Check if the seat is already booked in the booking table
      const conflictingSeats = bookedSeats
        .map((booking: any) => booking.seat_no.split(','))
        .flat()
        .filter((bookedSeat: any) => seat_no.split(',').includes(bookedSeat));

      if (seatCount && conflictingSeats.length === 0) {
        // Get movie information including ticket_price --> could be cached
        if (!cachedTicketPrice) {
          const [movieInfo]: any = await connection.execute(
            `SELECT mi.ticket_price 
            FROM movie_info mi
            INNER JOIN
            show_time st ON st.movie_id = mi.movie_id
            WHERE st.show_time_id = ?`,
            [show_time_id],
          );

          await cache?.set(
            `ticket_price/${show_time_id}`,
            movieInfo[0].ticket_price,
            TTL_EXPIRATION.THREE_HOUR,
          ); // ttl set for 3hrs
          cachedTicketPrice = movieInfo[0].ticket_price;
        }

        const ticketPrice = cachedTicketPrice;

        // Calculate tot_amount
        const totAmount = Number(ticketPrice) * no_of_tickets;

        // Perform soft booking with is_complete set to false
        await connection.execute(
          'INSERT INTO bookings (show_time_id, user_id, no_of_tickets, seat_no, tot_amount) VALUES (?, ?, ?, ?, ?)',
          [show_time_id, user_id, no_of_tickets, seat_no, totAmount],
        );

        await connection.commit();
      } else {
        await connection.rollback();
        throw new Error(
          conflictingSeats.length > 0
            ? 'Seats selected are not available anymore'
            : 'Please select valid seats no',
        );
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error performing booking:', error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default DBRepository;
