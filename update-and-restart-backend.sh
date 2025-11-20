#!/bin/bash

# Update backend server.js and restart

echo "🔄 Updating backend to listen on all interfaces..."
echo ""

# Upload the fixed server.js
scp backend/src/server.js root@147.93.110.96:/var/www/usdtrain-backend/backend/src/

echo "✅ File uploaded"
echo ""

# Restart backend
ssh root@147.93.110.96 << 'ENDSSH'

cd /var/www/usdtrain-backend/backend

echo "Restarting backend..."
pm2 restart usdtrain-backend

echo ""
echo "Waiting 5 seconds..."
sleep 5

echo ""
echo "Backend status:"
pm2 status

echo ""
echo "Recent logs:"
pm2 logs usdtrain-backend --lines 20 --nostream

ENDSSH

echo ""
echo "✅ Backend updated and restarted!"
echo ""
echo "Test it:"
echo "  curl http://147.93.110.96:3001/api/v1/health"
echo ""
