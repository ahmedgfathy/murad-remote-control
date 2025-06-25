import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../utils/auth';
import { sessionManager } from './sessionManager';
import { SocketData, WebRTCSignal, ControlEvent } from '../types';

export const setupSocketHandlers = (io: SocketIOServer) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyToken(token);
      socket.data = decoded as SocketData;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}, User: ${socket.data.userId}`);

    // Join user to their personal room
    socket.join(socket.data.userId);

    // Handle session creation (guest)
    socket.on('create-session', async (callback) => {
      try {
        if (socket.data.role !== 'guest') {
          return callback({ success: false, error: 'Only guests can create sessions' });
        }

        const session = await sessionManager.createSession(socket.data.userId);
        socket.data.sessionId = session.id;
        socket.join(session.id);

        callback({ success: true, data: { sessionCode: session.code } });
        console.log(`📱 Session created: ${session.code} by guest ${socket.data.userId}`);
      } catch (error) {
        callback({ success: false, error: 'Failed to create session' });
      }
    });

    // Handle session joining (controller)
    socket.on('join-session', async (data: { code: string }, callback) => {
      try {
        if (socket.data.role !== 'controller') {
          return callback({ success: false, error: 'Only controllers can join sessions' });
        }

        const session = await sessionManager.joinSession(data.code, socket.data.userId);
        socket.data.sessionId = session.id;
        socket.join(session.id);

        // Notify guest that controller joined
        socket.to(session.guestId!).emit('controller-joined', {
          controllerId: socket.data.userId,
          sessionId: session.id
        });

        callback({ success: true, data: session });
        console.log(`🎮 Controller ${socket.data.userId} joined session ${data.code}`);
      } catch (error) {
        callback({ success: false, error: error instanceof Error ? error.message : 'Failed to join session' });
      }
    });

    // WebRTC signaling
    socket.on('webrtc-signal', (signal: WebRTCSignal) => {
      if (!socket.data.sessionId) {
        socket.emit('error', { message: 'Not in a session' });
        return;
      }

      // Forward signal to the other peer in the session
      socket.to(signal.to).emit('webrtc-signal', {
        ...signal,
        from: socket.data.userId
      });

      console.log(`📡 WebRTC signal: ${signal.type} from ${socket.data.userId} to ${signal.to}`);
    });

    // Remote control events
    socket.on('control-event', (event: ControlEvent) => {
      if (!socket.data.sessionId || socket.data.role !== 'controller') {
        socket.emit('error', { message: 'Unauthorized control event' });
        return;
      }

      // Forward control event to guest
      socket.to(socket.data.sessionId).emit('control-event', {
        ...event,
        from: socket.data.userId
      });

      console.log(`🎮 Control event: ${event.type} in session ${socket.data.sessionId}`);
    });

    // Screen quality adjustment
    socket.on('adjust-quality', (data: { quality: 'low' | 'medium' | 'high' }) => {
      if (!socket.data.sessionId) {
        socket.emit('error', { message: 'Not in a session' });
        return;
      }

      socket.to(socket.data.sessionId).emit('quality-change', data);
    });

    // Session permissions update
    socket.on('update-permissions', (permissions) => {
      if (!socket.data.sessionId || socket.data.role !== 'guest') {
        socket.emit('error', { message: 'Only guests can update permissions' });
        return;
      }

      sessionManager.updatePermissions(socket.data.sessionId, permissions);
      socket.to(socket.data.sessionId).emit('permissions-updated', permissions);
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`🔌 Client disconnected: ${socket.id}, User: ${socket.data.userId}`);

      if (socket.data.sessionId) {
        // Notify other participants
        socket.to(socket.data.sessionId).emit('peer-disconnected', {
          userId: socket.data.userId,
          role: socket.data.role
        });

        // End session if guest disconnects
        if (socket.data.role === 'guest') {
          await sessionManager.endSession(socket.data.sessionId);
          socket.to(socket.data.sessionId).emit('session-ended');
        }
      }
    });

    // Heartbeat for connection monitoring
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  console.log('🔧 Socket.IO handlers configured');
};
