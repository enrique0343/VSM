import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { ProcessData } from '../../types/vsm';

function ProcessNode({ data, selected }: NodeProps<ProcessData>) {
  return (
    <div
      className={`select-none w-[160px] rounded border ${
        selected ? 'border-blue-400 shadow-[0_0_0_2px_rgba(59,130,246,0.4)]' : 'border-slate-400'
      } bg-white overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`px-2 py-1 text-center text-xs font-semibold tracking-wide text-white truncate ${
          data.isValueAdded ? 'bg-blue-600' : 'bg-slate-500'
        }`}
      >
        {data.label}
      </div>

      {/* Process icon */}
      <div className="flex justify-center py-2 bg-slate-50 border-b border-slate-200">
        <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
          <rect x="2" y="2" width="32" height="24" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="18" cy="14" r="6" fill="#3b82f6" opacity="0.3" stroke="#3b82f6" strokeWidth="1.5" />
          <circle cx="18" cy="14" r="2" fill="#3b82f6" />
        </svg>
      </div>

      {/* Data table */}
      <div className="divide-y divide-slate-100 text-[11px]">
        <Row label="TC" value={`${data.cycleTime} s`} />
        <Row label="C/O" value={`${data.changeoverTime} s`} />
        <Row label="Up" value={`${data.uptime}%`} />
        <Row label="Op" value={`${data.operators}`} />
      </div>

      {/* VA indicator */}
      <div
        className={`text-center text-[10px] py-0.5 font-medium ${
          data.isValueAdded ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}
      >
        {data.isValueAdded ? '✓ Valor Añadido' : '✗ Sin Valor'}
      </div>

      <Handle type="target" position={Position.Left} className="!bg-blue-400 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-blue-400 !w-2 !h-2 !border-0" />
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2 !border-0" />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-2 py-0.5 hover:bg-slate-50">
      <span className="text-slate-500 font-medium">{label}:</span>
      <span className="text-slate-800 font-mono">{value}</span>
    </div>
  );
}

export default memo(ProcessNode);
