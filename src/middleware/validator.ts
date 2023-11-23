// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { FastifyReply, FastifyRequest } from 'fastify';
// import { z } from 'zod';
// import AppResponse from '@/helpers/AppResponse';
// import { extractValidationErrors } from '@/helpers/parseSchemaError';
// import { paginateSchema } from '@/schema/commonSchema';

// function createValidationMiddleware(schema: z.ZodObject<any, any, any>) {
//   return async (request: FastifyRequest, reply: FastifyReply) => {
//     try {
//       schema.parse(request.body);
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         const validationErrors = extractValidationErrors(error);
//         reply.send(new AppResponse(validationErrors, null, 400));
//       }
//     }
//   };
// }

// function createValidationMiddlewareQuery(schema: any) {
//   return async (request: FastifyRequest, reply: FastifyReply) => {
//     try {
//       schema.parse(request.query);
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         const validationErrors = extractValidationErrors(error);
//         reply.send(new AppResponse(validationErrors, null, 400));
//       }
//     }
//   };
// }

// export const validatePaginate = createValidationMiddlewareQuery(paginateSchema);
