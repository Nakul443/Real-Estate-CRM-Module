// middleware file to check if the user is authenticated
// before allowing access to protected routes

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extending the Request interface to include user payload
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    email: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string; email: string };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// for RBAC
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // req.user was populated by the authenticate middleware
    const user = req.user;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Requires one of the following roles: ${roles.join(', ')}` 
      });
    }
    next();
  };
};