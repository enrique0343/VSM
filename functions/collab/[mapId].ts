import type { DurableObjectNamespace, DurableObjectState, WebSocket } from '@cloudflare/workers-types';

interface Env {
  VSM_COLLAB: DurableObjectNamespace;
}

// ── Durable Object ────────────────────────────────────────────────────────────

export class VSMCollabDO {
  private sessions: Map<string, WebSocket> = new Map();

  constructor(private state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader?.toLowerCase() !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    // @ts-ignore — Cloudflare Workers WebSocketPair
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];

    const sessionId = crypto.randomUUID();
    // @ts-ignore
    server.accept();
    this.sessions.set(sessionId, server);

    const userCount = this.sessions.size;
    this.broadcast(JSON.stringify({ type: 'join', users: userCount }), sessionId);
    server.send(JSON.stringify({ type: 'join', users: userCount }));

    server.addEventListener('message', (event: MessageEvent) => {
      this.broadcast(event.data as string, sessionId);
    });

    server.addEventListener('close', () => {
      this.sessions.delete(sessionId);
      this.broadcast(
        JSON.stringify({ type: 'leave', users: this.sessions.size }),
        null
      );
    });

    return new Response(null, { status: 101, webSocket: client } as ResponseInit);
  }

  private broadcast(message: string, excludeId: string | null) {
    for (const [id, ws] of this.sessions) {
      if (id !== excludeId) {
        try {
          ws.send(message);
        } catch {
          this.sessions.delete(id);
        }
      }
    }
  }
}

// ── Pages Function ────────────────────────────────────────────────────────────

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const mapId = ctx.params.mapId as string;
  if (!mapId) return new Response('mapId requerido', { status: 400 });

  const id = ctx.env.VSM_COLLAB.idFromName(mapId);
  const stub = ctx.env.VSM_COLLAB.get(id);
  return stub.fetch(ctx.request);
};
