package com.remotecontrol.guest.services;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;

import com.remotecontrol.guest.models.ControlEvent;
import com.remotecontrol.guest.utils.EventBroadcaster;
import com.remotecontrol.guest.utils.SessionManager;
import com.google.gson.Gson;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

public class WebSocketService extends Service {
    
    private static final String TAG = "WebSocketService";
    private static final String SERVER_URL = "ws://192.168.137.3:3001"; // Corrected to actual Mac IP
    
    private WebSocketClient webSocketClient;
    private Gson gson;
    private SessionManager sessionManager;
    private boolean isConnected = false;
    
    @Override
    public void onCreate() {
        super.onCreate();
        gson = new Gson();
        sessionManager = SessionManager.getInstance(this);
        
        // Register for frame broadcasts
        EventBroadcaster.getInstance().setFrameListener(this::sendFrame);
        
        connectToServer();
    }
    
    private void connectToServer() {
        try {
            URI serverUri = URI.create(SERVER_URL);
            
            // Add authentication header
            Map<String, String> headers = new HashMap<>();
            headers.put("Authorization", "Bearer " + sessionManager.getAuthToken());
            
            webSocketClient = new WebSocketClient(serverUri, headers) {
                @Override
                public void onOpen(ServerHandshake handshake) {
                    Log.d(TAG, "WebSocket connected to server");
                    isConnected = true;
                    authenticateAndCreateSession();
                }
                
                @Override
                public void onMessage(String message) {
                    handleServerMessage(message);
                }
                
                @Override
                public void onClose(int code, String reason, boolean remote) {
                    Log.d(TAG, "WebSocket disconnected: " + reason);
                    isConnected = false;
                    
                    // Attempt to reconnect after delay
                    new android.os.Handler().postDelayed(() -> {
                        if (!isConnected) {
                            connectToServer();
                        }
                    }, 5000);
                }
                
                @Override
                public void onError(Exception ex) {
                    Log.e(TAG, "WebSocket error", ex);
                    isConnected = false;
                }
            };
            
            webSocketClient.connect();
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to connect to server", e);
        }
    }
    
    private void authenticateAndCreateSession() {
        // Request guest authentication token from server
        Map<String, Object> authRequest = new HashMap<>();
        authRequest.put("type", "authenticate");
        authRequest.put("role", "guest");
        authRequest.put("deviceInfo", getDeviceInfo());
        
        sendMessage(authRequest);
    }
    
    private void handleServerMessage(String message) {
        try {
            Map<String, Object> data = gson.fromJson(message, Map.class);
            String type = (String) data.get("type");
            
            Log.d(TAG, "Received message type: " + type);
            
            switch (type) {
                case "auth-success":
                    handleAuthSuccess(data);
                    break;
                case "session-created":
                    handleSessionCreated(data);
                    break;
                case "controller-joined":
                    handleControllerJoined(data);
                    break;
                case "control-event":
                    handleControlEvent(data);
                    break;
                case "webrtc-signal":
                    handleWebRTCSignal(data);
                    break;
                case "quality-change":
                    handleQualityChange(data);
                    break;
                default:
                    Log.w(TAG, "Unknown message type: " + type);
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error handling server message", e);
        }
    }
    
    private void handleAuthSuccess(Map<String, Object> data) {
        String token = (String) data.get("token");
        sessionManager.setAuthToken(token);
        
        // Create session
        createSession();
    }
    
    private void createSession() {
        Map<String, Object> sessionRequest = new HashMap<>();
        sessionRequest.put("type", "create-session");
        
        sendMessage(sessionRequest);
    }
    
    private void handleSessionCreated(Map<String, Object> data) {
        String sessionCode = (String) data.get("sessionCode");
        sessionManager.setCurrentSession(sessionCode);
        
        Log.d(TAG, "Session created with code: " + sessionCode);
        
        // Broadcast session code to UI
        Intent intent = new Intent("SESSION_CODE_RECEIVED");
        intent.putExtra("sessionCode", sessionCode);
        sendBroadcast(intent);
    }
    
    private void handleControllerJoined(Map<String, Object> data) {
        String controllerId = (String) data.get("controllerId");
        
        Log.d(TAG, "Controller joined: " + controllerId);
        
        // Broadcast to UI
        Intent intent = new Intent("CONTROLLER_JOINED");
        intent.putExtra("controllerId", controllerId);
        sendBroadcast(intent);
    }
    
    private void handleControlEvent(Map<String, Object> data) {
        try {
            ControlEvent event = gson.fromJson(gson.toJson(data), ControlEvent.class);
            EventBroadcaster.getInstance().broadcastControlEvent(event);
        } catch (Exception e) {
            Log.e(TAG, "Error parsing control event", e);
        }
    }
    
    private void handleWebRTCSignal(Map<String, Object> data) {
        // Handle WebRTC signaling for direct peer connection
        Log.d(TAG, "WebRTC signal received: " + data);
        // TODO: Implement WebRTC handling
    }
    
    private void handleQualityChange(Map<String, Object> data) {
        String quality = (String) data.get("quality");
        EventBroadcaster.getInstance().broadcastQualityChange(quality);
    }
    
    private void sendFrame(byte[] frameData) {
        if (isConnected && webSocketClient != null) {
            try {
                // Send frame as binary data
                webSocketClient.send(frameData);
            } catch (Exception e) {
                Log.e(TAG, "Error sending frame", e);
            }
        }
    }
    
    private void sendMessage(Map<String, Object> message) {
        if (isConnected && webSocketClient != null) {
            try {
                String json = gson.toJson(message);
                webSocketClient.send(json);
            } catch (Exception e) {
                Log.e(TAG, "Error sending message", e);
            }
        }
    }
    
    private Map<String, Object> getDeviceInfo() {
        Map<String, Object> deviceInfo = new HashMap<>();
        deviceInfo.put("model", android.os.Build.MODEL);
        deviceInfo.put("manufacturer", android.os.Build.MANUFACTURER);
        deviceInfo.put("androidVersion", android.os.Build.VERSION.RELEASE);
        deviceInfo.put("sdkVersion", android.os.Build.VERSION.SDK_INT);
        return deviceInfo;
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        
        if (webSocketClient != null) {
            webSocketClient.close();
        }
        
        Log.d(TAG, "WebSocket service destroyed");
    }
    
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
