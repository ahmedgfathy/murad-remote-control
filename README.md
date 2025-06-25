# Remote Mobile Control System

A complete remote control system similar to AnyDesk, enabling full control of Android devices from web browsers or mobile apps.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Interface │    │  Mobile App     │    │  Android APK    │
│   (Controller)  │    │  (Controller)   │    │    (Guest)      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────┬───────────┴──────────────────────┘
                     │
          ┌─────────────────┐
          │  Backend Server │
          │ (Node.js + WS)  │
          └─────────────────┘
```

## 📦 Components

### 1. Backend Server (`backend/`)
- **Technology**: Node.js + TypeScript + Socket.IO + Express
- **Purpose**: Signaling server for WebRTC connections and session management
- **Features**:
  - JWT authentication
  - Session code generation (6-digit codes)
  - WebRTC signaling relay
  - Real-time control event forwarding
  - Rate limiting and security middleware

### 2. Web Interface (`web-interface/`)
- **Technology**: React + TypeScript + Socket.IO Client + WebRTC
- **Purpose**: Web-based controller dashboard
- **Features**:
  - Real-time screen viewing via Canvas API
  - Touch/click event transmission
  - Session joining with codes
  - Quality control (low/medium/high)
  - Responsive design

### 3. Mobile App (`mobile-app/`)
- **Technology**: React Native + TypeScript + Socket.IO Client
- **Purpose**: Cross-platform mobile controller interface
- **Features**:
  - Native mobile UI optimized for touch
  - Real-time screen viewing with gesture controls
  - Session management and authentication
  - Quality adjustment controls
  - Works on both iOS and Android platforms
  - AsyncStorage for session persistence

### 4. Android APK (`android-plugin/`)
- **Technology**: Native Android (Java) + MediaProjection API + Accessibility Service
- **Purpose**: Guest device plugin for screen sharing and remote control
- **Features**:
  - Screen capture via MediaProjection API
  - Touch injection via Accessibility Service
  - Real-time frame encoding and streaming
  - Session management
  - Foreground service for continuous operation

## ✅ Component Status

| Component | Status | Features |
|-----------|--------|----------|
| 🔧 **Backend Server** | ✅ **Complete** | JWT auth, WebSocket, session management |
| 🌐 **Web Interface** | ✅ **Complete** | Canvas rendering, touch control, quality settings |
| 📱 **Mobile App** | ✅ **Complete** | React Native, gesture control, cross-platform |
| 🤖 **Android APK** | ✅ **Complete** | Screen capture, touch injection, system integration |

**All components are fully implemented and tested!**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Android Studio (for APK development)
- Modern web browser with WebRTC support

### 1. Setup Backend Server

```bash
cd backend
npm install
npm run dev
```

The server will start on http://localhost:3001

### 2. Setup Web Interface

```bash
cd web-interface
npm install
npm start
```

The web app will start on http://localhost:3000

### 3. Setup Mobile App (Optional)

```bash
cd mobile-app
npm install

# For Android
npm run android

# For iOS (macOS only)
cd ios && pod install && cd ..
npm run ios
```

### 4. Build Android APK

```bash
cd android-plugin
./gradlew assembleDebug
```

Install the generated APK on the guest Android device.

## 🔧 Configuration

### Backend Environment Variables (`.env`)
```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
```

### Web Interface Environment Variables (`.env`)
```env
REACT_APP_SERVER_URL=http://localhost:3001
REACT_APP_API_URL=http://localhost:3001/api
```

### Android Configuration
Update the server URL in `WebSocketService.java`:
```java
private static final String SERVER_URL = "ws://YOUR_SERVER_IP:3001";
```

## 📱 Usage Flow

### For Guest (Android Device)
1. Install and open the Android APK
2. Grant required permissions:
   - Screen capture (MediaProjection)
   - Accessibility service
   - Overlay window
   - Storage access
3. Tap "Start Remote Control"
4. Share the generated 6-digit session code

### For Controller (Web/Mobile)
1. Open the web interface or mobile app
2. Enter your username to authenticate
3. Enter the 6-digit session code
4. Start controlling the remote device!

## 🔒 Security Features

- **Encrypted Communication**: All data transmitted over TLS/SSL
- **JWT Authentication**: Secure token-based authentication
- **Session Expiration**: Automatic session cleanup after 30 minutes
- **Permission Validation**: Strict permission checks on Android
- **Rate Limiting**: Prevents abuse and DDoS attacks

## 🛠️ Required Android Permissions

The Android APK requires these critical permissions:

```xml
<!-- Network communication -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Screen capture -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />

<!-- File access -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

<!-- System overlay and services -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

<!-- Accessibility for touch injection -->
<uses-permission android:name="android.permission.BIND_ACCESSIBILITY_SERVICE" />
```

## 🔧 Development Setup

### Backend Development
```bash
cd backend
npm run dev    # Start with hot reload
npm run build  # Build TypeScript
npm test       # Run tests
```

### Web Interface Development
```bash
cd web-interface
npm start      # Start development server
npm run build  # Build for production
npm test       # Run tests
```

### Android Development
```bash
cd android-plugin
./gradlew assembleDebug    # Build debug APK
./gradlew assembleRelease  # Build release APK
./gradlew installDebug     # Install on connected device
```

## 📊 Technical Details

### WebRTC Data Flow
1. Guest starts screen capture using MediaProjection API
2. Frames are encoded as JPEG and sent via WebSocket
3. Controller receives frames and renders on Canvas
4. Controller sends touch events via WebSocket
5. Guest executes touch events using Accessibility Service

### Session Management
- Sessions use 6-digit numeric codes for easy sharing
- Automatic cleanup of expired sessions
- Support for session reconnection
- Real-time status updates

### Performance Optimizations
- Configurable frame rate (default: 30 FPS)
- Quality adjustment (low/medium/high)
- Efficient bitmap encoding
- Background service optimization

## 🚨 Important Notes

### Legal Considerations
- **Explicit Consent Required**: Guest must explicitly allow remote access
- **Clear Permission Requests**: All permissions must be transparently requested
- **Compliance**: Ensure compliance with local privacy laws

### Technical Limitations
- **Android 7.0+**: Accessibility gesture dispatch requires API level 24+
- **Google Play Policy**: Apps with remote control may be restricted on Play Store
- **Root Access**: Some advanced features may require root access
- **Network Dependency**: Requires stable internet connection

### Distribution
- **Private Distribution**: Recommended for internal/private use
- **Enterprise Distribution**: Consider enterprise app distribution
- **Sideloading**: Users must enable "Unknown Sources" for APK installation

## 🔍 Troubleshooting

### Common Issues

**1. WebSocket Connection Failed**
- Check server URL configuration
- Verify network connectivity
- Ensure server is running

**2. Screen Capture Permission Denied**
- Grant MediaProjection permission
- Check Android version compatibility
- Restart the app after granting permissions

**3. Touch Events Not Working**
- Enable Accessibility Service in system settings
- Verify Accessibility Service permissions
- Check Android API level compatibility

**4. Poor Video Quality**
- Adjust quality settings in controller
- Check network bandwidth
- Reduce frame rate if needed

### Debug Logs
Enable debug logging in Android:
```java
Log.d(TAG, "Debug message");
```

Check browser console for web interface errors.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This software is provided for educational and legitimate remote support purposes only. Users are responsible for ensuring compliance with applicable laws and regulations. The developers are not responsible for any misuse of this software.
