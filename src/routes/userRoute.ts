import { FastifyInstance } from 'fastify';
import { signUp, signIn } from '@/controller/userController';
import { signInSchema, signUpSchema } from '@/schema/userSchema';

const userRoute = async (app: FastifyInstance) => {
  app.post('/sign-up', { schema: { body: signUpSchema } }, signUp);
  app.post('/sign-in', { schema: { body: signInSchema } }, signIn);
};

export default userRoute;
