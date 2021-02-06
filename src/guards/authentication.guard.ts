import config from 'config';
import express from 'express';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import catchError from '../error/catch-error';
import HandledApplicationError from '../error/handled-application-error';
import { logger } from '../util/winston';
import IAuthenticatedRequest from './authenticated.request';

async function authenticationGuard(
  req: IAuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction,
) {
  try {
      next();
  } catch (err) {
    logger.error(`Referer: ${req.header('referer')}, Origin: ${req.header('origin')}, Request body: ${JSON.stringify(req.body)}`);
    catchError(err, next);
  }
}

export default authenticationGuard;
