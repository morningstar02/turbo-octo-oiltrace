import express from 'express';
import HandledApplicationError from '../error/handled-application-error';

async function throwIfInputValidationError(req: express.Request) {
  const errors = await req.getValidationResult();
  if (!errors.isEmpty()) {
    const msg = errors
      .array()
      .map((i) => `${i.msg}`)
      .join('; ');
    throw new HandledApplicationError(422, msg);
  }
}

export default throwIfInputValidationError;
