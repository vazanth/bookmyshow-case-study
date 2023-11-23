import fastify, { FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import fjwt from '@fastify/jwt';
import helmet from '@fastify/helmet';
import userRoute from '@/routes/userRoute';
import cityRoute from '@/routes/cityRoute';
import movieRoute from '@/routes/movieRoute';
import theaterRoute from '@/routes/theaterRoute';
import seatRoute from '@/routes/seatRoute';
import responseMiddleware from '@/middleware/responseMiddleware';
import { decorateFastifyInstance } from '@/repository/decorate';
import bookingRoute from './routes/bookingRoute';

const app = fastify();

app.register(helmet);

app.register(fjwt, { secret: process.env.JWT_SECRET_KEY || '' });

decorateFastifyInstance(app);

app.addHook('preHandler', (request: FastifyRequest, res, next: HookHandlerDoneFunction) => {
  request.jwt = app.jwt;
  return next();
});

app.register(userRoute, { prefix: '/api/users' });

app.register(cityRoute, { prefix: '/api/cities' });

app.register(movieRoute, { prefix: '/api/movies' });

app.register(theaterRoute, { prefix: '/api/theaters' });

app.register(seatRoute, { prefix: '/api/seats' });

app.register(bookingRoute, { prefix: '/api/booking' });

// Common response hook
app.addHook('onSend', (request, reply, payload: string, done) => {
  const modifiedPayload = responseMiddleware(request, reply, payload);
  done(null, modifiedPayload);
});

export default app;
