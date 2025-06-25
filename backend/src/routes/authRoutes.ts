import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateToken } from '../utils/auth';
import { ApiResponse, SocketData } from '../types';

const router = Router();

// Generate auth token for controller
router.post('/controller', (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Username is required'
      } as ApiResponse);
      return;
    }

    const userData: SocketData = {
      userId: uuidv4(),
      role: 'controller'
    };

    const token = generateToken(userData);

    res.json({
      success: true,
      data: {
        token,
        userId: userData.userId,
        role: userData.role,
        username: username.trim()
      }
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate controller token'
    } as ApiResponse);
  }
});

// Generate auth token for guest
router.post('/guest', (req: Request, res: Response) => {
  try {
    const { deviceInfo } = req.body;

    const userData: SocketData = {
      userId: uuidv4(),
      role: 'guest'
    };

    const token = generateToken(userData);

    res.json({
      success: true,
      data: {
        token,
        userId: userData.userId,
        role: userData.role,
        deviceInfo: deviceInfo || {}
      }
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate guest token'
    } as ApiResponse);
  }
});

// Verify token endpoint
router.post('/verify', (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      } as ApiResponse);
    }

    // This will throw if token is invalid
    const decoded = require('../utils/auth').verifyToken(token);

    res.json({
      success: true,
      data: decoded
    } as ApiResponse);
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    } as ApiResponse);
  }
});

export default router;
