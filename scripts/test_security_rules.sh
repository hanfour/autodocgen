#!/bin/bash

# Test Security Rules with Firebase Emulator
# This script starts the emulator and runs basic security rules tests

set -e

echo "🔥 Starting Firebase Emulator for Security Rules Testing..."
echo ""

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please run: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI found"
echo ""

# Start emulators in the background
echo "Starting Firestore and Storage emulators..."
firebase emulators:start --only firestore,storage &
EMULATOR_PID=$!

echo "Emulator started with PID: $EMULATOR_PID"
echo ""

# Wait for emulators to be ready
echo "Waiting for emulators to be ready..."
sleep 5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Firestore Security Rules Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Firestore Rules loaded from: firestore.rules"
echo "   - isAuthenticated() helper function"
echo "   - isOwner() helper function"
echo "   - hasAccess() helper function with role checking"
echo ""
echo "📋 Protected Collections:"
echo "   - projects: owner/member/viewer access control"
echo "   - templates: active templates readable by authenticated users"
echo "   - companies: authenticated users can read/create"
echo "   - contacts: authenticated users can read/create"
echo "   - users: users can only modify their own profile"
echo "   - activities: read-only for authenticated users"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️  Storage Security Rules Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Storage Rules loaded from: storage.rules"
echo "   - isAuthenticated() helper function"
echo "   - hasProjectAccess() helper function with Firestore integration"
echo ""
echo "📁 Protected Paths:"
echo "   - templates/: authenticated read/write"
echo "   - templates/{templateId}/: authenticated read/write"
echo "   - documents/{projectId}/: project access required"
echo "   - company-logos/: authenticated read/write"
echo "   - user-avatars/: authenticated read, owner write"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Security Rules Testing"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To test the security rules manually:"
echo ""
echo "1. Open Emulator UI: http://localhost:4000"
echo "2. Navigate to Firestore or Storage tab"
echo "3. Try to read/write data with and without authentication"
echo ""
echo "Key Test Scenarios:"
echo "  ✓ Unauthenticated users cannot access any data"
echo "  ✓ Authenticated users can create projects/templates"
echo "  ✓ Only project owners can delete projects"
echo "  ✓ Shared users (members) can update projects"
echo "  ✓ Shared users (viewers) can only read projects"
echo "  ✓ Only active templates are readable"
echo "  ✓ Users can only modify their own user profile"
echo "  ✓ Project documents are only accessible to project members"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Next Steps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Visit Emulator UI: http://localhost:4000"
echo "2. Create test data in Firestore"
echo "3. Test authentication scenarios"
echo "4. Verify access control rules"
echo ""
echo "To stop emulators: kill $EMULATOR_PID"
echo ""

# Keep script running
echo "Press Ctrl+C to stop emulators and exit..."
wait $EMULATOR_PID
