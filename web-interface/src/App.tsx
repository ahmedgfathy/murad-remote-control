import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import ControllerDashboard from './components/ControllerDashboard';
import { socketService } from './services/socketService';
import { apiService } from './services/apiService';
import { AuthState } from './types';
import './App.css';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token in localStorage
    const checkExistingAuth = async () => {
      const token = localStorage.getItem('remoteControlToken');
      
      if (token) {
        try {
          const user = await apiService.verifyToken(token);
          setAuthState({
            isAuthenticated: true,
            user,
            token
          });
          
          // Connect to socket server
          await socketService.connect(token);
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('remoteControlToken');
        }
      }
      
      setLoading(false);
    };

    checkExistingAuth();
  }, []);

  const handleLogin = async (newAuthState: AuthState) => {
    try {
      // Store token in localStorage
      if (newAuthState.token) {
        localStorage.setItem('remoteControlToken', newAuthState.token);
      }
      
      // Connect to socket server
      await socketService.connect(newAuthState.token!);
      
      setAuthState(newAuthState);
    } catch (error) {
      console.error('Login connection failed:', error);
      // Clear invalid token
      localStorage.removeItem('remoteControlToken');
      throw error;
    }
  };

  const handleLogout = () => {
    // Disconnect from socket server
    socketService.disconnect();
    
    // Clear stored token
    localStorage.removeItem('remoteControlToken');
    
    // Reset auth state
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null
    });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="App">
      {authState.isAuthenticated && authState.user ? (
        <ControllerDashboard 
          username={authState.user.username}
          onLogout={handleLogout}
        />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
