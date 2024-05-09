import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/error';
import { HttpStatus } from '../utils/statusCodes';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    console.log(err);
    return res
      .status(err.statusCode)
      .json({ success: false, error: err.message });
  }
  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: err,
  });
};
