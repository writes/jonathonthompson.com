# Jonathon Thompson Portfolio & League Stats Platform

A high-performance portfolio website with an integrated League of Legends statistics platform built with Next.js 14, TypeScript, GraphQL, and advanced real-time features.

## Features

### Portfolio
- Modern, responsive design with Framer Motion animations
- Dark mode support
- SEO optimized
- Performance monitoring dashboard

### League of Legends Platform
- **Real-time Updates**: WebSocket integration with Socket.io for live match updates
- **3D Champion Viewer**: Interactive Three.js models with React Three Fiber
- **ML-Powered Analytics**: Draft assistant and match predictions
- **Tournament System**: Complete bracket management for multiple tournament formats
- **Advanced Caching**: Redis integration for leaderboards and performance
- **Security**: Rate limiting, DDoS protection, and secure authentication

## Getting Started

### Prerequisites
- Node.js 18+
- Redis (optional, for caching features)
- Python 3.8+ (optional, for ML service)

### Environment Setup

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Configure environment variables in `.env.local`:
```
# Authentication
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Riot Games API
RIOT_API_DEVELOPMENT_KEY=your-riot-api-key

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run Redis (optional)
redis-server

# Run ML service (optional)
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload
```

Open [http://localhost:3000](http://localhost:3000) to see the portfolio.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── league/            # League stats pages
│   ├── admin/             # Admin dashboard
│   └── auth/              # Authentication pages
├── components/            # React components
├── lib/                   # Utilities and services
│   ├── websocket/         # WebSocket server
│   ├── redis/             # Redis client
│   ├── services/          # Business logic
│   └── graphql/           # GraphQL schema
├── hooks/                 # Custom React hooks
├── ml-service/            # Python ML microservice
└── public/                # Static assets
```

## Authentication

The platform supports multiple authentication methods:
- Email/Password (with bcrypt hashing)
- Google OAuth
- GitHub OAuth

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

## Key Features Implementation

### WebSocket Real-time Updates
- Horizontal scaling with Redis adapter
- Room-based subscriptions
- Automatic reconnection
- JWT authentication

### 3D Champion Viewer
- GLTF model loading
- LOD system for performance
- Skin switching
- Post-processing effects

### Tournament System
- Single/Double elimination
- Swiss system
- Round-robin
- Visual bracket rendering

### Performance Monitoring
- Request metrics tracking
- System health monitoring
- Real-time dashboards
- Alert system

## Security

- Rate limiting on all endpoints
- GraphQL query complexity analysis
- CSRF protection
- Security headers (CSP, HSTS, etc.)
- Input validation with Zod

## Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Docker
```bash
docker build -t portfolio .
docker run -p 3000:3000 portfolio
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.
