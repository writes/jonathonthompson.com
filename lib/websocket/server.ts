import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-advanced';
import jwt from 'jsonwebtoken';

// Redis clients for pub/sub
const pubClient = createClient({ 
  url: process.env.REDIS_URL || 'redis://localhost:6379' 
});
const subClient = pubClient.duplicate();

// Initialize Redis clients
Promise.all([pubClient.connect(), subClient.connect()]).catch(console.error);

export interface SocketWithAuth extends SocketIOServer {
  userId?: string;
  sessionId?: string;
}

export class WebSocketServer {
  private io: SocketIOServer;
  private connections: Map<string, Set<string>> = new Map();

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

    // Authentication middleware
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

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const userId = (socket as any).userId;
      console.log(`User ${userId} connected`);

      // Track user connections
      if (!this.connections.has(userId)) {
        this.connections.set(userId, new Set());
      }
      this.connections.get(userId)!.add(socket.id);

      // Join user-specific room
      socket.join(`user:${userId}`);

      // Handle match subscriptions
      socket.on('subscribe:match', (matchId: string) => {
        socket.join(`match:${matchId}`);
        socket.emit('subscribed', { channel: `match:${matchId}` });
      });

      socket.on('unsubscribe:match', (matchId: string) => {
        socket.leave(`match:${matchId}`);
      });

      // Handle player subscriptions
      socket.on('subscribe:player', (playerId: string) => {
        socket.join(`player:${playerId}`);
        socket.emit('subscribed', { channel: `player:${playerId}` });
      });

      socket.on('unsubscribe:player', (playerId: string) => {
        socket.leave(`player:${playerId}`);
      });

      // Handle tournament subscriptions
      socket.on('subscribe:tournament', (tournamentId: string) => {
        socket.join(`tournament:${tournamentId}`);
        socket.emit('subscribed', { channel: `tournament:${tournamentId}` });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`);
        const userConnections = this.connections.get(userId);
        if (userConnections) {
          userConnections.delete(socket.id);
          if (userConnections.size === 0) {
            this.connections.delete(userId);
          }
        }
      });
    });
  }

  // Emit match update to all subscribers
  public emitMatchUpdate(matchId: string, data: any) {
    this.io.to(`match:${matchId}`).emit('match:update', data);
  }

  // Emit player update to all subscribers
  public emitPlayerUpdate(playerId: string, data: any) {
    this.io.to(`player:${playerId}`).emit('player:update', data);
  }

  // Emit tournament update
  public emitTournamentUpdate(tournamentId: string, data: any) {
    this.io.to(`tournament:${tournamentId}`).emit('tournament:update', data);
  }

  // Send notification to specific user
  public sendToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Get active connections count
  public getConnectionsCount(): number {
    return this.connections.size;
  }

  // Get server instance
  public getServer(): SocketIOServer {
    return this.io;
  }
}