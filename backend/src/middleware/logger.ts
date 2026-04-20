import { Request, Response, NextFunction } from 'express';

const logger = (req: Request, _res: Response, next: NextFunction): void => {
  const timestamp: string = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
};

export default logger;
