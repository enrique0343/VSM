import { useEffect, useRef, useCallback } from 'react';
import { useVSMStore } from '../store/vsmStore';
import type { VSMNode, VSMEdge } from '../types/vsm';

interface CollabMessage {
  type: 'state' | 'cursor' | 'join' | 'leave';
  userId?: string;
  nodes?: VSMNode[];
  edges?: VSMEdge[];
  x?: number;
  y?: number;
  users?: number;
}

export function useCollaboration(mapId: string | null) {
  const ws = useRef<WebSocket | null>(null);
  const userId = useRef<string>(Math.random().toString(36).slice(2, 8));
  const isRemoteUpdate = useRef(false);
  const { setNodes, setEdges, setConnectedUsers } = useVSMStore();

  useEffect(() => {
    if (!mapId) return;

    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${location.host}/collab/${mapId}`;

    const connect = () => {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        ws.current?.send(
          JSON.stringify({ type: 'join', userId: userId.current })
        );
      };

      ws.current.onmessage = (event) => {
        const msg: CollabMessage = JSON.parse(event.data as string);
        if (msg.type === 'state' && msg.nodes && msg.edges) {
          isRemoteUpdate.current = true;
          setNodes(msg.nodes);
          setEdges(msg.edges);
          isRemoteUpdate.current = false;
        }
        if (msg.type === 'join' || msg.type === 'leave') {
          if (msg.users !== undefined) setConnectedUsers(msg.users);
        }
      };

      ws.current.onclose = () => {
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      ws.current?.close();
      ws.current = null;
    };
  }, [mapId, setNodes, setEdges, setConnectedUsers]);

  const broadcast = useCallback(
    (nodes: VSMNode[], edges: VSMEdge[]) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({ type: 'state', userId: userId.current, nodes, edges })
        );
      }
    },
    []
  );

  return { broadcast, isRemoteUpdate };
}
