/* eslint-disable no-console */

import 'module-alias/register';

import { env } from '@/envConfig';
import database from '@/database/db';
import app from './app';

const port = Number(env.SERVER_PORT);

database
  .connect()
  .then(() => {
    app.listen({ port }, async (err, address) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(`Server listening on ${address} 🚀🚀🚀`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
    process.exit(1); // Terminate the application on database connection failure
  });
