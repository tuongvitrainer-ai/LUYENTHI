#!/bin/bash

# Start server in background
cd /home/user/LUYENTHI/vuot-vu-mon
npm rebuild better-sqlite3 > /dev/null 2>&1
node server.js > server.log 2>&1 &
SERVER_PID=$!

echo "Server starting... PID=$SERVER_PID"
sleep 5

# Test health
echo "Testing health..."
curl -s http://localhost:3000/health

# Test admin login
echo -e "\n\nTesting admin login..."
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq .

# Kill server
kill $SERVER_PID 2>/dev/null
echo -e "\n\nServer stopped"
