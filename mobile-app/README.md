# Remote Control Mobile App

React Native mobile controller application for the Remote Mobile Control System.

## Features

- **Mobile Remote Control**: Control remote devices directly from your mobile phone
- **Touch Gestures**: Full touch gesture support for remote device interaction
- **Real-time Screen Sharing**: View remote device screens in real-time
- **Session Management**: Join existing sessions or create new ones
- **Quality Control**: Adjustable streaming quality (low/medium/high)
- **Secure Authentication**: JWT-based authentication system
- **Cross-platform**: Works on both iOS and Android

## Prerequisites

- Node.js 16+ and npm
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development on macOS)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **iOS Setup (macOS only):**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Android Setup:**
   - Ensure Android Studio is installed
   - Set up Android SDK and emulator

## Running the App

### Development Mode

1. **Start Metro bundler:**
   ```bash
   npm start
   ```

2. **Run on Android:**
   ```bash
   npm run android
   ```

3. **Run on iOS (macOS only):**
   ```bash
   npm run ios
   ```

## Usage

### Login as Controller
1. Open the app
2. Enter your username and password
3. Tap "Login as Controller"

### Join Session
1. After logging in, enter a 6-digit session code
2. Tap "Join Session"
3. Start controlling the remote device

### Create Session
1. After logging in, tap "Create Session"
2. Share the generated session code with the device you want to control
3. Wait for the device to connect

## App Structure

```
src/
├── App.tsx                    # Main app component with navigation
├── contexts/
│   └── AuthContext.tsx       # Authentication context
├── screens/
│   ├── LoginScreen.tsx       # Login and session management
│   └── ControllerScreen.tsx  # Remote control interface
├── services/
│   ├── apiService.ts         # HTTP API client
│   └── socketService.ts      # WebSocket communication
└── types/
    └── index.ts              # TypeScript type definitions
```

## Configuration

The app connects to the backend server at `http://localhost:3001` by default. To change this:

1. Edit `src/services/apiService.ts`
2. Edit `src/services/socketService.ts`
3. Update the `API_BASE_URL` and `SOCKET_URL` constants

## Integration with Backend

This mobile app works with:
- **Backend Server**: Node.js + Express + Socket.IO
- **Web Interface**: React web controller
- **Android Plugin**: Native Android APK for guest devices

Make sure all components are running for full functionality.