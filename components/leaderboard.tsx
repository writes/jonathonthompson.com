'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '@/hooks/useWebSocket';
import Image from 'next/image';
import Link from 'next/link';

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

interface LeaderboardChange {
  playerId: string;
  playerName: string;
  previousRank: number;
  newRank: number;
  lpChange: number;
}

interface LeaderboardProps {
  region: string;
  initialData?: LeaderboardEntry[];
}

export default function Leaderboard({ region, initialData = [] }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initialData);
  const [changes, setChanges] = useState<Map<string, LeaderboardChange>>(new Map());
  const { connected, subscribe, unsubscribe } = useWebSocket({ autoConnect: true });

  useEffect(() => {
    if (!connected) return;

    const channel = `leaderboard:${region}`;
    
    const handleUpdate = (data: any) => {
      if (data.changes) {
        const newChanges = new Map(changes);
        data.changes.forEach((change: LeaderboardChange) => {
          newChanges.set(change.playerId, change);
          
          // Clear change after animation
          setTimeout(() => {
            setChanges(prev => {
              const updated = new Map(prev);
              updated.delete(change.playerId);
              return updated;
            });
          }, 5000);
        });
        setChanges(newChanges);
        
        // Update entries with new rankings
        setEntries(prev => {
          const updated = [...prev];
          data.changes.forEach((change: LeaderboardChange) => {
            const index = updated.findIndex(e => e.playerId === change.playerId);
            if (index !== -1) {
              updated[index].rank = change.newRank;
            }
          });
          return updated.sort((a, b) => a.rank - b.rank);
        });
      }
    };

    subscribe(channel, handleUpdate);

    return () => {
      unsubscribe(channel);
    };
  }, [connected, region, subscribe, unsubscribe, changes]);

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      CHALLENGER: 'from-yellow-400 to-yellow-600',
      GRANDMASTER: 'from-red-400 to-red-600',
      MASTER: 'from-purple-400 to-purple-600',
      DIAMOND: 'from-blue-400 to-blue-600',
      EMERALD: 'from-emerald-400 to-emerald-600',
      PLATINUM: 'from-cyan-400 to-cyan-600',
      GOLD: 'from-amber-400 to-amber-600',
      SILVER: 'from-gray-400 to-gray-600',
      BRONZE: 'from-orange-400 to-orange-600',
      IRON: 'from-stone-400 to-stone-600'
    };
    return colors[tier] || 'from-gray-400 to-gray-600';
  };

  const getRankChange = (playerId: string) => {
    return changes.get(playerId);
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Top 10 {region.toUpperCase()} Players
          </h2>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-400">
              {connected ? 'Live Updates' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-800">
        <AnimatePresence mode="popLayout">
          {entries.map((entry) => {
            const change = getRankChange(entry.playerId);
            const isMovingUp = change && change.newRank < change.previousRank;
            const isMovingDown = change && change.newRank > change.previousRank;

            return (
              <motion.div
                key={entry.playerId}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  backgroundColor: change ? (isMovingUp ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)') : 'transparent'
                }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ 
                  layout: { type: "spring", stiffness: 300, damping: 30 },
                  backgroundColor: { duration: 0.5 }
                }}
                className="p-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex items-center gap-2 min-w-[80px]">
                    <div className="text-2xl font-bold text-white">
                      #{entry.rank}
                    </div>
                    {change && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className={`text-sm font-medium ${
                          isMovingUp ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {isMovingUp ? '↑' : '↓'} {Math.abs(change.newRank - change.previousRank)}
                      </motion.div>
                    )}
                  </div>

                  {/* Profile Icon */}
                  <div className="relative w-12 h-12">
                    <Image
                      src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/profileicon/${entry.profileIconId}.png`}
                      alt={entry.playerName}
                      fill
                      className="rounded-full object-cover"
                    />
                    {entry.hotStreak && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-xs">🔥</span>
                      </div>
                    )}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1">
                    <Link
                      href={`/league/player/${region}/${entry.playerId}`}
                      className="text-lg font-medium text-white hover:text-blue-400 transition-colors"
                    >
                      {entry.playerName}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-sm font-medium bg-gradient-to-r ${getTierColor(entry.tier)} bg-clip-text text-transparent`}>
                        {entry.tier} {entry.division}
                      </span>
                      <span className="text-sm text-gray-400">
                        {entry.leaguePoints} LP
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-sm text-gray-400">
                      {entry.wins}W {entry.losses}L
                    </div>
                    <div className={`text-sm font-medium ${
                      entry.winRate >= 60 ? 'text-green-400' : 
                      entry.winRate >= 50 ? 'text-blue-400' : 'text-red-400'
                    }`}>
                      {entry.winRate.toFixed(1)}% WR
                    </div>
                  </div>
                </div>

                {/* LP Change Animation */}
                {change && change.lpChange !== 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-sm text-center"
                  >
                    <span className={change.lpChange > 0 ? 'text-green-400' : 'text-red-400'}>
                      {change.lpChange > 0 ? '+' : ''}{change.lpChange} LP
                    </span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}