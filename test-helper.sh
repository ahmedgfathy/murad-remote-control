#!/bin/bash

# Remote Control System - Testing Helper Script
echo "🚀 Remote Control System - Testing Helper"
echo "=========================================="

# Check if ADB is available
if ! command -v adb &> /dev/null; then
    echo "❌ ADB not found. Please install Android platform tools:"
    echo "   brew install android-platform-tools"
    exit 1
fi

# Function to check device connection
check_device() {
    echo "📱 Checking for connected Android devices..."
    devices=$(adb devices | grep -v "List of devices attached" | grep -v "^$" | wc -l)
    
    if [ $devices -eq 0 ]; then
        echo "❌ No Android devices connected"
        echo "   Please connect your Android device via USB and enable USB debugging"
        echo "   Or start an Android emulator"
        return 1
    else
        echo "✅ Found $devices Android device(s)"
        adb devices
        return 0
    fi
}

# Function to install APK
install_apk() {
    APK_PATH="/Users/ahmedgomaa/Downloads/murad/android-plugin/app/build/outputs/apk/debug/app-debug.apk"
    
    if [ ! -f "$APK_PATH" ]; then
        echo "❌ APK not found at: $APK_PATH"
        echo "   Please build the APK first:"
        echo "   cd /Users/ahmedgomaa/Downloads/murad/android-plugin && ./gradlew assembleDebug"
        return 1
    fi
    
    echo "📦 Installing APK..."
    adb install -r "$APK_PATH"
    
    if [ $? -eq 0 ]; then
        echo "✅ APK installed successfully"
        echo "   App package: com.remotecontrol.guest"
        return 0
    else
        echo "❌ APK installation failed"
        return 1
    fi
}

# Function to check services
check_services() {
    echo "🔍 Checking system services..."
    
    # Check backend
    if curl -s http://192.168.1.5:3001/health > /dev/null; then
        echo "✅ Backend server running (192.168.1.5:3001)"
    else
        echo "❌ Backend server not responding"
        echo "   Start with: cd backend && npm start"
    fi
    
    # Check web interface
    if curl -s http://192.168.1.5:3000 > /dev/null; then
        echo "✅ Web interface running (192.168.1.5:3000)"
    else
        echo "❌ Web interface not responding"
        echo "   Start with: cd web-interface && npm start"
    fi
}

# Function to get device logs
get_logs() {
    echo "📋 Getting Android app logs..."
    echo "   Use Ctrl+C to stop log monitoring"
    adb logcat | grep -E "(RemoteControl|WebSocket|ScreenCapture)"
}

# Function to launch app
launch_app() {
    echo "🚀 Launching Remote Control Guest app..."
    adb shell am start -n com.remotecontrol.guest/.MainActivity
    
    if [ $? -eq 0 ]; then
        echo "✅ App launched successfully"
        echo "   Please grant all permissions when prompted"
    else
        echo "❌ Failed to launch app"
    fi
}

# Main menu
show_menu() {
    echo ""
    echo "📋 Testing Options:"
    echo "1. Check connected devices"
    echo "2. Install APK"
    echo "3. Check services status"
    echo "4. Launch app on device"
    echo "5. Monitor app logs"
    echo "6. Full test sequence"
    echo "7. Open web interface"
    echo "8. Exit"
    echo ""
}

# Full test sequence
full_test() {
    echo "🧪 Running full test sequence..."
    
    check_device || return 1
    check_services || echo "⚠️  Some services not running"
    install_apk || return 1
    launch_app || return 1
    
    echo ""
    echo "✅ Test sequence complete!"
    echo "📝 Next steps:"
    echo "   1. Grant all permissions in the Android app"
    echo "   2. Tap 'Start Service' in the app"
    echo "   3. Note the session code"
    echo "   4. Open web interface and enter the code"
    echo "   5. Test remote control functionality"
}

# Main loop
while true; do
    show_menu
    read -p "Choose an option (1-8): " choice
    
    case $choice in
        1) check_device ;;
        2) install_apk ;;
        3) check_services ;;
        4) launch_app ;;
        5) get_logs ;;
        6) full_test ;;
        7) echo "🌐 Opening web interface..."; open http://192.168.1.5:3000 ;;
        8) echo "👋 Goodbye!"; exit 0 ;;
        *) echo "❌ Invalid option. Please choose 1-8." ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done
