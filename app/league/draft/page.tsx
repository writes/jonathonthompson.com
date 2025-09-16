'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DraftAssistant from '@/components/draft-assistant';
import { FaBrain, FaChartBar, FaGamepad, FaInfoCircle } from 'react-icons/fa';

interface MatchPrediction {
  blue_win_probability: number;
  red_win_probability: number;
  key_factors: string[];
  predicted_game_length: number;
  confidence: number;
}

export default function DraftPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedChampions, setSelectedChampions] = useState<string[]>([]);
  const [matchPrediction, setMatchPrediction] = useState<MatchPrediction | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);

  // Mock teams for prediction demo
  const blueTeam = ['Aatrox', 'Lee Sin', 'Ahri', 'Jinx', 'Thresh'];
  const redTeam = ['Garen', 'Jarvan IV', 'Orianna', 'Caitlyn', 'Leona'];

  const fetchMatchPrediction = async () => {
    setPredictionLoading(true);
    try {
      const response = await fetch('http://localhost:8001/match/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blue_team: blueTeam,
          red_team: redTeam,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMatchPrediction(data);
      }
    } catch (error) {
      console.error('Failed to fetch match prediction:', error);
    } finally {
      setPredictionLoading(false);
    }
  };

  const handleChampionSelect = (champion: string) => {
    setSelectedChampions([...selectedChampions, champion]);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push('/auth/signin?callbackUrl=/league/draft');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/league')}
            className="mb-4 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white transition-colors"
          >
            ← Back to League Stats
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <FaBrain className="text-3xl text-purple-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">AI Draft Assistant</h1>
              <p className="text-gray-400 mt-1">
                Get intelligent champion recommendations powered by machine learning
              </p>
            </div>
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8 flex items-start gap-3"
        >
          <FaInfoCircle className="text-blue-400 mt-1" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-blue-400 mb-1">How to use the Draft Assistant:</p>
            <ul className="space-y-1 text-gray-400">
              <li>• Select your role to get personalized recommendations</li>
              <li>• Left-click champions to add them to your team</li>
              <li>• Right-click champions to ban them</li>
              <li>• The AI will analyze team synergies and suggest optimal picks</li>
            </ul>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Draft Assistant */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <DraftAssistant onChampionSelect={handleChampionSelect} />
          </motion.div>

          {/* Side Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Match Prediction */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaChartBar className="text-green-500" />
                Match Prediction
              </h3>

              <div className="space-y-4">
                <div className="text-sm text-gray-400">
                  <p className="mb-2">Demo Match:</p>
                  <div className="flex justify-between mb-1">
                    <span className="text-blue-400">Blue Team</span>
                    <span className="text-red-400">Red Team</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {blueTeam.join(', ')} vs {redTeam.join(', ')}
                  </div>
                </div>

                <button
                  onClick={fetchMatchPrediction}
                  disabled={predictionLoading}
                  className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  {predictionLoading ? 'Analyzing...' : 'Predict Match Outcome'}
                </button>

                {matchPrediction && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-400">Blue Team</span>
                        <span className="text-lg font-bold text-white">
                          {matchPrediction.blue_win_probability}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                          style={{ width: `${matchPrediction.blue_win_probability}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-red-400">Red Team</span>
                        <span className="text-lg font-bold text-white">
                          {matchPrediction.red_win_probability}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full"
                          style={{ width: `${matchPrediction.red_win_probability}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-700">
                      <p className="text-xs text-gray-400 mb-2">Key Factors:</p>
                      {matchPrediction.key_factors.map((factor, i) => (
                        <p key={i} className="text-xs text-gray-300 mb-1">• {factor}</p>
                      ))}
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Predicted Game Length:</span>
                      <span className="text-gray-300">{matchPrediction.predicted_game_length} min</span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Confidence:</span>
                      <span className="text-green-400">
                        {(matchPrediction.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaGamepad className="text-purple-500" />
                AI Features
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Smart Recommendations</p>
                    <p className="text-xs text-gray-400">
                      ML model trained on millions of matches
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Team Synergy Analysis</p>
                    <p className="text-xs text-gray-400">
                      Real-time composition evaluation
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Counter Pick Suggestions</p>
                    <p className="text-xs text-gray-400">
                      Intelligent matchup analysis
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Win Rate Predictions</p>
                    <p className="text-xs text-gray-400">
                      Data-driven outcome forecasting
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Champions */}
            {selectedChampions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6"
              >
                <h3 className="text-lg font-bold text-white mb-3">Your Selections</h3>
                <div className="space-y-2">
                  {selectedChampions.map((champion, i) => (
                    <p key={i} className="text-sm text-gray-300">
                      {i + 1}. {champion}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}