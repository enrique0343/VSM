import { useVSMStore } from '../../store/vsmStore';
import { formatTime } from '../../lib/metrics';

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: 'blue' | 'green' | 'red' | 'amber';
}

const highlightMap = {
  blue: 'text-blue-400',
  green: 'text-green-400',
  red: 'text-red-400',
  amber: 'text-amber-400',
};

function MetricCard({ label, value, sub, highlight }: MetricCardProps) {
  return (
    <div className="flex flex-col items-center px-4 py-2 border-r border-slate-700 last:border-0 min-w-[110px]">
      <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-500 mb-0.5">
        {label}
      </span>
      <span className={`text-lg font-mono font-bold leading-none ${highlight ? highlightMap[highlight] : 'text-slate-100'}`}>
        {value}
      </span>
      {sub && <span className="text-[9px] text-slate-500 mt-0.5">{sub}</span>}
    </div>
  );
}

export default function MetricsBar() {
  const { metrics, nodes } = useVSMStore();

  const hasNodes = nodes.length > 0;

  return (
    <footer className="h-16 bg-panel border-t border-border-dark flex items-center overflow-x-auto flex-shrink-0">
      {/* Timeline visual */}
      <div className="flex-1 px-4 flex items-center gap-1 min-w-0 overflow-x-auto">
        <TimelineBar />
      </div>

      {/* Metric cards */}
      <div className="flex items-center border-l border-border-dark flex-shrink-0">
        <MetricCard
          label="Takt Time"
          value={hasNodes ? formatTime(metrics.taktTime) : '—'}
          sub="por unidad"
          highlight="blue"
        />
        <MetricCard
          label="Lead Time"
          value={hasNodes ? formatTime(metrics.leadTime) : '—'}
          sub="total"
        />
        <MetricCard
          label="VA Time"
          value={hasNodes ? formatTime(metrics.vaTime) : '—'}
          sub={hasNodes ? `${metrics.processCount} procesos` : undefined}
          highlight="green"
        />
        <MetricCard
          label="NVA Time"
          value={hasNodes ? formatTime(metrics.nvaTime) : '—'}
          sub={hasNodes ? `${metrics.inventoryCount} inventarios` : undefined}
          highlight="red"
        />
        <MetricCard
          label="% VA"
          value={hasNodes ? `${metrics.percentVA.toFixed(1)}%` : '—'}
          highlight={metrics.percentVA > 50 ? 'green' : metrics.percentVA > 20 ? 'amber' : 'red'}
        />
      </div>
    </footer>
  );
}

function TimelineBar() {
  const { nodes } = useVSMStore();

  const sorted = [...nodes]
    .filter((n) => n.type === 'process' || n.type === 'inventory')
    .sort((a, b) => a.position.x - b.position.x);

  if (sorted.length === 0) {
    return (
      <p className="text-[10px] text-slate-600 whitespace-nowrap">
        Añade procesos e inventarios para ver la línea de tiempo del Lead Time
      </p>
    );
  }

  return (
    <div className="flex items-end gap-0.5 h-10">
      {sorted.map((n) => {
        const isProcess = n.type === 'process';
        const data = n.data as { cycleTime?: number; waitDays?: number; label: string; isValueAdded?: boolean };
        const label = data.label;
        const seconds = isProcess ? (data.cycleTime ?? 0) : (data.waitDays ?? 0) * 86400;
        const pct = Math.max(seconds / 3600, 0.5);
        const width = Math.min(pct * 6, 80);

        return (
          <div
            key={n.id}
            title={`${label}: ${formatTime(seconds)}`}
            style={{ width: `${width}px` }}
            className={`flex-shrink-0 rounded-sm text-[8px] text-center overflow-hidden transition-all ${
              isProcess
                ? (data.isValueAdded !== false ? 'bg-blue-600 text-white' : 'bg-slate-500 text-white')
                : 'bg-amber-500/60 text-amber-900'
            }`}
            aria-label={label}
          >
            <div className="truncate px-0.5 leading-tight mt-0.5">{formatTime(seconds)}</div>
          </div>
        );
      })}
    </div>
  );
}
