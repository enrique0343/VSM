import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { CustomerData } from '../../types/vsm';

function CustomerNode({ data, selected }: NodeProps<CustomerData>) {
  return (
    <div
      className={`flex flex-col items-center select-none ${selected ? 'drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]' : ''}`}
    >
      {/* Factory SVG — espejo de Supplier */}
      <svg width="80" height="72" viewBox="0 0 80 72" fill="none">
        <polygon points="8,32 40,4 72,32" fill="#1e3a5f" stroke="#22c55e" strokeWidth="1.5" />
        <rect x="22" y="10" width="8" height="22" fill="#1e3a5f" stroke="#22c55e" strokeWidth="1" />
        <rect x="8" y="32" width="64" height="36" rx="1" fill="#1e3a5f" stroke="#22c55e" strokeWidth="1.5" />
        <rect x="16" y="40" width="10" height="10" rx="1" fill="#22c55e" opacity="0.7" />
        <rect x="35" y="40" width="10" height="10" rx="1" fill="#22c55e" opacity="0.7" />
        <rect x="14" y="48" width="12" height="20" rx="1" fill="#0f172a" stroke="#22c55e" strokeWidth="1" />
      </svg>

      {/* Label */}
      <div className="mt-1 px-3 py-1 bg-green-600 rounded text-white text-xs font-semibold tracking-wide max-w-[100px] text-center truncate">
        {data.label}
      </div>

      {/* Demand badge */}
      <div className="mt-1 text-[10px] text-slate-400 font-mono">
        {data.demandPerDay} {data.demandUnit}
      </div>

      <Handle type="target" position={Position.Left} className="!bg-green-400 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-green-400 !w-2 !h-2 !border-0" />
    </div>
  );
}

export default memo(CustomerNode);
