# Jonathon Thompson Portfolio & League Stats Platform - Architecture Analysis Report

## Executive Summary

This is a sophisticated full-stack application combining a personal portfolio with a comprehensive League of Legends analytics platform. The architecture leverages modern web technologies with a focus on real-time capabilities, scalability, and performance optimization.

## Technology Stack Overview

### Frontend Technologies
- **Next.js 13.4.8** - React-based framework with App Router
  - *Implementation*: `app/layout.tsx:21-50` - Root layout with server components
  - *Configuration*: `next.config.js:2-28` - Image optimization and webpack config
  ```typescript
  // app/layout.tsx:21-50
  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="en" className="!scroll-smooth">
        <body className={`${inter.className} bg-gray-50 text-gray-950...`}>
          <ConditionalBackground />
          <Providers>
            <ThemeContextProvider>
              <ActiveSectionContextProvider>
                <ConditionalWrapper>
                  <Navigation />
                  {children}
                  <ConditionalFooter />
                </ConditionalWrapper>
              </ActiveSectionContextProvider>
            </ThemeContextProvider>
          </Providers>
        </body>
      </html>
    );
  }
  ```

- **TypeScript 5.1.5** - Type safety and developer experience
  - *Configuration*: `tsconfig.json:1-28` - Strict TypeScript settings
  - *Type Definitions*: `types/auth.d.ts`, `types/next-auth.d.ts` - Custom type definitions
  ```json
  // tsconfig.json:2-24
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
  ```

- **Tailwind CSS 3.3.2** - Utility-first styling framework
  - *Configuration*: `tailwind.config.js:1-19` - Dark mode and custom themes
  - *Usage*: `app/layout.tsx:29` - Responsive classes with dark mode support
  ```javascript
  // tailwind.config.js:8-18
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  darkMode: 'class',
  ```

- **Framer Motion 10.18.0** - Animation library
  - *Package*: `package.json:35` - Animation dependency
  - *Implementation*: Used in various components for smooth transitions

- **React Three Fiber 8.15.12** - 3D graphics with Three.js
  - *Dependencies*: `package.json:19-21` - Three.js ecosystem
  - *Components*: `components/champion-viewer.tsx` - 3D champion model viewer
  ```typescript
  // package.json:19-21
  "@react-three/drei": "^9.88.17",
  "@react-three/fiber": "^8.15.12",
  "@react-three/postprocessing": "^2.15.11",
  ```

- **Apollo Client 3.13.8** - GraphQL client with caching
  - *Package*: `package.json:12` - GraphQL client
  - *Implementation*: `components/providers.tsx:1-7` - Session provider setup

### Backend Technologies
- **Next.js API Routes** - Server-side API endpoints
  - *Implementation*: `app/api/graphql/route.ts:1-35` - GraphQL API endpoint
  - *Protected Routes*: `app/api/protected/` - Authentication-required endpoints
  ```typescript
  // app/api/graphql/route.ts:14-27
  const handler = startServerAndCreateNextHandler(server, {
    context: async (req: NextRequest) => {
      const session = await getServerSession(authOptions);
      
      if (!session) {
        throw new Error('Unauthorized');
      }

      return {
        riotApiKey: process.env.RIOT_API_DEVELOPMENT_KEY,
        user: session.user
      };
    }
  });
  ```

- **Apollo Server 4.12.2** - GraphQL server implementation
  - *Package*: `package.json:13` - GraphQL server dependency
  - *Schema*: `lib/graphql/schema.ts:1-239` - Complete GraphQL type definitions
  - *Resolvers*: `lib/graphql/resolvers.ts` - Business logic implementation
  ```typescript
  // lib/graphql/schema.ts:1-8
  export const typeDefs = `#graphql
    scalar DateTime

    type Query {
      topPlayers(region: Region!): [Player!]!
      player(region: Region!, summonerId: String!): Player
      currentGame(region: Region!, summonerId: String!): CurrentGameInfo
    }
  ```

- **Socket.io 4.8.1** - Real-time WebSocket communication
  - *Package*: `package.json:54-55` - WebSocket libraries
  - *Server*: `lib/websocket/server.ts:1-144` - WebSocket server implementation
  - *Custom Server*: `server.js:1-39` - Node.js server with WebSocket support
  ```typescript
  // lib/websocket/server.ts:23-38
  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    // Use Redis adapter for horizontal scaling
    this.io.adapter(createAdapter(pubClient, subClient));
  }
  ```

- **NextAuth.js 4.24.11** - Authentication framework
  - *Package*: `package.json:42` - Authentication library
  - *Configuration*: `lib/auth.ts:1-54` - Authentication options
  - *Middleware*: `middleware.ts:1-76` - Route protection
  ```typescript
  // lib/auth.ts:4-32
  export const authOptions: NextAuthOptions = {
    providers: [
      CredentialsProvider({
        name: "credentials",
        credentials: {
          username: { label: "Username", type: "text" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          // Authentication logic
        }
      })
    ],
    session: {
      strategy: "jwt"
    }
  };
  ```

- **Node.js Custom Server** - Custom HTTP/WebSocket server
  - *Implementation*: `server.js:1-39` - Custom server setup
  - *Integration*: `package.json:8` - Production start script
  ```javascript
  // server.js:12-26
  app.prepare().then(() => {
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    });

    // Initialize WebSocket server
    const wsServer = new WebSocketServer(server);
  });
  ```

### Data & Caching Layer
- **Redis 5.5.6** - In-memory data store for caching and pub/sub
  - *Package*: `package.json:52` - Redis client
  - *Implementation*: `lib/redis/client.ts:1-208` - Comprehensive Redis service class
  - *WebSocket Integration*: `lib/websocket/server.ts:9-16` - Redis adapter for scaling
  ```typescript
  // lib/redis/client.ts:3-30
  export class RedisService {
    private client: RedisClientType;
    private isConnected: boolean = false;

    constructor() {
      // Skip Redis initialization if disabled
      if (process.env.DISABLE_REDIS === 'true') {
        console.log('Redis disabled via DISABLE_REDIS environment variable');
        return;
      }

      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 5000)
        }
      });
    }
  }
  ```

- **GraphQL** - API query language with type safety
  - *Schema*: `lib/graphql/schema.ts:10-239` - Comprehensive type system
  - *Subscriptions*: `lib/graphql/subscriptions.ts` - Real-time GraphQL subscriptions
  - *Cache Management*: `lib/graphql/cache-manager.ts` - GraphQL caching strategies

- **DataLoader 2.2.3** - Batching and caching for GraphQL resolvers
  - *Package*: `package.json:31` - Batching dependency
  - *Implementation*: Used in GraphQL resolvers to prevent N+1 queries

### Machine Learning & Analytics
- **FastAPI** - Python microservice for ML operations
  - *Service*: `ml-service/main.py:1-316` - Complete ML API implementation
  - *Models*: `ml-service/main.py:85-194` - Draft assistant and match prediction
  ```python
  # ml-service/main.py:13-23
  app = FastAPI(title="League ML Service", version="1.0.0")

  app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:3000", "https://jonathonthompson.com"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```

- **NumPy & Pandas** - Data processing and analysis
  - *Requirements*: `ml-service/requirements.txt` - Python dependencies
  - *Usage*: `ml-service/main.py:92-102` - Mock data generation and analysis

- **Mock ML Models** - Draft assistance and match prediction
  - *Draft Assistant*: `ml-service/main.py:85-163` - Champion recommendation engine
  - *Match Predictor*: `ml-service/main.py:164-191` - Win probability calculation

### Security & Middleware
- **bcryptjs** - Password hashing
  - *Package*: `package.json:28` - Password hashing library
  - *Usage*: Authentication system for secure password storage

- **JWT** - Token-based authentication
  - *Package*: `package.json:39` - JSON Web Token library
  - *Implementation*: `lib/websocket/server.ts:47-55` - WebSocket authentication
  ```typescript
  // lib/websocket/server.ts:40-56
  this.io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;
      (socket as any).userId = decoded.id;
      (socket as any).sessionId = socket.id;

      next();
    } catch (err) {
      next(new Error('Invalid authentication'));
    }
  });
  ```

- **Custom security middleware** - Rate limiting and security headers
  - *Implementation*: `lib/security-middleware.ts` - Security headers and rate limiting
  - *Integration*: `middleware.ts:4-13` - Middleware pipeline
  ```typescript
  // middleware.ts:7-13
  export default withAuth(
    async function middleware(req: NextRequest) {
      // Apply security middleware first
      const securityResponse = await securityMiddleware(req);
      if (securityResponse.status !== 200) {
        return securityResponse;
      }
    }
  );
  ```

- **Zod 3.25.63** - Runtime type validation
  - *Package*: `package.json:60` - Schema validation library
  - *Implementation*: `lib/validation.ts` - Input validation schemas

## Architecture Analysis

### 1. Frontend Architecture

**Implementation Examples:**

*Next.js App Router Structure:*
```typescript
// app/league/layout.tsx - Nested layouts for League section
export default function LeagueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
```

*Context Providers:* `context/theme-context.tsx`, `context/active-section-context.tsx`
```typescript
// context/theme-context.tsx - Theme management
"use client";

import React, { useEffect, useState, createContext, useContext } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<ThemeContextType | null>(null);

export default function ThemeContextProvider({
  children,
}: ThemeContextProviderProps) {
  const [theme, setTheme] = useState<Theme>("light");

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      window.localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      window.localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    }
  };
}
```

*Component Examples:*
- `components/champion-viewer.tsx` - 3D champion model viewer
- `components/tournament-bracket.tsx` - Interactive tournament bracket
- `components/real-time-status.tsx` - Live match status updates

**Strengths:**
- **Modern React Patterns**: Uses Next.js 13 App Router with server components for optimal performance
- **Type Safety**: Full TypeScript implementation reduces runtime errors  
- **Component Organization**: Well-structured component hierarchy with clear separation of concerns
- **Performance Optimizations**: Code splitting, lazy loading, and optimized image handling
- **3D Graphics Integration**: React Three Fiber enables sophisticated visual components
- **Real-time Updates**: WebSocket integration for live data updates

**Weaknesses:**
- **Complex State Management**: No centralized state management solution (Redux/Zustand)
- **Bundle Size**: Heavy dependencies (Three.js, Apollo Client) may impact initial load
- **Limited Error Boundaries**: Basic error handling implementation

**Technologies Chosen For:**
- **Next.js**: Server-side rendering, automatic code splitting, and excellent developer experience
- **TypeScript**: Enhanced code quality and developer productivity
- **Tailwind CSS**: Rapid UI development with consistent design system
- **Framer Motion**: Smooth animations without performance penalties

### 2. Backend Architecture

**Implementation Examples:**

*GraphQL Resolver Pattern:* `lib/graphql/resolvers.ts`
```typescript
// lib/graphql/resolvers.ts - Example resolver structure
export const resolvers = {
  Query: {
    topPlayers: async (
      _: any,
      { region }: { region: Region },
      { riotApiKey }: Context
    ) => {
      const cacheKey = `top-players:${region}`;
      const cached = await redisService.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const players = await fetchTopPlayersFromRiot(region, riotApiKey);
      await redisService.set(cacheKey, JSON.stringify(players), 300);
      
      return players;
    },
  },
  
  Subscription: {
    playerGameUpdate: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['PLAYER_GAME_UPDATE']),
        (payload, variables) => {
          return payload.playerGameUpdate.summonerId === variables.summonerId;
        }
      ),
    },
  },
};
```

*WebSocket Event Handling:* `lib/websocket/server.ts:75-94`
```typescript
// WebSocket subscription management
socket.on('subscribe:match', (matchId: string) => {
  socket.join(`match:${matchId}`);
  socket.emit('subscribed', { channel: `match:${matchId}` });
});

socket.on('subscribe:player', (playerId: string) => {
  socket.join(`player:${playerId}`);
  socket.emit('subscribed', { channel: `player:${playerId}` });
});

// Emit updates to subscribers
public emitMatchUpdate(matchId: string, data: any) {
  this.io.to(`match:${matchId}`).emit('match:update', data);
}
```

*Middleware Pipeline:* `middleware.ts:7-41`
```typescript
// Combined authentication and security middleware
export default withAuth(
  async function middleware(req: NextRequest) {
    // Apply security middleware first
    const securityResponse = await securityMiddleware(req);
    if (securityResponse.status !== 200) {
      return securityResponse;
    }

    const token = (req as any).nextauth?.token;
    const path = req.nextUrl.pathname;

    // Admin routes
    if (path.startsWith("/admin")) {
      if (token?.role !== UserRole.ADMIN) {
        return NextResponse.redirect(new URL("/auth/unauthorized", req.url));
      }
    }

    // API protection
    if (path.startsWith("/api/protected")) {
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    return securityResponse;
  }
);
```

*Service Layer Architecture:* `lib/services/`
- `lib/services/cache.ts` - Caching service abstraction
- `lib/services/leaderboard.ts` - Leaderboard management
- `lib/services/tournament.ts` - Tournament logic
- `lib/services/rate-limiter.ts` - API rate limiting

**Strengths:**
- **GraphQL Implementation**: Type-safe API with efficient data fetching
- **Real-time Capabilities**: WebSocket server with Redis adapter for horizontal scaling
- **Microservice Approach**: Separate Python ML service for specialized computations
- **Authentication Integration**: Multiple auth providers with JWT tokens
- **Middleware Pipeline**: Comprehensive security and authentication middleware

**Weaknesses:**
- **No Database Layer**: Currently using mock data and Redis for persistence
- **Limited Error Handling**: Basic error propagation without structured logging
- **GraphQL Complexity**: No query complexity analysis or rate limiting
- **Single Point of Failure**: Monolithic Next.js server handles multiple concerns

**Technologies Chosen For:**
- **Apollo Server**: Robust GraphQL implementation with built-in caching
- **Socket.io**: Mature WebSocket library with fallback mechanisms
- **NextAuth.js**: Comprehensive authentication with multiple providers
- **Custom Node.js Server**: Full control over HTTP and WebSocket handling

### 3. Data Architecture

**Implementation Examples:**

*Redis Operations:* `lib/redis/client.ts:47-149`
```typescript
// Comprehensive Redis operations
export class RedisService {
  // Basic cache operations
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setEx(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  // Leaderboard operations with sorted sets
  async zAdd(key: string, score: number, member: string): Promise<number> {
    return await this.client.zAdd(key, { score, value: member });
  }

  async zRevRange(key: string, start: number, stop: number, withScores: boolean = false) {
    if (withScores) {
      return await this.client.zRangeWithScores(key, start, stop, { REV: true });
    }
    return await this.client.zRange(key, start, stop, { REV: true });
  }

  // Pub/Sub for real-time updates
  async publish(channel: string, message: string): Promise<number> {
    return await this.client.publish(channel, message);
  }
}
```

*GraphQL Schema Design:* `lib/graphql/schema.ts:52-77`
```graphql
# Complex type relationships
type Player {
  id: String!
  accountId: String!
  puuid: String!
  profileIconId: Int!
  summonerLevel: Int!
  summonerName: String!
  region: Region!
  leagueEntry: LeagueEntry
  recentMatches: [Match!]!
  currentGame: CurrentGameInfo
  lastChampionPlayed: Champion
}

type LeagueEntry {
  tier: Tier!
  division: Division!
  leaguePoints: Int!
  wins: Int!
  losses: Int!
  winRate: Float!
  hotStreak: Boolean!
  veteran: Boolean!
  freshBlood: Boolean!
  inactive: Boolean!
}
```

*Real-time Subscriptions:* `lib/graphql/schema.ts:10-16`
```graphql
type Subscription {
  playerGameUpdate(summonerId: String!): PlayerGameUpdate!
  matchUpdated(matchId: String!): Match!
  playerStatusChanged(playerId: String!): PlayerStatus!
  tournamentUpdated(tournamentId: String!): Tournament!
  leaderboardChanged(region: Region!): LeaderboardUpdate!
}
```

*Caching Strategy:* `lib/graphql/cache-manager.ts`
- Apollo Client cache configuration
- Redis-based server-side caching
- TTL-based cache invalidation

**Strengths:**
- **Caching Strategy**: Multi-layer caching with Redis and GraphQL cache
- **Real-time Synchronization**: Redis pub/sub for cross-service communication
- **Data Modeling**: Well-structured GraphQL schema with proper typing
- **Performance Optimization**: DataLoader prevents N+1 query problems

**Weaknesses:**
- **No Persistent Database**: Relies entirely on external APIs and Redis cache
- **Data Consistency**: No ACID transactions or data validation at storage level
- **Backup Strategy**: No data persistence strategy for critical user data
- **Scalability Limits**: Redis as primary data store may not scale for complex queries

**Technologies Chosen For:**
- **Redis**: High-performance caching and pub/sub messaging
- **GraphQL**: Efficient data querying with strong typing
- **DataLoader**: Request batching and caching optimization

### 4. Security Implementation

**Implementation Examples:**

*Role-Based Access Control:* `middleware.ts:18-31`
```typescript
// Admin route protection
if (path.startsWith("/admin")) {
  if (token?.role !== UserRole.ADMIN) {
    return NextResponse.redirect(new URL("/auth/unauthorized", req.url));
  }
}

// Moderator routes
if (path.startsWith("/moderate")) {
  if (![UserRole.ADMIN, UserRole.MODERATOR].includes(token?.role as UserRole)) {
    return NextResponse.redirect(new URL("/auth/unauthorized", req.url));
  }
}

// API protection
if (path.startsWith("/api/protected")) {
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
```

*Security Middleware:* `lib/security-middleware.ts`
```typescript
export async function securityMiddleware(req: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
  );
  
  // Rate limiting logic
  const ip = req.ip || 'unknown';
  const rateLimitResult = await checkRateLimit(ip);
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  return response;
}
```

*Authentication Configuration:* `lib/auth-advanced.ts`
```typescript
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // bcrypt password verification
        const isValid = await bcrypt.compare(
          credentials.password,
          hashedPassword
        );
        
        if (isValid) {
          return {
            id: user.id,
            email: user.email,
            role: user.role
          };
        }
        
        return null;
      }
    })
  ],
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.provider = account?.provider;
      }
      return token;
    },
    
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role as UserRole;
      return session;
    }
  }
};
```

*Input Validation:* `lib/validation.ts`
```typescript
import { z } from 'zod';

export const PlayerQuerySchema = z.object({
  region: z.enum(['NA1', 'EUW1', 'EUN1', 'KR', 'BR1', 'JP1']),
  summonerId: z.string().min(1).max(100),
});

export const MatchPredictionSchema = z.object({
  blueTeam: z.array(z.string()).length(5),
  redTeam: z.array(z.string()).length(5),
  gameMode: z.enum(['CLASSIC', 'ARAM', 'RANKED']).optional(),
});
```

**Strengths:**
- **Authentication Layers**: Multiple auth methods with JWT tokens
- **Password Security**: bcrypt hashing for credential protection
- **Middleware Security**: Custom security headers and rate limiting
- **Input Validation**: Zod schemas for runtime type checking
- **CORS Configuration**: Proper cross-origin resource sharing setup

**Weaknesses:**
- **Session Management**: Basic JWT implementation without refresh tokens
- **Authorization Granularity**: Limited role-based access control
- **API Security**: No GraphQL-specific security measures (query depth limiting)
- **Secrets Management**: Environment variables without rotation strategy

**Technologies Chosen For:**
- **NextAuth.js**: Mature authentication solution with OAuth support
- **bcryptjs**: Industry-standard password hashing
- **JWT**: Stateless authentication for scalability

### 5. Machine Learning Integration

**Implementation Examples:**

*FastAPI Service Structure:* `ml-service/main.py:13-23`
```python
# FastAPI application setup
app = FastAPI(title="League ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://jonathonthompson.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis connection for caching
redis_client = redis.Redis(
    host='localhost',
    port=6379,
    decode_responses=True
)
```

*Draft Recommendation Engine:* `ml-service/main.py:104-131`
```python
def recommend_champions(self, request: DraftRequest) -> List[ChampionRecommendation]:
    available_champions = [
        champ for champ in CHAMPIONS 
        if champ not in request.team_picks + request.enemy_picks + request.team_bans + request.enemy_bans
        and CHAMPIONS[champ]["role"] == request.role
    ]
    
    recommendations = []
    for champion in available_champions[:5]:  # Top 5 recommendations
        score = np.random.rand()
        win_rate = self.win_rates.get(champion, 0.5)
        
        recommendation = ChampionRecommendation(
            champion=champion,
            score=round(score * 100, 2),
            win_rate=round(win_rate * 100, 2),
            reasons=[
                f"Strong against {request.enemy_picks[0] if request.enemy_picks else 'enemy comp'}",
                f"Good synergy with {request.team_picks[0] if request.team_picks else 'your team'}",
                "Currently meta pick"
            ],
            synergies=request.team_picks[:2] if request.team_picks else [],
            counters=request.enemy_picks[:2] if request.enemy_picks else []
        )
        recommendations.append(recommendation)
    
    return sorted(recommendations, key=lambda x: x.score, reverse=True)
```

*API Endpoints with Caching:* `ml-service/main.py:226-255`
```python
@app.post("/draft/recommend", response_model=DraftResponse)
async def recommend_draft(request: DraftRequest):
    try:
        # Get recommendations
        recommendations = draft_assistant.recommend_champions(request)
        
        # Analyze team composition
        comp_analysis = draft_assistant.analyze_team_composition(request.team_picks)
        
        # Cache results
        cache_key = f"draft:{hash(str(request.dict()))}"
        redis_client.setex(
            cache_key,
            300,  # 5 minutes TTL
            json.dumps({
                "recommendations": [r.dict() for r in recommendations],
                "analysis": comp_analysis
            })
        )
        
        return DraftResponse(
            recommendations=recommendations,
            team_composition_score=comp_analysis["score"],
            damage_distribution=comp_analysis["damage_distribution"],
            team_strengths=comp_analysis["strengths"],
            team_weaknesses=comp_analysis["weaknesses"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Draft recommendation error: {str(e)}")
```

*Pydantic Data Models:* `ml-service/main.py:47-83`
```python
class DraftRequest(BaseModel):
    team_picks: List[str]
    enemy_picks: List[str]
    team_bans: List[str]
    enemy_bans: List[str]
    role: str
    player_champion_pool: Optional[List[str]] = None

class ChampionRecommendation(BaseModel):
    champion: str
    score: float
    win_rate: float
    reasons: List[str]
    synergies: List[str]
    counters: List[str]

class DraftResponse(BaseModel):
    recommendations: List[ChampionRecommendation]
    team_composition_score: float
    damage_distribution: Dict[str, float]
    team_strengths: List[str]
    team_weaknesses: List[str]
```

*Health Check Endpoint:* `ml-service/main.py:210-224`
```python
@app.get("/health")
async def health_check():
    try:
        # Check Redis connection
        redis_client.ping()
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "redis": "connected",
                "ml_models": "loaded"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")
```

**Strengths:**
- **Microservice Architecture**: Isolated Python service for ML operations
- **API Design**: RESTful endpoints with proper data modeling
- **Caching Integration**: Redis caching for ML prediction results
- **Health Monitoring**: Service health checks and status endpoints

**Weaknesses:**
- **Mock Implementation**: No actual ML models or training data
- **Performance**: Synchronous API calls may cause latency
- **Scalability**: Single instance without load balancing
- **Model Management**: No versioning or A/B testing capabilities

**Technologies Chosen For:**
- **FastAPI**: High-performance Python API framework
- **NumPy/Pandas**: Standard data science libraries
- **Redis Integration**: Shared caching layer with main application

## Improvement Recommendations

### 1. Database Layer Enhancement
- **Add PostgreSQL**: Implement proper relational database for persistent data
- **Prisma ORM**: Type-safe database client with migrations
- **Data Modeling**: Design normalized schema for users, matches, and tournaments

### 2. State Management Optimization
- **Zustand Integration**: Lightweight state management for complex UI state
- **Apollo Cache Optimization**: Implement custom cache policies
- **Optimistic Updates**: Improve UX with optimistic mutations

### 3. Performance Improvements
- **Bundle Analysis**: Implement bundle analyzer and optimization
- **CDN Integration**: Static asset delivery optimization
- **Service Worker**: Offline capabilities and background sync
- **Database Indexing**: Query optimization strategies

### 4. Security Enhancements
- **Refresh Tokens**: Implement secure token refresh mechanism
- **Rate Limiting**: GraphQL query complexity analysis
- **Audit Logging**: Comprehensive security event logging
- **Secrets Management**: HashiCorp Vault or AWS Secrets Manager

### 5. Scalability Improvements
- **Database Sharding**: Horizontal scaling for large datasets
- **Microservice Split**: Separate concerns into dedicated services
- **Load Balancing**: Multiple application instances
- **Caching Layers**: Multi-tier caching strategy

### 6. Development Experience
- **Testing Framework**: Jest/React Testing Library implementation
- **CI/CD Pipeline**: Automated testing and deployment
- **Monitoring**: Application performance monitoring (APM)
- **Documentation**: API documentation and architecture diagrams

### 7. Machine Learning Evolution
- **Real ML Models**: Implement actual ML algorithms with training data
- **Model Versioning**: MLflow or similar for model lifecycle management
- **Feature Engineering**: Advanced data preprocessing pipelines
- **A/B Testing**: Model performance comparison framework

## Technology Justification

### Why These Technologies Were Excellent Choices:

1. **Next.js**: Perfect for hybrid SSR/CSR applications with excellent developer experience
2. **TypeScript**: Essential for large-scale applications to prevent runtime errors
3. **GraphQL**: Ideal for complex data relationships and efficient mobile/web clients  
4. **Redis**: Optimal for high-performance caching and real-time features
5. **Socket.io**: Mature solution for real-time features with fallback mechanisms
6. **Tailwind CSS**: Enables rapid UI development with consistent design systems
7. **React Three Fiber**: Declarative 3D graphics that integrate well with React patterns

### Alternative Considerations:
- **tRPC**: Could replace GraphQL for end-to-end type safety
- **SvelteKit**: Lighter alternative to Next.js for better performance
- **Bun**: Could replace Node.js for improved performance
- **Drizzle ORM**: Type-safe database queries alternative to Prisma

## File Structure Analysis

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── graphql/       # GraphQL server endpoint
│   │   ├── admin/         # Admin-only endpoints
│   │   └── protected/     # Protected API routes
│   ├── league/            # League stats pages
│   ├── admin/             # Admin dashboard pages
│   └── auth/              # Authentication pages
├── components/            # React components
│   ├── champion-*.tsx     # League-specific components
│   ├── draft-*.tsx        # Draft assistance components
│   └── tournament-*.tsx   # Tournament components
├── lib/                   # Utilities and services
│   ├── websocket/         # WebSocket server implementation
│   ├── redis/             # Redis client and operations
│   ├── services/          # Business logic services
│   ├── graphql/           # GraphQL schema and resolvers
│   └── auth*.ts           # Authentication configurations
├── hooks/                 # Custom React hooks
├── ml-service/            # Python ML microservice
└── types/                 # TypeScript type definitions
```

## Key Architecture Patterns

### 1. Layered Architecture
- **Presentation Layer**: React components with TypeScript
- **Business Logic Layer**: GraphQL resolvers and service classes
- **Data Access Layer**: Redis operations and external API calls
- **External Services**: Riot API, ML service, authentication providers

### 2. Event-Driven Architecture
- **WebSocket Events**: Real-time updates for matches and tournaments
- **Redis Pub/Sub**: Inter-service communication
- **GraphQL Subscriptions**: Real-time data synchronization

### 3. Microservice Pattern
- **Main Application**: Next.js handling web requests and WebSocket connections
- **ML Service**: Python FastAPI for machine learning operations
- **External APIs**: Riot Games API for League data

### 4. Caching Strategy
- **Browser Cache**: Static assets and API responses
- **Redis Cache**: Frequent data and session storage
- **GraphQL Cache**: Apollo Client intelligent caching
- **ML Cache**: Prediction results with TTL

## Performance Characteristics

### Strengths:
- **Server-Side Rendering**: Fast initial page loads
- **Code Splitting**: Automatic bundle optimization
- **Caching Layers**: Multiple levels of data caching
- **Real-time Updates**: Efficient WebSocket communication

### Areas for Optimization:
- **Bundle Size**: Large dependencies impact initial load
- **Database Queries**: No persistent database optimizations
- **Image Optimization**: Could benefit from CDN integration
- **Service Worker**: Missing offline capabilities

## Conclusion

This architecture demonstrates sophisticated full-stack development with modern best practices. The technology choices show excellent understanding of performance, scalability, and developer experience trade-offs. The main areas for improvement involve adding persistent data storage, implementing comprehensive testing, and evolving the ML capabilities from mock to production-ready implementations.

The foundation is solid for building a production-ready application that could scale to handle significant user loads while maintaining excellent performance and developer productivity.

---

*Generated on: 2025-06-26*
*Analysis Version: 1.0*