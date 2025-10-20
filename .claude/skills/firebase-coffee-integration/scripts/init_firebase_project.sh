#!/bin/bash

# Firebase Initialization Script for React/Vite Coffee E-Commerce
# This script sets up Firebase in your React + Vite project

set -e

echo "🔥 Firebase Project Initialization for Coffee E-Commerce"
echo "========================================================"

# Check if we're in a React project
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the project root?"
    exit 1
fi

# Install Firebase dependencies
echo ""
echo "📦 Installing Firebase dependencies..."
npm install firebase

# Install dev dependencies for Firebase tools
npm install -D firebase-tools

# Create Firebase config directory
mkdir -p src/config
mkdir -p src/lib/firebase
mkdir -p src/hooks

echo ""
echo "📁 Created directories:"
echo "  - src/config"
echo "  - src/lib/firebase"
echo "  - src/hooks"

# Create .env.local template
if [ ! -f ".env.local" ]; then
    echo ""
    echo "📝 Creating .env.local template..."
    cat > .env.local << 'EOF'
# Firebase Configuration
# Get these values from Firebase Console > Project Settings > Your apps > SDK setup and configuration

VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
EOF
    echo "✅ Created .env.local (remember to add your Firebase credentials!)"
else
    echo "⚠️  .env.local already exists, skipping..."
fi

# Add .env.local to .gitignore if not already there
if [ -f ".gitignore" ]; then
    if ! grep -q ".env.local" .gitignore; then
        echo "" >> .gitignore
        echo "# Firebase environment variables" >> .gitignore
        echo ".env.local" >> .gitignore
        echo "✅ Added .env.local to .gitignore"
    fi
fi

# Initialize Firebase CLI (optional)
echo ""
echo "🔧 Firebase CLI Setup"
echo "Would you like to initialize Firebase CLI? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    npx firebase login
    npx firebase init
fi

echo ""
echo "✅ Firebase initialization complete!"
echo ""
echo "Next steps:"
echo "1. Go to https://console.firebase.google.com"
echo "2. Create a new project or select existing one"
echo "3. Enable Firestore Database"
echo "4. Enable Authentication (Email/Password)"
echo "5. Copy your Firebase config to .env.local"
echo "6. Run the app: npm run dev"
echo ""
echo "For detailed setup instructions, see references/firebase_setup_guide.md"
