'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FaBrain, FaChartLine, FaShieldAlt, FaSwords, FaMagic, FaExclamationTriangle } from 'react-icons/fa';

interface Champion {
  id: string;
  name: string;
  role: string;
  image: string;
}

interface Recommendation {
  champion: string;
  score: number;
  win_rate: number;
  reasons: string[];
  synergies: string[];
  counters: string[];
}

interface DraftAssistantProps {
  onChampionSelect?: (champion: string) => void;
}

const ROLES = ['top', 'jungle', 'mid', 'adc', 'support'];

// Mock champion pool - in production, fetch from API
const CHAMPION_POOL: Champion[] = [
  { id: 'aatrox', name: 'Aatrox', role: 'top', image: 'Aatrox.png' },
  { id: 'ahri', name: 'Ahri', role: 'mid', image: 'Ahri.png' },
  { id: 'akali', name: 'Akali', role: 'mid', image: 'Akali.png' },
  { id: 'alistar', name: 'Alistar', role: 'support', image: 'Alistar.png' },
  { id: 'amumu', name: 'Amumu', role: 'jungle', image: 'Amumu.png' },
  { id: 'anivia', name: 'Anivia', role: 'mid', image: 'Anivia.png' },
  { id: 'annie', name: 'Annie', role: 'mid', image: 'Annie.png' },
  { id: 'aphelios', name: 'Aphelios', role: 'adc', image: 'Aphelios.png' },
  { id: 'ashe', name: 'Ashe', role: 'adc', image: 'Ashe.png' },
  { id: 'azir', name: 'Azir', role: 'mid', image: 'Azir.png' },
];

export default function DraftAssistant({ onChampionSelect }: DraftAssistantProps) {
  const [selectedRole, setSelectedRole] = useState<string>('mid');
  const [teamPicks, setTeamPicks] = useState<string[]>([]);
  const [enemyPicks, setEnemyPicks] = useState<string[]>([]);
  const [teamBans, setTeamBans] = useState<string[]>([]);
  const [enemyBans, setEnemyBans] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [teamAnalysis, setTeamAnalysis] = useState<any>(null);

  // Fetch recommendations when draft state changes
  useEffect(() => {
    if (selectedRole) {
      fetchRecommendations();
    }
  }, [selectedRole, teamPicks, enemyPicks, teamBans, enemyBans]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8001/draft/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_picks: teamPicks,
          enemy_picks: enemyPicks,
          team_bans: teamBans,
          enemy_bans: enemyBans,
          role: selectedRole,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
        setTeamAnalysis({
          score: data.team_composition_score,
          damage_distribution: data.damage_distribution,
          strengths: data.team_strengths,
          weaknesses: data.team_weaknesses,
        });
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChampionClick = (champion: Champion, action: 'pick' | 'ban') => {
    if (action === 'pick') {
      if (teamPicks.length < 5 && !teamPicks.includes(champion.name)) {
        setTeamPicks([...teamPicks, champion.name]);
      }
    } else {
      if (teamBans.length < 5 && !teamBans.includes(champion.name)) {
        setTeamBans([...teamBans, champion.name]);
      }
    }
  };

  const removeChampion = (champion: string, from: 'teamPicks' | 'teamBans') => {
    if (from === 'teamPicks') {
      setTeamPicks(teamPicks.filter(c => c !== champion));
    } else {
      setTeamBans(teamBans.filter(c => c !== champion));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaBrain className="text-3xl text-purple-500" />
        <h2 className="text-2xl font-bold text-white">AI Draft Assistant</h2>
      </div>

      {/* Role Selector */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Select Your Role</h3>
        <div className="flex gap-2">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                selectedRole === role
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Draft State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Your Team */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">Your Team Picks</h3>
          <div className="bg-gray-800/50 rounded-lg p-4 min-h-[120px]">
            <div className="flex flex-wrap gap-2">
              {teamPicks.map((champion) => (
                <motion.div
                  key={champion}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-1 text-sm text-blue-400 flex items-center gap-2"
                >
                  {champion}
                  <button
                    onClick={() => removeChampion(champion, 'teamPicks')}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
              {teamPicks.length === 0 && (
                <p className="text-gray-500 text-sm">Click champions below to add picks</p>
              )}
            </div>
          </div>
        </div>

        {/* Your Bans */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">Your Team Bans</h3>
          <div className="bg-gray-800/50 rounded-lg p-4 min-h-[120px]">
            <div className="flex flex-wrap gap-2">
              {teamBans.map((champion) => (
                <motion.div
                  key={champion}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-1 text-sm text-red-400 flex items-center gap-2"
                >
                  {champion}
                  <button
                    onClick={() => removeChampion(champion, 'teamBans')}
                    className="text-red-300 hover:text-red-200"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
              {teamBans.length === 0 && (
                <p className="text-gray-500 text-sm">Right-click champions to ban</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Champion Pool */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Champion Pool</h3>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {CHAMPION_POOL.map((champion) => {
            const isPicked = teamPicks.includes(champion.name) || enemyPicks.includes(champion.name);
            const isBanned = teamBans.includes(champion.name) || enemyBans.includes(champion.name);
            const isDisabled = isPicked || isBanned;

            return (
              <motion.button
                key={champion.id}
                whileHover={{ scale: isDisabled ? 1 : 1.1 }}
                whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                onClick={() => !isDisabled && handleChampionClick(champion, 'pick')}
                onContextMenu={(e) => {
                  e.preventDefault();
                  !isDisabled && handleChampionClick(champion, 'ban');
                }}
                className={`relative rounded-lg overflow-hidden ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <Image
                  src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${champion.image}`}
                  alt={champion.name}
                  width={60}
                  height={60}
                  className="w-full h-auto"
                />
                {isPicked && (
                  <div className="absolute inset-0 bg-blue-500/50 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">PICKED</span>
                  </div>
                )}
                {isBanned && (
                  <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">BANNED</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FaChartLine className="text-blue-500" />
          AI Recommendations
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Analyzing draft...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.champion}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Image
                      src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${rec.champion}.png`}
                      alt={rec.champion}
                      width={64}
                      height={64}
                      className="rounded-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {index + 1}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-white">{rec.champion}</h4>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-400">AI Score</p>
                          <p className={`text-lg font-bold ${getScoreColor(rec.score)}`}>
                            {rec.score}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Win Rate</p>
                          <p className="text-sm font-medium text-gray-300">{rec.win_rate}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {rec.reasons.map((reason, i) => (
                        <p key={i} className="text-sm text-gray-400 flex items-center gap-2">
                          <span className="text-green-400">✓</span>
                          {reason}
                        </p>
                      ))}
                    </div>

                    <div className="flex gap-4 mt-3">
                      {rec.synergies.length > 0 && (
                        <div className="flex items-center gap-2">
                          <FaShieldAlt className="text-blue-400 text-sm" />
                          <span className="text-xs text-gray-400">
                            Synergizes with: {rec.synergies.join(', ')}
                          </span>
                        </div>
                      )}
                      {rec.counters.length > 0 && (
                        <div className="flex items-center gap-2">
                          <FaSwords className="text-red-400 text-sm" />
                          <span className="text-xs text-gray-400">
                            Counters: {rec.counters.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleChampionClick(
                        { id: rec.champion.toLowerCase(), name: rec.champion, role: selectedRole, image: `${rec.champion}.png` },
                        'pick'
                      );
                      onChampionSelect?.(rec.champion);
                    }}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Select
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Team Analysis */}
        {teamAnalysis && teamPicks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-6 border border-purple-500/20 mt-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">Team Composition Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Composition Score</span>
                  <span className={`text-2xl font-bold ${getScoreColor(teamAnalysis.score)}`}>
                    {teamAnalysis.score.toFixed(1)}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400">Damage Distribution</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <FaSwords className="text-orange-400" /> Physical
                      </span>
                      <div className="flex-1 mx-3 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-orange-400 h-2 rounded-full"
                          style={{ width: `${teamAnalysis.damage_distribution.physical * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">
                        {(teamAnalysis.damage_distribution.physical * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <FaMagic className="text-blue-400" /> Magic
                      </span>
                      <div className="flex-1 mx-3 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-400 h-2 rounded-full"
                          style={{ width: `${teamAnalysis.damage_distribution.magic * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">
                        {(teamAnalysis.damage_distribution.magic * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {teamAnalysis.strengths.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-400 mb-1">Strengths</h4>
                    {teamAnalysis.strengths.map((strength: string, i: number) => (
                      <p key={i} className="text-xs text-gray-300">• {strength}</p>
                    ))}
                  </div>
                )}
                
                {teamAnalysis.weaknesses.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-400 mb-1 flex items-center gap-1">
                      <FaExclamationTriangle /> Weaknesses
                    </h4>
                    {teamAnalysis.weaknesses.map((weakness: string, i: number) => (
                      <p key={i} className="text-xs text-gray-300">• {weakness}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}