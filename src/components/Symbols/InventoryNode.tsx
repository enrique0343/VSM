import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { InventoryData } from '../../types/vsm';

function InventoryNode({ data, selected }: NodeProps<InventoryData>) {
  return (
    <div
      className={`flex flex-col items-center select-none ${selected ? 'drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]' : ''}`}
    >
      {/* Triangle SVG */}
      <svg width="72" height="64" viewBox="0 0 72 64" fill="none">
        <polygon
          points="36,4 68,60 4,60"
          fill="#f59e0b"
          stroke={selected ? '#fbbf24' : '#d97706'}
          strokeWidth="2"
        />
        {/* I letter */}
        <text x="36" y="46" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="system-ui">
          I
        </text>
      </svg>

      {/* Data */}
      <div className="mt-1 flex flex-col items-center gap-0.5">
        <span className="text-xs font-mono font-semibold text-amber-700">
          {data.units.toLocaleString()} uds
        </span>
        <span className="text-[10px] text-slate-500 font-mono">
          {data.waitDays} {data.waitDays === 1 ? 'día' : 'días'}
        </span>
      </div>

      <Handle type="target" position={Position.Left} className="!bg-amber-400 !w-2 !h-2 !border-0" style={{ top: '40%' }} />
      <Handle type="source" position={Position.Right} className="!bg-amber-400 !w-2 !h-2 !border-0" style={{ top: '40%' }} />
    </div>
  );
}

export default memo(InventoryNode);
