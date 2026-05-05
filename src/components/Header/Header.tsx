import { useState, useCallback } from 'react';
import { useVSMStore } from '../../store/vsmStore';
import { useExport } from '../../hooks/useExport';
import { saveMap } from '../../lib/api';

export default function Header() {
  const {
    currentMapName, currentMapId, setCurrentMapName,
    closeMap, isSaving, setIsSaving, setIsDirty, isDirty,
    connectedUsers, getMapData,
  } = useVSMStore();

  const { exportPNG, exportPDF, copyShareLink } = useExport(currentMapName);
  const [shareMsg, setShareMsg] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);

  const handleSave = useCallback(async () => {
    if (!currentMapId || isSaving) return;
    setIsSaving(true);
    try {
      await saveMap(currentMapId, currentMapName, getMapData());
      setIsDirty(false);
    } catch (e) {
      console.error('Error guardando:', e);
    } finally {
      setIsSaving(false);
    }
  }, [currentMapId, isSaving, currentMapName, getMapData, setIsSaving, setIsDirty]);

  const handleShare = useCallback(async () => {
    if (!currentMapId) return;
    await handleSave();
    await copyShareLink(currentMapId);
    setShareMsg('¡Enlace copiado!');
    setTimeout(() => setShareMsg(''), 2500);
  }, [currentMapId, handleSave, copyShareLink]);

  return (
    <header className="h-12 bg-panel border-b border-border-dark flex items-center px-4 gap-3 flex-shrink-0 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="5" fill="#3b82f6" />
          <rect x="3" y="6" width="8" height="7" rx="1" fill="white" opacity="0.9" />
          <rect x="13" y="6" width="8" height="7" rx="1" fill="white" opacity="0.9" />
          <rect x="23" y="6" width="6" height="7" rx="1" fill="white" opacity="0.9" />
          <polygon points="7,17 16,26 25,17" fill="#fbbf24" />
        </svg>
        <span className="text-xs font-bold text-slate-200 tracking-wider">VSM</span>
      </div>

      <div className="h-5 w-px bg-border-dark" />

      {/* Map name */}
      {editingName ? (
        <input
          autoFocus
          value={currentMapName}
          onChange={(e) => setCurrentMapName(e.target.value)}
          onBlur={() => setEditingName(false)}
          onKeyDown={(e) => { if (e.key === 'Enter') setEditingName(false); }}
          className="bg-panel-light border border-accent rounded px-2 py-0.5 text-sm text-slate-100 focus:outline-none w-48"
        />
      ) : (
        <button
          onClick={() => setEditingName(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-200 hover:text-white transition-colors group"
        >
          {currentMapName}
          {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Cambios sin guardar" />}
          <span className="text-slate-600 group-hover:text-slate-400 text-[10px]">✎</span>
        </button>
      )}

      <div className="flex-1" />

      {/* Connected users */}
      <div className="flex items-center gap-1 text-[10px] text-slate-400" title="Usuarios conectados">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        {connectedUsers} {connectedUsers === 1 ? 'usuario' : 'usuarios'}
      </div>

      <div className="h-5 w-px bg-border-dark" />

      {/* Export dropdown */}
      <div className="relative">
        <button
          onClick={() => setExportOpen((v) => !v)}
          className="text-[11px] text-slate-300 hover:text-white border border-border-dark hover:border-slate-500 px-3 py-1 rounded transition-colors flex items-center gap-1"
        >
          Exportar ▾
        </button>
        {exportOpen && (
          <div className="absolute right-0 top-8 bg-panel-light border border-border-dark rounded shadow-lg z-50 min-w-[140px]">
            <button
              onClick={() => { exportPNG(); setExportOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-panel hover:text-white transition-colors"
            >
              ↓ Descargar PNG
            </button>
            <button
              onClick={() => { exportPDF(); setExportOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-panel hover:text-white transition-colors"
            >
              ↓ Descargar PDF
            </button>
            <button
              onClick={() => { handleShare(); setExportOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-panel hover:text-white transition-colors"
            >
              🔗 {shareMsg || 'Copiar enlace'}
            </button>
          </div>
        )}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={isSaving || !isDirty}
        className="text-[11px] font-semibold bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-1 rounded transition-colors"
      >
        {isSaving ? 'Guardando…' : 'Guardar'}
      </button>

      {/* Back */}
      <button
        onClick={closeMap}
        className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
        title="Volver a mis mapas"
      >
        ← Mapas
      </button>
    </header>
  );
}
