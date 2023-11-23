import { FastifyReply, FastifyRequest } from 'fastify';
import { CustomResponse } from '../types';
import { commonResponseMessages } from '../constants';
import AppResponse from '../helpers/AppResponse';

const sendResponse = (result: CustomResponse) => {
  if (result?.isOperational) {
    // const statusCode: number = Number(result?.statusCode);
    // Trusted resultors that we know
    return JSON.stringify({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  }
  // Unknown errors
  return JSON.stringify({
    status: result.status || 'error',
    message: result.message || 'Something Went Wrong!!',
  });
};

const handleJWTError = () => new AppResponse(commonResponseMessages.INVALID_TOKEN);

const handleJWTExpiredError = () => new AppResponse(commonResponseMessages.EXPIRED_TOKEN);

const responseMiddleware = (req: FastifyRequest, reply: FastifyReply, payload: string) => {
  let response = JSON.parse(payload);
  if (response instanceof AppResponse) {
    return sendResponse(response);
  }
  if (response?.message === 'jwt expired') {
    response = handleJWTExpiredError();
  }
  if (response?.message === 'invalid token' || response?.message === 'invalid signature') {
    response = handleJWTError();
  }

  return sendResponse(response);
};

export default responseMiddleware;
