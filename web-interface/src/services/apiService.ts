import { AuthState, User, WebRTCConfig } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  // Generate controller authentication token
  async authenticateController(username: string): Promise<AuthState> {
    const response = await fetch(`${API_BASE_URL}/auth/controller`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Authentication failed');
    }

    const user: User = {
      id: data.data.userId,
      username: data.data.username,
      role: data.data.role,
    };

    return {
      isAuthenticated: true,
      user,
      token: data.data.token,
    };
  }

  // Verify existing token
  async verifyToken(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Token verification failed');
    }

    return {
      id: data.data.userId,
      username: data.data.username || 'Unknown',
      role: data.data.role,
    };
  }

  // Get WebRTC configuration
  async getWebRTCConfig(): Promise<WebRTCConfig> {
    const response = await fetch(`${API_BASE_URL}/sessions/webrtc-config`);

    if (!response.ok) {
      throw new Error('Failed to get WebRTC configuration');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to get WebRTC configuration');
    }

    return data.data;
  }

  // Get session info by code
  async getSessionInfo(code: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/sessions/${code}`);

    if (!response.ok) {
      throw new Error('Session not found');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Session not found');
    }

    return data.data;
  }

  // Get server stats
  async getServerStats(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/sessions/stats/server`);

    if (!response.ok) {
      throw new Error('Failed to get server stats');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to get server stats');
    }

    return data.data;
  }
}

export const apiService = new ApiService();
