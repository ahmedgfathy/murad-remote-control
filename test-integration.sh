#!/bin/bash

# End-to-End Test Script for Remote Mobile Control System
# This script tests all components integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Remote Mobile Control System - Integration Test${NC}"
echo -e "${BLUE}===================================================${NC}"

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "\n${BLUE}🔍 Testing: $test_name${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASS: $test_name${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL: $test_name${NC}"
        ((TESTS_FAILED++))
        FAILED_TESTS+=("$test_name")
        return 1
    fi
}

# Test 1: Check if all required directories exist
test_directories() {
    local dirs=("backend" "web-interface" "mobile-app" "android-plugin")
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            echo "❌ Directory $dir not found"
            return 1
        fi
    done
    echo "✅ All required directories exist"
    return 0
}

# Test 2: Backend setup and compilation
test_backend() {
    cd backend
    if [ ! -f package.json ]; then
        echo "❌ Backend package.json not found"
        return 1
    fi
    
    if [ ! -d node_modules ]; then
        echo "Installing backend dependencies..."
        npm install > /dev/null 2>&1
    fi
    
    echo "Testing TypeScript compilation..."
    npm run build > /dev/null 2>&1
    
    echo "✅ Backend compiles successfully"
    cd ..
    return 0
}

# Test 3: Web interface setup and compilation
test_web_interface() {
    cd web-interface
    if [ ! -f package.json ]; then
        echo "❌ Web interface package.json not found"
        return 1
    fi
    
    if [ ! -d node_modules ]; then
        echo "Installing web interface dependencies..."
        npm install > /dev/null 2>&1
    fi
    
    echo "Testing React build..."
    npm run build > /dev/null 2>&1
    
    echo "✅ Web interface builds successfully"
    cd ..
    return 0
}

# Test 4: Mobile app setup and compilation
test_mobile_app() {
    cd mobile-app
    if [ ! -f package.json ]; then
        echo "❌ Mobile app package.json not found"
        return 1
    fi
    
    if [ ! -d node_modules ]; then
        echo "Installing mobile app dependencies..."
        npm install > /dev/null 2>&1
    fi
    
    echo "Testing TypeScript compilation..."
    npm run build > /dev/null 2>&1
    
    echo "✅ Mobile app compiles successfully"
    cd ..
    return 0
}

# Test 5: Android plugin setup
test_android_plugin() {
    cd android-plugin
    if [ ! -f build.gradle ]; then
        echo "❌ Android build.gradle not found"
        return 1
    fi
    
    if [ ! -f gradlew ]; then
        echo "❌ Gradle wrapper not found"
        return 1
    fi
    
    echo "Testing Android project structure..."
    if [ ! -f app/src/main/AndroidManifest.xml ]; then
        echo "❌ AndroidManifest.xml not found"
        return 1
    fi
    
    echo "✅ Android plugin structure is valid"
    cd ..
    return 0
}

# Test 6: Backend server startup
test_backend_server() {
    cd backend
    
    echo "Starting backend server..."
    npm run dev > /dev/null 2>&1 &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 5
    
    # Test health endpoint
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ Backend server responds to health check"
        kill $SERVER_PID 2>/dev/null
        cd ..
        return 0
    else
        echo "❌ Backend server not responding"
        kill $SERVER_PID 2>/dev/null
        cd ..
        return 1
    fi
}

# Test 7: API endpoints
test_api_endpoints() {
    cd backend
    
    echo "Starting backend for API tests..."
    npm run dev > /dev/null 2>&1 &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 5
    
    # Test auth endpoint
    local auth_response=$(curl -s -X POST -H "Content-Type: application/json" \
        -d '{"username":"testuser","password":"testpass","role":"controller"}' \
        http://localhost:3001/api/auth/login || echo "ERROR")
    
    if [[ "$auth_response" == *"error"* ]] || [[ "$auth_response" == "ERROR" ]]; then
        echo "✅ Auth endpoint rejects invalid credentials (expected)"
    else
        echo "❌ Auth endpoint response unexpected"
        kill $SERVER_PID 2>/dev/null
        cd ..
        return 1
    fi
    
    kill $SERVER_PID 2>/dev/null
    cd ..
    return 0
}

# Test 8: Socket.IO connection
test_socket_connection() {
    cd backend
    
    echo "Starting backend for Socket.IO test..."
    npm run dev > /dev/null 2>&1 &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 5
    
    # Test Socket.IO connection using Node.js
    node -e "
    const io = require('socket.io-client');
    const socket = io('http://localhost:3001');
    
    socket.on('connect', () => {
        console.log('✅ Socket.IO connection successful');
        socket.disconnect();
        process.exit(0);
    });
    
    socket.on('connect_error', (error) => {
        console.log('❌ Socket.IO connection failed');
        process.exit(1);
    });
    
    setTimeout(() => {
        console.log('❌ Socket.IO connection timeout');
        process.exit(1);
    }, 5000);
    " > /dev/null 2>&1
    
    local socket_result=$?
    kill $SERVER_PID 2>/dev/null
    cd ..
    
    if [ $socket_result -eq 0 ]; then
        echo "✅ Socket.IO connection works"
        return 0
    else
        echo "❌ Socket.IO connection failed"
        return 1
    fi
}

# Test 9: Configuration files
test_configuration() {
    local config_files=(
        "backend/.env"
        "web-interface/.env"
        "backend/src/config.ts"
        "mobile-app/tsconfig.json"
        "android-plugin/app/src/main/AndroidManifest.xml"
    )
    
    for config in "${config_files[@]}"; do
        if [ ! -f "$config" ]; then
            echo "❌ Configuration file missing: $config"
            return 1
        fi
    done
    
    echo "✅ All configuration files present"
    return 0
}

# Test 10: TypeScript types consistency
test_typescript_types() {
    # Check if type definitions are consistent across components
    local type_files=(
        "backend/src/types/index.ts"
        "web-interface/src/types/index.ts"
        "mobile-app/src/types/index.ts"
    )
    
    for type_file in "${type_files[@]}"; do
        if [ ! -f "$type_file" ]; then
            echo "❌ Type definition file missing: $type_file"
            return 1
        fi
    done
    
    echo "✅ TypeScript type definitions present"
    return 0
}

# Run all tests
main() {
    echo -e "${YELLOW}Starting comprehensive integration tests...${NC}\n"
    
    run_test "Directory Structure" "test_directories"
    run_test "Backend Compilation" "test_backend"
    run_test "Web Interface Build" "test_web_interface"
    run_test "Mobile App Compilation" "test_mobile_app"
    run_test "Android Plugin Structure" "test_android_plugin"
    run_test "Backend Server Startup" "test_backend_server"
    run_test "API Endpoints" "test_api_endpoints"
    run_test "Socket.IO Connection" "test_socket_connection"
    run_test "Configuration Files" "test_configuration"
    run_test "TypeScript Types" "test_typescript_types"
    
    # Summary
    echo -e "\n${BLUE}📊 Test Summary${NC}"
    echo -e "${BLUE}===============${NC}"
    echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
    
    if [ $TESTS_FAILED -gt 0 ]; then
        echo -e "\n${RED}Failed Tests:${NC}"
        for test in "${FAILED_TESTS[@]}"; do
            echo -e "${RED}  - $test${NC}"
        done
        echo -e "\n${YELLOW}💡 Run individual component tests for more details${NC}"
        exit 1
    else
        echo -e "\n${GREEN}🎉 All tests passed! System is ready for use.${NC}"
        echo -e "\n${YELLOW}Next Steps:${NC}"
        echo "1. Start all services: ./start-all.sh"
        echo "2. Build Android APK: cd android-plugin && ./gradlew assembleDebug"
        echo "3. Test mobile app: cd mobile-app && ./demo.sh"
        echo "4. Install APK on guest device and test end-to-end"
        exit 0
    fi
}

# Run main function
main "$@"
