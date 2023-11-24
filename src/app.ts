import fastify, { FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import fjwt from '@fastify/jwt';
import helmet from '@fastify/helmet';
import userRoute from '@/routes/userRoute';
import cityRoute from '@/routes/cityRoute';
import movieRoute from '@/routes/movieRoute';
import theaterRoute from '@/routes/theaterRoute';
import seatRoute from '@/routes/seatRoute';
import bookingRoute from '@/routes/bookingRoute';
import responseMiddleware from '@/middleware/responseMiddleware';
import { decorateFastifyInstance } from '@/decorator';
import CacheManager from '@/repository/CacheRepository';
import { env } from '@/envConfig';

const { REDIS_HOST, REDIS_PORT } = env;

const app = fastify();

const cacheRepository = new CacheManager(app, {
  host: REDIS_HOST,
  port: REDIS_PORT,
  family: 4,
});
// registering helmet for endpoint protection
app.register(helmet);

// registering jwt token to fastify instance
app.register(fjwt, { secret: process.env.JWT_SECRET_KEY || '' });

app.decorate('cacheRepository', cacheRepository);

// this decorator takes care of jwt creation and verification
decorateFastifyInstance(app);

// handles before endpoint journey starts
app.addHook('preHandler', (request: FastifyRequest, res, next: HookHandlerDoneFunction) => {
  request.jwt = app.jwt;
  request.app = app;
  return next();
});

// api endpoint routes
app.register(userRoute, { prefix: '/api/users' });

app.register(cityRoute, { prefix: '/api/cities' });

app.register(movieRoute, { prefix: '/api/movies' });

app.register(theaterRoute, { prefix: '/api/theaters' });

app.register(seatRoute, { prefix: '/api/seats' });

app.register(bookingRoute, { prefix: '/api/booking' });

// Common response hook for response modification from controller
app.addHook('onSend', (request, reply, payload: string, done) => {
  const modifiedPayload = responseMiddleware(request, reply, payload);
  done(null, modifiedPayload);
});

export default app;
