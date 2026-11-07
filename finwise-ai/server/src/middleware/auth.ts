import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'finwise-secret-key-development-2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}

export function generateToken(payload: { id: string; email: string; name: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
