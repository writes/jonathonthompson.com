'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export interface WebSocketHook {
  socket: Socket | null;
  connected: boolean;
  connecting: boolean;
  error: Error | null;
  subscribe: (channel: string, callback: (data: any) => void) => void;
  unsubscribe: (channel: string) => void;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): WebSocketHook {
  const { data: session } = useSession();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const subscriptionsRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  useEffect(() => {
    if (!session?.user || !options.autoConnect !== false) return;

    setConnecting(true);
    setError(null);

    const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3000', {
      auth: {
        token: (session as any).accessToken || '',
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: options.reconnectionAttempts || 5,
      reconnectionDelay: options.reconnectionDelay || 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
      setConnecting(false);
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setError(err);
      setConnecting(false);
    });

    socket.on('error', (err) => {
      console.error('WebSocket error:', err);
      setError(new Error(err));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
      setConnecting(false);
    };
  }, [session, options.autoConnect, options.reconnectionAttempts, options.reconnectionDelay]);

  const subscribe = useCallback((channel: string, callback: (data: any) => void) => {
    if (!socketRef.current) return;

    // Subscribe to channel
    const [type, id] = channel.split(':');
    socketRef.current.emit(`subscribe:${type}`, id);

    // Store callback
    if (!subscriptionsRef.current.has(channel)) {
      subscriptionsRef.current.set(channel, new Set());
    }
    subscriptionsRef.current.get(channel)!.add(callback);

    // Listen for updates
    const eventName = `${type}:update`;
    socketRef.current.on(eventName, (data: any) => {
      if (data.id === id || data.matchId === id || data.playerId === id) {
        subscriptionsRef.current.get(channel)?.forEach(cb => cb(data));
      }
    });
  }, []);

  const unsubscribe = useCallback((channel: string) => {
    if (!socketRef.current) return;

    const [type, id] = channel.split(':');
    socketRef.current.emit(`unsubscribe:${type}`, id);
    subscriptionsRef.current.delete(channel);
  }, []);

  const emit = useCallback((event: string, data: any) => {
    if (!socketRef.current) return;
    socketRef.current.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (!socketRef.current) return;
    socketRef.current.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (!socketRef.current) return;
    if (callback) {
      socketRef.current.off(event, callback);
    } else {
      socketRef.current.off(event);
    }
  }, []);

  return {
    socket: socketRef.current,
    connected,
    connecting,
    error,
    subscribe,
    unsubscribe,
    emit,
    on,
    off,
  };
}