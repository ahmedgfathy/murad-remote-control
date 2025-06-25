export interface User {
  id: string;
  username: string;
  role: 'controller' | 'guest';
}

export interface Session {
  id: string;
  code: string;
  guestId?: string;
  controllerId?: string;
  status: 'waiting' | 'active' | 'ended';
  createdAt: string;
}

export interface ControlEvent {
  type: 'touch' | 'key' | 'scroll';
  x?: number;
  y?: number;
  action?: 'down' | 'up' | 'move';
  key?: string;
  deltaX?: number;
  deltaY?: number;
}

export interface ScreenFrame {
  data: string; // base64 encoded image
  width: number;
  height: number;
  timestamp: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface SocketEvents {
  // Authentication
  authenticate: {token: string};
  authenticated: {user: User};
  
  // Session management
  'join-session': {sessionCode: string};
  'join-session-success': {session: Session};
  'join-session-error': {error: string};
  
  // Control events
  'control-event': ControlEvent;
  'screen-frame': ScreenFrame;
  
  // Connection
  connect: void;
  disconnect: void;
  error: {message: string};
}
