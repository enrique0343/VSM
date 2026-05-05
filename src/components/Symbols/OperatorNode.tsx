import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { OperatorData } from '../../types/vsm';

function OperatorNode({ data, selected }: NodeProps<OperatorData>) {
  return (
    <div
      className={`flex flex-col items-center select-none ${selected ? 'drop-shadow-[0_0_6px_rgba(148,163,184,0.9)]' : ''}`}
    >
      <div className="flex gap-1 flex-wrap justify-center max-w-[80px]">
        {Array.from({ length: Math.min(data.count, 6) }).map((_, i) => (
          <svg key={i} width="24" height="32" viewBox="0 0 24 32" fill="none">
            {/* Head */}
            <circle cx="12" cy="7" r="5" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
            {/* Body */}
            <path d="M4 20 Q12 14 20 20 L19 30 H5 Z" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
          </svg>
        ))}
        {data.count > 6 && (
          <span className="text-[10px] text-slate-400 self-center">+{data.count - 6}</span>
        )}
      </div>

      <div className="mt-1 text-[10px] text-slate-500 font-mono">
        {data.count} op.
      </div>

      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2 !border-0" />
    </div>
  );
}

export default memo(OperatorNode);
