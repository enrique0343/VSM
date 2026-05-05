import type { D1Database, DurableObjectNamespace } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
  VSM_COLLAB: DurableObjectNamespace;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

function err(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, '');

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }

  // GET /api/maps
  if (path === '/maps' && request.method === 'GET') {
    const result = await env.DB.prepare(
      'SELECT id, name, created_at, updated_at FROM maps ORDER BY updated_at DESC'
    ).all();
    return json(result.results);
  }

  // POST /api/maps
  if (path === '/maps' && request.method === 'POST') {
    const body = await request.json<{ name: string; data: unknown }>();
    const id = crypto.randomUUID();
    const now = Date.now();
    await env.DB.prepare(
      'INSERT INTO maps (id, name, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(id, body.name, JSON.stringify(body.data), now, now)
      .run();
    return json({ id, name: body.name, created_at: now, updated_at: now }, 201);
  }

  // /api/maps/:id
  const match = path.match(/^\/maps\/([^/]+)$/);
  if (match) {
    const mapId = match[1];

    if (request.method === 'GET') {
      const row = await env.DB.prepare('SELECT * FROM maps WHERE id = ?')
        .bind(mapId)
        .first<{ id: string; name: string; data: string; created_at: number; updated_at: number }>();
      if (!row) return err('Mapa no encontrado', 404);
      return json({ ...row, data: JSON.parse(row.data) });
    }

    if (request.method === 'PUT') {
      const body = await request.json<{ name: string; data: unknown }>();
      const now = Date.now();
      const result = await env.DB.prepare(
        'UPDATE maps SET name = ?, data = ?, updated_at = ? WHERE id = ?'
      )
        .bind(body.name, JSON.stringify(body.data), now, mapId)
        .run();
      if (result.meta.changes === 0) return err('Mapa no encontrado', 404);
      return json({ success: true });
    }

    if (request.method === 'DELETE') {
      await env.DB.prepare('DELETE FROM maps WHERE id = ?').bind(mapId).run();
      return json({ success: true });
    }
  }

  return err('Ruta no encontrada', 404);
};
