#!/bin/bash

# ==============================================================================
# Dairy Management (ڈیری مینجمنٹ) - Run on Android via USB Cable
# ==============================================================================

# Add Android Platform Tools (adb) to PATH
export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools"

echo "📱 Checking USB Connected Android Devices..."
adb devices

echo ""
echo "🔌 Forwarding port 8081 via USB cable..."
adb reverse tcp:8081 tcp:8081

echo ""
echo "🚀 Starting Expo over USB (Localhost mode)..."
echo "👉 Press 'a' in the terminal to automatically open on your Android phone!"
echo ""

npx expo start --localhost
