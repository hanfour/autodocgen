#!/bin/bash

# AutoDocGen Development Stop Script
# This script stops both Firebase Emulators and Frontend Dev Server

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

echo ""
print_color "$BLUE" "=================================="
print_color "$BLUE" "  Stopping Development Services  "
print_color "$BLUE" "=================================="
echo ""

# Stop Firebase Emulators
if [ -f "logs/emulator.pid" ]; then
    EMULATOR_PID=$(cat logs/emulator.pid)
    if kill -0 $EMULATOR_PID 2>/dev/null; then
        print_color "$YELLOW" "Stopping Firebase Emulators (PID: $EMULATOR_PID)..."
        kill $EMULATOR_PID
        rm logs/emulator.pid
        print_color "$GREEN" "✓ Firebase Emulators stopped"
    else
        print_color "$YELLOW" "Firebase Emulators not running"
        rm logs/emulator.pid
    fi
else
    print_color "$YELLOW" "No Firebase Emulator PID file found"
fi

# Stop Frontend Dev Server
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        print_color "$YELLOW" "Stopping Frontend Dev Server (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        rm logs/frontend.pid
        print_color "$GREEN" "✓ Frontend Dev Server stopped"
    else
        print_color "$YELLOW" "Frontend Dev Server not running"
        rm logs/frontend.pid
    fi
else
    print_color "$YELLOW" "No Frontend PID file found"
fi

# Clean up any remaining processes
print_color "$YELLOW" "Cleaning up remaining processes..."
pkill -f "firebase emulators" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

echo ""
print_color "$GREEN" "✅ All services stopped"
echo ""
