# 📱 Mobile Device Connection Guide

## ✅ System Status
- **Backend Server**: ✅ Running on port 3001
- **Web Interface**: ✅ Running on port 3000  
- **Android APK**: ✅ Built with your IP (192.168.90.170) - **CRASH FIXED!**
- **Updated APK Location**: `/Users/ahmedgomaa/Downloads/murad/android-plugin/app/build/outputs/apk/debug/app-debug.apk`

## 🛠️ Latest Fix (Jun 24, 2025)
**Problem**: App was crashing with white screen due to SessionManager initialization error  
**Solution**: Fixed MainActivity and WebSocketService to properly initialize SessionManager with context  
**Result**: App should now open normally and display the main interface

## 🔗 How to Connect Your Mobile Device

### Step 1: Install Updated APK
1. **Transfer the new APK** to your mobile device:
   - The APK is located at: `/Users/ahmedgomaa/Downloads/murad/android-plugin/app/build/outputs/apk/debug/app-debug.apk`
   - You can transfer it via ADB, email, or file sharing
2. **Install the updated APK** on your mobile device
3. **Grant all required permissions** when prompted:
   - Internet access
   - Screen capture (MediaProjection)
   - Accessibility service
   - System alert window
   - Foreground service

### Step 2: Start Remote Control Session on Mobile
1. **Open the Remote Control Guest app** on your mobile device
2. **Grant accessibility permissions**:
   - Go to Settings > Accessibility
   - Find "Remote Control Guest" 
   - Enable the service
3. **Start screen sharing**:
   - Tap "Start Remote Control" in the app
   - Accept screen recording permission
   - The app will generate a **6-digit session code**

### Step 3: Connect from Web Interface
1. **Open web browser** on your computer
2. **Navigate to**: http://localhost:3000
3. **Create a controller account** or login
4. **Enter the 6-digit session code** from your mobile device
5. **Click "Connect"**

### Step 4: Control Your Mobile Device
Once connected, you should see:
- **Live screen feed** from your mobile device
- **Touch/click controls** - click anywhere on the screen to control
- **Quality controls** - adjust video quality as needed

## 🌐 Network Requirements

### Same Wi-Fi Network
Both devices must be on the same Wi-Fi network:
- **Your computer**: Connected to Wi-Fi
- **Your mobile device**: Connected to the same Wi-Fi network
- **Server IP**: 192.168.90.170:3001

### Firewall Settings
If connection fails, check:
- Mac firewall allows connections on port 3001
- Router doesn't block local network traffic

## 🔧 Troubleshooting

### Mobile App Issues
- **"Connection Failed"**: Check Wi-Fi connection
- **"No Session Code"**: Grant all permissions first
- **"Screen Recording Failed"**: Enable screen recording permission

### Web Interface Issues  
- **"Failed to join session"**: Check session code is correct
- **"No video feed"**: Check mobile device permissions
- **"Connection timeout"**: Ensure both devices on same network

### Network Issues
- **Can't connect**: Verify IP address is correct (192.168.90.170)
- **Slow performance**: Reduce video quality in web interface

## 📋 Connection Checklist

### Mobile Device ✅
- [ ] APK installed and opened
- [ ] All permissions granted
- [ ] Accessibility service enabled
- [ ] Screen recording permission granted
- [ ] Connected to same Wi-Fi network
- [ ] 6-digit session code generated

### Computer ✅  
- [ ] Backend server running (port 3001)
- [ ] Web interface running (port 3000)
- [ ] Browser opened to http://localhost:3000
- [ ] Controller account created
- [ ] Session code entered correctly

## 🎯 Expected Behavior

### Successful Connection Flow:
1. Mobile app shows "🟢 Remote Control Active"
2. Web interface shows "Connected to session XXXXXX"
3. Live screen feed appears in web browser
4. Mouse clicks on web interface control mobile device
5. Touch events appear in real-time on mobile screen

## 📞 Quick Commands

### Restart Services (if needed):
```bash
# Stop current services (Ctrl+C in terminals)
# Then restart:
cd /Users/ahmedgomaa/Downloads/murad/backend && npm run dev
cd /Users/ahmedgomaa/Downloads/murad/web-interface && npm start
```

### Check Server Status:
```bash
curl http://localhost:3001/health
```

### Rebuild APK (if IP changes):
```bash
cd /Users/ahmedgomaa/Downloads/murad/android-plugin
./gradlew assembleDebug
```

---

**Ready to connect!** Follow the steps above to establish the remote control session between your mobile device and web interface.
