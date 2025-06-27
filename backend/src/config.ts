import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 3001,
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // CORS settings
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'http://localhost:3000', 
        'http://localhost:3001', 
        'http://localhost:8081',
        'http://192.168.1.5:3000',
        'http://192.168.1.5:3001',
        'http://192.168.1.4:3000',
        'http://192.168.1.4:3001'
      ],
  
  // WebRTC Configuration
  WEBRTC_CONFIG: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      // Add TURN servers for production
      // {
      //   urls: 'turn:your-turn-server.com:3478',
      //   username: 'turnuser',
      //   credential: 'turnpass'
      // }
    ]
  },
  
  // Rate limiting
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  // Session settings
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_CONNECTIONS_PER_SESSION: 2,
  
  // Security
  BCRYPT_ROUNDS: 12,
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production'
};
