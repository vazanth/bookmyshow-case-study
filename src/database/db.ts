/* eslint-disable no-console */
// import { Sequelize } from 'sequelize-typescript';
// import { Dialect } from 'sequelize';
// import { User } from '@/models/User';
// import { Movie } from '@/models/Movie';
// import { Theater } from '@/models/Theater';
// import { env } from './envConfig';

// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// const { DB_DATABASE, DB_USER_NAME, DB_PASSWORD, DB_HOST, DB_PORT } = env;

// const options = {
//   dialect: 'mysql' as Dialect, // Adjust the dialect based on your database type
//   host: DB_HOST,
//   port: Number(DB_PORT),
//   username: DB_USER_NAME,
//   password: DB_PASSWORD,
//   database: DB_DATABASE,
//   pool: {
//     max: 10,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
//   models: [User, Theater, Movie],
// };

// const sequelize = new Sequelize(options);

// async function initSequelize() {
//   try {
//     await sequelize.authenticate();
//     // sequelize.sync({ force: true }).then(() => {
//     //   console.log('Database synchronized.');
//     // });
//     console.log('Connection to the database has been established successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }
// }

// export { sequelize, initSequelize };

import { createPool, Pool, PoolConnection } from 'mysql2/promise';
import { env } from '@/envConfig';

const { DB_DATABASE, DB_USER_NAME, DB_PASSWORD, DB_HOST, DB_PORT } = env;

class Database {
  private pool: Pool | null = null;

  async connect(): Promise<void> {
    try {
      this.pool = createPool({
        host: DB_HOST,
        port: Number(DB_PORT),
        user: DB_USER_NAME,
        password: DB_PASSWORD,
        database: DB_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      // Test the connection
      const connection = await this.pool.getConnection();
      connection.release();
      console.log('Database connection established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      process.exit(1); // Terminate the application on database connection failure
    }
  }

  async getConnection(): Promise<PoolConnection> {
    if (!this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }

    const connection = await this.pool.getConnection();

    return connection;
  }
}

export default new Database();
