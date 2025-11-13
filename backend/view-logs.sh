#!/bin/bash

# Log Viewer Script for USDT Rain Backend

echo "📖 USDT Rain Backend - Log Viewer"
echo "=================================="
echo ""

# Check if logs directory exists
if [ ! -d "logs" ]; then
  echo "❌ Logs directory not found. Server may not have been started yet."
  exit 1
fi

# Function to show menu
show_menu() {
  echo ""
  echo "Select an option:"
  echo "1) View recent requests (last 20)"
  echo "2) View failed requests"
  echo "3) View request statistics"
  echo "4) View all requests (live tail)"
  echo "5) View error log"
  echo "6) View combined log"
  echo "7) Clear old logs (7+ days)"
  echo "8) Exit"
  echo ""
  read -p "Enter your choice [1-8]: " choice
}

# Main loop
while true; do
  show_menu
  
  case $choice in
    1)
      echo ""
      echo "📋 Recent Requests:"
      echo "==================="
      node src/utils/logViewer.js recent 20
      ;;
    2)
      echo ""
      echo "❌ Failed Requests:"
      echo "==================="
      node src/utils/logViewer.js failed
      ;;
    3)
      echo ""
      echo "📊 Request Statistics:"
      echo "======================"
      node src/utils/logViewer.js stats
      ;;
    4)
      echo ""
      echo "📡 Live Request Log (Ctrl+C to stop):"
      echo "======================================"
      tail -f logs/requests.log | while read line; do
        echo "$line" | jq -r 'if .type == "REQUEST" then "📥 \(.method) \(.path)" elif .type == "RESPONSE" then "📤 \(.statusCode) (\(.duration))" else . end' 2>/dev/null || echo "$line"
      done
      ;;
    5)
      echo ""
      echo "🔴 Error Log (last 50 lines):"
      echo "============================="
      tail -n 50 logs/error.log
      ;;
    6)
      echo ""
      echo "📝 Combined Log (last 50 lines):"
      echo "================================="
      tail -n 50 logs/combined.log
      ;;
    7)
      echo ""
      read -p "Clear logs older than how many days? [7]: " days
      days=${days:-7}
      node src/utils/logViewer.js clear $days
      ;;
    8)
      echo ""
      echo "👋 Goodbye!"
      exit 0
      ;;
    *)
      echo ""
      echo "❌ Invalid option. Please try again."
      ;;
  esac
  
  echo ""
  read -p "Press Enter to continue..."
done
