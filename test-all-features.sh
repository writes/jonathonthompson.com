#!/bin/bash

echo "🚀 League Stats Platform - Feature Testing Script"
echo "================================================"
echo ""
echo "📝 Available Test Accounts:"
echo "  - Admin: admin@portfolio.com / admin123"
echo "  - User: demo@leaguestats.com / demo123" 
echo "  - Moderator: mod@portfolio.com / mod123"
echo "  - Google OAuth: Use your Google account"
echo ""
echo "🔗 Opening all test pages in your browser..."
echo ""

# Base URL
BASE_URL="http://localhost:3000"

# Array of URLs to test
urls=(
  "$BASE_URL/auth/signin|🔐 Login Page"
  "$BASE_URL/league|🎮 League Dashboard"
  "$BASE_URL/league/match/NA1_4736583920|📊 Live Match (WebSocket)"
  "$BASE_URL/league/champion/Ahri|🎨 3D Champion Viewer"
  "$BASE_URL/league/summoner/Faker|👤 Player Profile"
  "$BASE_URL/league/tournaments|🏆 Tournaments"
  "$BASE_URL/league/draft|🤖 AI Draft Assistant"
  "$BASE_URL/admin|🛡️ Admin Dashboard"
  "$BASE_URL/admin/performance|📈 Performance Monitor"
)

# Open each URL
for url_info in "${urls[@]}"; do
  IFS='|' read -r url description <<< "$url_info"
  echo "Opening: $description"
  echo "  URL: $url"
  
  # Open in default browser (works on macOS)
  open "$url" 2>/dev/null || xdg-open "$url" 2>/dev/null || echo "  ⚠️  Please open manually"
  
  # Small delay to prevent overwhelming the browser
  sleep 0.5
done

echo ""
echo "✅ All pages opened! Check your browser tabs."
echo ""
echo "💡 Testing Tips:"
echo "  1. Login first at /auth/signin"
echo "  2. Try both regular login and Google OAuth"
echo "  3. Use admin account to access admin features"
echo "  4. Check browser console for WebSocket activity"
echo "  5. Try dragging to rotate 3D champions"
echo ""
echo "⚠️  IMPORTANT: Regenerate Google OAuth credentials!"
echo "   See SECURITY_NOTICE.md for instructions"