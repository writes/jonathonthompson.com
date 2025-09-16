import { PubSub } from 'graphql-subscriptions';
import { WebSocketServer } from '@/lib/websocket/server';

// Create PubSub instance for GraphQL subscriptions
export const pubsub = new PubSub();

// Subscription event types
export const SUBSCRIPTION_EVENTS = {
  MATCH_UPDATED: 'MATCH_UPDATED',
  PLAYER_STATUS_CHANGED: 'PLAYER_STATUS_CHANGED',
  TOURNAMENT_UPDATED: 'TOURNAMENT_UPDATED',
  LEADERBOARD_CHANGED: 'LEADERBOARD_CHANGED',
} as const;

// Helper to publish match updates
export function publishMatchUpdate(matchId: string, match: any, wsServer?: WebSocketServer) {
  pubsub.publish(SUBSCRIPTION_EVENTS.MATCH_UPDATED, { 
    matchUpdated: match 
  });
  
  // Also emit via WebSocket if available
  if (wsServer) {
    wsServer.emitMatchUpdate(matchId, match);
  }
}

// Helper to publish player status changes
export function publishPlayerStatusChange(playerId: string, status: any, wsServer?: WebSocketServer) {
  pubsub.publish(SUBSCRIPTION_EVENTS.PLAYER_STATUS_CHANGED, {
    playerStatusChanged: status
  });
  
  if (wsServer) {
    wsServer.emitPlayerUpdate(playerId, status);
  }
}

// Helper to publish tournament updates
export function publishTournamentUpdate(tournamentId: string, tournament: any, wsServer?: WebSocketServer) {
  pubsub.publish(SUBSCRIPTION_EVENTS.TOURNAMENT_UPDATED, {
    tournamentUpdated: tournament
  });
  
  if (wsServer) {
    wsServer.emitTournamentUpdate(tournamentId, tournament);
  }
}

// Helper to publish leaderboard changes
export function publishLeaderboardChange(region: string, leaderboard: any) {
  pubsub.publish(SUBSCRIPTION_EVENTS.LEADERBOARD_CHANGED, {
    leaderboardChanged: { region, leaderboard }
  });
}