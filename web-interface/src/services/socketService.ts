import { io, Socket } from 'socket.io-client';
import { AuthState, Session, ControlEvent } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('🔌 Connected to server');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection failed:', error);
        reject(error);
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Disconnected from server');
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a session with session code
  joinSession(code: string): Promise<Session> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('join-session', { code }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Send control event to guest
  sendControlEvent(event: ControlEvent): void {
    if (this.socket) {
      this.socket.emit('control-event', event);
    }
  }

  // Send WebRTC signaling data
  sendWebRTCSignal(signal: any): void {
    if (this.socket) {
      this.socket.emit('webrtc-signal', signal);
    }
  }

  // Adjust screen quality
  adjustQuality(quality: 'low' | 'medium' | 'high'): void {
    if (this.socket) {
      this.socket.emit('adjust-quality', { quality });
    }
  }

  // Event listeners
  onControllerJoined(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('controller-joined', callback);
    }
  }

  onWebRTCSignal(callback: (signal: any) => void): void {
    if (this.socket) {
      this.socket.on('webrtc-signal', callback);
    }
  }

  onQualityChange(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('quality-change', callback);
    }
  }

  onPermissionsUpdated(callback: (permissions: any) => void): void {
    if (this.socket) {
      this.socket.on('permissions-updated', callback);
    }
  }

  onPeerDisconnected(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('peer-disconnected', callback);
    }
  }

  onSessionEnded(callback: () => void): void {
    if (this.socket) {
      this.socket.on('session-ended', callback);
    }
  }

  onError(callback: (error: any) => void): void {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  // Heartbeat
  ping(): void {
    if (this.socket) {
      this.socket.emit('ping');
    }
  }

  onPong(callback: () => void): void {
    if (this.socket) {
      this.socket.on('pong', callback);
    }
  }
}

export const socketService = new SocketService();
