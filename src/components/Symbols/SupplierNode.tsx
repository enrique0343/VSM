import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { SupplierData } from '../../types/vsm';

function SupplierNode({ data, selected }: NodeProps<SupplierData>) {
  return (
    <div
      className={`flex flex-col items-center select-none ${selected ? 'drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]' : ''}`}
    >
      {/* Factory SVG */}
      <svg width="80" height="72" viewBox="0 0 80 72" fill="none">
        {/* Roof */}
        <polygon points="8,32 40,4 72,32" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" />
        {/* Chimney */}
        <rect x="50" y="10" width="8" height="22" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1" />
        {/* Body */}
        <rect x="8" y="32" width="64" height="36" rx="1" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" />
        {/* Windows */}
        <rect x="16" y="40" width="10" height="10" rx="1" fill="#3b82f6" opacity="0.7" />
        <rect x="35" y="40" width="10" height="10" rx="1" fill="#3b82f6" opacity="0.7" />
        {/* Door */}
        <rect x="54" y="48" width="12" height="20" rx="1" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" />
      </svg>

      {/* Label */}
      <div className="mt-1 px-3 py-1 bg-blue-600 rounded text-white text-xs font-semibold tracking-wide max-w-[100px] text-center truncate">
        {data.label}
      </div>

      <Handle type="source" position={Position.Right} className="!bg-blue-400 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400 !w-2 !h-2 !border-0" />
      <Handle type="target" position={Position.Left} className="!bg-blue-400 !w-2 !h-2 !border-0" />
    </div>
  );
}

export default memo(SupplierNode);
