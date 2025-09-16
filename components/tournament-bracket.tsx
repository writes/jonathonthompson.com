'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TournamentMatch, TournamentParticipant } from '@/lib/services/tournament';
import { FaTrophy, FaCrown, FaMedal, FaGamepad } from 'react-icons/fa';

interface BracketNode {
  match: TournamentMatch;
  children?: [BracketNode?, BracketNode?];
}

interface TournamentBracketProps {
  matches: TournamentMatch[];
  participants: TournamentParticipant[];
  format: string;
  onMatchClick?: (match: TournamentMatch) => void;
}

export default function TournamentBracket({ 
  matches, 
  participants, 
  format,
  onMatchClick 
}: TournamentBracketProps) {
  const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);
  const [bracketTree, setBracketTree] = useState<BracketNode | null>(null);

  useEffect(() => {
    if (format === 'SINGLE_ELIMINATION' || format === 'DOUBLE_ELIMINATION') {
      buildBracketTree();
    }
  }, [matches, format]);

  const buildBracketTree = () => {
    // Sort matches by round and match number
    const sortedMatches = [...matches].sort((a, b) => {
      if (b.round !== a.round) return b.round - a.round;
      return a.matchNumber - b.matchNumber;
    });

    // Find the final match (highest round)
    const finalMatch = sortedMatches.find(m => m.round === Math.max(...matches.map(match => match.round)));
    if (!finalMatch) return;

    // Build tree recursively
    const buildNode = (match: TournamentMatch): BracketNode => {
      const node: BracketNode = { match };
      
      // Find matches that feed into this one
      const previousRound = match.round - 1;
      if (previousRound > 0) {
        const feedingMatches = matches.filter(m => 
          m.round === previousRound && 
          (m.winnerId === match.player1Id || m.winnerId === match.player2Id)
        );
        
        if (feedingMatches.length > 0) {
          node.children = [
            feedingMatches[0] ? buildNode(feedingMatches[0]) : undefined,
            feedingMatches[1] ? buildNode(feedingMatches[1]) : undefined
          ];
        }
      }
      
      return node;
    };

    setBracketTree(buildNode(finalMatch));
  };

  const getParticipantName = (playerId?: string) => {
    if (!playerId) return 'TBD';
    const participant = participants.find(p => p.playerId === playerId);
    return participant?.playerName || 'Unknown';
  };

  const renderMatch = (match: TournamentMatch) => {
    const player1Name = getParticipantName(match.player1Id);
    const player2Name = getParticipantName(match.player2Id);
    const isComplete = match.status === 'COMPLETED';
    const isLive = match.status === 'IN_PROGRESS';

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setSelectedMatch(match);
          onMatchClick?.(match);
        }}
        className={`
          bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border cursor-pointer
          ${selectedMatch?.id === match.id ? 'border-purple-500' : 'border-gray-700'}
          ${isLive ? 'border-green-500 animate-pulse' : ''}
        `}
      >
        <div className="text-xs text-gray-400 mb-2">
          Round {match.round} - Match {match.matchNumber}
        </div>
        
        <div className="space-y-2">
          <div className={`
            flex items-center justify-between p-2 rounded
            ${match.winnerId === match.player1Id ? 'bg-green-500/20' : 'bg-gray-700/50'}
          `}>
            <span className="text-sm font-medium text-white">{player1Name}</span>
            {isComplete && match.score && (
              <span className="text-sm text-gray-300">{match.score.player1}</span>
            )}
          </div>
          
          <div className={`
            flex items-center justify-between p-2 rounded
            ${match.winnerId === match.player2Id ? 'bg-green-500/20' : 'bg-gray-700/50'}
          `}>
            <span className="text-sm font-medium text-white">{player2Name}</span>
            {isComplete && match.score && (
              <span className="text-sm text-gray-300">{match.score.player2}</span>
            )}
          </div>
        </div>

        {isLive && (
          <div className="mt-2 text-xs text-green-400 text-center">
            LIVE
          </div>
        )}
      </motion.div>
    );
  };

  const renderBracketNode = (node: BracketNode, level: number = 0): JSX.Element => {
    return (
      <div className="flex items-center gap-8">
        {node.children && (
          <div className="flex flex-col gap-8">
            {node.children[0] && renderBracketNode(node.children[0], level + 1)}
            {node.children[1] && renderBracketNode(node.children[1], level + 1)}
          </div>
        )}
        
        <div className="relative">
          {node.children && (
            <svg
              className="absolute -left-8 top-1/2 -translate-y-1/2"
              width="32"
              height="100"
              viewBox="0 0 32 100"
            >
              <path
                d="M 0 25 L 16 25 L 16 50 L 32 50 M 0 75 L 16 75 L 16 50"
                stroke="rgb(107 114 128)"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          )}
          {renderMatch(node.match)}
        </div>
      </div>
    );
  };

  const renderSwissOrRoundRobin = () => {
    const rounds = Array.from(new Set(matches.map(m => m.round))).sort((a, b) => a - b);
    
    return (
      <div className="space-y-8">
        {rounds.map(round => (
          <div key={round}>
            <h3 className="text-lg font-bold text-white mb-4">Round {round}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches
                .filter(m => m.round === round)
                .map(match => (
                  <div key={match.id}>{renderMatch(match)}</div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStandings = () => {
    const standings = [...participants].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.losses - b.losses;
    });

    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaTrophy className="text-yellow-500" />
          Standings
        </h3>
        
        <div className="space-y-2">
          {standings.map((participant, index) => (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  {index === 0 && <FaCrown className="text-yellow-500 text-xl" />}
                  {index === 1 && <FaMedal className="text-gray-400 text-xl" />}
                  {index === 2 && <FaMedal className="text-orange-600 text-xl" />}
                  {index > 2 && <span className="text-gray-500 font-bold">{index + 1}</span>}
                </div>
                
                <span className="font-medium text-white">{participant.playerName}</span>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">
                  {participant.wins}W - {participant.losses}L
                </span>
                <span className="font-bold text-white">{participant.points} pts</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Tournament Bracket */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 overflow-x-auto">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FaGamepad className="text-purple-500" />
          Tournament Bracket
        </h2>
        
        {(format === 'SINGLE_ELIMINATION' || format === 'DOUBLE_ELIMINATION') && bracketTree ? (
          <div className="min-w-max">
            {renderBracketNode(bracketTree)}
          </div>
        ) : (
          renderSwissOrRoundRobin()
        )}
      </div>

      {/* Standings */}
      {(format === 'SWISS' || format === 'ROUND_ROBIN') && renderStandings()}

      {/* Selected Match Details */}
      <AnimatePresence>
        {selectedMatch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-500/20"
          >
            <h3 className="text-lg font-bold text-white mb-4">Match Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Players</p>
                <p className="text-white">
                  {getParticipantName(selectedMatch.player1Id)} vs {getParticipantName(selectedMatch.player2Id)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-1">Status</p>
                <p className={`font-medium ${
                  selectedMatch.status === 'COMPLETED' ? 'text-green-400' :
                  selectedMatch.status === 'IN_PROGRESS' ? 'text-yellow-400' :
                  'text-gray-400'
                }`}>
                  {selectedMatch.status}
                </p>
              </div>
              
              {selectedMatch.winnerId && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Winner</p>
                  <p className="text-green-400 font-medium">
                    {getParticipantName(selectedMatch.winnerId)}
                  </p>
                </div>
              )}
              
              {selectedMatch.score && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Score</p>
                  <p className="text-white">
                    {selectedMatch.score.player1} - {selectedMatch.score.player2}
                  </p>
                </div>
              )}
              
              {selectedMatch.scheduledTime && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Scheduled Time</p>
                  <p className="text-white">
                    {new Date(selectedMatch.scheduledTime).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}