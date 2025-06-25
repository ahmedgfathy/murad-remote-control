import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { socketService } from '../services/socketService';
import { apiService } from '../services/apiService';
import { Session, ControlEvent, WebRTCConfig } from '../types';

const ControllerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
`;

const SessionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  background: ${props => 
    props.status === 'connected' ? '#27ae60' :
    props.status === 'waiting' ? '#f39c12' : '#e74c3c'
  };
  color: white;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  gap: 1rem;
  padding: 1rem;
`;

const ScreenContainer = styled.div`
  flex: 1;
  background: #000;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RemoteScreen = styled.canvas`
  max-width: 100%;
  max-height: 100%;
  cursor: crosshair;
`;

const ControlPanel = styled.div`
  width: 300px;
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ConnectForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  text-align: center;
  letter-spacing: 2px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'warning' }>`
  padding: 10px 16px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          &:hover { transform: translateY(-1px); }
        `;
      case 'warning':
        return `
          background: #e74c3c;
          color: white;
          &:hover { background: #c0392b; }
        `;
      default:
        return `
          background: #ecf0f1;
          color: #2c3e50;
          &:hover { background: #d5dbdb; }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const QualitySelector = styled.select`
  padding: 8px;
  border: 2px solid #ddd;
  border-radius: 5px;
  background: white;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  padding: 10px;
  background: #ffeaa7;
  border-radius: 5px;
  font-size: 14px;
`;

const PlaceholderText = styled.div`
  color: #bdc3c7;
  text-align: center;
  font-size: 1.2rem;
`;

interface ControllerDashboardProps {
  username: string;
  onLogout: () => void;
}

const ControllerDashboard: React.FC<ControllerDashboardProps> = ({ username, onLogout }) => {
  const [sessionCode, setSessionCode] = useState('');
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Setup error handling
    socketService.onError((error) => {
      setError(error.message || 'Socket error occurred');
    });

    socketService.onSessionEnded(() => {
      setCurrentSession(null);
      setError('Session ended by guest');
      cleanupPeerConnection();
    });

    socketService.onPeerDisconnected((data) => {
      if (data.role === 'guest') {
        setCurrentSession(null);
        setError('Guest disconnected');
        cleanupPeerConnection();
      }
    });

    return () => {
      cleanupPeerConnection();
    };
  }, []);

  const cleanupPeerConnection = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(track => track.stop());
      remoteStreamRef.current = null;
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionCode.trim() || sessionCode.length !== 6) {
      setError('Please enter a valid 6-digit session code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const session = await socketService.joinSession(sessionCode.trim());
      setCurrentSession(session);
      await setupWebRTC();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  const setupWebRTC = async () => {
    try {
      const config = await apiService.getWebRTCConfig();
      const peerConnection = new RTCPeerConnection(config);
      peerConnectionRef.current = peerConnection;

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        remoteStreamRef.current = remoteStream;
        
        if (canvasRef.current) {
          const video = document.createElement('video');
          video.srcObject = remoteStream;
          video.play();
          
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const drawFrame = () => {
              if (ctx && video.readyState >= video.HAVE_CURRENT_DATA) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              }
              requestAnimationFrame(drawFrame);
            };
            drawFrame();
          };
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketService.sendWebRTCSignal({
            type: 'ice-candidate',
            data: event.candidate,
            to: currentSession?.guestId || '',
            sessionId: currentSession?.id || ''
          });
        }
      };

      // Handle WebRTC signaling from server
      socketService.onWebRTCSignal(async (signal) => {
        if (signal.type === 'offer') {
          await peerConnection.setRemoteDescription(signal.data);
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          
          socketService.sendWebRTCSignal({
            type: 'answer',
            data: answer,
            to: signal.from,
            sessionId: currentSession?.id || ''
          });
        } else if (signal.type === 'ice-candidate') {
          await peerConnection.addIceCandidate(signal.data);
        }
      });

    } catch (err) {
      console.error('WebRTC setup failed:', err);
      setError('Failed to setup video connection');
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentSession || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const controlEvent: ControlEvent = {
      type: 'touch',
      data: {
        action: 'down',
        x: Math.round(x),
        y: Math.round(y),
        timestamp: Date.now()
      },
      timestamp: Date.now()
    };

    socketService.sendControlEvent(controlEvent);

    // Send touch up event after short delay
    setTimeout(() => {
      socketService.sendControlEvent({
        ...controlEvent,
        data: { ...controlEvent.data, action: 'up' }
      });
    }, 100);
  };

  const handleQualityChange = (newQuality: 'low' | 'medium' | 'high') => {
    setQuality(newQuality);
    socketService.adjustQuality(newQuality);
  };

  const handleDisconnect = () => {
    setCurrentSession(null);
    setSessionCode('');
    cleanupPeerConnection();
  };

  return (
    <ControllerContainer>
      <Header>
        <Title>Remote Controller - {username}</Title>
        <SessionInfo>
          {currentSession && (
            <>
              <span>Session: {currentSession.code}</span>
              <StatusBadge status={currentSession.status}>
                {currentSession.status.toUpperCase()}
              </StatusBadge>
            </>
          )}
          <Button variant="warning" onClick={onLogout}>Logout</Button>
        </SessionInfo>
      </Header>

      <MainContent>
        <ScreenContainer>
          {currentSession ? (
            <RemoteScreen
              ref={canvasRef}
              onClick={handleCanvasClick}
            />
          ) : (
            <PlaceholderText>
              Connect to a session to view remote screen
            </PlaceholderText>
          )}
        </ScreenContainer>

        <ControlPanel>
          <h3>Session Control</h3>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          {!currentSession ? (
            <ConnectForm onSubmit={handleConnect}>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                disabled={loading}
              />
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Connecting...' : 'Connect'}
              </Button>
            </ConnectForm>
          ) : (
            <>
              <div>
                <label>Screen Quality:</label>
                <QualitySelector
                  value={quality}
                  onChange={(e) => handleQualityChange(e.target.value as any)}
                >
                  <option value="low">Low (Fast)</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Slow)</option>
                </QualitySelector>
              </div>
              
              <Button variant="warning" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </>
          )}
        </ControlPanel>
      </MainContent>
    </ControllerContainer>
  );
};

export default ControllerDashboard;
