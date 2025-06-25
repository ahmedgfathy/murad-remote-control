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
