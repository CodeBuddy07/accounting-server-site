import { Request, Response, NextFunction } from 'express';

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
  });

  console.log({
    success: false,
    message,
  });
};

export default globalErrorHandler;