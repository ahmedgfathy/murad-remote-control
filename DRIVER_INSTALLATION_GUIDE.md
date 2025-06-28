# 📱 Remote Control Plugin - Installation Instructions for Driver

## What is this?
This is a **remote control plugin** that allows authorized administrators to view and control your mobile device remotely, similar to TeamViewer or AnyDesk. This is typically used for:
- Technical support
- Training purposes
- Fleet management
- Remote assistance

## ⚠️ Important Security Information
- This app allows **full remote control** of your device
- Only install if authorized by your organization
- The app requires several sensitive permissions
- You can stop the service at any time

## 📋 Installation Steps

### Step 1: Enable Unknown Sources
1. Go to **Settings** → **Security** (or **Privacy**)
2. Enable **"Install from Unknown Sources"** or **"Allow installation of apps from unknown sources"**
3. You may need to enable this specifically for your file manager or browser

### Step 2: Install the APK
1. Copy the `app-debug.apk` file to your phone
2. Tap on the APK file to install
3. If prompted, allow installation from this source
4. Tap **"Install"** when prompted

### Step 3: Grant Required Permissions
The app will request several permissions that are **required** for remote control:

#### 🔹 Screen Recording Permission (MediaProjection)
- **Purpose**: Allows sharing your screen with the remote controller
- **When**: Prompted when you start the service
- **Action**: Tap **"Start now"** or **"Allow"**

#### 🔹 Accessibility Service Permission
- **Purpose**: Allows remote touch and gesture control
- **When**: You'll be taken to Accessibility settings
- **Action**: Find "Remote Control Guest" → Toggle **ON**

#### 🔹 Display Over Other Apps Permission
- **Purpose**: Shows connection status overlay
- **When**: Prompted during setup
- **Action**: Tap **"Allow"** or toggle **ON**

#### 🔹 Additional Permissions
- Camera access (for screen capture)
- Storage access (for file operations)
- Network access (for connection)

### Step 4: Start the Remote Control Service
1. Open the **"Remote Control Guest"** app
2. You'll see a simple interface with connection status
3. Tap **"Start Service"** to begin remote control session
4. A **6-digit session code** will appear (e.g., "123456")
5. **Share this code** with the administrator

### Step 5: Connection Process
1. Administrator enters your session code in their web interface
2. Connection will be established automatically
3. You'll see a small overlay indicating "Connected"
4. Your screen is now being shared and can be controlled remotely

## 🛡️ Security Features

### Session Management
- Each session has a **unique 6-digit code**
- Sessions **expire automatically** after a set time
- You can **end the session** at any time by closing the app

### Control What's Shared
- Only your screen content is shared
- No personal files are transferred
- No permanent access is granted

### Stop Remote Control
- Open the app and tap **"Stop Service"**
- Or force-close the app from recent apps
- Or restart your phone

## 📞 Support Information

### If You Have Issues
- **Cannot install**: Check unknown sources settings
- **Permissions denied**: Go to Settings → Apps → Remote Control Guest → Permissions
- **Connection fails**: Ensure you're on the same WiFi network as the administrator
- **App crashes**: Restart your phone and try again

### Contact Information
- **Administrator**: [Your contact information]
- **IT Support**: [Support contact if applicable]
- **Network**: Must be connected to WiFi network 192.168.1.x

## ⚙️ Technical Details
- **App Name**: Remote Control Guest
- **Package**: com.remotecontrol.guest
- **Version**: 1.0 (Debug Build)
- **Server**: Connects to 192.168.1.5:3001
- **Platform**: Android 5.0+ required

---

## 🔄 Quick Start Summary
1. ✅ Install APK from file
2. ✅ Grant all permissions (Screen, Accessibility, Overlay)
3. ✅ Open app and tap "Start Service"
4. ✅ Share the 6-digit code with administrator
5. ✅ Remote control session begins

**Remember**: You can stop the session at any time by closing the app or tapping "Stop Service".
