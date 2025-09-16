import { getRedisService } from '@/lib/redis/client';
import { publishLeaderboardChange } from '@/lib/graphql/subscriptions';
import { Region } from '@/lib/graphql/types';

interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  rank: number;
  leaguePoints: number;
  wins: number;
  losses: number;
  winRate: number;
  tier: string;
  division: string;
  hotStreak: boolean;
  profileIconId: number;
}

interface LeaderboardUpdate {
  playerId: string;
  playerName: string;
  previousRank: number;
  newRank: number;
  lpChange: number;
}

export class LeaderboardService {
  private redis = getRedisService();
  private readonly LEADERBOARD_PREFIX = 'leaderboard:';
  private readonly PLAYER_DATA_PREFIX = 'player:data:';
  private readonly LEADERBOARD_TTL = 300; // 5 minutes

  async connect() {
    await this.redis.connect();
  }

  // Get leaderboard key for a region
  private getLeaderboardKey(region: string): string {
    return `${this.LEADERBOARD_PREFIX}${region.toLowerCase()}`;
  }

  // Get player data key
  private getPlayerDataKey(playerId: string): string {
    return `${this.PLAYER_DATA_PREFIX}${playerId}`;
  }

  // Update player in leaderboard
  async updatePlayer(region: string, entry: LeaderboardEntry): Promise<LeaderboardUpdate | null> {
    const leaderboardKey = this.getLeaderboardKey(region);
    const playerDataKey = this.getPlayerDataKey(entry.playerId);

    // Get previous rank
    const previousRank = await this.redis.zRevRank(leaderboardKey, entry.playerId);
    
    // Calculate score (LP + tier bonus)
    const score = this.calculateScore(entry);
    
    // Update leaderboard
    await this.redis.zAdd(leaderboardKey, score, entry.playerId);
    
    // Store player data
    await this.redis.hSet(playerDataKey, 'data', JSON.stringify(entry));
    await this.redis.expire(playerDataKey, this.LEADERBOARD_TTL);
    
    // Set leaderboard expiry
    await this.redis.expire(leaderboardKey, this.LEADERBOARD_TTL);
    
    // Get new rank
    const newRank = await this.redis.zRevRank(leaderboardKey, entry.playerId);
    
    if (previousRank !== null && newRank !== null && previousRank !== newRank) {
      const update: LeaderboardUpdate = {
        playerId: entry.playerId,
        playerName: entry.playerName,
        previousRank: previousRank + 1, // Convert 0-based to 1-based
        newRank: newRank + 1,
        lpChange: 0 // Would need previous LP to calculate
      };
      
      // Publish update
      publishLeaderboardChange(region, {
        region: region as Region,
        timestamp: new Date(),
        changes: [update]
      });
      
      return update;
    }
    
    return null;
  }

  // Update multiple players (batch operation)
  async updateMultiplePlayers(region: string, entries: LeaderboardEntry[]): Promise<LeaderboardUpdate[]> {
    const updates: LeaderboardUpdate[] = [];
    const leaderboardKey = this.getLeaderboardKey(region);
    
    // Get all previous ranks
    const previousRanks = new Map<string, number>();
    for (const entry of entries) {
      const rank = await this.redis.zRevRank(leaderboardKey, entry.playerId);
      if (rank !== null) {
        previousRanks.set(entry.playerId, rank);
      }
    }
    
    // Batch update using transaction
    const multi = await this.redis.multi();
    
    for (const entry of entries) {
      const score = this.calculateScore(entry);
      const playerDataKey = this.getPlayerDataKey(entry.playerId);
      
      multi.zAdd(leaderboardKey, score, entry.playerId);
      multi.hSet(playerDataKey, 'data', JSON.stringify(entry));
      multi.expire(playerDataKey, this.LEADERBOARD_TTL);
    }
    
    multi.expire(leaderboardKey, this.LEADERBOARD_TTL);
    await multi.exec();
    
    // Get new ranks and calculate changes
    for (const entry of entries) {
      const newRank = await this.redis.zRevRank(leaderboardKey, entry.playerId);
      const previousRank = previousRanks.get(entry.playerId);
      
      if (previousRank !== undefined && newRank !== null && previousRank !== newRank) {
        updates.push({
          playerId: entry.playerId,
          playerName: entry.playerName,
          previousRank: previousRank + 1,
          newRank: newRank + 1,
          lpChange: 0
        });
      }
    }
    
    if (updates.length > 0) {
      publishLeaderboardChange(region, {
        region: region as Region,
        timestamp: new Date(),
        changes: updates
      });
    }
    
    return updates;
  }

  // Get top players from leaderboard
  async getTopPlayers(region: string, limit: number = 100): Promise<LeaderboardEntry[]> {
    const leaderboardKey = this.getLeaderboardKey(region);
    
    // Get top players with scores
    const topPlayers = await this.redis.zRevRange(leaderboardKey, 0, limit - 1, true) as { value: string; score: number }[];
    
    if (topPlayers.length === 0) {
      return [];
    }
    
    // Fetch player data
    const players: LeaderboardEntry[] = [];
    
    for (let i = 0; i < topPlayers.length; i++) {
      const { value: playerId } = topPlayers[i];
      const playerDataKey = this.getPlayerDataKey(playerId);
      const playerData = await this.redis.hGet(playerDataKey, 'data');
      
      if (playerData) {
        const entry = JSON.parse(playerData) as LeaderboardEntry;
        entry.rank = i + 1;
        players.push(entry);
      }
    }
    
    return players;
  }

  // Get player rank
  async getPlayerRank(region: string, playerId: string): Promise<number | null> {
    const leaderboardKey = this.getLeaderboardKey(region);
    const rank = await this.redis.zRevRank(leaderboardKey, playerId);
    return rank !== null ? rank + 1 : null;
  }

  // Get players around a specific rank
  async getPlayersAroundRank(region: string, rank: number, range: number = 5): Promise<LeaderboardEntry[]> {
    const leaderboardKey = this.getLeaderboardKey(region);
    const start = Math.max(0, rank - range - 1);
    const stop = rank + range - 1;
    
    const players = await this.redis.zRevRange(leaderboardKey, start, stop, true) as { value: string; score: number }[];
    
    const entries: LeaderboardEntry[] = [];
    
    for (let i = 0; i < players.length; i++) {
      const { value: playerId } = players[i];
      const playerDataKey = this.getPlayerDataKey(playerId);
      const playerData = await this.redis.hGet(playerDataKey, 'data');
      
      if (playerData) {
        const entry = JSON.parse(playerData) as LeaderboardEntry;
        entry.rank = start + i + 1;
        entries.push(entry);
      }
    }
    
    return entries;
  }

  // Remove player from leaderboard
  async removePlayer(region: string, playerId: string): Promise<void> {
    const leaderboardKey = this.getLeaderboardKey(region);
    const playerDataKey = this.getPlayerDataKey(playerId);
    
    await this.redis.zRem(leaderboardKey, playerId);
    await this.redis.del(playerDataKey);
  }

  // Clear entire leaderboard
  async clearLeaderboard(region: string): Promise<void> {
    const leaderboardKey = this.getLeaderboardKey(region);
    const pattern = `${this.PLAYER_DATA_PREFIX}*`;
    
    await this.redis.del(leaderboardKey);
    
    // Clear player data
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      for (const key of keys) {
        await this.redis.del(key);
      }
    }
  }

  // Get leaderboard size
  async getLeaderboardSize(region: string): Promise<number> {
    const leaderboardKey = this.getLeaderboardKey(region);
    return await this.redis.zCard(leaderboardKey);
  }

  // Calculate score based on tier and LP
  private calculateScore(entry: LeaderboardEntry): number {
    const tierValues: Record<string, number> = {
      'CHALLENGER': 2800,
      'GRANDMASTER': 2400,
      'MASTER': 2000,
      'DIAMOND': 1600,
      'EMERALD': 1200,
      'PLATINUM': 800,
      'GOLD': 400,
      'SILVER': 0,
      'BRONZE': -400,
      'IRON': -800
    };
    
    const divisionValues: Record<string, number> = {
      'I': 300,
      'II': 200,
      'III': 100,
      'IV': 0
    };
    
    const baseScore = tierValues[entry.tier] || 0;
    const divisionScore = divisionValues[entry.division] || 0;
    
    // For MASTER+ tiers, division doesn't matter
    if (['CHALLENGER', 'GRANDMASTER', 'MASTER'].includes(entry.tier)) {
      return baseScore + entry.leaguePoints;
    }
    
    return baseScore + divisionScore + entry.leaguePoints;
  }

  // Get regional statistics
  async getRegionalStats(region: string): Promise<{
    totalPlayers: number;
    averageLP: number;
    tierDistribution: Record<string, number>;
  }> {
    const players = await this.getTopPlayers(region, 1000); // Get top 1000 for stats
    
    if (players.length === 0) {
      return {
        totalPlayers: 0,
        averageLP: 0,
        tierDistribution: {}
      };
    }
    
    let totalLP = 0;
    const tierCounts: Record<string, number> = {};
    
    for (const player of players) {
      totalLP += player.leaguePoints;
      tierCounts[player.tier] = (tierCounts[player.tier] || 0) + 1;
    }
    
    return {
      totalPlayers: players.length,
      averageLP: totalLP / players.length,
      tierDistribution: tierCounts
    };
  }
}

// Singleton instance
let leaderboardService: LeaderboardService | null = null;

export function getLeaderboardService(): LeaderboardService {
  if (!leaderboardService) {
    leaderboardService = new LeaderboardService();
  }
  return leaderboardService;
}