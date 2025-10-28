#!/bin/bash

# AutoDocGen Development Startup Script
# This script starts both Firebase Emulators and Frontend Dev Server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Print banner
echo ""
print_color "$BLUE" "=================================="
print_color "$BLUE" "  AutoDocGen Development Server  "
print_color "$BLUE" "=================================="
echo ""

# Check prerequisites
print_color "$YELLOW" "🔍 Checking prerequisites..."

if ! command_exists node; then
    print_color "$RED" "❌ Node.js is not installed"
    exit 1
fi

if ! command_exists python3; then
    print_color "$RED" "❌ Python 3 is not installed"
    exit 1
fi

if ! command_exists firebase; then
    print_color "$RED" "❌ Firebase CLI is not installed"
    print_color "$YELLOW" "   Install with: npm install -g firebase-tools"
    exit 1
fi

print_color "$GREEN" "✓ All prerequisites met"
echo ""

# Check if in correct directory
if [ ! -f "firebase.json" ]; then
    print_color "$RED" "❌ Must run from project root directory"
    exit 1
fi

# Check Python virtual environment
if [ ! -d "functions/venv" ]; then
    print_color "$YELLOW" "📦 Creating Python virtual environment..."
    cd functions
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
    print_color "$GREEN" "✓ Python environment ready"
else
    print_color "$GREEN" "✓ Python environment exists"
fi

# Check frontend node_modules
if [ ! -d "frontend/node_modules" ]; then
    print_color "$YELLOW" "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    print_color "$GREEN" "✓ Frontend dependencies installed"
else
    print_color "$GREEN" "✓ Frontend dependencies exist"
fi

echo ""
print_color "$BLUE" "🚀 Starting services..."
echo ""

# Create log directory
mkdir -p logs

# Start Firebase Emulators in background
print_color "$YELLOW" "Starting Firebase Emulators..."
firebase emulators:start > logs/emulators.log 2>&1 &
EMULATOR_PID=$!
echo $EMULATOR_PID > logs/emulator.pid

# Wait for emulators to start
sleep 5

if ! kill -0 $EMULATOR_PID 2>/dev/null; then
    print_color "$RED" "❌ Failed to start Firebase Emulators"
    print_color "$YELLOW" "Check logs/emulators.log for details"
    exit 1
fi

print_color "$GREEN" "✓ Firebase Emulators started (PID: $EMULATOR_PID)"

# Start Frontend Dev Server in background
print_color "$YELLOW" "Starting Frontend Dev Server..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo $FRONTEND_PID > logs/frontend.pid

sleep 3

if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    print_color "$RED" "❌ Failed to start Frontend Dev Server"
    print_color "$YELLOW" "Check logs/frontend.log for details"
    # Kill emulators
    kill $EMULATOR_PID 2>/dev/null
    exit 1
fi

print_color "$GREEN" "✓ Frontend Dev Server started (PID: $FRONTEND_PID)"

echo ""
print_color "$GREEN" "✅ All services started successfully!"
echo ""
print_color "$BLUE" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_color "$BLUE" "  Access URLs:"
print_color "$BLUE" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_color "$GREEN" "  🌐 Frontend:        http://localhost:3000"
print_color "$GREEN" "  🔥 Emulator UI:     http://localhost:4000"
print_color "$GREEN" "  ⚡ Functions:       http://localhost:5001"
print_color "$GREEN" "  💾 Firestore:       http://localhost:8080"
print_color "$GREEN" "  🔐 Auth:            http://localhost:9099"
print_color "$GREEN" "  📦 Storage:         http://localhost:9199"
print_color "$BLUE" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_color "$YELLOW" "📝 Logs are being written to:"
print_color "$YELLOW" "   - logs/emulators.log"
print_color "$YELLOW" "   - logs/frontend.log"
echo ""
print_color "$YELLOW" "To stop all services, run:"
print_color "$YELLOW" "   ./scripts/stop-dev.sh"
echo ""
print_color "$GREEN" "Press Ctrl+C to stop monitoring (services will keep running)"
echo ""

# Monitor logs
print_color "$BLUE" "📊 Monitoring logs (Ctrl+C to exit)..."
echo ""

trap 'print_color "$YELLOW" "Stopped monitoring. Services are still running."; exit 0' INT

tail -f logs/emulators.log logs/frontend.log
