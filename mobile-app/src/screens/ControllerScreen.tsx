import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from 'react-native-gesture-handler';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {useAuth} from '../contexts/AuthContext';
import {socketService} from '../services/socketService';
import {ControlEvent, ScreenFrame} from '../types';
import {RootStackParamList} from '../App';

type ControllerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Controller'>;
type ControllerScreenRouteProp = RouteProp<RootStackParamList, 'Controller'>;

interface Props {
  navigation: ControllerScreenNavigationProp;
  route: ControllerScreenRouteProp;
}

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const controlAreaHeight = screenHeight - 200; // Leave space for controls

const ControllerScreen: React.FC<Props> = ({navigation, route}) => {
  const {sessionCode} = route.params;
  const {token, logout} = useAuth();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentFrame, setCurrentFrame] = useState<ScreenFrame | null>(null);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...');

  const panRef = useRef<PanGestureHandler>(null);

  useEffect(() => {
    if (!token) {
      navigation.navigate('Login');
      return;
    }

    initializeConnection();

    return () => {
      socketService.disconnect();
    };
  }, [token, sessionCode]);

  const initializeConnection = () => {
    socketService.connect(token!);

    socketService.on('connect', () => {
      setIsConnected(true);
      setConnectionStatus('Connected');
      joinSession();
    });

    socketService.on('disconnect', () => {
      setIsConnected(false);
      setIsSessionActive(false);
      setConnectionStatus('Disconnected');
    });

    socketService.on('join-session-success', (data) => {
      setIsSessionActive(true);
      setConnectionStatus(`Session ${sessionCode} active`);
      Alert.alert('Success', 'Successfully joined remote control session!');
    });

    socketService.on('join-session-error', (data) => {
      Alert.alert('Session Error', data.error);
      setConnectionStatus('Session failed');
    });

    socketService.on('screen-frame', (frame: ScreenFrame) => {
      setCurrentFrame(frame);
    });

    socketService.on('error', (data) => {
      Alert.alert('Connection Error', data.message);
      setConnectionStatus('Error');
    });
  };

  const joinSession = () => {
    socketService.emit('join-session', {sessionCode});
  };

  const sendControlEvent = (event: ControlEvent) => {
    if (isSessionActive) {
      socketService.emit('control-event', event);
    }
  };

  const handlePanGesture = (event: PanGestureHandlerGestureEvent) => {
    const {state, translationX, translationY, absoluteX, absoluteY} = event.nativeEvent;
    
    // Convert screen coordinates to remote device coordinates
    let x = absoluteX;
    let y = absoluteY - 100; // Adjust for header
    
    // Scale coordinates if we know the remote screen size
    if (currentFrame) {
      x = (x / screenWidth) * currentFrame.width;
      y = (y / controlAreaHeight) * currentFrame.height;
    }

    switch (state) {
      case State.BEGAN:
        sendControlEvent({
          type: 'touch',
          x: Math.round(x),
          y: Math.round(y),
          action: 'down',
        });
        break;
      
      case State.ACTIVE:
        sendControlEvent({
          type: 'touch',
          x: Math.round(x),
          y: Math.round(y),
          action: 'move',
        });
        break;
      
      case State.END:
      case State.CANCELLED:
        sendControlEvent({
          type: 'touch',
          x: Math.round(x),
          y: Math.round(y),
          action: 'up',
        });
        break;
    }
  };

  const handleQualityChange = (newQuality: 'low' | 'medium' | 'high') => {
    setQuality(newQuality);
    // Send quality preference to remote device
    socketService.emit('control-event', {
      type: 'quality-change',
      quality: newQuality,
    } as any);
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect',
      'Are you sure you want to disconnect from the remote session?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            socketService.disconnect();
            navigation.navigate('Login');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? This will end the current session.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            socketService.disconnect();
            logout();
            navigation.navigate('Login');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {connectionStatus} {isSessionActive && `• ${quality.toUpperCase()}`}
        </Text>
        <View style={styles.statusIndicator}>
          <View
            style={[
              styles.connectionDot,
              {backgroundColor: isConnected ? '#10b981' : '#ef4444'},
            ]}
          />
        </View>
      </View>

      {/* Remote Screen Display */}
      <View style={styles.screenContainer}>
        <PanGestureHandler
          ref={panRef}
          onGestureEvent={handlePanGesture}
          enabled={isSessionActive}
        >
          <View style={styles.touchArea}>
            {currentFrame ? (
              <Image
                source={{uri: `data:image/jpeg;base64,${currentFrame.data}`}}
                style={styles.screenImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.placeholderScreen}>
                <Text style={styles.placeholderText}>
                  {isSessionActive
                    ? 'Waiting for screen...'
                    : 'Connecting to remote device...'}
                </Text>
              </View>
            )}
          </View>
        </PanGestureHandler>
      </View>

      {/* Control Panel */}
      <View style={styles.controlPanel}>
        {/* Quality Controls */}
        <View style={styles.qualityControls}>
          <Text style={styles.controlLabel}>Quality:</Text>
          <View style={styles.qualityButtons}>
            {(['low', 'medium', 'high'] as const).map((q) => (
              <TouchableOpacity
                key={q}
                style={[
                  styles.qualityButton,
                  quality === q && styles.qualityButtonActive,
                ]}
                onPress={() => handleQualityChange(q)}
              >
                <Text
                  style={[
                    styles.qualityButtonText,
                    quality === q && styles.qualityButtonTextActive,
                  ]}
                >
                  {q.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.disconnectButton]}
            onPress={handleDisconnect}
          >
            <Text style={styles.actionButtonText}>Disconnect</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.actionButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1f2937',
  },
  statusText: {
    color: '#f3f4f6',
    fontSize: 14,
    fontWeight: '500',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#111827',
  },
  touchArea: {
    flex: 1,
  },
  screenImage: {
    width: '100%',
    height: '100%',
  },
  placeholderScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  controlPanel: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  qualityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlLabel: {
    color: '#f3f4f6',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 12,
  },
  qualityButtons: {
    flexDirection: 'row',
    flex: 1,
  },
  qualityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    borderRadius: 6,
    backgroundColor: '#374151',
    alignItems: 'center',
  },
  qualityButtonActive: {
    backgroundColor: '#2563eb',
  },
  qualityButtonText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
  },
  qualityButtonTextActive: {
    color: '#ffffff',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  disconnectButton: {
    backgroundColor: '#f59e0b',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ControllerScreen;
