import { memo } from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge, type EdgeProps } from 'reactflow';

interface InfoEdgeData {
  electronic?: boolean;
}

function InfoEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, selected,
}: EdgeProps<InfoEdgeData>) {
  const electronic = data?.electronic ?? false;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });

  const color = electronic ? '#06b6d4' : '#64748b';
  const label = electronic ? '⚡' : '✉';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? color : color,
          strokeWidth: selected ? 2 : 1.5,
          strokeDasharray: electronic ? undefined : '4 2',
          markerEnd: `url(#info-arrow-${electronic ? 'e' : 'm'})`,
          opacity: selected ? 1 : 0.75,
        }}
      />
      <defs>
        <marker id={`info-arrow-${electronic ? 'e' : 'm'}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill={color} />
        </marker>
      </defs>
      <EdgeLabelRenderer>
        <div
          style={{ transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)` }}
          className="absolute text-[11px] bg-white/80 px-0.5 rounded pointer-events-none"
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(InfoEdge);
