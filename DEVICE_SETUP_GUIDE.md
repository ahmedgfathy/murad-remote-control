# 📱 Android Device Setup Guide

## Updated APK with All Fixes ✅

The APK has been rebuilt with the following improvements:
- **✅ Proper App Icon**: Professional remote control icon with device and signal waves
- **✅ All Required Permissions**: Camera, microphone, location, wifi, storage, phone state, etc.
- **✅ Clickable Buttons**: Fixed button responsiveness issues
- **✅ Better Permission Handling**: Step-by-step permission requests

## 📥 Installation Steps

### 1. Transfer APK to Your Device
```bash
# APK Location on Mac:
/Users/ahmedgomaa/Downloads/murad/android-plugin/app/build/outputs/apk/debug/app-debug.apk

# Transfer methods:
# - Email to yourself and download on phone
# - Use Google Drive/Dropbox
# - Connect USB and copy to Downloads folder
# - Use ADB if device is connected: adb install app-debug.apk
```

### 2. Enable Unknown Sources
1. Go to **Settings** → **Security** (or **Privacy**)
2. Enable **Unknown Sources** or **Install from Unknown Sources**
3. Or when prompted during install, tap **Allow**

### 3. Install the APK
1. Open **File Manager** on your device
2. Navigate to **Downloads** folder
3. Tap **app-debug.apk**
4. Tap **Install**
5. You should now see **"Remote Control Guest"** app with a proper icon

## 🔧 App Setup & Permissions

### 4. Launch the App
- Look for **"Remote Control Guest"** with the blue circular icon
- The app should no longer appear as a white circle

### 5. Grant All Permissions (Step by Step)
The app will now request these permissions:

#### **Initial Permissions**:
- ✅ **Camera** - For potential video streaming
- ✅ **Microphone** - For audio capture
- ✅ **Location** - For network discovery
- ✅ **Storage** - For file access
- ✅ **Phone State** - For device information
- ✅ **WiFi State** - For network connectivity

#### **System Permissions** (Tap buttons to grant):
1. **Tap "Start Remote Control"** → Grant **Screen Recording** permission
2. **Tap "Settings"** → Enable **Accessibility Service**:
   - Go to **Settings** → **Accessibility** → **Downloaded Apps** (or **Installed Services**)
   - Find **"Remote Control Guest"** 
   - Toggle **ON** the switch
   - Confirm with **"OK"** when prompted
   - **Important**: Make sure the toggle stays ON and shows as enabled
3. **System Alert Window** permission (overlay permission)

**📋 Accessibility Service Troubleshooting:**
- If you don't see "Remote Control Guest" in accessibility list, restart your device
- If the toggle turns off immediately, try disabling other accessibility services first
- The service name should appear as "Remote Control Guest" or "RemoteControlAccessibilityService"
- Make sure you're looking in the right section (Downloaded Apps/Installed Services, not System services)

### 6. Verify All Permissions
- All buttons should now be **clickable**
- Status should show permission requirements clearly
- App should display your device's **6-digit session code**

## 🌐 Network Connection

### 7. Make Sure Both Devices Are on Same WiFi
- **Your Mac**: Connected to WiFi (IP: 192.168.90.170)
- **Your Android**: Connected to **same WiFi network**

### 8. Test Backend Connection
Your backend is running correctly:
- ✅ **Backend Server**: http://192.168.90.170:3001 ✅
- ✅ **Web Interface**: http://192.168.90.170:3000 ✅

### 9. Connection Flow
1. **Android App**: 
   - Grant all permissions
   - Tap **"Start Remote Control"**
   - Note the **6-digit session code** (e.g., "123456")

2. **Web Browser** (on Mac or another device):
   - Open: http://192.168.90.170:3000
   - Enter the **6-digit session code**
   - Click **"Connect"**

## 🐛 Troubleshooting

### **🚨 ACCESSIBILITY SERVICE POPUP ISSUE - FIXED**

If you're getting repeated popups asking to enable accessibility service:

**📱 Updated APK Solution:**
1. **Install the latest APK** (just rebuilt with fixes)
2. The app now **detects accessibility service better**
3. **Warnings instead of blocking** - app will warn but let you proceed
4. **Debug logging** - check Android logs to see what's happening

**🔧 Manual Steps:**
1. **Uninstall** the old app completely
2. **Install** the new APK
3. **Enable accessibility service**:
   - Settings → Accessibility → Downloaded Apps
   - Find **"Remote Control Guest"**
   - Toggle **ON**
   - Confirm **"OK"**
4. **Force close and reopen** the app
5. Try **"Start Remote Control"** again

**🔍 Debugging Steps:**
If still having issues, you can check the Android logs:
```bash
# Connect your device and run:
adb logcat -s MainActivity:D RemoteControlAccessibility:D
```

This will show you exactly what the app is detecting.

### If Buttons Still Don't Work:
1. **Force close** the app completely
2. **Reopen** the app
3. Try tapping **"Settings"** first to enable accessibility
4. Then try **"Start Remote Control"**

### If App Icon Still Shows as White Circle:
1. **Uninstall** the old app completely
2. **Restart** your device
3. **Reinstall** the new APK

### If Session Code Doesn't Appear:
1. Check **WiFi connection**
2. Verify backend is running: http://192.168.90.170:3001/health
3. Check app permissions are all granted

### Connection Issues:
1. **Same WiFi**: Ensure both devices on same network
2. **Firewall**: Mac firewall might block connections
3. **IP Address**: Verify Mac IP is still 192.168.90.170

## 📋 Quick Test Checklist

- [ ] APK installed with proper name and icon
- [ ] All permissions granted (camera, microphone, location, etc.)
- [ ] Accessibility service enabled
- [ ] Screen recording permission granted
- [ ] Overlay permission granted
- [ ] Both devices on same WiFi
- [ ] Backend server running (192.168.90.170:3001)
- [ ] Web interface accessible (192.168.90.170:3000)
- [ ] 6-digit session code generated
- [ ] Connection established between web and mobile

## 🎯 Expected Result

When everything works:
1. **Android App** shows: "🟢 Remote Control Active" with session code
2. **Web Interface** shows: Connected status with remote screen display
3. **You can control** the Android device from the web browser

Let me know if you encounter any issues with these steps!
