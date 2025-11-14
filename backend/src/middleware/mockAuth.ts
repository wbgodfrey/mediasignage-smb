import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
}

// Mock authentication middleware - assigns a default user ID to all requests
export const mockAuthenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Use a fixed user ID for demo purposes
  req.userId = 'demo-user-id';
  next();
};
