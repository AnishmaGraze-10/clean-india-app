#!/bin/bash
# Start server in background
cd "$(dirname "$0")"
npm run dev > /tmp/server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Run tests
node test-all.js

# Kill server
kill $SERVER_PID 2>/dev/null

