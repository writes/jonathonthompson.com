'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TournamentBracket from '@/components/tournament-bracket';
import { 
  getTournamentService, 
  Tournament, 
  TournamentFormat, 
  TournamentStatus,
  TournamentParticipant,
  TournamentMatch 
} from '@/lib/services/tournament';
import { 
  FaTrophy, 
  FaPlus, 
  FaUsers, 
  FaCalendar, 
  FaClock,
  FaGamepad,
  FaChartLine 
} from 'react-icons/fa';

const tournamentService = getTournamentService();

export default function TournamentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'create'>('upcoming');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  // Create tournament form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    format: TournamentFormat.SINGLE_ELIMINATION,
    maxParticipants: 8,
    startDate: '',
    registrationDeadline: '',
    region: 'NA1',
    rules: ['Best of 1', 'No remake unless disconnect'],
    prizePool: ''
  });

  useEffect(() => {
    if (status === 'authenticated') {
      loadTournaments();
    }
  }, [status, activeTab]);

  useEffect(() => {
    if (selectedTournament) {
      loadTournamentDetails(selectedTournament.id);
    }
  }, [selectedTournament]);

  const loadTournaments = async () => {
    setLoading(true);
    try {
      await tournamentService.connect();
      
      let tournamentList: Tournament[] = [];
      if (activeTab === 'upcoming') {
        tournamentList = await tournamentService.getUpcomingTournaments();
      } else if (activeTab === 'active') {
        tournamentList = await tournamentService.getActiveTournaments();
      }
      
      setTournaments(tournamentList);
    } catch (error) {
      console.error('Failed to load tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTournamentDetails = async (tournamentId: string) => {
    try {
      const [participantList, matchList] = await Promise.all([
        tournamentService.getParticipants(tournamentId),
        tournamentService.getTournamentMatches(tournamentId)
      ]);
      
      setParticipants(participantList);
      setMatches(matchList);
    } catch (error) {
      console.error('Failed to load tournament details:', error);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    try {
      const tournament = await tournamentService.createTournament({
        ...formData,
        startDate: new Date(formData.startDate),
        registrationDeadline: new Date(formData.registrationDeadline),
        createdBy: session.user.id,
        totalRounds: 0 // Will be calculated when tournament starts
      });
      
      setSelectedTournament(tournament);
      setActiveTab('upcoming');
      await loadTournaments();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        format: TournamentFormat.SINGLE_ELIMINATION,
        maxParticipants: 8,
        startDate: '',
        registrationDeadline: '',
        region: 'NA1',
        rules: ['Best of 1', 'No remake unless disconnect'],
        prizePool: ''
      });
    } catch (error) {
      console.error('Failed to create tournament:', error);
    }
  };

  const handleRegister = async (tournament: Tournament) => {
    if (!session?.user) return;
    
    setRegistering(true);
    try {
      await tournamentService.registerParticipant(
        tournament.id,
        session.user.id,
        session.user.name || 'Unknown Player'
      );
      
      await loadTournamentDetails(tournament.id);
    } catch (error: any) {
      console.error('Failed to register:', error);
      alert(error.message || 'Failed to register for tournament');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    router.push('/auth/signin?callbackUrl=/league/tournament');
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
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <FaTrophy className="text-3xl text-yellow-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Tournaments</h1>
              <p className="text-gray-400 mt-1">
                Compete in organized brackets and prove your skills
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {['upcoming', 'active', 'create'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 rounded-lg font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab === 'create' && <FaPlus className="inline mr-2" />}
              {tab} Tournaments
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'create' ? (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create Tournament</h2>
              
              <form onSubmit={handleCreateTournament} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Tournament Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="Epic League Tournament"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Format
                    </label>
                    <select
                      value={formData.format}
                      onChange={(e) => setFormData({ ...formData, format: e.target.value as TournamentFormat })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value={TournamentFormat.SINGLE_ELIMINATION}>Single Elimination</option>
                      <option value={TournamentFormat.DOUBLE_ELIMINATION}>Double Elimination</option>
                      <option value={TournamentFormat.SWISS}>Swiss</option>
                      <option value={TournamentFormat.ROUND_ROBIN}>Round Robin</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      required
                      min="2"
                      max="256"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Region
                    </label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="NA1">North America</option>
                      <option value="EUW1">Europe West</option>
                      <option value="KR">Korea</option>
                      <option value="global">Global</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Registration Deadline
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.registrationDeadline}
                      onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="Tournament details and requirements..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Prize Pool (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.prizePool}
                    onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="$500 or In-game rewards"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Create Tournament
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Tournament List */}
              <div className="lg:col-span-1 space-y-4">
                <h2 className="text-xl font-bold text-white mb-4">
                  {activeTab === 'upcoming' ? 'Upcoming' : 'Active'} Tournaments
                </h2>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : tournaments.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No {activeTab} tournaments found
                  </p>
                ) : (
                  tournaments.map((tournament) => (
                    <motion.div
                      key={tournament.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedTournament(tournament)}
                      className={`
                        bg-gray-800/50 rounded-lg p-4 cursor-pointer border transition-all
                        ${selectedTournament?.id === tournament.id 
                          ? 'border-purple-500' 
                          : 'border-gray-700 hover:border-gray-600'
                        }
                      `}
                    >
                      <h3 className="font-bold text-white mb-2">{tournament.name}</h3>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <FaGamepad />
                          <span>{tournament.format.replace('_', ' ')}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-400">
                          <FaUsers />
                          <span>{tournament.currentParticipants}/{tournament.maxParticipants} players</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-400">
                          <FaCalendar />
                          <span>{formatDate(tournament.startDate)}</span>
                        </div>
                        
                        {tournament.prizePool && (
                          <div className="flex items-center gap-2 text-yellow-400">
                            <FaTrophy />
                            <span>{tournament.prizePool}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className={`
                        mt-3 px-2 py-1 rounded text-xs font-medium text-center
                        ${tournament.status === TournamentStatus.UPCOMING 
                          ? 'bg-blue-500/20 text-blue-400'
                          : tournament.status === TournamentStatus.IN_PROGRESS
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                        }
                      `}>
                        {tournament.status}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Tournament Details */}
              {selectedTournament && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="lg:col-span-2 space-y-6"
                >
                  {/* Tournament Info */}
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                          {selectedTournament.name}
                        </h2>
                        {selectedTournament.description && (
                          <p className="text-gray-400">{selectedTournament.description}</p>
                        )}
                      </div>
                      
                      {selectedTournament.status === TournamentStatus.UPCOMING && (
                        <button
                          onClick={() => handleRegister(selectedTournament)}
                          disabled={registering || participants.some(p => p.playerId === session.user.id)}
                          className={`
                            px-4 py-2 rounded-lg font-medium transition-colors
                            ${participants.some(p => p.playerId === session.user.id)
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-purple-500 hover:bg-purple-600 text-white'
                            }
                          `}
                        >
                          {participants.some(p => p.playerId === session.user.id)
                            ? 'Registered'
                            : registering
                            ? 'Registering...'
                            : 'Register'
                          }
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Format</p>
                        <p className="text-sm font-medium text-white">
                          {selectedTournament.format.replace('_', ' ')}
                        </p>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Players</p>
                        <p className="text-sm font-medium text-white">
                          {selectedTournament.currentParticipants}/{selectedTournament.maxParticipants}
                        </p>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Start Time</p>
                        <p className="text-sm font-medium text-white">
                          {new Date(selectedTournament.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Status</p>
                        <p className={`text-sm font-medium ${
                          selectedTournament.status === TournamentStatus.UPCOMING 
                            ? 'text-blue-400'
                            : selectedTournament.status === TournamentStatus.IN_PROGRESS
                            ? 'text-green-400'
                            : 'text-gray-400'
                        }`}>
                          {selectedTournament.status}
                        </p>
                      </div>
                    </div>
                    
                    {selectedTournament.rules && selectedTournament.rules.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Rules</h4>
                        <ul className="space-y-1">
                          {selectedTournament.rules.map((rule, index) => (
                            <li key={index} className="text-sm text-gray-300">
                              • {rule}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Tournament Bracket */}
                  {selectedTournament.status !== TournamentStatus.UPCOMING && matches.length > 0 && (
                    <TournamentBracket
                      matches={matches}
                      participants={participants}
                      format={selectedTournament.format}
                    />
                  )}

                  {/* Participants List */}
                  {selectedTournament.status === TournamentStatus.UPCOMING && (
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <FaUsers className="text-blue-500" />
                        Registered Players ({participants.length})
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {participants.map((participant, index) => (
                          <motion.div
                            key={participant.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                          >
                            <span className="text-white">{participant.playerName}</span>
                            <span className="text-xs text-gray-400">
                              Seed #{participant.seed}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}