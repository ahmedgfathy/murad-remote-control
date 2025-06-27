import { Router, Request, Response } from 'express';
import { sessionManager } from '../services/sessionManager';
import { config } from '../config';
import { ApiResponse } from '../types';

const router = Router();

// Get WebRTC configuration
router.get('/webrtc-config', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: config.WEBRTC_CONFIG
  } as ApiResponse);
});

// Get session info by code
router.get('/:code', (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    
    if (!code || code.length !== 6) {
      res.status(400).json({
        success: false,
        error: 'Invalid session code format'
      } as ApiResponse);
      return;
    }

    const session = sessionManager.getSessionByCode(code);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      } as ApiResponse);
    }

    if (session.expiresAt < new Date()) {
      return res.status(410).json({
        success: false,
        error: 'Session expired'
      } as ApiResponse);
    }

    // Don't expose sensitive session details
    return res.json({
      success: true,
      data: {
        id: session.id,
        code: session.code,
        status: session.status,
        permissions: session.permissions,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt
      }
    } as ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get session info'
    } as ApiResponse);
  }
});

// Get server stats (for monitoring)
router.get('/stats/server', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      activeSessions: sessionManager.getActiveSessionsCount(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    }
  } as ApiResponse);
});

export default router;
