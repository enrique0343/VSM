import type { VSMMapSummary, VSMMapFull, VSMMapData } from '../types/vsm';
import { defaultSettings } from '../types/vsm';

// ── localStorage backend (funciona sin servidor) ─────────────────────────────

const LS_KEY = 'vsm:maps';

interface LSStore {
  [id: string]: VSMMapFull;
}

function lsRead(): LSStore {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function lsWrite(store: LSStore) {
  localStorage.setItem(LS_KEY, JSON.stringify(store));
}

const local = {
  list(): VSMMapSummary[] {
    const store = lsRead();
    return Object.values(store)
      .map(({ id, name, created_at, updated_at }) => ({ id, name, created_at, updated_at }))
      .sort((a, b) => b.updated_at - a.updated_at);
  },
  get(id: string): VSMMapFull | null {
    return lsRead()[id] ?? null;
  },
  create(name: string, data: VSMMapData): VSMMapSummary {
    const store = lsRead();
    const id = crypto.randomUUID();
    const now = Date.now();
    const entry: VSMMapFull = { id, name, data, created_at: now, updated_at: now };
    store[id] = entry;
    lsWrite(store);
    return { id, name, created_at: now, updated_at: now };
  },
  save(id: string, name: string, data: VSMMapData) {
    const store = lsRead();
    if (!store[id]) throw new Error('Not found');
    store[id] = { ...store[id], name, data, updated_at: Date.now() };
    lsWrite(store);
  },
  delete(id: string) {
    const store = lsRead();
    delete store[id];
    lsWrite(store);
  },
};

// ── HTTP backend (producción Cloudflare) ─────────────────────────────────────

const BASE = '/api';

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// Detecta si el backend de Cloudflare está disponible
let _backendAvailable: boolean | null = null;

async function isBackendAvailable(): Promise<boolean> {
  if (_backendAvailable !== null) return _backendAvailable;
  try {
    const res = await fetch('/api/maps', { method: 'GET', signal: AbortSignal.timeout(2000) });
    _backendAvailable = res.ok || res.status === 404;
  } catch {
    _backendAvailable = false;
  }
  return _backendAvailable;
}

// ── API pública (usa backend si está, si no localStorage) ────────────────────

export async function listMaps(): Promise<VSMMapSummary[]> {
  if (await isBackendAvailable()) return req<VSMMapSummary[]>('/maps');
  return local.list();
}

export async function getMap(id: string): Promise<VSMMapFull> {
  if (await isBackendAvailable()) return req<VSMMapFull>(`/maps/${id}`);
  const m = local.get(id);
  if (!m) throw new Error('Mapa no encontrado');
  return m;
}

export async function createMap(name: string): Promise<VSMMapSummary> {
  const data: VSMMapData = { nodes: [], edges: [], settings: defaultSettings };
  if (await isBackendAvailable()) {
    return req<VSMMapSummary>('/maps', {
      method: 'POST',
      body: JSON.stringify({ name, data }),
    });
  }
  return local.create(name, data);
}

export async function saveMap(id: string, name: string, data: VSMMapData): Promise<void> {
  if (await isBackendAvailable()) {
    await req(`/maps/${id}`, { method: 'PUT', body: JSON.stringify({ name, data }) });
    return;
  }
  local.save(id, name, data);
}

export async function deleteMap(id: string): Promise<void> {
  if (await isBackendAvailable()) {
    await req(`/maps/${id}`, { method: 'DELETE' });
    return;
  }
  local.delete(id);
}
