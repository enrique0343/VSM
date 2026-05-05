import { useEffect, useState, useCallback } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useVSMStore } from './store/vsmStore';
import { listMaps, getMap, createMap, deleteMap } from './lib/api';
import type { VSMMapSummary } from './types/vsm';

import Header from './components/Header/Header';
import SymbolPalette from './components/Panels/SymbolPalette';
import VSMCanvas from './components/Canvas/VSMCanvas';
import PropertiesPanel from './components/Panels/PropertiesPanel';
import MetricsBar from './components/Metrics/MetricsBar';

// ── Home / Dashboard ─────────────────────────────────────────────────────────

function HomeView() {
  const { maps, setMaps, openMap, setView } = useVSMStore();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    listMaps()
      .then((m) => {
        setMaps(m);
        // Si no hay backend, el API cae a localStorage
        const hasBackend = fetch('/api/maps', { signal: AbortSignal.timeout(2000) })
          .then((r) => setIsLocal(!r.ok && r.status !== 200))
          .catch(() => setIsLocal(true));
        void hasBackend;
      })
      .catch(() => setError('No se pudo conectar con el servidor.'))
      .finally(() => setLoading(false));
  }, [setMaps]);

  const handleOpen = useCallback(
    async (id: string, name: string) => {
      try {
        const map = await getMap(id);
        openMap(id, name, map.data);
      } catch {
        setError('Error al abrir el mapa.');
      }
    },
    [openMap]
  );

  const handleCreate = useCallback(async () => {
    const name = newName.trim() || 'Nuevo Mapa VSM';
    setCreating(true);
    try {
      const summary = await createMap(name);
      openMap(summary.id, summary.name, { nodes: [], edges: [], settings: { availableTimePerDay: 28800, demandPerDay: 100 } });
    } catch {
      setError('Error al crear el mapa.');
    } finally {
      setCreating(false);
      setShowCreate(false);
      setNewName('');
    }
  }, [newName, openMap]);

  const handleDelete = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!confirm('¿Eliminar este mapa?')) return;
      await deleteMap(id);
      setMaps(maps.filter((m) => m.id !== id));
    },
    [maps, setMaps]
  );

  void setView;

  return (
    <div className="min-h-screen bg-panel flex flex-col">
      {/* Top bar */}
      <div className="h-14 bg-panel border-b border-border-dark flex items-center px-8 gap-3">
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="5" fill="#3b82f6" />
          <rect x="3" y="6" width="8" height="7" rx="1" fill="white" opacity="0.9" />
          <rect x="13" y="6" width="8" height="7" rx="1" fill="white" opacity="0.9" />
          <rect x="23" y="6" width="6" height="7" rx="1" fill="white" opacity="0.9" />
          <polygon points="7,17 16,26 25,17" fill="#fbbf24" />
        </svg>
        <span className="text-sm font-bold text-white tracking-widest">VSM</span>
        <span className="text-xs text-slate-500 ml-1">Value Stream Mapping</span>
        <div className="flex-1" />
        <button
          onClick={() => setShowCreate(true)}
          className="bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-4 py-2 rounded transition-colors"
        >
          + Nuevo mapa
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <h1 className="text-xl font-bold text-slate-100 mb-1">Mis Mapas VSM</h1>
        <p className="text-xs text-slate-500 mb-6">
          Crea y gestiona tus Value Stream Maps. Arrastra elementos al canvas para mapear tu flujo de valor.
        </p>

        {isLocal && (
          <div className="mb-4 px-4 py-2 bg-amber-900/30 border border-amber-700/50 rounded text-xs text-amber-300 flex items-center gap-2">
            <span>⚠</span>
            <span>
              Modo local — los mapas se guardan en este navegador.
              Para persistencia compartida despliega en Cloudflare Pages con D1.
            </span>
          </div>
        )}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-900/30 border border-red-700 rounded text-xs text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
            Cargando mapas…
          </div>
        ) : maps.length === 0 ? (
          <EmptyState onCreate={() => setShowCreate(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {maps.map((m) => (
              <MapCard key={m.id} map={m} onOpen={handleOpen} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-panel-light border border-border-dark rounded-xl p-6 w-80 shadow-2xl">
            <h2 className="text-sm font-semibold text-slate-100 mb-4">Nuevo mapa VSM</h2>
            <input
              autoFocus
              placeholder="Nombre del mapa…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
              className="w-full bg-panel border border-border-dark rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-accent mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreate(false)}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="text-xs font-semibold bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-4 py-1.5 rounded transition-colors"
              >
                {creating ? 'Creando…' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MapCard({
  map, onOpen, onDelete,
}: {
  map: VSMMapSummary;
  onOpen: (id: string, name: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}) {
  const date = new Date(map.updated_at).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div
      onClick={() => onOpen(map.id, map.name)}
      className="bg-panel-light border border-border-dark rounded-xl p-5 cursor-pointer hover:border-accent/50 hover:bg-slate-800 transition-all group"
    >
      {/* Mini VSM preview icon */}
      <div className="mb-3 h-16 bg-canvas-bg rounded-lg flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity">
        <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
          <rect x="2" y="8" width="22" height="24" rx="2" fill="#3b82f6" opacity="0.5" />
          <rect x="32" y="10" width="20" height="20" rx="1" fill="#60a5fa" opacity="0.5" />
          <polygon points="61,10 71,30 51,30" fill="#f59e0b" opacity="0.6" />
          <rect x="79" y="10" width="20" height="20" rx="1" fill="#60a5fa" opacity="0.5" />
          <rect x="108" y="8" width="10" height="24" rx="2" fill="#22c55e" opacity="0.5" />
          <line x1="24" y1="20" x2="32" y2="20" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arr)" />
          <line x1="52" y1="20" x2="51" y2="20" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="71" y1="20" x2="79" y2="20" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="99" y1="20" x2="108" y2="20" stroke="#94a3b8" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
            {map.name}
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Editado: {date}</p>
        </div>
        <button
          onClick={(e) => onDelete(map.id, e)}
          className="text-slate-600 hover:text-red-400 transition-colors text-xs ml-2 flex-shrink-0"
          title="Eliminar mapa"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <svg width="64" height="64" viewBox="0 0 80 80" fill="none" className="mb-4 opacity-30">
        <rect x="4" y="14" width="22" height="22" rx="3" fill="#3b82f6" />
        <rect x="34" y="14" width="22" height="22" rx="3" fill="#3b82f6" />
        <polygon points="40,44 56,68 24,68" fill="#f59e0b" />
        <rect x="58" y="14" width="18" height="22" rx="3" fill="#22c55e" />
        <line x1="26" y1="25" x2="34" y2="25" stroke="white" strokeWidth="2" />
        <line x1="56" y1="25" x2="64" y2="25" stroke="white" strokeWidth="2" />
      </svg>
      <h2 className="text-slate-300 font-semibold mb-2">Sin mapas todavía</h2>
      <p className="text-slate-500 text-xs mb-6 max-w-xs">
        Crea tu primer Value Stream Map y comienza a identificar desperdicios en tu flujo de valor.
      </p>
      <button
        onClick={onCreate}
        className="bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-5 py-2.5 rounded transition-colors"
      >
        Crear primer mapa
      </button>
    </div>
  );
}

// ── Editor view ──────────────────────────────────────────────────────────────

function EditorView() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <SymbolPalette />
        <main className="flex-1 overflow-hidden relative">
          <ReactFlowProvider>
            <VSMCanvas />
          </ReactFlowProvider>
        </main>
        <PropertiesPanel />
      </div>
      <MetricsBar />
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const { view, openMap } = useVSMStore();

  // Handle ?map=<id> deep links
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mapId = params.get('map');
    if (mapId) {
      getMap(mapId)
        .then((m) => openMap(m.id, m.name, m.data))
        .catch(() => {});
    }
  }, [openMap]);

  return view === 'editor' ? <EditorView /> : <HomeView />;
}
