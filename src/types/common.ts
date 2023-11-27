/* eslint-disable @typescript-eslint/no-explicit-any */
import { JWT } from '@fastify/jwt';
import { BookingRequestBody } from './booking';

export type EnvConfig = {
  SERVER_PORT: number;
  DB_USER_NAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  DB_HOST: string;
  DB_PORT: string;
  DIALECT: string;
  JWT_SECRET_KEY: string;
  JWT_EXPIRES_IN: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
};

export type CustomResponse = {
  message: string;
  statusCode: string;
  status: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  isOperational: boolean;
};

export type UserMap = {
  user_id: number;
  name: string;
  email: string;
  city_id: number;
  role: 'customer' | 'admin';
};

export type CustomRequest = {
  user?: UserMap;
  userId: string;
};

export type PaginationParam = {
  limit?: string;
  offset?: string;
};

export type SchmeaErrorMap = { field: string; message: string };

export type CronBody = {
  hour: string;
};

export type DateRange = {
  from_date: string;
  to_date: string;
};

export type TitleQueryParam = {
  title: string;
};

export type QueryOptions = {
  tableName: string;
  conditions?: string;
  orderBy?: string;
  limit?: string;
  offset?: string;
  columns?: string[];
};

export type InsertOptions = {
  tableName: string;
  values: Record<string, any>;
};

export type UpdateOptions = InsertOptions & {
  conditions: Record<string, any>;
};

export type DeleteOptions = Omit<Omit<InsertOptions, 'values'>, 'conditions'> & {
  conditions: Record<string, any>;
};

export type TransactBookingOptions = BookingRequestBody & {
  user_id: number;
  cache: any;
};

export type RedisCacheOptions = {
  host: string;
  port: number;
  family: number;
};

declare module 'fastify' {
  interface FastifyRequest {
    jwt: JWT;
    app: any;
    stripe: any;
  }
  export interface FastifyInstance {
    authenticate: any;
    checkCache: any;
    restrictTo: any;
    cacheRepository: any;
  }
}
