import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config';
import { setupSocketHandlers } from './services/socketService';
import { errorHandler } from './middleware/errorHandler';
import { rateLimitMiddleware } from './middleware/rateLimiter';
import authRoutes from './routes/authRoutes';
import sessionRoutes from './routes/sessionRoutes';
import { setupAndroidWebSocketServer } from './services/androidWebSocketService';

const app = express();
const server = createServer(app);

// CORS configuration for WebRTC and Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: config.ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Required for WebRTC
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      mediaSrc: ["'self'", "blob:"]
    }
  }
}));

app.use(compression());
app.use(cors({
  origin: config.ALLOWED_ORIGINS,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimitMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Remote Control Backend Server',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      sessions: '/api/sessions'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Socket.IO setup
setupSocketHandlers(io);

// Android WebSocket server setup
setupAndroidWebSocketServer(server);

// Error handling
app.use(errorHandler);

const PORT = config.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Remote Control Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready`);
  console.log(`🤖 Android WebSocket server ready at /android`);
  console.log(`🔒 CORS enabled for: ${config.ALLOWED_ORIGINS.join(', ')}`);
});

export { app, server, io };
