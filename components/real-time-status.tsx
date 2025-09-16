'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { motion, AnimatePresence } from 'framer-motion';

interface RealTimeStatusProps {
  playerId: string;
}

export default function RealTimeStatus({ playerId }: RealTimeStatusProps) {
  const { connected, subscribe, unsubscribe } = useWebSocket({ autoConnect: true });
  const [playerStatus, setPlayerStatus] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!connected || !playerId) return;

    const channel = `player:${playerId}`;
    
    const handleUpdate = (data: any) => {
      setPlayerStatus(data);
      setLastUpdate(new Date());
    };

    subscribe(channel, handleUpdate);

    return () => {
      unsubscribe(channel);
    };
  }, [connected, playerId, subscribe, unsubscribe]);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-300">Real-Time Status</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-400">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {playerStatus ? (
          <motion.div
            key="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Status:</span>
              <span className={`text-sm font-medium ${
                playerStatus.inGame ? 'text-green-400' : 'text-gray-300'
              }`}>
                {playerStatus.inGame ? 'In Game' : 'Online'}
              </span>
            </div>
            
            {playerStatus.currentGameId && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Game ID:</span>
                <span className="text-sm font-mono text-gray-300">
                  {playerStatus.currentGameId.slice(0, 8)}...
                </span>
              </div>
            )}

            {lastUpdate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Last Update:</span>
                <span className="text-sm text-gray-300">
                  {lastUpdate.toLocaleTimeString()}
                </span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-gray-400 text-center py-2"
          >
            Waiting for updates...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}