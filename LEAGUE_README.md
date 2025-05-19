# League of Legends Statistics Feature

This feature demonstrates advanced Next.js, GraphQL, and real-time data handling capabilities through a League of Legends statistics viewer.

## Features Implemented

### Authentication
- NextAuth.js integration with secure session management
- Animated login page using Framer Motion
- Protected routes with middleware

### GraphQL API
- Apollo Server wrapping Riot Games API
- Type-safe GraphQL schema for League data
- DataLoader pattern for efficient batching

### Performance & Caching
- In-memory caching with TTL management
- Rate limiting to respect Riot API limits (100 req/2min)
- Automatic cache cleanup

### UI/UX
- Framer Motion animations throughout
- Real-time polling for active games (30s intervals)
- Responsive design with Tailwind CSS
- Live game indicators with pulsing animations

### Pages
1. **Login** (`/league/login`) - Animated authentication page
2. **Player List** (`/league`) - Top 10 Challenger players with stats
3. **Player Detail** (`/league/player/[region]/[summonerId]`) - Comprehensive player statistics

## Demo Credentials
- Username: `demo`
- Password: `leaguestats2025`

## Architecture Decisions

### Why In-Memory Cache vs Redis
- No additional infrastructure required
- Sufficient for development API rate limits
- Easy to upgrade to Redis later

### Why Polling vs WebSockets
- Riot Games doesn't provide WebSocket APIs
- Polling interval (30s) balances freshness vs rate limits
- Can be upgraded to WebSocket with server-side polling

### Security
- API key stored in environment variables
- Authentication required for all League routes
- GraphQL context validates session

## Future Enhancements (Requiring Payment/External Setup)

1. **Redis Caching**
   - Distributed cache across multiple instances
   - Better rate limit management
   - Persistent cache storage

2. **WebSocket Server**
   - True real-time updates
   - Lower latency for game events
   - More efficient than polling

3. **Production Riot API Key**
   - 3000 requests/10s vs 100/2min
   - Access to more endpoints
   - Higher reliability

4. **Edge Deployment**
   - Cloudflare Workers or Vercel Edge
   - <10ms latency globally
   - Better scalability

## Running Locally

1. Ensure `.env.local` contains the Riot API key
2. Run `npm run dev`
3. Navigate to `/league`
4. Login with demo credentials
5. Explore top players and their statistics

## Technologies Showcased

- **Next.js 14** - App Router, Middleware, API Routes
- **GraphQL** - Apollo Server, Type-safe schemas
- **Framer Motion** - Complex animations, gestures
- **NextAuth.js** - Secure authentication
- **TypeScript** - Full type safety
- **Tailwind CSS** - Responsive styling

This implementation demonstrates production-ready patterns while remaining deployable on free hosting tiers.