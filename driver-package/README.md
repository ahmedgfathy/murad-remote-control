# 📱 Remote Control Driver Plugin Package

## 📦 Contents
- **RemoteControlPlugin.apk** - The main application to install on driver's phone
- **DRIVER_INSTALLATION_GUIDE.md** - Complete installation instructions

## 🚀 Quick Install (For Driver)
1. Transfer `RemoteControlPlugin.apk` to your Android phone
2. Enable "Unknown Sources" in phone settings
3. Tap the APK file to install
4. Grant all requested permissions
5. Open app and tap "Start Service"
6. Share the 6-digit code with administrator

## 🔧 Administrator Setup
- **Web Interface**: http://192.168.1.5:3000
- **Backend Server**: Running on 192.168.1.5:3001
- **Network**: Both devices must be on same WiFi (192.168.1.x)

## 📋 Connection Flow
1. **Driver** installs APK and starts service → Gets session code
2. **Administrator** opens web interface → Enters session code
3. **Connection established** → Real-time screen sharing and control

---
**File Size**: ~6MB  
**Android Version**: 5.0+ required  
**Permissions**: Screen capture, Accessibility, Overlay  
**Network**: WiFi connection required
