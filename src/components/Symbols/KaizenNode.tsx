import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { KaizenData } from '../../types/vsm';

/* Kaizen burst: jagged star polygon */
function starPath(cx: number, cy: number, r: number, ir: number, points: number): string {
  const step = Math.PI / points;
  let d = '';
  for (let i = 0; i < 2 * points; i++) {
    const radius = i % 2 === 0 ? r : ir;
    const angle = i * step - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    d += (i === 0 ? 'M' : 'L') + `${x.toFixed(2)},${y.toFixed(2)}`;
  }
  return d + 'Z';
}

function KaizenNode({ data, selected }: NodeProps<KaizenData>) {
  return (
    <div
      className={`flex flex-col items-center select-none ${selected ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]' : ''}`}
    >
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <path
          d={starPath(40, 40, 36, 22, 12)}
          fill="#fef3c7"
          stroke="#ef4444"
          strokeWidth="2"
        />
        <text x="40" y="37" textAnchor="middle" fill="#b91c1c" fontSize="9" fontWeight="700" fontFamily="system-ui">
          KAIZEN
        </text>
        <text x="40" y="50" textAnchor="middle" fill="#7f1d1d" fontSize="7" fontFamily="system-ui">
          BURST
        </text>
      </svg>

      {data.description && (
        <div className="text-[10px] text-red-700 font-medium max-w-[90px] text-center leading-tight mt-0.5">
          {data.description}
        </div>
      )}

      <Handle type="target" position={Position.Top} className="!bg-red-400 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-red-400 !w-2 !h-2 !border-0" />
      <Handle type="target" position={Position.Left} className="!bg-red-400 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-red-400 !w-2 !h-2 !border-0" />
    </div>
  );
}

export default memo(KaizenNode);
