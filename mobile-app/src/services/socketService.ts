import {io, Socket} from 'socket.io-client';
import {SocketEvents} from '../types';

const SOCKET_URL = 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.emit('connect', undefined);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.emit('disconnect', undefined);
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
      this.emit('error', {message: error.message || 'Socket error'});
    });

    // Set up event forwarding
    this.socket.onAny((eventName: string, ...args: any[]) => {
      this.emit(eventName, args[0]);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  emit<K extends keyof SocketEvents>(
    event: K,
    data: SocketEvents[K]
  ): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  on<K extends keyof SocketEvents>(
    event: K,
    callback: (data: SocketEvents[K]) => void
  ): void {
    if (!this.listeners.has(event as string)) {
      this.listeners.set(event as string, []);
    }
    this.listeners.get(event as string)!.push(callback);
  }

  off<K extends keyof SocketEvents>(
    event: K,
    callback?: (data: SocketEvents[K]) => void
  ): void {
    const eventListeners = this.listeners.get(event as string);
    if (eventListeners) {
      if (callback) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      } else {
        eventListeners.length = 0;
      }
    }
  }

  private triggerListeners(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
