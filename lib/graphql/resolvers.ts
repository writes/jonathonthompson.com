import { RiotAPI } from './riot-api-datasource';
import { InMemoryCache, RateLimiter } from './cache-manager';
import { getChampionById } from './champion-data';
import { GraphQLError } from 'graphql';

const cache = new InMemoryCache();
const rateLimiter = new RateLimiter();
cache.startCleanup();

// Polling management for live updates
const activePolls = new Map<string, NodeJS.Timeout>();

export const resolvers = {
  Query: {
    topPlayers: async (_: any, { region }: { region: string }, context: any) => {
      const cacheKey = `topPlayers:${region}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      const apiKey = context.riotApiKey;
      const riotAPI = new RiotAPI(apiKey);

      // Check rate limit
      const { allowed, remaining } = await rateLimiter.checkLimit(apiKey, 'league-v4');
      if (!allowed) {
        throw new GraphQLError('Rate limit exceeded. Please try again later.', {
          extensions: { code: 'RATE_LIMITED' }
        });
      }

      try {
        // Get challenger league
        const challengerLeague = await riotAPI.getChallengerLeague(region.toLowerCase());
        
        // Get top 10 players
        const topEntries = challengerLeague.entries
          .sort((a: any, b: any) => b.leaguePoints - a.leaguePoints)
          .slice(0, 10);

        // Fetch summoner details for each player
        const players = await Promise.all(
          topEntries.map(async (entry: any) => {
            try {
              const summoner = await riotAPI.getSummonerById(region.toLowerCase(), entry.summonerId);
              
              if (!summoner) {
                console.error('Invalid summoner data:', summoner);
                return null;
              }

              // Fetch account data for gameName
              let summonerName = 'Unknown Summoner';
              try {
                const account = await riotAPI.getAccountByPuuid(summoner.puuid);
                if (account && account.gameName) {
                  summonerName = `${account.gameName}#${account.tagLine}`;
                }
              } catch (accountError) {
                console.error('Error fetching account data:', accountError);
              }
              
              // Get recent matches
              let lastChampionPlayed = null;
              try {
                const matchIds = await riotAPI.getMatchIds(region.toLowerCase(), summoner.puuid, 5);
                
                if (matchIds && matchIds.length > 0) {
                  const lastMatch = await riotAPI.getMatch(region.toLowerCase(), matchIds[0]);
                  const participant = lastMatch.info.participants.find(
                    (p: any) => p.puuid === summoner.puuid
                  );
                  
                  if (participant) {
                    const championData = getChampionById(participant.championId);
                    lastChampionPlayed = {
                      id: participant.championId,
                      ...championData,
                      image: {
                        full: `${championData.key}.png`,
                        sprite: 'champion0.png',
                        group: 'champion',
                        x: 0,
                        y: 0,
                        w: 48,
                        h: 48
                      }
                    };
                  }
                }
              } catch (matchError) {
                console.error('Error fetching match data:', matchError);
              }

              return {
                id: summoner.id,
                accountId: summoner.accountId,
                puuid: summoner.puuid,
                profileIconId: summoner.profileIconId || 1,
                summonerLevel: summoner.summonerLevel || 1,
                summonerName: summonerName,
                region: region.toUpperCase(),
                leagueEntry: {
                  tier: 'CHALLENGER',
                  division: 'I',
                  leaguePoints: entry.leaguePoints,
                  wins: entry.wins,
                  losses: entry.losses,
                  winRate: (entry.wins / (entry.wins + entry.losses)) * 100,
                  hotStreak: entry.hotStreak || false,
                  veteran: entry.veteran || false,
                  freshBlood: entry.freshBlood || false,
                  inactive: entry.inactive || false
                },
                lastChampionPlayed,
                recentMatches: [],
                currentGame: null
              };
            } catch (summonerError) {
              console.error('Error fetching summoner:', entry.summonerId, summonerError);
              return null;
            }
          })
        );

        // Filter out null entries
        const validPlayers = players.filter(p => p !== null);

        cache.set(cacheKey, validPlayers, 300000); // Cache for 5 minutes
        return validPlayers;
      } catch (error) {
        console.error('Error fetching top players:', error);
        throw new GraphQLError('Failed to fetch top players', {
          extensions: { code: 'RIOT_API_ERROR', error }
        });
      }
    },

    player: async (_: any, { region, summonerId }: { region: string; summonerId: string }, context: any) => {
      const cacheKey = `player:${region}:${summonerId}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      const apiKey = context.riotApiKey;
      const riotAPI = new RiotAPI(apiKey);

      const { allowed } = await rateLimiter.checkLimit(apiKey, 'summoner-v4');
      if (!allowed) {
        throw new GraphQLError('Rate limit exceeded. Please try again later.', {
          extensions: { code: 'RATE_LIMITED' }
        });
      }

      try {
        const summoner = await riotAPI.getSummonerById(region.toLowerCase(), summonerId);
        
        if (!summoner) {
          throw new GraphQLError('Summoner not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        // Fetch account data for gameName
        let summonerName = 'Unknown Summoner';
        try {
          const account = await riotAPI.getAccountByPuuid(summoner.puuid);
          if (account && account.gameName) {
            summonerName = `${account.gameName}#${account.tagLine}`;
          }
        } catch (accountError) {
          console.error('Error fetching account data:', accountError);
        }
        
        const leagueEntries = await riotAPI.getLeagueEntries(region.toLowerCase(), summonerId);
        const soloQueueEntry = leagueEntries.find((e: any) => e.queueType === 'RANKED_SOLO_5x5');

        // Get recent matches
        let recentMatches = [];
        try {
          const matchIds = await riotAPI.getMatchIds(region.toLowerCase(), summoner.puuid, 10);
          recentMatches = await Promise.all(
            matchIds.slice(0, 5).map(async (matchId: string) => {
              try {
                const match = await riotAPI.getMatch(region.toLowerCase(), matchId);
                const participant = match.info.participants.find(
                  (p: any) => p.puuid === summoner.puuid
                );

                if (!participant) return null;

                const championData = getChampionById(participant.championId);

                return {
                  matchId,
                  gameCreation: new Date(match.info.gameCreation),
                  gameDuration: match.info.gameDuration,
                  gameMode: match.info.gameMode,
                  gameType: match.info.gameType,
                  queueId: match.info.queueId,
                  participants: [{
                    summonerId: summoner.id,
                    summonerName: summonerName,
                    championId: participant.championId,
                    champion: {
                      id: participant.championId,
                      ...championData,
                      image: {
                        full: `${championData.key}.png`,
                        sprite: 'champion0.png',
                        group: 'champion',
                        x: 0,
                        y: 0,
                        w: 48,
                        h: 48
                      }
                    },
                    teamId: participant.teamId,
                    win: participant.win,
                    kills: participant.kills,
                    deaths: participant.deaths,
                    assists: participant.assists,
                    kda: participant.deaths === 0 
                      ? participant.kills + participant.assists 
                      : (participant.kills + participant.assists) / participant.deaths,
                    goldEarned: participant.goldEarned,
                    totalDamageDealtToChampions: participant.totalDamageDealtToChampions,
                    visionScore: participant.visionScore,
                    items: [
                      participant.item0,
                      participant.item1,
                      participant.item2,
                      participant.item3,
                      participant.item4,
                      participant.item5,
                      participant.item6
                    ]
                  }]
                };
              } catch (error) {
                console.error('Error processing match:', matchId, error);
                return null;
              }
            })
          );
          // Filter out null matches
          recentMatches = recentMatches.filter(m => m !== null);
        } catch (error) {
          console.error('Error fetching recent matches:', error);
        }

        const player = {
          id: summoner.id,
          accountId: summoner.accountId,
          puuid: summoner.puuid,
          profileIconId: summoner.profileIconId,
          summonerLevel: summoner.summonerLevel,
          summonerName: summonerName,
          region: region.toUpperCase(),
          leagueEntry: soloQueueEntry ? {
            tier: soloQueueEntry.tier,
            division: soloQueueEntry.rank,
            leaguePoints: soloQueueEntry.leaguePoints,
            wins: soloQueueEntry.wins,
            losses: soloQueueEntry.losses,
            winRate: (soloQueueEntry.wins / (soloQueueEntry.wins + soloQueueEntry.losses)) * 100,
            hotStreak: soloQueueEntry.hotStreak,
            veteran: soloQueueEntry.veteran,
            freshBlood: soloQueueEntry.freshBlood,
            inactive: soloQueueEntry.inactive
          } : null,
          recentMatches,
          currentGame: null,
          lastChampionPlayed: recentMatches[0]?.participants[0]?.champion || null
        };

        cache.set(cacheKey, player, 60000); // Cache for 1 minute
        return player;
      } catch (error) {
        console.error('Error fetching player:', error);
        throw new GraphQLError('Failed to fetch player data', {
          extensions: { code: 'RIOT_API_ERROR', error }
        });
      }
    },

    currentGame: async (_: any, { region, summonerId }: { region: string; summonerId: string }, context: any) => {
      const apiKey = context.riotApiKey;
      const riotAPI = new RiotAPI(apiKey);

      const { allowed } = await rateLimiter.checkLimit(apiKey, 'spectator-v4');
      if (!allowed) {
        throw new GraphQLError('Rate limit exceeded. Please try again later.', {
          extensions: { code: 'RATE_LIMITED' }
        });
      }

      try {
        const gameInfo = await riotAPI.getCurrentGameInfo(region.toLowerCase(), summonerId);
        
        if (!gameInfo) {
          return null;
        }

        const participants = await Promise.all(
          gameInfo.participants.map(async (p: any) => {
            const championData = getChampionById(p.championId);
            
            return {
              teamId: p.teamId,
              championId: p.championId,
              champion: {
                id: p.championId,
                ...championData,
                image: {
                  full: `${championData.key}.png`,
                  sprite: 'champion0.png',
                  group: 'champion',
                  x: 0,
                  y: 0,
                  w: 48,
                  h: 48
                }
              },
              summonerId: p.summonerId,
              summoner: {
                id: p.summonerId,
                summonerName: p.summonerName,
                region: region.toUpperCase()
              },
              perks: {
                perkIds: p.perks.perkIds,
                perkStyle: p.perks.perkStyle,
                perkSubStyle: p.perks.perkSubStyle
              }
            };
          })
        );

        return {
          gameId: gameInfo.gameId,
          gameType: gameInfo.gameType,
          gameStartTime: new Date(gameInfo.gameStartTime),
          mapId: gameInfo.mapId,
          gameLength: gameInfo.gameLength,
          gameMode: gameInfo.gameMode,
          participants
        };
      } catch (error: any) {
        if (error.message?.includes('404')) {
          return null; // Player not in game
        }
        throw new GraphQLError('Failed to fetch current game', {
          extensions: { code: 'RIOT_API_ERROR', error }
        });
      }
    }
  },

  Subscription: {
    playerGameUpdate: {
      subscribe: async function* (_: any, { summonerId }: { summonerId: string }, context: any) {
        // Simple polling-based subscription
        let isInGame = false;
        
        while (true) {
          try {
            const gameInfo = await resolvers.Query.currentGame(_, { region: 'NA1', summonerId }, context);
            
            if (gameInfo && !isInGame) {
              isInGame = true;
              yield {
                playerGameUpdate: {
                  type: 'ENTERED_GAME',
                  summonerId,
                  gameId: gameInfo.gameId,
                  champion: gameInfo.participants.find((p: any) => p.summonerId === summonerId)?.champion,
                  timestamp: new Date()
                }
              };
            } else if (!gameInfo && isInGame) {
              isInGame = false;
              yield {
                playerGameUpdate: {
                  type: 'LEFT_GAME',
                  summonerId,
                  gameId: null,
                  champion: null,
                  timestamp: new Date()
                }
              };
            }
            
            // Wait 30 seconds before next poll
            await new Promise(resolve => setTimeout(resolve, 30000));
          } catch (error) {
            console.error('Subscription error:', error);
            await new Promise(resolve => setTimeout(resolve, 60000)); // Wait longer on error
          }
        }
      }
    }
  }
};