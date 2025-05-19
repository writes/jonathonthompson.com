"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface Player {
  id: string;
  summonerName: string;
  summonerLevel: number;
  profileIconId: number;
  region: string;
  leagueEntry: {
    tier: string;
    division: string;
    leaguePoints: number;
    wins: number;
    losses: number;
    winRate: number;
  };
  lastChampionPlayed?: {
    id: number;
    key: string;
    name: string;
    title: string;
  };
  currentGame?: any;
}

const TOP_PLAYERS_QUERY = `
  query GetTopPlayers($region: Region!) {
    topPlayers(region: $region) {
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
      lastChampionPlayed {
        id
        key
        name
        title
      }
      currentGame {
        gameId
      }
    }
  }
`;

export default function LeaguePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("NA1");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/league/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchTopPlayers();
    }
  }, [session, selectedRegion]);

  const fetchTopPlayers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: TOP_PLAYERS_QUERY,
          variables: { region: selectedRegion }
        })
      });

      const data = await response.json();

      if (data.errors) {
        setError(data.errors[0].message);
      } else {
        setPlayers(data.data.topPlayers);
      }
    } catch (err) {
      setError("Failed to fetch players");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <nav className="bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-white">League Stats</h1>
            <div className="flex items-center gap-4">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-white/10 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="NA1">North America</option>
                <option value="EUW1">Europe West</option>
                <option value="KR">Korea</option>
                <option value="BR1">Brazil</option>
              </select>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-white/70 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Top 10 Challenger Players</h2>
          <p className="text-gray-400">Click on a player to view detailed statistics</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"
              />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 text-red-400"
            >
              {error}
            </motion.div>
          ) : (
            <motion.div
              key="players"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-2"
            >
              {players.map((player, index) => (
                <Link
                  key={player.id}
                  href={`/league/player/${player.region.toLowerCase()}/${player.id}`}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      ...(player.currentGame ? {
                        boxShadow: [
                          '0 0 30px rgba(16, 185, 129, 0.3), 0 0 60px rgba(59, 130, 246, 0.2), 0 0 90px rgba(139, 92, 246, 0.1)',
                          '0 0 40px rgba(16, 185, 129, 0.4), 0 0 80px rgba(59, 130, 246, 0.3), 0 0 120px rgba(139, 92, 246, 0.2)',
                          '0 0 30px rgba(16, 185, 129, 0.3), 0 0 60px rgba(59, 130, 246, 0.2), 0 0 90px rgba(139, 92, 246, 0.1)'
                        ]
                      } : {})
                    }}
                    transition={{ 
                      delay: index * 0.1, 
                      duration: 0.5,
                      boxShadow: player.currentGame ? {
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      } : {}
                    }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className={`relative bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6 cursor-pointer hover:bg-white/10 transition-all duration-300 overflow-hidden ${
                      player.currentGame ? 'shadow-lg' : ''
                    }`}
                  >
                    {/* Animated border for players in game */}
                    {player.currentGame && (
                      <>
                        {/* Gradient border animation */}
                        <motion.div
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: 'linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6, #ec4899, #10b981)',
                            backgroundSize: '200% 100%',
                            padding: '2px',
                            zIndex: -1,
                          }}
                          animate={{
                            backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        />
                        
                        {/* Inner background to create border effect */}
                        <div className="absolute inset-[2px] bg-gray-900 rounded-xl z-0" />
                        
                        {/* Corner accents */}
                        <motion.div
                          className="absolute top-0 left-0 w-8 h-8"
                          animate={{
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 0,
                          }}
                        >
                          <svg viewBox="0 0 32 32" className="w-full h-full">
                            <path
                              d="M0 8 L0 0 L8 0"
                              stroke="#10b981"
                              strokeWidth="3"
                              fill="none"
                            />
                          </svg>
                        </motion.div>
                        
                        <motion.div
                          className="absolute top-0 right-0 w-8 h-8"
                          animate={{
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 0.5,
                          }}
                        >
                          <svg viewBox="0 0 32 32" className="w-full h-full">
                            <path
                              d="M24 0 L32 0 L32 8"
                              stroke="#3b82f6"
                              strokeWidth="3"
                              fill="none"
                            />
                          </svg>
                        </motion.div>
                        
                        <motion.div
                          className="absolute bottom-0 left-0 w-8 h-8"
                          animate={{
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 1,
                          }}
                        >
                          <svg viewBox="0 0 32 32" className="w-full h-full">
                            <path
                              d="M0 24 L0 32 L8 32"
                              stroke="#8b5cf6"
                              strokeWidth="3"
                              fill="none"
                            />
                          </svg>
                        </motion.div>
                        
                        <motion.div
                          className="absolute bottom-0 right-0 w-8 h-8"
                          animate={{
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 1.5,
                          }}
                        >
                          <svg viewBox="0 0 32 32" className="w-full h-full">
                            <path
                              d="M24 32 L32 32 L32 24"
                              stroke="#ec4899"
                              strokeWidth="3"
                              fill="none"
                            />
                          </svg>
                        </motion.div>
                        
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 rounded-xl pointer-events-none"
                          style={{
                            background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%)',
                            backgroundSize: '200% 200%',
                          }}
                          animate={{
                            backgroundPosition: ['-100% 0%', '200% 0%'],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            repeatDelay: 1,
                            ease: 'easeInOut',
                          }}
                        />
                        
                        {/* Live indicator badge */}
                        <motion.div
                          className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10"
                          animate={{
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                        >
                          <motion.div
                            className="w-2 h-2 bg-white rounded-full"
                            animate={{
                              opacity: [1, 0.3, 1],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                            }}
                          />
                          LIVE
                        </motion.div>
                      </>
                    )}
                    
                    {/* Content with relative positioning */}
                    <div className="relative z-10">
                      <div className="flex items-center gap-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                          className="relative"
                        >
                          <img
                            src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${player.profileIconId}.png`}
                            alt={player.summonerName}
                            className="w-20 h-20 rounded-full border-2 border-purple-500"
                          />
                        </motion.div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{player.summonerName}</h3>
                        <p className="text-gray-400 text-sm">Level {player.summonerLevel}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-yellow-500 font-semibold">
                            {player.leagueEntry.tier} {player.leagueEntry.division}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400">{player.leagueEntry.leaguePoints} LP</span>
                        </div>
                      </div>

                      {player.lastChampionPlayed && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                          className="text-center"
                        >
                          <img
                            src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${player.lastChampionPlayed.key}.png`}
                            alt={player.lastChampionPlayed.name}
                            className="w-16 h-16 rounded-lg shadow-lg"
                          />
                          <p className="text-xs text-gray-400 mt-1">{player.lastChampionPlayed.name}</p>
                        </motion.div>
                      )}
                    </div>

                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: index * 0.1 + 0.4, duration: 0.5 }}
                        className="mt-4 flex items-center justify-between text-sm"
                      >
                        <div className="text-gray-400">
                          W/L: <span className="text-green-400">{player.leagueEntry.wins}</span>/
                          <span className="text-red-400">{player.leagueEntry.losses}</span>
                        </div>
                        <div className="text-gray-400">
                          Win Rate: <span className="text-white font-semibold">
                            {player.leagueEntry.winRate.toFixed(1)}%
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}