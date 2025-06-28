# 📱 Android Plugin Installation Guide for Driver's Mobile

## 🎯 Setup Overview

**Your Network Configuration:**
- **Your Laptop (Controller)**: 192.168.1.5 - Web interface to view/control
- **Driver's Mobile (Guest)**: 192.168.1.4 - Android plugin to share screen
- **Backend Server**: 192.168.1.5:3001 - Signaling and session management
- **Web Controller**: 192.168.1.5:3000 - Your control dashboard

## 📦 APK Installation on Driver's Mobile

### Option 1: Direct Transfer (Recommended)
1. **Copy APK to driver's device:**
   ```bash
   # Location of APK file:
   /Users/ahmedgomaa/Downloads/murad/android-plugin/app/build/outputs/apk/debug/app-debug.apk
   ```

2. **Transfer methods:**
   - **USB Transfer**: Connect driver's phone to computer, copy APK to Downloads folder
   - **Cloud Share**: Upload to Google Drive/Dropbox and download on driver's phone
   - **Email**: Send APK as email attachment to driver
   - **AirDrop/Bluetooth**: Direct wireless transfer

### Option 2: Using ADB (if driver's phone has USB debugging enabled)
```bash
# Connect driver's phone via USB
adb devices

# Install APK directly
adb install -r /Users/ahmedgomaa/Downloads/murad/android-plugin/app/build/outputs/apk/debug/app-debug.apk
```

## 🔧 Driver's Mobile Setup Steps

### 1. Enable Unknown Sources
- Go to **Settings** > **Security** > **Unknown Sources** (Enable)
- Or **Settings** > **Apps** > **Special Access** > **Install Unknown Apps**

### 2. Install APK
- Locate the `app-debug.apk` file in Downloads
- Tap to install
- Grant installation permission if prompted

### 3. Grant Required Permissions
The app will request these critical permissions:

#### A. Screen Recording Permission
- **MediaProjection API** for screen capture
- Tap **Allow** when "Start Recording" dialog appears

#### B. Overlay Permission
- **System Alert Window** permission
- Settings > Apps > Remote Control Guest > Permissions > Display over other apps > **Allow**

#### C. Accessibility Service
- **Most Important** - for touch injection
- Settings > Accessibility > Remote Control Guest > **Turn On**
- This allows the web interface to control the phone

### 4. Start Remote Control Service
- Open "Remote Control Guest" app
- Tap **"Start Service"** button
- Note the **6-digit session code** that appears (e.g., "123456")

## 🌐 Web Interface Connection (Your Laptop)

### 1. Open Controller Dashboard
- Open browser: http://192.168.1.5:3000
- You should see the Remote Control dashboard

### 2. Enter Session Code
- Enter the 6-digit code from driver's phone
- Click **"Connect"** button

### 3. Expected Results
- ✅ Live screen sharing from driver's phone
- ✅ Click/touch control via web interface
- ✅ Real-time remote control functionality

## 🔍 Connection Flow

```
Driver's Phone (192.168.1.4)
    ↓ WebSocket Connection
Backend Server (192.168.1.5:3001)
    ↓ Session Management
Your Web Interface (192.168.1.5:3000)
    ↓ WebRTC P2P
Driver's Phone ←→ Your Laptop
```

## 🧪 Testing Checklist

### Pre-Connection
- [ ] Both devices on same WiFi network (192.168.1.x)
- [ ] Backend server running (shows both IPs in CORS)
- [ ] Web interface accessible at 192.168.1.5:3000
- [ ] APK installed on driver's phone

### During Connection
- [ ] Driver starts service and gets session code
- [ ] You enter code in web interface
- [ ] Connection establishes successfully
- [ ] Screen sharing works
- [ ] Touch control works

## 🚨 Troubleshooting

### If Connection Fails
1. **Check Network**: Both devices must be on same WiFi (192.168.1.x)
2. **Check Permissions**: All Android permissions must be granted
3. **Check Session Code**: Must be entered correctly (6 digits)
4. **Check Backend**: Should show connection logs in terminal

### Common Issues
- **"Failed to connect"**: Network or firewall issue
- **"No session code"**: WebSocket connection failed
- **"Screen not sharing"**: MediaProjection permission denied
- **"Can't control phone"**: Accessibility service not enabled

### Log Checking
```bash
# Check backend logs
# Look at terminal where backend is running

# Check Android logs (if ADB available)
adb logcat | grep -E "(RemoteControl|WebSocket)"
```

## 🔧 Network Configuration Details

### Backend CORS Configuration ✅
```
✅ http://localhost:3000
✅ http://localhost:3001  
✅ http://localhost:8081
✅ http://192.168.1.5:3000  ← Your web interface
✅ http://192.168.1.5:3001  ← Your backend
✅ http://192.168.1.4:3000  ← Driver's device access
✅ http://192.168.1.4:3001  ← Driver's device access
```

### Android APK Configuration ✅
```java
WebSocket URL: ws://192.168.1.5:3001
```

## 🎯 Expected User Experience

1. **Driver**: Installs APK, grants permissions, starts service, shares session code
2. **You**: Opens web interface, enters session code, gains remote control
3. **Result**: You can see and control driver's phone from your laptop browser

---

**Status**: System fully configured and ready for driver's mobile installation.
**APK Location**: `/Users/ahmedgomaa/Downloads/murad/android-plugin/app/build/outputs/apk/debug/app-debug.apk`
**Backend**: Running with proper CORS for both devices ✅
