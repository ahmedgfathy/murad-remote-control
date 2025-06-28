import { WebSocketServer } from 'ws';
import { Server } from 'http';
import { sessionManager } from './sessionManager';
import { config } from '../config';

interface AndroidClient {
  ws: any;
  userId: string;
  sessionId?: string;
  authenticated: boolean;
}

const androidClients = new Map<string, AndroidClient>();

export const setupAndroidWebSocketServer = (server: Server) => {
  const wss = new WebSocketServer({ 
    server,
    path: '/android' // Android clients will connect to ws://host:port/android
  });

  wss.on('connection', async (ws, req) => {
    console.log('📱 Android client attempting connection');
    
    const clientId = generateClientId();
    
    // Generate session code immediately for Android client
    const sessionCode = generateSessionCode();
    const sessionId = `android_${Date.now()}`;
    
    const client: AndroidClient = {
      ws,
      userId: clientId,
      sessionId: sessionId,
      authenticated: true // Skip auth for now to fix connection
    };
    
    androidClients.set(clientId, client);

    // Create session in session manager
    const session = await sessionManager.createSession(clientId);
    
    // Update session with our generated code
    session.code = sessionCode;

    console.log(`📱 Created session ${sessionCode} for Android client ${clientId}`);

    // Send session code to Android app immediately
    sendMessage(ws, {
      type: 'session_created',
      sessionCode: sessionCode,
      sessionId: sessionId,
      status: 'connected'
    });

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await handleAndroidMessage(clientId, message);
      } catch (error) {
        console.error('Error parsing Android message:', error);
        sendError(ws, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      console.log(`📱 Android client disconnected: ${clientId}`);
      androidClients.delete(clientId);
    });

    ws.on('error', (error) => {
      console.error('Android WebSocket error:', error);
      androidClients.delete(clientId);
    });
  });

  return wss;
};

async function handleAndroidMessage(clientId: string, message: any) {
  const client = androidClients.get(clientId);
  if (!client) return;

  console.log('📱 Android message:', message.type);

  switch (message.type) {
    case 'authenticate':
      await handleAuthentication(clientId, message);
      break;
    case 'create-session':
      await handleCreateSession(clientId);
      break;
    default:
      console.log('Unknown Android message type:', message.type);
  }
}

async function handleAuthentication(clientId: string, message: any) {
  const client = androidClients.get(clientId);
  if (!client) return;

  try {
    // Generate a guest token - simplified version
    const userId = generateUserId();
    
    client.userId = userId;
    client.authenticated = true;

    // Send authentication success
    sendMessage(client.ws, {
      type: 'auth-success',
      userId: userId,
      status: 'authenticated'
    });

    console.log(`✅ Android client authenticated: ${userId}`);
  } catch (error) {
    console.error('Authentication error:', error);
    sendError(client.ws, 'Authentication failed');
  }
}

async function handleCreateSession(clientId: string) {
  const client = androidClients.get(clientId);
  if (!client) {
    console.error('Client not found:', clientId);
    return;
  }
  
  if (!client.authenticated) {
    return sendError(client.ws, 'Not authenticated');
  }

  try {
    // Create session using the session manager
    const session = await sessionManager.createSession(client.userId);
    client.sessionId = session.id;

    // Send session created response
    sendMessage(client.ws, {
      type: 'session-created',
      sessionCode: session.code,
      sessionId: session.id
    });

    console.log(`📱 Android session created: ${session.code} for user ${client.userId}`);
  } catch (error) {
    console.error('Session creation error:', error);
    sendError(client.ws, 'Failed to create session');
  }
}

function sendMessage(ws: any, message: any) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function sendError(ws: any, error: string) {
  sendMessage(ws, {
    type: 'error',
    error
  });
}

function generateClientId(): string {
  return 'android_' + Math.random().toString(36).substr(2, 9);
}

function generateUserId(): string {
  return 'guest_' + Math.random().toString(36).substr(2, 9);
}

function generateSessionCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
