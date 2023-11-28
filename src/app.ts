import fastify, { FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import fastifyStatic from '@fastify/static';
import fjwt from '@fastify/jwt';
import helmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import path from 'path';
import Stripe from 'stripe';
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

// eslint-disable-next-line @typescript-eslint/no-var-requires
app.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/public',
});

const cacheRepository = new CacheManager(app, {
  host: REDIS_HOST,
  port: REDIS_PORT,
  family: 4,
});

// registering helmet for endpoint protection
app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://js.stripe.com'],
      frameSrc: ['https://js.stripe.com'],
    },
  },
});

app.register(fastifyCors, {
  origin: 'https://js.stripe.com', // This will allow all origins by default. You can specify specific origins if needed.
  methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
  credentials: true,
});

// registering jwt token to fastify instance
app.register(fjwt, { secret: process.env.JWT_SECRET_KEY || '' });

app.decorate('cacheRepository', cacheRepository);

const stripeInstance = new Stripe(process.env.STRIPE_KEY || '');

// Attach the Stripe instance to the Fastify instance
app.decorate('stripe', stripeInstance);

// this decorator takes care of jwt creation and verification
decorateFastifyInstance(app);

// handles before endpoint journey starts
app.addHook('preHandler', (request: FastifyRequest, res, next: HookHandlerDoneFunction) => {
  request.jwt = app.jwt;
  request.app = app;
  request.stripe = stripeInstance;
  return next();
});

// for default endpoint expose to ngork
app.get('/', (_, reply) => {
  reply.send('Hello There');
});

// api endpoint routes
app.register(userRoute, { prefix: '/api/users' });

app.register(cityRoute, { prefix: '/api/cities' });

app.register(movieRoute, { prefix: '/api/movies' });

app.register(theaterRoute, { prefix: '/api/theaters' });

app.register(seatRoute, { prefix: '/api/seats' });

app.register(bookingRoute, { prefix: '/api/bookings' });

// Common response hook for response modification from controller
app.addHook('onSend', (request, reply, payload: string, done) => {
  // Check if the request is for serving static files if so dont modify
  if ((request.url && request.url.startsWith('/public')) || request.url === '/') {
    // Skip the hook for static files
    return done(null, payload);
  }
  const modifiedPayload = responseMiddleware(request, reply, payload);
  return done(null, modifiedPayload);
});

export default app;
