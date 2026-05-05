import { memo } from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge, type EdgeProps } from 'reactflow';

function PushEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#f97316' : '#ea580c',
          strokeWidth: selected ? 2.5 : 2,
          markerEnd: 'url(#push-arrow)',
        }}
      />
      <defs>
        <marker id="push-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#ea580c" />
        </marker>
      </defs>
      <EdgeLabelRenderer>
        <div
          style={{ transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)` }}
          className="absolute text-[9px] font-bold text-orange-600 bg-white/80 px-1 rounded pointer-events-none"
        >
          PUSH
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(PushEdge);
