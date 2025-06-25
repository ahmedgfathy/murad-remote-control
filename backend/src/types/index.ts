// Common interfaces and types

export interface User {
  id: string;
  username: string;
  role: 'controller' | 'guest';
  createdAt: Date;
}

export interface Session {
  id: string;
  code: string;
  controllerId?: string;
  guestId?: string;
  status: 'waiting' | 'connected' | 'disconnected';
  createdAt: Date;
  expiresAt: Date;
  permissions: SessionPermissions;
}

export interface SessionPermissions {
  screenShare: boolean;
  remoteControl: boolean;
  fileTransfer: boolean;
  audioShare: boolean;
}

export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  sessionId: string;
  from: string;
  to: string;
  data: any;
}

export interface ControlEvent {
  type: 'touch' | 'key' | 'scroll' | 'gesture';
  sessionId: string;
  data: TouchEvent | KeyEvent | ScrollEvent | GestureEvent;
}

export interface TouchEvent {
  action: 'down' | 'up' | 'move';
  x: number;
  y: number;
  pressure?: number;
  timestamp: number;
}

export interface KeyEvent {
  action: 'down' | 'up';
  keyCode: number;
  metaState?: number;
  timestamp: number;
}

export interface ScrollEvent {
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  timestamp: number;
}

export interface GestureEvent {
  type: 'pinch' | 'swipe';
  data: any;
  timestamp: number;
}

export interface SocketData {
  userId: string;
  sessionId?: string;
  role: 'controller' | 'guest';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
