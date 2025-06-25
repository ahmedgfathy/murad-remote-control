#!/bin/bash

# Remote Mobile Control System - Setup Script
# This script automates the setup of all components

set -e

echo "🚀 Setting up Remote Mobile Control System..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
check_nodejs() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
        echo "Download from: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}❌ Node.js version 18+ required. Current version: $(node -v)${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"
}

# Setup backend
setup_backend() {
    echo -e "\n${BLUE}📦 Setting up Backend Server...${NC}"
    cd backend
    
    if [ ! -f .env ]; then
        echo -e "${YELLOW}⚠️  Creating .env file from template...${NC}"
        cp .env .env.backup 2>/dev/null || true
    fi
    
    echo "Installing backend dependencies..."
    npm install
    
    echo "Building backend..."
    npm run build
    
    echo -e "${GREEN}✅ Backend setup complete${NC}"
    cd ..
}

# Setup web interface
setup_web() {
    echo -e "\n${BLUE}🌐 Setting up Web Interface...${NC}"
    cd web-interface
    
    echo "Installing web interface dependencies..."
    npm install
    
    echo "Building web interface..."
    npm run build
    
    echo -e "${GREEN}✅ Web interface setup complete${NC}"
    cd ..
}

# Setup mobile app
setup_mobile() {
    echo -e "\n${BLUE}📱 Setting up Mobile App...${NC}"
    cd mobile-app
    
    if [ ! -f package.json ]; then
        echo -e "${RED}❌ Mobile app package.json not found${NC}"
        exit 1
    fi
    
    echo "Installing mobile app dependencies..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install mobile app dependencies${NC}"
        exit 1
    fi
    
    echo "Checking TypeScript compilation..."
    npm run build
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Mobile app TypeScript compilation failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Mobile app setup complete${NC}"
    echo -e "${YELLOW}💡 To run on device: npm run android or npm run ios${NC}"
    
    cd ..
}

# Create startup scripts
create_scripts() {
    echo -e "\n${BLUE}📝 Creating startup scripts...${NC}"
    
    # Start all services script
    cat > start-all.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Remote Mobile Control System..."

# Start backend in background
echo "Starting backend server..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start web interface
echo "Starting web interface..."
cd ../web-interface && npm start &
WEB_PID=$!

echo "✅ All services started!"
echo "Backend PID: $BACKEND_PID"
echo "Web PID: $WEB_PID"
echo ""
echo "🌐 Web Interface: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "📱 Mobile App: cd mobile-app && npm run android/ios"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo 'Stopping services...'; kill $BACKEND_PID $WEB_PID 2>/dev/null; exit 0" INT
wait
EOF

    chmod +x start-all.sh
    
    # Backend only script
    cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "🔧 Starting Backend Server..."
cd backend && npm run dev
EOF

    chmod +x start-backend.sh
    
    # Web only script  
    cat > start-web.sh << 'EOF'
#!/bin/bash
echo "🌐 Starting Web Interface..."
cd web-interface && npm start
EOF

    chmod +x start-web.sh
    
    echo -e "${GREEN}✅ Startup scripts created${NC}"
}

# Create development guide
create_dev_guide() {
    cat > DEVELOPMENT.md << 'EOF'
# Development Guide

## Quick Start Commands

### Start All Services
```bash
./start-all.sh
```

### Start Individual Services
```bash
./start-backend.sh    # Backend only
./start-web.sh        # Web interface only
```

### Development URLs
- **Web Interface**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Backend Health**: http://localhost:3001/health

## Development Workflow

### Backend Development
```bash
cd backend
npm run dev          # Start with hot reload
npm run build        # Build TypeScript
npm test            # Run tests
npm run lint        # Check code quality
```

### Web Interface Development
```bash
cd web-interface
npm start           # Development server
npm run build       # Production build
npm test           # Run tests
```

### Mobile App Development
```bash
cd mobile-app
npm start           # Start Metro bundler
npm run android     # Run on Android
npm run ios         # Run on iOS (macOS only)
npm run build       # TypeScript check
./demo.sh           # Run demo script
```

### Android Development
```bash
cd android-plugin
./gradlew assembleDebug      # Build debug APK
./gradlew installDebug       # Install on device
```

## Configuration Files

### Backend (.env)
```env
PORT=3001
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=http://localhost:3000
```

### Web Interface (.env)
```env
REACT_APP_SERVER_URL=http://localhost:3001
REACT_APP_API_URL=http://localhost:3001/api
```

## Testing the System

1. Start backend and web interface
2. Open web interface in browser
3. Create controller account
4. Install Android APK on test device
5. Start remote control session
6. Test screen sharing and control

## Deployment

### Production Backend
```bash
cd backend
npm run build
npm start
```

### Production Web
```bash
cd web-interface  
npm run build
# Serve static files from build/ directory
```

### Android Release
```bash
cd android-plugin
./gradlew assembleRelease
```
EOF
}

# Main setup function
main() {
    echo -e "${BLUE}Remote Mobile Control System Setup${NC}"
    echo -e "${BLUE}===================================${NC}"
    
    # Check prerequisites
    check_nodejs
    
    # Setup components
    setup_backend
    setup_web
    setup_mobile
    
    # Create helper scripts
    create_scripts
    create_dev_guide
    
    echo -e "\n${GREEN}🎉 Setup Complete!${NC}"
    echo -e "\n${YELLOW}Next Steps:${NC}"
    echo "1. Configure your server IP in android-plugin/app/src/main/java/com/remotecontrol/guest/services/WebSocketService.java"
    echo "2. Build the Android APK: cd android-plugin && ./gradlew assembleDebug"
    echo "3. Start all services: ./start-all.sh"
    echo "4. Install APK on guest Android device"
    echo "5. Open web interface at http://localhost:3000"
    echo ""
    echo -e "${GREEN}📖 Read README.md for detailed usage instructions${NC}"
    echo -e "${GREEN}📖 Read DEVELOPMENT.md for development workflow${NC}"
}

# Run main function
main "$@"
