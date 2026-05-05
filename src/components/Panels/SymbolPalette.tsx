import { useVSMStore } from '../../store/vsmStore';
import type { VSMNodeType, VSMEdgeType } from '../../types/vsm';

interface PaletteItem {
  type: VSMNodeType;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const NODE_ITEMS: PaletteItem[] = [
  {
    type: 'supplier',
    label: 'Proveedor',
    color: '#3b82f6',
    icon: (
      <svg width="28" height="24" viewBox="0 0 80 72" fill="none">
        <polygon points="8,32 40,4 72,32" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2" />
        <rect x="8" y="32" width="64" height="36" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2" />
      </svg>
    ),
  },
  {
    type: 'customer',
    label: 'Cliente',
    color: '#22c55e',
    icon: (
      <svg width="28" height="24" viewBox="0 0 80 72" fill="none">
        <polygon points="8,32 40,4 72,32" fill="#1e3a5f" stroke="#22c55e" strokeWidth="2" />
        <rect x="8" y="32" width="64" height="36" fill="#1e3a5f" stroke="#22c55e" strokeWidth="2" />
      </svg>
    ),
  },
  {
    type: 'process',
    label: 'Proceso',
    color: '#60a5fa',
    icon: (
      <svg width="28" height="20" viewBox="0 0 80 56" fill="none">
        <rect x="2" y="2" width="76" height="52" rx="2" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
        <rect x="2" y="2" width="76" height="16" rx="2" fill="#3b82f6" />
      </svg>
    ),
  },
  {
    type: 'inventory',
    label: 'Inventario',
    color: '#f59e0b',
    icon: (
      <svg width="24" height="22" viewBox="0 0 72 64" fill="none">
        <polygon points="36,4 68,60 4,60" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
        <text x="36" y="46" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="system-ui">I</text>
      </svg>
    ),
  },
  {
    type: 'kaizen',
    label: 'Kaizen',
    color: '#ef4444',
    icon: (
      <svg width="26" height="26" viewBox="0 0 80 80" fill="none">
        <path d="M40,4 L46,26 L68,20 L54,38 L76,44 L54,50 L68,68 L46,62 L40,76 L34,62 L12,68 L26,50 L4,44 L26,38 L12,20 L34,26 Z"
          fill="#fef3c7" stroke="#ef4444" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    type: 'operator',
    label: 'Operario',
    color: '#94a3b8',
    icon: (
      <svg width="20" height="28" viewBox="0 0 24 32" fill="none">
        <circle cx="12" cy="7" r="5" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
        <path d="M4 20 Q12 14 20 20 L19 30 H5 Z" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
      </svg>
    ),
  },
];

interface EdgeItem {
  type: VSMEdgeType;
  label: string;
  color: string;
  dash?: boolean;
}

const EDGE_ITEMS: EdgeItem[] = [
  { type: 'push', label: 'Flujo Push', color: '#ea580c' },
  { type: 'pull', label: 'Flujo Pull', color: '#6366f1', dash: true },
  { type: 'infoManual', label: 'Info Manual', color: '#64748b', dash: true },
  { type: 'infoElectronic', label: 'Info Electrónica', color: '#06b6d4' },
];

function NodeDraggable({ item }: { item: PaletteItem }) {
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/vsm-node', item.type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex flex-col items-center gap-1 p-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-panel-light transition-colors group select-none"
      title={`Arrastra ${item.label} al canvas`}
    >
      <div className="flex items-center justify-center w-10 h-10">
        {item.icon}
      </div>
      <span className="text-[10px] text-slate-400 group-hover:text-slate-200 transition-colors text-center leading-tight">
        {item.label}
      </span>
    </div>
  );
}

export default function SymbolPalette() {
  const { activeEdgeType, setActiveEdgeType } = useVSMStore();

  return (
    <aside className="w-[160px] flex-shrink-0 bg-panel border-r border-border-dark flex flex-col overflow-y-auto">
      {/* Flujo de material */}
      <div className="px-3 pt-4 pb-1">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">
          Material
        </p>
      </div>
      <div className="grid grid-cols-2 gap-1 px-2">
        {NODE_ITEMS.map((item) => (
          <NodeDraggable key={item.type} item={item} />
        ))}
      </div>

      <div className="my-3 border-t border-border-dark" />

      {/* Tipo de conexión */}
      <div className="px-3 pb-1">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">
          Tipo de flecha
        </p>
      </div>
      <div className="flex flex-col gap-1 px-2 pb-4">
        {EDGE_ITEMS.map((item) => (
          <button
            key={item.type}
            onClick={() => setActiveEdgeType(item.type)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${
              activeEdgeType === item.type
                ? 'bg-accent/20 text-white'
                : 'text-slate-400 hover:bg-panel-light hover:text-slate-200'
            }`}
          >
            <svg width="28" height="8" viewBox="0 0 28 8">
              <line
                x1="2" y1="4" x2="22" y2="4"
                stroke={item.color}
                strokeWidth="2"
                strokeDasharray={item.dash ? '4 2' : undefined}
              />
              <polygon points="22,1 28,4 22,7" fill={item.color} />
            </svg>
            <span className="text-[10px] leading-tight">{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
