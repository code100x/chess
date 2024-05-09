import { Request, Response, NextFunction } from 'express';

type AsyncHandlerCallback = (
  req: Request,
  res: Response,
  next: NextFunction,
) => any;
export function asyncHandler(cb: AsyncHandlerCallback) {
  return (req: Request, res: Response, next: NextFunction) => {
    return cb(req, res, next)?.catch(next);
  };
}
