import dotenv from 'dotenv';
import path from 'path';
import { EnvConfig } from '@/types';

const envpath = path.join(__dirname, '..', '.env');

dotenv.config({ path: envpath });

export const env: EnvConfig = {
  SERVER_PORT: parseInt(process.env.SERVER_PORT || '3000', 10),
  DB_DATABASE: process.env.DB_DATABASE || '',
  DB_USER_NAME: process.env.DB_USER_NAME || '',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_HOST: process.env.DB_HOST || '',
  DB_PORT: process.env.DB_PORT || '',
  DIALECT: process.env.DIALECT || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '',
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || '',
  REDIS_HOST: process.env.REDIS_HOST || '',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
};
