import { getRedisService } from '@/lib/redis/client';
import { publishTournamentUpdate } from '@/lib/graphql/subscriptions';
import { v4 as uuidv4 } from 'uuid';

export enum TournamentFormat {
  SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
  DOUBLE_ELIMINATION = 'DOUBLE_ELIMINATION',
  SWISS = 'SWISS',
  ROUND_ROBIN = 'ROUND_ROBIN'
}

export enum TournamentStatus {
  UPCOMING = 'UPCOMING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FORFEIT = 'FORFEIT'
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  format: TournamentFormat;
  status: TournamentStatus;
  maxParticipants: number;
  currentParticipants: number;
  currentRound: number;
  totalRounds: number;
  startDate: Date;
  endDate?: Date;
  registrationDeadline: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  rules?: string[];
  prizePool?: string;
  region?: string;
}

export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  playerId: string;
  playerName: string;
  seed: number;
  wins: number;
  losses: number;
  points: number;
  eliminated: boolean;
  registeredAt: Date;
}

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  player1Id?: string;
  player2Id?: string;
  winnerId?: string;
  loserId?: string;
  score?: { player1: number; player2: number };
  status: MatchStatus;
  scheduledTime?: Date;
  startTime?: Date;
  endTime?: Date;
  nextMatchId?: string; // For bracket progression
  isLosersRounds?: boolean; // For double elimination
}

export class TournamentService {
  private redis = getRedisService();
  private readonly TOURNAMENT_PREFIX = 'tournament:';
  private readonly PARTICIPANT_PREFIX = 'participant:';
  private readonly MATCH_PREFIX = 'match:';
  private readonly BRACKET_PREFIX = 'bracket:';

  async connect() {
    await this.redis.connect();
  }

  // Create a new tournament
  async createTournament(data: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt' | 'currentParticipants' | 'currentRound' | 'status'>): Promise<Tournament> {
    const tournament: Tournament = {
      ...data,
      id: uuidv4(),
      status: TournamentStatus.UPCOMING,
      currentParticipants: 0,
      currentRound: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const key = `${this.TOURNAMENT_PREFIX}${tournament.id}`;
    await this.redis.set(key, JSON.stringify(tournament));
    
    // Add to tournament list
    await this.redis.sAdd(`tournaments:${tournament.region || 'global'}`, tournament.id);
    
    // Publish update
    publishTournamentUpdate(tournament.id, tournament);
    
    return tournament;
  }

  // Get tournament by ID
  async getTournament(tournamentId: string): Promise<Tournament | null> {
    const key = `${this.TOURNAMENT_PREFIX}${tournamentId}`;
    const data = await this.redis.get(key);
    
    if (!data) return null;
    
    const tournament = JSON.parse(data);
    // Convert date strings back to Date objects
    tournament.startDate = new Date(tournament.startDate);
    tournament.createdAt = new Date(tournament.createdAt);
    tournament.updatedAt = new Date(tournament.updatedAt);
    tournament.registrationDeadline = new Date(tournament.registrationDeadline);
    if (tournament.endDate) tournament.endDate = new Date(tournament.endDate);
    
    return tournament;
  }

  // Register participant
  async registerParticipant(tournamentId: string, playerId: string, playerName: string): Promise<TournamentParticipant> {
    const tournament = await this.getTournament(tournamentId);
    if (!tournament) throw new Error('Tournament not found');
    
    if (tournament.status !== TournamentStatus.UPCOMING) {
      throw new Error('Tournament registration is closed');
    }
    
    if (tournament.currentParticipants >= tournament.maxParticipants) {
      throw new Error('Tournament is full');
    }
    
    if (new Date() > tournament.registrationDeadline) {
      throw new Error('Registration deadline has passed');
    }
    
    // Check if already registered
    const existingKey = `${this.PARTICIPANT_PREFIX}${tournamentId}:${playerId}`;
    const existing = await this.redis.get(existingKey);
    if (existing) throw new Error('Already registered');
    
    const participant: TournamentParticipant = {
      id: uuidv4(),
      tournamentId,
      playerId,
      playerName,
      seed: tournament.currentParticipants + 1,
      wins: 0,
      losses: 0,
      points: 0,
      eliminated: false,
      registeredAt: new Date()
    };
    
    // Save participant
    await this.redis.set(existingKey, JSON.stringify(participant));
    await this.redis.sAdd(`participants:${tournamentId}`, playerId);
    
    // Update tournament participant count
    tournament.currentParticipants++;
    tournament.updatedAt = new Date();
    await this.redis.set(`${this.TOURNAMENT_PREFIX}${tournamentId}`, JSON.stringify(tournament));
    
    // Publish update
    publishTournamentUpdate(tournamentId, tournament);
    
    return participant;
  }

  // Get tournament participants
  async getParticipants(tournamentId: string): Promise<TournamentParticipant[]> {
    const playerIds = await this.redis.sMembers(`participants:${tournamentId}`);
    const participants: TournamentParticipant[] = [];
    
    for (const playerId of playerIds) {
      const key = `${this.PARTICIPANT_PREFIX}${tournamentId}:${playerId}`;
      const data = await this.redis.get(key);
      if (data) {
        const participant = JSON.parse(data);
        participant.registeredAt = new Date(participant.registeredAt);
        participants.push(participant);
      }
    }
    
    return participants.sort((a, b) => a.seed - b.seed);
  }

  // Start tournament and generate brackets
  async startTournament(tournamentId: string): Promise<void> {
    const tournament = await this.getTournament(tournamentId);
    if (!tournament) throw new Error('Tournament not found');
    
    if (tournament.status !== TournamentStatus.UPCOMING) {
      throw new Error('Tournament has already started');
    }
    
    const participants = await this.getParticipants(tournamentId);
    if (participants.length < 2) {
      throw new Error('Not enough participants');
    }
    
    // Update tournament status
    tournament.status = TournamentStatus.IN_PROGRESS;
    tournament.currentRound = 1;
    tournament.updatedAt = new Date();
    
    // Generate matches based on format
    let matches: TournamentMatch[] = [];
    
    switch (tournament.format) {
      case TournamentFormat.SINGLE_ELIMINATION:
        matches = await this.generateSingleEliminationBracket(tournamentId, participants);
        tournament.totalRounds = Math.ceil(Math.log2(participants.length));
        break;
        
      case TournamentFormat.DOUBLE_ELIMINATION:
        matches = await this.generateDoubleEliminationBracket(tournamentId, participants);
        tournament.totalRounds = Math.ceil(Math.log2(participants.length)) * 2 - 1;
        break;
        
      case TournamentFormat.SWISS:
        matches = await this.generateSwissRound(tournamentId, participants, 1);
        tournament.totalRounds = Math.ceil(Math.log2(participants.length));
        break;
        
      case TournamentFormat.ROUND_ROBIN:
        matches = await this.generateRoundRobinMatches(tournamentId, participants);
        tournament.totalRounds = participants.length - 1;
        break;
    }
    
    // Save tournament and matches
    await this.redis.set(`${this.TOURNAMENT_PREFIX}${tournamentId}`, JSON.stringify(tournament));
    
    for (const match of matches) {
      await this.saveMatch(match);
    }
    
    // Publish update
    publishTournamentUpdate(tournamentId, tournament);
  }

  // Generate single elimination bracket
  private async generateSingleEliminationBracket(
    tournamentId: string,
    participants: TournamentParticipant[]
  ): Promise<TournamentMatch[]> {
    const matches: TournamentMatch[] = [];
    const totalParticipants = participants.length;
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(totalParticipants)));
    const byes = nextPowerOf2 - totalParticipants;
    
    // Shuffle participants for random seeding (or use existing seeds)
    const shuffled = [...participants].sort((a, b) => a.seed - b.seed);
    
    // Generate first round matches
    let matchNumber = 1;
    let playerIndex = 0;
    
    for (let i = 0; i < nextPowerOf2 / 2; i++) {
      const match: TournamentMatch = {
        id: uuidv4(),
        tournamentId,
        round: 1,
        matchNumber: matchNumber++,
        status: MatchStatus.SCHEDULED,
        player1Id: shuffled[playerIndex]?.playerId,
        player2Id: undefined,
        scheduledTime: new Date(Date.now() + i * 3600000) // 1 hour intervals
      };
      
      playerIndex++;
      
      // Add opponent if not a bye
      if (i >= byes) {
        match.player2Id = shuffled[playerIndex]?.playerId;
        playerIndex++;
      } else {
        // Auto-advance player with bye
        match.status = MatchStatus.COMPLETED;
        match.winnerId = match.player1Id;
        match.endTime = new Date();
      }
      
      matches.push(match);
    }
    
    // Generate bracket structure for subsequent rounds
    await this.generateBracketStructure(tournamentId, matches.length);
    
    return matches;
  }

  // Generate double elimination bracket
  private async generateDoubleEliminationBracket(
    tournamentId: string,
    participants: TournamentParticipant[]
  ): Promise<TournamentMatch[]> {
    // Start with winners bracket (same as single elimination)
    const winnersBracket = await this.generateSingleEliminationBracket(tournamentId, participants);
    
    // Mark these as winners bracket matches
    winnersBracket.forEach(match => match.isLosersRounds = false);
    
    // Losers bracket will be generated dynamically as matches complete
    
    return winnersBracket;
  }

  // Generate Swiss round
  private async generateSwissRound(
    tournamentId: string,
    participants: TournamentParticipant[],
    round: number
  ): Promise<TournamentMatch[]> {
    const matches: TournamentMatch[] = [];
    
    // Sort by points and previous opponents
    const sorted = [...participants].sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      return b.wins - a.wins;
    });
    
    const paired = new Set<string>();
    let matchNumber = 1;
    
    // Pair players with similar scores
    for (let i = 0; i < sorted.length; i++) {
      if (paired.has(sorted[i].playerId)) continue;
      
      for (let j = i + 1; j < sorted.length; j++) {
        if (paired.has(sorted[j].playerId)) continue;
        
        // Check if they've played before
        const previousMatch = await this.getPreviousMatch(tournamentId, sorted[i].playerId, sorted[j].playerId);
        if (previousMatch) continue;
        
        // Create match
        const match: TournamentMatch = {
          id: uuidv4(),
          tournamentId,
          round,
          matchNumber: matchNumber++,
          player1Id: sorted[i].playerId,
          player2Id: sorted[j].playerId,
          status: MatchStatus.SCHEDULED,
          scheduledTime: new Date(Date.now() + (matchNumber - 1) * 3600000)
        };
        
        matches.push(match);
        paired.add(sorted[i].playerId);
        paired.add(sorted[j].playerId);
        break;
      }
    }
    
    return matches;
  }

  // Generate round robin matches
  private async generateRoundRobinMatches(
    tournamentId: string,
    participants: TournamentParticipant[]
  ): Promise<TournamentMatch[]> {
    const matches: TournamentMatch[] = [];
    let matchNumber = 1;
    let round = 1;
    
    // Generate all possible pairings
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const match: TournamentMatch = {
          id: uuidv4(),
          tournamentId,
          round,
          matchNumber: matchNumber++,
          player1Id: participants[i].playerId,
          player2Id: participants[j].playerId,
          status: MatchStatus.SCHEDULED,
          scheduledTime: new Date(Date.now() + (matchNumber - 1) * 3600000)
        };
        
        matches.push(match);
        
        // Increment round after each complete set of matches
        if (matchNumber % (participants.length / 2) === 0) {
          round++;
        }
      }
    }
    
    return matches;
  }

  // Save match
  private async saveMatch(match: TournamentMatch): Promise<void> {
    const key = `${this.MATCH_PREFIX}${match.id}`;
    await this.redis.set(key, JSON.stringify(match));
    
    // Add to tournament matches
    await this.redis.sAdd(`matches:${match.tournamentId}:round:${match.round}`, match.id);
    
    // Add to player matches
    if (match.player1Id) {
      await this.redis.sAdd(`matches:player:${match.player1Id}`, match.id);
    }
    if (match.player2Id) {
      await this.redis.sAdd(`matches:player:${match.player2Id}`, match.id);
    }
  }

  // Get match by ID
  async getMatch(matchId: string): Promise<TournamentMatch | null> {
    const key = `${this.MATCH_PREFIX}${matchId}`;
    const data = await this.redis.get(key);
    
    if (!data) return null;
    
    const match = JSON.parse(data);
    // Convert date strings
    if (match.scheduledTime) match.scheduledTime = new Date(match.scheduledTime);
    if (match.startTime) match.startTime = new Date(match.startTime);
    if (match.endTime) match.endTime = new Date(match.endTime);
    
    return match;
  }

  // Update match result
  async updateMatchResult(
    matchId: string,
    winnerId: string,
    score?: { player1: number; player2: number }
  ): Promise<void> {
    const match = await this.getMatch(matchId);
    if (!match) throw new Error('Match not found');
    
    const tournament = await this.getTournament(match.tournamentId);
    if (!tournament) throw new Error('Tournament not found');
    
    // Update match
    match.winnerId = winnerId;
    match.loserId = winnerId === match.player1Id ? match.player2Id : match.player1Id;
    match.score = score;
    match.status = MatchStatus.COMPLETED;
    match.endTime = new Date();
    
    await this.saveMatch(match);
    
    // Update participant stats
    if (match.winnerId) {
      await this.updateParticipantStats(match.tournamentId, match.winnerId, true);
    }
    if (match.loserId) {
      await this.updateParticipantStats(match.tournamentId, match.loserId, false);
    }
    
    // Handle bracket progression
    await this.handleBracketProgression(tournament, match);
    
    // Check if tournament is complete
    await this.checkTournamentCompletion(tournament);
    
    // Publish update
    publishTournamentUpdate(match.tournamentId, tournament);
  }

  // Update participant statistics
  private async updateParticipantStats(
    tournamentId: string,
    playerId: string,
    won: boolean
  ): Promise<void> {
    const key = `${this.PARTICIPANT_PREFIX}${tournamentId}:${playerId}`;
    const data = await this.redis.get(key);
    
    if (!data) return;
    
    const participant = JSON.parse(data);
    
    if (won) {
      participant.wins++;
      participant.points += 3; // 3 points for win
    } else {
      participant.losses++;
      participant.points += 0; // 0 points for loss
    }
    
    await this.redis.set(key, JSON.stringify(participant));
  }

  // Handle bracket progression
  private async handleBracketProgression(
    tournament: Tournament,
    completedMatch: TournamentMatch
  ): Promise<void> {
    if (tournament.format === TournamentFormat.SINGLE_ELIMINATION && completedMatch.nextMatchId) {
      const nextMatch = await this.getMatch(completedMatch.nextMatchId);
      if (nextMatch) {
        if (!nextMatch.player1Id) {
          nextMatch.player1Id = completedMatch.winnerId;
        } else {
          nextMatch.player2Id = completedMatch.winnerId;
        }
        await this.saveMatch(nextMatch);
      }
    }
    
    // Handle double elimination losers bracket
    if (tournament.format === TournamentFormat.DOUBLE_ELIMINATION && !completedMatch.isLosersRounds) {
      // Create losers bracket match for the loser
      // Implementation depends on specific double elimination rules
    }
  }

  // Check if tournament is complete
  private async checkTournamentCompletion(tournament: Tournament): Promise<void> {
    const allMatches = await this.getTournamentMatches(tournament.id);
    const incompleteMatches = allMatches.filter(m => m.status !== MatchStatus.COMPLETED);
    
    if (incompleteMatches.length === 0) {
      tournament.status = TournamentStatus.COMPLETED;
      tournament.endDate = new Date();
      tournament.updatedAt = new Date();
      
      const key = `${this.TOURNAMENT_PREFIX}${tournament.id}`;
      await this.redis.set(key, JSON.stringify(tournament));
    }
  }

  // Get all tournament matches
  async getTournamentMatches(tournamentId: string): Promise<TournamentMatch[]> {
    const tournament = await this.getTournament(tournamentId);
    if (!tournament) return [];
    
    const matches: TournamentMatch[] = [];
    
    for (let round = 1; round <= tournament.totalRounds; round++) {
      const matchIds = await this.redis.sMembers(`matches:${tournamentId}:round:${round}`);
      
      for (const matchId of matchIds) {
        const match = await this.getMatch(matchId);
        if (match) matches.push(match);
      }
    }
    
    return matches.sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;
      return a.matchNumber - b.matchNumber;
    });
  }

  // Get player matches
  async getPlayerMatches(playerId: string): Promise<TournamentMatch[]> {
    const matchIds = await this.redis.sMembers(`matches:player:${playerId}`);
    const matches: TournamentMatch[] = [];
    
    for (const matchId of matchIds) {
      const match = await this.getMatch(matchId);
      if (match) matches.push(match);
    }
    
    return matches.sort((a, b) => {
      const dateA = a.scheduledTime || a.startTime || new Date(0);
      const dateB = b.scheduledTime || b.startTime || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }

  // Check if players have played before
  private async getPreviousMatch(
    tournamentId: string,
    player1Id: string,
    player2Id: string
  ): Promise<TournamentMatch | null> {
    const player1Matches = await this.getPlayerMatches(player1Id);
    
    return player1Matches.find(match => 
      match.tournamentId === tournamentId &&
      (match.player1Id === player2Id || match.player2Id === player2Id)
    ) || null;
  }

  // Generate bracket structure for visualization
  private async generateBracketStructure(tournamentId: string, firstRoundMatches: number): Promise<void> {
    const rounds = Math.ceil(Math.log2(firstRoundMatches * 2));
    let matchesInRound = firstRoundMatches;
    
    for (let round = 1; round <= rounds; round++) {
      const roundKey = `${this.BRACKET_PREFIX}${tournamentId}:round:${round}`;
      await this.redis.set(roundKey, JSON.stringify({
        round,
        matchCount: matchesInRound,
        isRound: true
      }));
      
      matchesInRound = Math.ceil(matchesInRound / 2);
    }
  }

  // Get upcoming tournaments
  async getUpcomingTournaments(region?: string): Promise<Tournament[]> {
    const tournamentIds = await this.redis.sMembers(`tournaments:${region || 'global'}`);
    const tournaments: Tournament[] = [];
    
    for (const id of tournamentIds) {
      const tournament = await this.getTournament(id);
      if (tournament && tournament.status === TournamentStatus.UPCOMING) {
        tournaments.push(tournament);
      }
    }
    
    return tournaments.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  // Get active tournaments
  async getActiveTournaments(region?: string): Promise<Tournament[]> {
    const tournamentIds = await this.redis.sMembers(`tournaments:${region || 'global'}`);
    const tournaments: Tournament[] = [];
    
    for (const id of tournamentIds) {
      const tournament = await this.getTournament(id);
      if (tournament && tournament.status === TournamentStatus.IN_PROGRESS) {
        tournaments.push(tournament);
      }
    }
    
    return tournaments;
  }
}

// Singleton instance
let tournamentService: TournamentService | null = null;

export function getTournamentService(): TournamentService {
  if (!tournamentService) {
    tournamentService = new TournamentService();
  }
  return tournamentService;
}