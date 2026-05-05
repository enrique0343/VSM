import type { VSMMapSummary, VSMMapFull, VSMMapData } from '../types/vsm';
import { defaultSettings } from '../types/vsm';

const BASE = '/api';

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function listMaps(): Promise<VSMMapSummary[]> {
  return req<VSMMapSummary[]>('/maps');
}

export async function getMap(id: string): Promise<VSMMapFull> {
  return req<VSMMapFull>(`/maps/${id}`);
}

export async function createMap(name: string): Promise<VSMMapSummary> {
  return req<VSMMapSummary>('/maps', {
    method: 'POST',
    body: JSON.stringify({
      name,
      data: { nodes: [], edges: [], settings: defaultSettings },
    }),
  });
}

export async function saveMap(
  id: string,
  name: string,
  data: VSMMapData
): Promise<void> {
  await req(`/maps/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, data }),
  });
}

export async function deleteMap(id: string): Promise<void> {
  await req(`/maps/${id}`, { method: 'DELETE' });
}
