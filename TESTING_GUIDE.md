# Testing Guide for League Stats Platform

## 🔐 Authentication Testing

### Google OAuth Login
1. Navigate to http://localhost:3000/auth/signin
2. Click the "Google" button
3. You'll be redirected to Google's OAuth page
4. Sign in with your Google account
5. You'll be redirected back and logged in

**⚠️ IMPORTANT**: The Google OAuth will only work if you've updated the credentials in `.env.local` with valid ones, as the exposed credentials should be regenerated.

### Alternative Login Methods
- **Demo Credentials**: Use the credentials in your `.env.local` for DEMO_USERNAME and DEMO_PASSWORD
- **GitHub OAuth**: Click "GitHub" button (requires GitHub OAuth setup)

## 🎮 League Features Testing

### 1. Main League Dashboard
- **URL**: http://localhost:3000/league
- **Features to test**:
  - View featured matches
  - Check leaderboards
  - Browse champion roster
  - View recent matches

### 2. Real-time Match Updates
- **URL**: http://localhost:3000/league/match/NA1_4736583920
- **Features**:
  - WebSocket connection indicator (top right)
  - Live match timeline updates
  - Real-time gold/objectives tracking
  - Team statistics

### 3. 3D Champion Viewer
- **URL**: http://localhost:3000/league/champion/Ahri
- **Test these champions**: Ahri, Yasuo, Lux, Zed, Jinx
- **Features**:
  - 3D model rotation (drag to rotate)
  - Skin switcher
  - Ability showcase
  - Stats display

### 4. Player Profiles
- **URL**: http://localhost:3000/league/summoner/Faker
- **Features**:
  - Match history
  - Champion mastery
  - Ranked statistics
  - Recent performance

### 5. Tournament System
- **URL**: http://localhost:3000/league/tournaments
- **Features**:
  - View active tournaments
  - Interactive brackets
  - Match schedules
  - Create tournament (if logged in)

### 6. Draft Assistant
- **URL**: http://localhost:3000/league/draft
- **Features**:
  - Champion recommendations
  - Counter picks
  - Team composition analysis
  - Win rate predictions

## 🛡️ Admin Features

### Admin Dashboard
- **URL**: http://localhost:3000/admin
- **Access**: Requires admin role (modify user role in auth-advanced.ts)
- **Features**:
  - User statistics
  - System metrics
  - Recent activity log

### Performance Monitoring
- **URL**: http://localhost:3000/admin/performance
- **Features**:
  - Real-time performance metrics
  - API response times
  - System health status
  - Alert notifications

### Security Dashboard
- **URL**: http://localhost:3000/admin/security
- **Features**:
  - Rate limit monitoring
  - Failed login attempts
  - Active sessions
  - Threat detection

## 🧪 Testing WebSocket Features

1. **Open Multiple Tabs**:
   - Open the same match in 2+ browser tabs
   - Updates should sync across all tabs

2. **Test Subscriptions**:
   ```javascript
   // Open browser console on match page
   // You should see WebSocket logs like:
   // "WebSocket connected"
   // "Subscribed to match: NA1_4736583920"
   ```

3. **Simulate Updates**:
   - WebSocket updates are simulated every 30 seconds
   - Watch for gold/kill updates

## 🚀 Performance Testing

### Redis Features (if Redis is running)
1. **Start Redis**:
   ```bash
   redis-server
   ```

2. **Test Caching**:
   - Load a player profile
   - Reload the page (should be faster)
   - Check Redis: `redis-cli KEYS "*"`

3. **Test Leaderboards**:
   - View leaderboards on main page
   - Updates are cached for 5 minutes

### ML Service (if Python service is running)
1. **Start ML Service**:
   ```bash
   cd ml-service
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

2. **Test Draft Assistant**:
   - Go to draft page
   - Select champions
   - Get AI recommendations

## 📊 API Testing

### GraphQL Playground
- **URL**: http://localhost:3000/api/graphql
- **Sample Query**:
  ```graphql
  query {
    featuredMatches {
      id
      gameMode
      participants {
        summonerName
        championName
      }
    }
  }
  ```

### REST Endpoints
- **Leaderboard**: GET http://localhost:3000/api/league/leaderboard
- **Match**: GET http://localhost:3000/api/league/match/NA1_4736583920
- **Performance**: GET http://localhost:3000/api/admin/performance (requires auth)

## 🐛 Troubleshooting

### Google OAuth Not Working
1. Check browser console for errors
2. Verify credentials in `.env.local`
3. Ensure NEXTAUTH_URL is correct
4. Check redirect URI in Google Console

### WebSocket Connection Failed
1. Check browser console
2. Ensure no ad blockers are interfering
3. Try hard refresh (Ctrl+Shift+R)

### 3D Models Not Loading
1. Check browser WebGL support
2. Try different browser
3. Check console for Three.js errors

### No Data Showing
- Most data is mocked/simulated
- Riot API key is used for some real data
- Check `.env.local` for API keys

## 🎯 Quick Test Checklist

- [ ] Login with Google OAuth
- [ ] View League dashboard
- [ ] Open a match with real-time updates
- [ ] Try 3D champion viewer
- [ ] Check player profile
- [ ] View tournaments
- [ ] Test draft assistant
- [ ] Access admin dashboard (if admin)
- [ ] Check performance metrics
- [ ] Test GraphQL queries

## 💡 Tips

1. **Best Experience**: Use Chrome/Edge for best WebGL performance
2. **Multiple Users**: Open incognito windows to test as different users
3. **Mobile**: Test responsive design on mobile devices
4. **Dark Mode**: The entire app supports dark mode by default

Remember to regenerate the Google OAuth credentials before testing OAuth login!