import {User} from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

interface LoginResponse {
  user: User;
  token: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await this.request<ApiResponse<LoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        role: 'controller', // Mobile app is always a controller
      }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Login failed');
    }

    return response.data;
  }

  async createSession(token: string): Promise<{sessionCode: string}> {
    const response = await this.request<ApiResponse<{sessionCode: string}>>('/sessions/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create session');
    }

    return response.data;
  }
}

export const apiService = new ApiService();
