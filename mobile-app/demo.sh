#!/bin/bash

# Mobile App Demo Script for Remote Mobile Control System
# This script demonstrates the mobile app functionality

echo "🚀 Remote Control Mobile App Demo"
echo "=================================="
echo

# Check if we're in the mobile app directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the mobile-app directory"
    echo "Usage: cd mobile-app && ./demo.sh"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo "✅ Dependencies checked"

# Check TypeScript compilation
echo "🔍 Checking TypeScript compilation..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed"
    exit 1
fi

echo "✅ TypeScript compilation successful"

# Check if backend is running
echo "🔍 Checking backend server connection..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend server is running"
else
    echo "⚠️  Backend server is not running. Starting it first..."
    echo "   Please run: cd ../backend && npm run dev"
    echo "   Then come back and run this demo again."
    exit 1
fi

echo
echo "🎯 Demo Options:"
echo "1. Start Metro bundler (React Native development server)"
echo "2. Run on Android emulator/device"
echo "3. Run on iOS simulator (macOS only)"
echo "4. Build for production"
echo "5. Test Socket.IO connection"
echo

read -p "Choose an option (1-5): " choice

case $choice in
    1)
        echo "🚀 Starting Metro bundler..."
        echo "Open another terminal and run 'npm run android' or 'npm run ios'"
        npm start
        ;;
    2)
        echo "🤖 Running on Android..."
        echo "Make sure you have an Android emulator running or device connected"
        npm run android
        ;;
    3)
        echo "🍎 Running on iOS..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            if [ ! -d "ios/Pods" ]; then
                echo "📦 Installing iOS dependencies..."
                cd ios && pod install && cd ..
            fi
            npm run ios
        else
            echo "❌ iOS development is only supported on macOS"
        fi
        ;;
    4)
        echo "🏗️ Building for production..."
        echo "Building Android APK..."
        cd android && ./gradlew assembleRelease
        if [ $? -eq 0 ]; then
            echo "✅ Android APK built successfully!"
            echo "📍 Location: android/app/build/outputs/apk/release/"
        fi
        ;;
    5)
        echo "🔌 Testing Socket.IO connection..."
        node -e "
        const io = require('socket.io-client');
        const socket = io('http://localhost:3001');
        
        socket.on('connect', () => {
            console.log('✅ Socket.IO connection successful!');
            console.log('Connection ID:', socket.id);
            socket.disconnect();
            process.exit(0);
        });
        
        socket.on('connect_error', (error) => {
            console.log('❌ Socket.IO connection failed:', error.message);
            process.exit(1);
        });
        
        setTimeout(() => {
            console.log('❌ Connection timeout');
            process.exit(1);
        }, 5000);
        "
        ;;
    *)
        echo "❌ Invalid option selected"
        exit 1
        ;;
esac

echo
echo "🎉 Demo completed!"
echo
echo "📚 Next Steps:"
echo "1. Make sure the backend server is running (cd ../backend && npm run dev)"
echo "2. Install the Android APK on a guest device (cd ../android-plugin)"
echo "3. Use the mobile app to control the guest device"
echo
echo "📖 For more information, check the README.md file"
