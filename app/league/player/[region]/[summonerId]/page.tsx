"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import Link from "next/link";
import { useGameUpdates } from "@/hooks/useGameUpdates";

interface PlayerDetail {
  id: string;
  summonerName: string;
  summonerLevel: number;
  profileIconId: number;
  region: string;
  leagueEntry?: {
    tier: string;
    division: string;
    leaguePoints: number;
    wins: number;
    losses: number;
    winRate: number;
  };
  recentMatches: Array<{
    matchId: string;
    gameCreation: string;
    gameDuration: number;
    participants: Array<{
      championId: number;
      champion: {
        id: number;
        key: string;
        name: string;
      };
      kills: number;
      deaths: number;
      assists: number;
      kda: number;
      win: boolean;
      goldEarned: number;
      totalDamageDealtToChampions: number;
    }>;
  }>;
  currentGame?: {
    gameId: string;
    gameStartTime: string;
    gameMode: string;
    participants: Array<{
      championId: number;
      champion: {
        name: string;
        key: string;
      };
      summonerId: string;
      summoner: {
        summonerName: string;
      };
      teamId: number;
    }>;
  };
}

const PLAYER_DETAIL_QUERY = `
  query GetPlayerDetail($region: Region!, $summonerId: String!) {
    player(region: $region, summonerId: $summonerId) {
      id
      summonerName
      summonerLevel
      profileIconId
      region
      leagueEntry {
        tier
        division
        leaguePoints
        wins
        losses
        winRate
      }
      recentMatches {
        matchId
        gameCreation
        gameDuration
        participants {
          championId
          champion {
            id
            key
            name
          }
          kills
          deaths
          assists
          kda
          win
          goldEarned
          totalDamageDealtToChampions
        }
      }
      currentGame {
        gameId
        gameStartTime
        gameMode
        participants {
          championId
          champion {
            name
            key
          }
          summonerId
          summoner {
            summonerName
          }
          teamId
        }
      }
    }
  }
`;

export default function PlayerDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gameJustEnded, setGameJustEnded] = useState(false);

  const winRate = useMotionValue(0);
  const animatedWinRate = useTransform(winRate, (value) => `${value.toFixed(1)}%`);

  // Use live game updates
  const { gameUpdate, isPolling } = useGameUpdates(
    params.region?.toString() || '',
    params.summonerId?.toString() || '',
    !!player?.currentGame
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/league/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session && params.region && params.summonerId) {
      fetchPlayerDetail();
      const interval = setInterval(fetchPlayerDetail, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [session, params]);

  useEffect(() => {
    if (player?.leagueEntry) {
      animate(winRate, player.leagueEntry.winRate, { duration: 1 });
    }
  }, [player?.leagueEntry?.winRate]);

  // Detect when game ends
  useEffect(() => {
    if (!isPolling && player?.currentGame && !gameUpdate) {
      setGameJustEnded(true);
      setTimeout(() => {
        fetchPlayerDetail(); // Refresh player data
        setGameJustEnded(false);
      }, 3000);
    }
  }, [isPolling, player?.currentGame, gameUpdate]);

  const fetchPlayerDetail = async () => {
    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: PLAYER_DETAIL_QUERY,
          variables: {
            region: params.region?.toString().toUpperCase(),
            summonerId: params.summonerId
          }
        })
      });

      const data = await response.json();

      if (data.errors) {
        setError(data.errors[0].message);
      } else {
        setPlayer(data.data.player);
      }
    } catch (err) {
      setError("Failed to fetch player details");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Player not found"}</p>
          <Link href="/league" className="text-purple-400 hover:text-purple-300">
            Back to List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <nav className="bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/league" className="text-white hover:text-purple-400 transition-colors">
              ← Back to List
            </Link>
            <h1 className="text-2xl font-bold text-white">Player Details</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence>
          {gameJustEnded && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg shadow-lg"
            >
              <p className="font-semibold flex items-center gap-2">
                🎮 Game Ended! Refreshing stats...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-8 mb-8"
        >
          <div className="flex items-center gap-6 mb-8">
            <motion.img
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${player.profileIconId}.png`}
              alt={player.summonerName}
              className="w-32 h-32 rounded-full border-4 border-purple-500"
            />
            <div>
              <motion.h2
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-4xl font-bold text-white mb-2"
              >
                {player.summonerName}
              </motion.h2>
              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-400 text-lg"
              >
                Level {player.summonerLevel} • {player.region}
              </motion.p>
              {player.leagueEntry && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-2"
                >
                  <span className="text-2xl font-bold text-yellow-500">
                    {player.leagueEntry.tier} {player.leagueEntry.division}
                  </span>
                  <span className="text-gray-400 ml-2">• {player.leagueEntry.leaguePoints} LP</span>
                </motion.div>
              )}
            </div>
          </div>

          {player.leagueEntry && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 rounded-lg p-4 text-center"
              >
                <p className="text-gray-400 mb-2">Wins</p>
                <motion.p
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="text-3xl font-bold text-green-400"
                >
                  {player.leagueEntry.wins}
                </motion.p>
              </motion.div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 rounded-lg p-4 text-center"
              >
                <p className="text-gray-400 mb-2">Losses</p>
                <motion.p
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="text-3xl font-bold text-red-400"
                >
                  {player.leagueEntry.losses}
                </motion.p>
              </motion.div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 rounded-lg p-4 text-center"
              >
                <p className="text-gray-400 mb-2">Win Rate</p>
                <motion.p className="text-3xl font-bold text-purple-400">
                  {animatedWinRate}
                </motion.p>
              </motion.div>
            </div>
          )}
        </motion.div>

        {player.currentGame && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <motion.div 
              key={gameUpdate?.timestamp}
              className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-6"
              animate={gameUpdate ? { 
                boxShadow: ['0 0 0px rgba(34, 197, 94, 0)', '0 0 20px rgba(34, 197, 94, 0.4)', '0 0 0px rgba(34, 197, 94, 0)']
              } : {}}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <motion.h3
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl font-bold text-green-400"
                  >
                    Current Match - Live
                  </motion.h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Real-time match data streaming
                  </p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-2"
                >
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-green-400 text-sm font-medium">STREAMING</span>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-black/20 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Game Mode</p>
                  <p className="text-white font-semibold">{player.currentGame.gameMode}</p>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Game Time</p>
                  <motion.p
                    key={gameUpdate?.timestamp || player.currentGame.gameLength}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-white font-semibold flex items-center gap-2"
                  >
                    {Math.floor((gameUpdate?.gameLength || player.currentGame.gameLength || 0) / 60)}:
                    {String((gameUpdate?.gameLength || player.currentGame.gameLength || 0) % 60).padStart(2, '0')}
                    {isPolling && (
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 bg-green-500 rounded-full"
                      />
                    )}
                  </motion.p>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Map</p>
                  <p className="text-white font-semibold">
                    {player.currentGame.mapId === 11 ? "Summoner's Rift" : "Other"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {[100, 200].map((teamId) => {
                  const isPlayerTeam = player.currentGame?.participants.some(
                    p => p.summonerId === player.id && p.teamId === teamId
                  );
                  
                  return (
                    <motion.div
                      key={teamId}
                      className={`bg-black/20 rounded-lg p-4 ${isPlayerTeam ? 'ring-2 ring-purple-500/50' : ''}`}
                      initial={{ opacity: 0, x: teamId === 100 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${teamId === 100 ? 'bg-blue-500' : 'bg-red-500'}`} />
                        Team {teamId === 100 ? "Blue" : "Red"}
                        {isPlayerTeam && <span className="text-xs text-purple-400">(Your Team)</span>}
                      </h4>
                      
                      <div className="space-y-2">
                        {player.currentGame?.participants
                          .filter((p) => p.teamId === teamId)
                          .map((participant, idx) => {
                            const isCurrentPlayer = participant.summonerId === player.id;
                            
                            return (
                              <motion.div
                                key={participant.summonerId}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.1 + 0.3 }}
                                className={`flex items-center gap-3 p-2 rounded-lg ${
                                  isCurrentPlayer ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-white/5'
                                }`}
                              >
                                <div className="relative">
                                  <img
                                    src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${participant.champion.key}.png`}
                                    alt={participant.champion.name}
                                    className="w-10 h-10 rounded"
                                  />
                                  {isCurrentPlayer && (
                                    <motion.div
                                      animate={{ scale: [0.8, 1.2, 0.8] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                      className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"
                                    />
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <p className={`text-sm font-medium ${
                                    isCurrentPlayer ? "text-purple-400" : "text-gray-300"
                                  }`}>
                                    {participant.summoner.summonerName}
                                  </p>
                                  <p className="text-xs text-gray-500">{participant.champion.name}</p>
                                </div>
                                
                                {isCurrentPlayer && isPolling && (
                                  <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="text-xs text-purple-400 flex items-center gap-1"
                                  >
                                    <span>Live</span>
                                    <motion.span
                                      animate={{ scale: [1, 1.5, 1] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    >
                                      •
                                    </motion.span>
                                  </motion.div>
                                )}
                              </motion.div>
                            );
                          })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 space-y-3"
              >
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-sm flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      ⚡
                    </motion.span>
                    Live data updates every 30 seconds
                  </p>
                </div>
                
                {gameUpdate && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-400 text-sm font-medium">Estimated Game Duration</p>
                        <p className="text-gray-400 text-xs mt-1">
                          Based on average {player.currentGame.gameMode} games
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">
                          ~{Math.floor(35 - (gameUpdate.gameLength / 60))} min remaining
                        </p>
                        <motion.div className="mt-2 w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((gameUpdate.gameLength / 60 / 35) * 100, 100)}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6">Recent Matches</h3>
          <div className="space-y-4">
            {player.recentMatches.map((match, index) => {
              const participant = match.participants[0];
              return (
                <motion.div
                  key={match.matchId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  className={`bg-white/5 backdrop-blur-lg rounded-lg border ${
                    participant.win ? "border-green-500/30" : "border-red-500/30"
                  } p-4`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${participant.champion.key}.png`}
                        alt={participant.champion.name}
                        className="w-12 h-12 rounded"
                      />
                      <div>
                        <p className="text-white font-semibold">{participant.champion.name}</p>
                        <p className="text-gray-400 text-sm">
                          {Math.floor(match.gameDuration / 60)}m {match.gameDuration % 60}s
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-white font-semibold">
                          {participant.kills}/{participant.deaths}/{participant.assists}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {participant.kda.toFixed(2)} KDA
                        </p>
                      </div>
                      <div className={`text-lg font-bold ${participant.win ? "text-green-400" : "text-red-400"}`}>
                        {participant.win ? "Victory" : "Defeat"}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
}