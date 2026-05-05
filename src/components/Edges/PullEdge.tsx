import { memo } from 'react';
import { getStraightPath, EdgeLabelRenderer, BaseEdge, type EdgeProps } from 'reactflow';

function PullEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX, sourceY, targetX, targetY,
  });

  void sourcePosition; void targetPosition;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#818cf8' : '#6366f1',
          strokeWidth: selected ? 2.5 : 2,
          strokeDasharray: '6 3',
          markerEnd: 'url(#pull-arrow)',
        }}
      />
      <defs>
        <marker id="pull-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#6366f1" />
        </marker>
      </defs>
      <EdgeLabelRenderer>
        <div
          style={{ transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)` }}
          className="absolute text-[9px] font-bold text-indigo-600 bg-white/80 px-1 rounded pointer-events-none"
        >
          PULL
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(PullEdge);
