// Common types for the web interface
export interface Session {
  id: string;
  code: string;
  controllerId?: string;
  guestId?: string;
  status: 'waiting' | 'connected' | 'disconnected';
  permissions: {
    screenShare: boolean;
    remoteControl: boolean;
    fileTransfer: boolean;
    audioShare: boolean;
  };
}

export interface User {
  id: string;
  username: string;
  role: 'controller' | 'guest';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface ControlEvent {
  type: 'touch' | 'key' | 'scroll' | 'gesture';
  data: any;
  timestamp: number;
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}
