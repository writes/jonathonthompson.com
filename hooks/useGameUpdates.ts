import { useState, useEffect, useCallback } from 'react';

interface GameUpdate {
  gameLength: number;
  timestamp: number;
}

export function useGameUpdates(
  region: string, 
  summonerId: string, 
  isInGame: boolean
) {
  const [gameUpdate, setGameUpdate] = useState<GameUpdate | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const fetchGameUpdate = useCallback(async () => {
    if (!isInGame) return;

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetCurrentGame($region: Region!, $summonerId: String!) {
              currentGame(region: $region, summonerId: $summonerId) {
                gameId
                gameLength
              }
            }
          `,
          variables: {
            region: region.toUpperCase(),
            summonerId
          }
        })
      });

      const data = await response.json();
      
      if (data.data?.currentGame) {
        setGameUpdate({
          gameLength: data.data.currentGame.gameLength,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error fetching game update:', error);
    }
  }, [region, summonerId, isInGame]);

  useEffect(() => {
    if (!isInGame) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    fetchGameUpdate(); // Initial fetch

    const interval = setInterval(fetchGameUpdate, 30000); // Poll every 30 seconds

    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [isInGame, fetchGameUpdate]);

  return { gameUpdate, isPolling };
}