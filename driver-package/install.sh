#!/bin/bash

# Remote Control Plugin - Driver Installation Script
echo "📱 Remote Control Plugin - Driver Installation"
echo "=============================================="

# Check if ADB is available
if command -v adb &> /dev/null; then
    echo "🔧 ADB found - checking for connected devices..."
    
    # Check for connected devices
    devices=$(adb devices | grep -v "List of devices attached" | grep -v "^$" | wc -l)
    
    if [ $devices -gt 0 ]; then
        echo "📱 Android device connected via USB"
        echo ""
        echo "🚀 Installing Remote Control Plugin..."
        
        # Install the APK
        adb install -r RemoteControlPlugin.apk
        
        if [ $? -eq 0 ]; then
            echo "✅ Plugin installed successfully!"
            echo ""
            echo "📋 Next steps for driver:"
            echo "1. Grant all permissions when prompted"
            echo "2. Open 'Remote Control Guest' app"
            echo "3. Tap 'Start Service'"
            echo "4. Share the 6-digit code with administrator"
            echo ""
            echo "🌐 Administrator should open: http://192.168.1.5:3000"
        else
            echo "❌ Installation failed"
            echo "Please install manually by tapping the APK file"
        fi
    else
        echo "❌ No Android devices connected"
        echo ""
        echo "📋 Manual installation steps:"
        echo "1. Transfer RemoteControlPlugin.apk to driver's phone"
        echo "2. Enable 'Unknown Sources' in phone settings"
        echo "3. Tap the APK file to install"
        echo "4. Follow the installation guide"
    fi
else
    echo "📋 Manual installation required:"
    echo "1. Transfer RemoteControlPlugin.apk to driver's phone"
    echo "2. Enable 'Unknown Sources' in phone settings"  
    echo "3. Tap the APK file to install"
    echo "4. Follow DRIVER_INSTALLATION_GUIDE.md"
fi

echo ""
echo "📄 For detailed instructions, see: DRIVER_INSTALLATION_GUIDE.md"
echo "🆘 For support, contact the administrator"
