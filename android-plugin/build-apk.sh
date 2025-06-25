#!/bin/bash

# Android APK Build Script for Remote Control Guest App
# This script handles the complete Android build process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🤖 Building Android APK for Remote Control Guest${NC}"
echo -e "${BLUE}=================================================${NC}"

# Check prerequisites
check_java() {
    echo -e "\n${BLUE}🔍 Checking Java installation...${NC}"
    
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
        echo -e "${GREEN}✅ Java found: $JAVA_VERSION${NC}"
        return 0
    else
        echo -e "${RED}❌ Java not found${NC}"
        echo -e "${YELLOW}📥 Installing Java...${NC}"
        
        # Install Java using Homebrew on macOS
        if command -v brew &> /dev/null; then
            echo "Installing OpenJDK 17 via Homebrew..."
            brew install openjdk@17
            
            # Add to PATH
            echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
            export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
            
            echo -e "${GREEN}✅ Java installed successfully${NC}"
            return 0
        else
            echo -e "${RED}❌ Homebrew not found. Please install Java manually:${NC}"
            echo "1. Download Java 17+ from: https://adoptium.net/"
            echo "2. Or install Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            echo "3. Then run: brew install openjdk@17"
            return 1
        fi
    fi
}

# Check Android SDK (optional - will work without it for basic builds)
check_android_sdk() {
    echo -e "\n${BLUE}🔍 Checking Android SDK...${NC}"
    
    if [ -n "$ANDROID_HOME" ] && [ -d "$ANDROID_HOME" ]; then
        echo -e "${GREEN}✅ Android SDK found: $ANDROID_HOME${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Android SDK not found${NC}"
        echo -e "${YELLOW}💡 For full development, install Android Studio or set ANDROID_HOME${NC}"
        echo "   Download from: https://developer.android.com/studio"
        return 0  # Not critical for basic builds
    fi
}

# Prepare build environment
prepare_build() {
    echo -e "\n${BLUE}🔧 Preparing build environment...${NC}"
    
    # Make gradlew executable
    chmod +x gradlew
    
    # Clean previous builds
    echo "Cleaning previous builds..."
    ./gradlew clean > /dev/null 2>&1 || true
    
    echo -e "${GREEN}✅ Build environment ready${NC}"
}

# Build the APK
build_apk() {
    echo -e "\n${BLUE}🏗️ Building Android APK...${NC}"
    
    echo "Running Gradle assembleDebug..."
    if ./gradlew assembleDebug; then
        echo -e "${GREEN}✅ APK built successfully!${NC}"
        
        # Find and display APK location
        APK_PATH=$(find . -name "*.apk" -type f | head -1)
        if [ -n "$APK_PATH" ]; then
            APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
            echo -e "\n${GREEN}📦 APK Details:${NC}"
            echo -e "📍 Location: $APK_PATH"
            echo -e "📏 Size: $APK_SIZE"
            echo -e "\n${YELLOW}📱 Install on device:${NC}"
            echo "adb install $APK_PATH"
        fi
        
        return 0
    else
        echo -e "${RED}❌ APK build failed${NC}"
        echo -e "${YELLOW}💡 Check the error messages above for details${NC}"
        return 1
    fi
}

# Install APK to connected device (optional)
install_apk() {
    echo -e "\n${BLUE}📱 Checking for connected devices...${NC}"
    
    if command -v adb &> /dev/null; then
        DEVICES=$(adb devices | grep -v "List of devices" | grep "device$" | wc -l)
        if [ "$DEVICES" -gt 0 ]; then
            echo -e "${GREEN}✅ Found $DEVICES connected device(s)${NC}"
            read -p "Install APK to connected device? (y/N): " install_choice
            
            if [[ $install_choice =~ ^[Yy]$ ]]; then
                APK_PATH=$(find . -name "*.apk" -type f | head -1)
                if [ -n "$APK_PATH" ]; then
                    echo "Installing APK..."
                    adb install -r "$APK_PATH"
                    echo -e "${GREEN}✅ APK installed successfully!${NC}"
                else
                    echo -e "${RED}❌ APK file not found${NC}"
                fi
            fi
        else
            echo -e "${YELLOW}⚠️  No devices connected${NC}"
            echo "Connect an Android device with USB debugging enabled"
        fi
    else
        echo -e "${YELLOW}⚠️  ADB not found${NC}"
        echo "Install Android SDK platform-tools for device installation"
    fi
}

# Main build process
main() {
    # Change to android-plugin directory if not already there
    if [ ! -f "gradlew" ]; then
        if [ -f "../android-plugin/gradlew" ]; then
            cd ../android-plugin
        elif [ -f "android-plugin/gradlew" ]; then
            cd android-plugin
        else
            echo -e "${RED}❌ Cannot find Android project directory${NC}"
            exit 1
        fi
    fi
    
    echo -e "📂 Working directory: $(pwd)"
    
    # Run checks and build
    if check_java && prepare_build && build_apk; then
        echo -e "\n${GREEN}🎉 Android APK build completed successfully!${NC}"
        
        # Optional installation
        install_apk
        
        echo -e "\n${YELLOW}📋 Next Steps:${NC}"
        echo "1. Transfer APK to guest Android device"
        echo "2. Enable 'Install from unknown sources' on the device"
        echo "3. Install and grant required permissions"
        echo "4. Start the backend server: cd ../backend && npm run dev"
        echo "5. Use the APK to connect to remote control sessions"
        
    else
        echo -e "\n${RED}❌ Build failed. Please check the errors above.${NC}"
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    "clean")
        echo "Cleaning build..."
        ./gradlew clean
        ;;
    "install")
        echo "Installing to device..."
        install_apk
        ;;
    *)
        main
        ;;
esac
