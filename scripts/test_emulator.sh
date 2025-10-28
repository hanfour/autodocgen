#!/bin/bash

# Test Firebase Emulator Setup
echo "🔥 Testing Firebase Emulator Setup..."
echo ""

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not installed"
    echo "   Run: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI installed ($(firebase --version))"

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged into Firebase"
    echo "   Run: firebase login"
    exit 1
fi

echo "✅ Logged into Firebase"

# Check if firebase.json exists
if [ ! -f "firebase.json" ]; then
    echo "❌ firebase.json not found"
    echo "   Run: firebase init"
    exit 1
fi

echo "✅ firebase.json exists"

# Check if emulators are downloaded
echo ""
echo "🔧 Checking emulators..."
firebase emulators:exec --only firestore "echo 'Firestore emulator OK'" 2>&1 | grep -q "Firestore emulator OK"
if [ $? -eq 0 ]; then
    echo "✅ Firestore emulator ready"
else
    echo "⚠️  Firestore emulator may need to be downloaded"
fi

echo ""
echo "✨ Firebase Emulator setup test complete!"
echo ""
echo "To start emulators, run:"
echo "  firebase emulators:start"
echo ""
echo "Emulator UI will be available at:"
echo "  http://localhost:4000"
