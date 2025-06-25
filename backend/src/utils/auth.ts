import jwt from 'jsonwebtoken';
import { config } from '../config';
import { SocketData } from '../types';

export const generateToken = (payload: SocketData): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): SocketData => {
  return jwt.verify(token, config.JWT_SECRET) as SocketData;
};
