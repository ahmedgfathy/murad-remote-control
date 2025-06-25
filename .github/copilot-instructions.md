<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Remote Mobile Control System - Copilot Instructions

This is a multi-component remote mobile control system similar to AnyDesk, consisting of:

## Project Structure
- `backend/` - Node.js + TypeScript signaling server with WebSocket/WebRTC
- `web-interface/` - React + TypeScript web controller dashboard
- `mobile-app/` - React Native mobile controller interface
- `android-plugin/` - Native Android APK for guest device control

## Key Technologies
- **Backend**: Express, Socket.IO, WebRTC signaling, JWT authentication
- **Web**: React, TypeScript, WebRTC, Canvas API for screen rendering
- **Mobile**: React Native, WebRTC, native Android bridge
- **Android**: MediaProjection API, AccessibilityService, foreground services

## Architecture Patterns
- Use WebRTC for peer-to-peer screen streaming
- Socket.IO for signaling and control commands
- JWT tokens for authentication and session management
- Canvas API for rendering remote screen content
- Accessibility Service API for touch injection on Android

## Security Considerations
- All communications must be encrypted (TLS/SSL)
- Implement proper permission checks for Android APIs
- Use secure token-based authentication
- Validate all remote control commands

## Code Style
- Use TypeScript with strict mode enabled
- Follow React functional components with hooks
- Implement proper error handling and logging
- Use async/await for asynchronous operations
- Follow Android development best practices for system-level APIs
